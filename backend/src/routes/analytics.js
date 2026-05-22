const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { TopicStatModel } = require("../models/TopicStat");
const { AnalyticsSnapshotModel } = require("../models/AnalyticsSnapshot");
const { SkillDecayModel } = require("../models/SkillDecay");
const { enrichInsight } = require("../services/insight-enrichment.service");
const { RecommendationModel } = require("../models/Recommendation");
const { SubmissionModel } = require("../models/Submission");

const router = Router();

/**
 * Get overall analytics for dashboard
 */
router.get("/dashboard", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const topicStats = await TopicStatModel.find({ user: userId });
    const latestSnapshot = await AnalyticsSnapshotModel.findOne({ user: userId }).sort({ date: -1 });
    const recentSubmissions = await require("../models/Submission").SubmissionModel
      .find({ user: userId })
      .sort({ solvedAt: -1 })
      .limit(10);

    res.status(200).json({
      topicStats,
      snapshot: latestSnapshot,
      recentSubmissions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get skill decay status
 */
router.get("/decay", requireAuth, async (req, res) => {
  try {
    const decayLogs = await SkillDecayModel.find({ user: req.user.id })
      .sort({ checkedAt: -1 })
      .limit(50);
    res.status(200).json({ decayLogs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get prioritized recommendation queue for Phase 3
 */
router.get("/recommendations", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const criticalTopics = await SkillDecayModel.find({ 
      user: userId, 
      status: 'critical' 
    }).sort({ retentionScore: 1 }).limit(5);

    res.status(200).json({
      queue: criticalTopics,
      nextAction: criticalTopics.length > 0 ? `Revise ${criticalTopics[0].topic}` : "Explore new topics"
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all enriched insights with confidence, evidence, and caveats
 */
router.get("/insights", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const enrichedInsights = [];

    // 1. Fetch all data sources
    const topicStats = await TopicStatModel.find({ user: userId });
    const decayLogs = await SkillDecayModel.find({ user: userId })
      .sort({ checkedAt: -1 })
      .limit(50);
    const recentSubmissions = await SubmissionModel.find({ user: userId })
      .sort({ solvedAt: -1 })
      .limit(100);
    const snapshot = await AnalyticsSnapshotModel.findOne({ user: userId })
      .sort({ date: -1 });
    const recommendations = await RecommendationModel.find({
      user: userId,
      status: "pending"
    }).sort({ urgencyScore: -1 }).limit(10);

    // 2. Enrich recommendations
    for (const rec of recommendations) {
      try {
        const enriched = await enrichInsight("recommendation", rec.toObject(), userId);
        enrichedInsights.push({
          type: "recommendation",
          ...enriched,
          metadata: {
            topic: rec.topic,
            generatedAt: rec.generatedAt,
            sourceAlgorithm: rec.sourceAlgorithm
          }
        });
      } catch (err) {
        console.warn(`Failed to enrich recommendation: ${err.message}`);
      }
    }

    // 3. Enrich trend insights per topic
    if (topicStats.length > 0) {
      for (const topic of topicStats) {
        const topicSubmissions = recentSubmissions.filter(s => s.topics?.includes(topic.topic));
        if (topicSubmissions.length >= 5) {
          try {
            const trendData = {
              recentPassRate: topic.masteryScore / 100,
              olderPassRate: topic.previousMasteryScore ? topic.previousMasteryScore / 100 : topic.masteryScore / 100,
              recentCount: Math.min(5, topicSubmissions.length),
              olderCount: Math.min(15, topicSubmissions.length),
              recentDays: 7,
              olderDays: 30,
              consecutiveDays: topic.consecutivePracticeDays || 0,
              recentConsistency: topic.consistencyScore || 70,
              dataPoints: topicSubmissions.length,
              recencyDays: topic.daysSinceSolve || 1
            };
            const enriched = await enrichInsight("trend", trendData, userId);
            enrichedInsights.push({
              type: "trend",
              ...enriched,
              metadata: { topic: topic.topic }
            });
          } catch (err) {
            console.warn(`Failed to enrich trend for ${topic.topic}: ${err.message}`);
          }
        }
      }
    }

    // 4. Enrich mastery drop insights
    if (decayLogs.length > 0) {
      for (const decay of decayLogs.slice(0, 5)) {
        if (decay.retentionScore < 0.6) {
          try {
            const dropData = {
              retentionScore: decay.retentionScore,
              daysSinceLastSolve: decay.daysSinceLastSolve || 10,
              mastery: decay.masteryAtMaxStrength || 65,
              halfLife: decay.halfLife || 52,
              topic: decay.topic
            };
            const enriched = await enrichInsight("mastery_drop", dropData, userId);
            enrichedInsights.push({
              type: "mastery_drop",
              ...enriched,
              metadata: { topic: decay.topic }
            });
          } catch (err) {
            console.warn(`Failed to enrich mastery drop for ${decay.topic}: ${err.message}`);
          }
        }
      }
    }

    // 5. Enrich frequency pattern insights
    if (recentSubmissions.length >= 5) {
      try {
        const gaps = [];
        for (let i = 0; i < recentSubmissions.length - 1; i++) {
          const gap = (recentSubmissions[i].solvedAt - recentSubmissions[i + 1].solvedAt) / (1000 * 60 * 60 * 24);
          gaps.push(gap);
        }
        const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
        const variance = gaps.length > 1
          ? Math.sqrt(gaps.reduce((sum, g) => sum + Math.pow(g - avgGap, 2), 0) / gaps.length) / avgGap
          : 0;

        const frequencyData = {
          averageGapDays: Math.round(avgGap * 10) / 10,
          optimalGapDays: 3,
          recentTrend: recentSubmissions.length >= 10 ? 5 : 0, // Placeholder
          varianceInFrequency: variance,
          activeDaysPerMonth: 15
        };
        const enriched = await enrichInsight("frequency_pattern", frequencyData, userId);
        enrichedInsights.push({
          type: "frequency_pattern",
          ...enriched,
          metadata: {}
        });
      } catch (err) {
        console.warn(`Failed to enrich frequency pattern: ${err.message}`);
      }
    }

    // 6. Enrich DNA profile insight
    if (snapshot) {
      try {
        const dnaData = {
          profileType: snapshot.skillDNA?.profile || "Consistent Learner",
          consistencyScore: snapshot.skillDNA?.consistency || 70,
          observationDays: snapshot.skillDNA?.observationDays || 30,
          totalSubmissions: snapshot.totalSubmissions || 50,
          topicsExplored: topicStats.length,
          difficultyProgression: snapshot.skillDNA?.difficultyProgression || 0.1,
          depthBreadthRatio: snapshot.skillDNA?.depthBreadthRatio || 0.5,
          dataPoints: snapshot.totalSubmissions || 50,
          recencyDays: 1
        };
        const enriched = await enrichInsight("dna_profile", dnaData, userId);
        enrichedInsights.push({
          type: "dna_profile",
          ...enriched,
          metadata: { profile: snapshot.skillDNA?.profile }
        });
      } catch (err) {
        console.warn(`Failed to enrich DNA profile: ${err.message}`);
      }
    }

    // 7. Sort by confidence score (highest first)
    enrichedInsights.sort((a, b) => {
      const scoreA = a.confidence?.score || 0;
      const scoreB = b.confidence?.score || 0;
      return scoreB - scoreA;
    });

    res.status(200).json({
      insights: enrichedInsights,
      total: enrichedInsights.length,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { analyticsRouter: router };
