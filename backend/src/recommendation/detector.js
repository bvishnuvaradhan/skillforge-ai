const { TopicStatModel } = require("../models/TopicStat");
const { SkillDecayModel } = require("../models/SkillDecay");
const { SubmissionModel } = require("../models/Submission");
const { AnalyticsSnapshotModel } = require("../models/AnalyticsSnapshot");
const { RecommendationModel } = require("../models/Recommendation");
const { RULES } = require("./rules");

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

    // 3. EXPLORATION recommendation (dependency-aware, but for now suggest next topic)
    if (RULES.EXPLORATION.condition(snapshot, topicStats)) {
      // Get topics not yet explored or barely explored
      const exploredTopics = new Set(topicStats.map(t => t.topic));
      const allCommonTopics = [
        "Arrays", "Strings", "Linked Lists", "Stacks", "Queues",
        "Trees", "Graphs", "Heaps", "Hash Tables", "Dynamic Programming",
        "Greedy", "Divide & Conquer", "Backtracking", "BIT", "Recursion"
      ];

      const candidates = allCommonTopics.filter(t => !exploredTopics.has(t));

      if (candidates.length > 0) {
        // For now: pick first candidate (dependencies will be added in Step 6)
        const candidateTopic = candidates[0];
        const rec = RULES.EXPLORATION.generate(
          { topic: candidateTopic, suggestedUDI: 4, prerequisites: [], strength: 0.8 },
          topicStats.length
        );
        rec.reason = `You've mastered ${topicStats.length} topics. Time to explore ${candidateTopic}.`;
        rec.metrics.consistency = snapshot?.consistencyScore || 0;
        recommendations.push(rec);
      }
    }

    // 4. Deduplicate by (type + topic)
    const deduplicated = deduplicateRecommendations(recommendations);

    // 5. Save to database with expiration dates
    const savedRecs = [];
    for (const rec of deduplicated) {
      const expiryDays = RECOMMENDATION_EXPIRY[rec.type] || 7;
      const expiresAt = new Date(Date.now() + expiryDays * 24 * 60 * 60 * 1000);

      const saved = await RecommendationModel.create({
        user: userId,
        ...rec,
        expiresAt
      });

      savedRecs.push(saved);
    }

    console.log(`[RecommendationEngine] Generated ${savedRecs.length} recommendations for user ${userId}`);
    return savedRecs;
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
