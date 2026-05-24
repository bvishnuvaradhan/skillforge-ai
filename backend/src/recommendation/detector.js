const { TopicStatModel } = require("../models/TopicStat");
const { SkillDecayModel } = require("../models/SkillDecay");
const { SubmissionModel } = require("../models/Submission");
const { AnalyticsSnapshotModel } = require("../models/AnalyticsSnapshot");
const { RecommendationModel } = require("../models/Recommendation");
const { RULES } = require("./rules");
const { buildExplanation } = require("../explanation/basic");
const { suggestSmartExploration } = require("../services/dependency");
const { adaptExplorationByDependencies } = require("./dependency-adapter");
const { orchestrateRecommendations } = require("../services/arbitration");

const RECOMMENDATION_EXPIRY = {
  revision: 3,
  "weak-topic": 7,
  exploration: 14,
  "difficulty-increase": 5,
  "difficulty-decrease": 7
};

/**
 * Main recommendation engine - evaluates all rules and generates recommendations
 */
async function generateRecommendations(userId) {
  console.log(`[RecommendationEngine] Generating recommendations for user: ${userId}`);

  try {
    // 1. Fetch all data
    const topicStats = await TopicStatModel.find({ user: userId });
    const decayLogs = await SkillDecayModel.find({ user: userId }).sort({ checkedAt: -1 }).limit(100);
    const recentSubmissions = await SubmissionModel.find({ user: userId }).sort({ solvedAt: -1 }).limit(100);
    const snapshot = await AnalyticsSnapshotModel.findOne({ user: userId }).sort({ date: -1 });

    if (!topicStats.length) {
      console.log(`[RecommendationEngine] No topic stats found for user ${userId}. Skipping.`);
      return [];
    }

    const recommendations = [];

    // 2. Evaluate each topic against REVISION, WEAK_TOPIC, DIFFICULTY rules
    for (const topic of topicStats) {
      const decay = decayLogs.find(d => d.topic === topic.topic);
      const topicSubmissions = recentSubmissions.filter(s => s.topics.includes(topic.topic));

      if (!topicSubmissions.length) continue;

      // Calculate recent metrics
      const recent10 = topicSubmissions.slice(0, 10);
      const avgUDI = recent10.reduce((sum, s) => sum + (s.udi || 3), 0) / recent10.length;
      const passCount = recent10.filter(s => s.status === "accepted").length;
      const firstTimePassRate = recent10.filter(s => s.retries === 0 || !s.retries).length / recent10.length;
      const failRate = (recent10.length - passCount) / recent10.length;

      // REVISION recommendation
      if (decay && RULES.REVISION.condition(topic, decay, topic.masteryScore)) {
        const rec = RULES.REVISION.generate(topic, decay);
        rec.reason = RULES.REVISION.reason(topic, decay);
        recommendations.push(rec);
      }

      // WEAK_TOPIC recommendation
      if (RULES.WEAK_TOPIC.condition(topic, topic.masteryScore, topicSubmissions)) {
        const rec = RULES.WEAK_TOPIC.generate(topic, topic.masteryScore, topicSubmissions);
        rec.reason = RULES.WEAK_TOPIC.reason(topic, topic.masteryScore, rec.metrics.avgRetries);
        recommendations.push(rec);
      }

      // DIFFICULTY_INCREASE recommendation
      if (RULES.DIFFICULTY_INCREASE.condition({ firstTimePassRate, avgUDI })) {
        const rec = RULES.DIFFICULTY_INCREASE.generate(topic, { firstTimePassRate, avgUDI });
        rec.reason = RULES.DIFFICULTY_INCREASE.reason();
        recommendations.push(rec);
      }

      // DIFFICULTY_DECREASE recommendation
      if (RULES.DIFFICULTY_DECREASE.condition({ failRate, avgUDI })) {
        const rec = RULES.DIFFICULTY_DECREASE.generate(topic, { failRate, avgUDI });
        rec.reason = RULES.DIFFICULTY_DECREASE.reason({ failRate });
        recommendations.push(rec);
      }
    }

    // 3. EXPLORATION recommendation (dependency-aware)
    if (RULES.EXPLORATION.condition(snapshot, topicStats)) {
      const smart = await suggestSmartExploration(userId, { limit: 3 });
      const candidates = smart?.suggestions || [];

      for (const candidate of candidates) {
        const rec = RULES.EXPLORATION.generate(
          {
            topic: candidate.topic,
            suggestedUDI: candidate.readinessBand === "MASTERED" ? 6 : candidate.readinessBand === "READY" ? 5 : 4,
            prerequisites: (candidate.prerequisites || []).map((p) => p.topic),
            strength: (candidate.readinessInternal || 50) / 100
          },
          topicStats.length
        );

        rec.reason = candidate.reason || `Common successful next step: ${candidate.topic}`;
        rec.metrics.consistency = snapshot?.consistencyScore || 0;

        const adapted = await adaptExplorationByDependencies(rec, userId);
        recommendations.push(adapted);
      }
    }

    // 4. Deduplicate by (type + topic)
    const deduplicated = deduplicateRecommendations(recommendations);

    // Conservative priority guardrail: decay-related urgency should stay above exploration
    const hasDecayUrgent = deduplicated.some((r) => r.type === "revision" || r.type === "weak-topic");
    const prioritized = hasDecayUrgent
      ? deduplicated.map((r) =>
          r.type === "exploration"
            ? { ...r, urgencyScore: Math.min(r.urgencyScore || 30, 25) }
            : r
        )
      : deduplicated;

    // 5. Add explanations to each recommendation
    const withExplanations = prioritized.map(rec => {
      const explanation = buildExplanation(rec, rec.metrics);
      return {
        ...rec,
        evidence: {
          ...rec.evidence,
          triggers: explanation.triggers,
          keyMetrics: explanation.keyMetrics,
          explanation: explanation.explanation
        }
      };
    });

    // 6. Save all candidates first; arbitration will keep winners and stale others.
    const savedCandidates = [];
    for (const rec of withExplanations) {
      const expiryDays = RECOMMENDATION_EXPIRY[rec.type] || 7;
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      const saved = await RecommendationModel.create({
        user: userId,
        ...rec,
        expiresAt
      });
      savedCandidates.push(saved);
    }

    const arbitration = await orchestrateRecommendations(userId, savedCandidates, { persist: true });
    const winnerIds = arbitration.winners.map((r) => r._id);
    const winners = await RecommendationModel.find({ _id: { $in: winnerIds } });

    console.log(
      `[RecommendationEngine] Generated ${savedCandidates.length} candidates; ` +
      `${winners.length} governed winners for user ${userId}`
    );

    return winners;
  } catch (error) {
    console.error(`[RecommendationEngine] Failed to generate recommendations for ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Deduplication: Allow both revision AND difficulty-change for same topic
 * But not two revisions for same topic
 */
function deduplicateRecommendations(recommendations) {
  const seen = new Set();

  return recommendations.filter(rec => {
    const key = `${rec.type}::${rec.topic}`;
    if (seen.has(key)) {
      console.log(`[Dedup] Skipping duplicate: ${key}`);
      return false;
    }
    seen.add(key);
    return true;
  });
}

/**
 * Cleanup: Mark expired recommendations
 */
async function cleanupExpiredRecommendations() {
  try {
    const result = await RecommendationModel.updateMany(
      { expiresAt: { $lt: new Date() }, status: "pending" },
      { status: "expired" }
    );
    if (result.modifiedCount > 0) {
      console.log(`[RecommendationEngine] Marked ${result.modifiedCount} recommendations as expired`);
    }
  } catch (error) {
    console.error("[RecommendationEngine] Error cleaning up expired recommendations:", error.message);
  }
}

module.exports = {
  generateRecommendations,
  deduplicateRecommendations,
  cleanupExpiredRecommendations
};
