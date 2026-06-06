const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { TopicStatModel } = require("../models/TopicStat");
const { DependencyGraphModel } = require("../models/DependencyGraph");
const { SkillDecayModel } = require("../models/SkillDecay");
const { DNAProfileModel } = require("../models/DNAProfile");
const { DecayForecastModel } = require("../models/DecayForecast");
const { RecommendationModel } = require("../models/Recommendation");
const { RecommendationHistoryModel } = require("../models/RecommendationHistory");
const { SubmissionModel } = require("../models/Submission");
const { mentorAIService } = require("../services/mentor-ai.service");
const cache = require("../lib/cache");

const router = Router();

/**
 * GET /api/mentor/:userId/roadmap
 * Returns: { nodes: [], edges: [], userProgress: {} }
 */
router.get("/:userId/roadmap", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    // Verify user is requesting their own data or is admin
    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:roadmap`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    const graph = await DependencyGraphModel.findOne({ user: userId });
    if (!graph) {
      return res.status(404).json({ error: "Roadmap not found" });
    }

    // Get user progress
    const topicStats = await TopicStatModel.find({ user: userId });
    const userProgress = {};

    topicStats.forEach(stat => {
      userProgress[stat.topic] = {
        completed: stat.masteredAt ? true : false,
        masteredAt: stat.masteredAt,
        masteryScore: stat.score
      };
    });

    const result = {
      nodes: graph.nodes || [],
      edges: graph.edges || [],
      userProgress
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentor/:userId/retention
 * Returns: { heatmap: {}, decayRates: {} }
 */
router.get("/:userId/retention", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:retention`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    const topicStats = await TopicStatModel.find({ user: userId });
    const heatmap = {};
    const decayRates = {};

    topicStats.forEach(stat => {
      const daysSincePractice = stat.lastPracticed
        ? Math.floor((Date.now() - new Date(stat.lastPracticed)) / (1000 * 60 * 60 * 24))
        : 999;

      heatmap[stat.topic] = {
        daysSincePractice,
        retentionRate: stat.retentionRate || Math.max(0, 1 - daysSincePractice / 30),
        lastPracticed: stat.lastPracticed
      };

      decayRates[stat.topic] = stat.decayRate || 0.15;
    });

    const result = { heatmap, decayRates };
    await cache.set(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentor/:userId/mastery
 * Returns: { [topic]: score, ... }
 */
router.get("/:userId/mastery", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:mastery`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    const topicStats = await TopicStatModel.find({ user: userId });
    const mastery = {};

    topicStats.forEach(stat => {
      mastery[stat.topic] = stat.score || 0;
    });

    await cache.set(cacheKey, mastery, 300); // 5 min TTL
    res.json(mastery);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentor/:userId/dna
 * Returns: { type, confidence, description, retryBehavior, ... }
 */
router.get("/:userId/dna", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:dna`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    const dna = await DNAProfileModel.findOne({ user: userId });
    if (!dna) {
      // Return default DNA if not found
      return res.json({
        type: 'Unknown',
        confidence: 0.5,
        description: 'Learning profile not yet determined',
        retryBehavior: 0.5,
        explorationBehavior: 0.5,
        difficultyPreference: 0.5,
        focusStyle: 'balanced',
        learningRhythm: 'variable'
      });
    }

    const result = {
      type: dna.dnaType || 'Unknown',
      confidence: dna.confidence || 0.5,
      description: dna.description || '',
      retryBehavior: dna.retryBehavior || 0.5,
      explorationBehavior: dna.explorationBehavior || 0.5,
      difficultyPreference: dna.difficultyPreference || 0.5,
      focusStyle: dna.focusStyle || 'balanced',
      learningRhythm: dna.learningRhythm || 'variable'
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentor/:userId/forecast
 * Returns: { predictions: {}, timeHorizon, confidence, trendingTopics, riskingTopics }
 */
router.get("/:userId/forecast", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:forecast`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    const forecast = await DecayForecastModel.findOne({ user: userId }).sort({ createdAt: -1 });

    if (!forecast) {
      // Return default forecast
      return res.json({
        predictions: {},
        timeHorizon: 7,
        confidence: 0.5,
        trendingTopics: [],
        riskingTopics: []
      });
    }

    const result = {
      predictions: forecast.predictions || {},
      timeHorizon: forecast.timeHorizon || 7,
      confidence: forecast.confidence || 0.5,
      trendingTopics: forecast.trendingTopics || [],
      riskingTopics: forecast.riskingTopics || []
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentor/:userId/governance
 * Returns: { policies: [], activeCooldowns: {}, capacityRemaining, constraints: [] }
 */
router.get("/:userId/governance", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:governance`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    // Return governance policies (currently hardcoded, could be stored in DB)
    const result = {
      policies: [
        { type: 'cooldown', active: false, durationDays: 1 },
        { type: 'readiness', active: true, masteryThreshold: 0.6 }
      ],
      activeCooldowns: {},
      capacityRemaining: 85,
      constraints: [
        { type: 'max_recommendations_per_day', value: 5 }
      ]
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentor/:userId/activity
 * Returns: { sessionsLastWeek, problemsSolvedLastWeek, averageSessionDuration, currentStreak, lastActivityTime, focusTopics }
 */
router.get("/:userId/activity", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:activity`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    // Calculate recent activity
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentSubmissions = await SubmissionModel.find({
      user: userId,
      solvedAt: { $gte: sevenDaysAgo }
    });

    const topicStats = await TopicStatModel.find({ user: userId });
    const focusTopics = topicStats
      .sort((a, b) => b.lastPracticed - a.lastPracticed)
      .slice(0, 3)
      .map(t => t.topic);

    const lastActivity = recentSubmissions.length > 0
      ? new Date(Math.max(...recentSubmissions.map(s => new Date(s.solvedAt))))
      : null;

    const result = {
      sessionsLastWeek: Math.ceil(recentSubmissions.length / 5) || 0,
      problemsSolvedLastWeek: recentSubmissions.length,
      averageSessionDuration: 45,
      currentStreak: 3,
      lastActivityTime: lastActivity ? lastActivity.getTime() : Date.now() - 3600000,
      focusTopics
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/mentor/:userId/recommendation-history
 * Returns: { recommendations: [], acceptanceRate, completionRate, averageEffectiveness, recentRecommendations }
 */
router.get("/:userId/recommendation-history", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const cacheKey = `user:${userId}:mentor:recommendation-history`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.json({ ...cached, _fromCache: true });
    }

    const recommendations = await RecommendationHistoryModel.find({ user: userId }).sort({ createdAt: -1 }).limit(20);

    let accepted = 0;
    let completed = 0;
    let effectivenessScores = [];

    recommendations.forEach(rec => {
      if (rec.status === 'accepted') accepted++;
      if (rec.status === 'completed') completed++;
      if (rec.effectiveness) effectivenessScores.push(rec.effectiveness);
    });

    const acceptanceRate = recommendations.length > 0 ? accepted / recommendations.length : 0;
    const completionRate = recommendations.length > 0 ? completed / recommendations.length : 0;
    const avgEffectiveness = effectivenessScores.length > 0
      ? effectivenessScores.reduce((a, b) => a + b, 0) / effectivenessScores.length
      : 0.5;

    const recentRecommendations = recommendations
      .filter(r => r.topic)
      .slice(0, 5)
      .map(r => r.topic);

    const result = {
      recommendations: recommendations.map(r => ({
        id: r._id,
        topic: r.topic,
        accepted: r.status === 'accepted' || r.status === 'completed'
      })),
      acceptanceRate,
      completionRate,
      averageEffectiveness: avgEffectiveness,
      recentRecommendations
    };

    await cache.set(cacheKey, result, 300); // 5 min TTL
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentor/:userId/response
 * Generate AI mentor response
 */
router.post("/:userId/response", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { systemPrompt, userPrompt } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!systemPrompt || !userPrompt) {
      return res.status(400).json({ error: "Missing systemPrompt or userPrompt" });
    }

    const response = await mentorAIService.generateMentorResponse(
      systemPrompt,
      userPrompt,
      userId,
      "mentor_response"
    );

    res.json({ response });
  } catch (error) {
    console.error("Failed to generate mentor response:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentor/:userId/explain
 * Generate explanation for a concept
 */
router.post("/:userId/explain", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { explanationType, context } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!explanationType || !context) {
      return res.status(400).json({ error: "Missing explanationType or context" });
    }

    const explanation = await mentorAIService.generateExplanation(
      explanationType,
      context,
      userId
    );

    res.json({ explanation });
  } catch (error) {
    console.error("Failed to generate explanation:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentor/:userId/insight
 * Generate coaching insight
 */
router.post("/:userId/insight", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { learnerProfile, recentActivity } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!learnerProfile || !recentActivity) {
      return res
        .status(400)
        .json({ error: "Missing learnerProfile or recentActivity" });
    }

    const insight = await mentorAIService.generateCoachingInsight(
      learnerProfile,
      recentActivity,
      userId
    );

    res.json({ insight });
  } catch (error) {
    console.error("Failed to generate coaching insight:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/mentor/:userId/reflection
 * Generate weekly reflection
 */
router.post("/:userId/reflection", requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { weeklyData } = req.body;

    if (req.user.id !== userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!weeklyData) {
      return res.status(400).json({ error: "Missing weeklyData" });
    }

    const reflection = await mentorAIService.generateReflection(weeklyData, userId);

    res.json({ reflection });
  } catch (error) {
    console.error("Failed to generate reflection:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { mentorRouter: router };
