const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { RecommendationModel } = require("../models/Recommendation");
const { RecommendationHistoryModel } = require("../models/RecommendationHistory");
const { RecommendationLifecycleModel } = require("../models/RecommendationLifecycle");
const { generateRecommendations } = require("../recommendation/detector");
const { filterByCooldowm } = require("../recommendation/cooldown");
const { formatExplanationForDisplay } = require("../explanation/basic");
const { enrichRecommendationWithExplanation } = require("../services/explainability.service");
const { updateHistoricalAccuracyAsync } = require("../services/feedback-learning.service");
const { transitionLifecycle } = require("../services/arbitration/recommendation-lifecycle");
const cache = require("../lib/cache");
const { z } = require("zod");

const router = Router();

/**
 * GET /api/recommendations
 * Get pending recommendations for current user with deep explanations
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const cacheKey = `user:${req.user.id}:recommendations`;
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json({ recommendations: cached, _fromCache: true });
    }

    const active = await RecommendationLifecycleModel.find({
      user: req.user.id,
      state: "active"
    }).sort({ updatedAt: -1 }).limit(10);

    const activeIds = active.map((item) => item.recommendationId);

    const recs = await RecommendationModel.find({
      user: req.user.id,
      _id: { $in: activeIds },
      status: "pending"
    }).sort({ urgencyScore: -1, impactScore: -1 });

    // Apply cool-down filter
    const filtered = await filterByCooldowm(recs);

    // Enrich with deep explanations (confidence, evidence, caveats, alternatives)
    const enriched = await Promise.all(
      filtered.map(rec => enrichRecommendationWithExplanation(rec, req.user.id))
    );

    // Add computed finalPriority using confidence from deep explanation
    const withPriority = enriched.map(rec => {
      const finalPriority = rec.confidence && rec.confidence.score
        ? (rec.urgencyScore * 0.5 + rec.impactScore * 0.3 + rec.confidence.score * 0.2) / 100
        : (rec.urgencyScore * 0.5 + rec.impactScore * 0.3 + 50 * 0.2) / 100;

      return {
        ...rec,
        finalPriority: Math.min(95, Math.max(0, finalPriority)),
        display: formatExplanationForDisplay(rec, rec.evidence || {})
      };
    });

    await cache.set(cacheKey, withPriority, 300); // Cache for 5 minutes (300 seconds)

    res.status(200).json({ recommendations: withPriority });
  } catch (error) {
    console.error("[RecommendationRoute] GET / error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recommendations/generate
 * Manually trigger recommendation generation (for testing/admin)
 */
router.post("/generate", requireAuth, async (req, res) => {
  try {
    const recs = await generateRecommendations(req.user.id);
    await cache.del(`user:${req.user.id}:recommendations`);
    res.status(200).json({
      message: `Generated ${recs.length} recommendations`,
      recommendations: recs
    });
  } catch (error) {
    console.error("[RecommendationRoute] POST /generate error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recommendations/:id/accept
 * User accepts a recommendation
 */
router.post("/:id/accept", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const rec = await RecommendationModel.findByIdAndUpdate(
      id,
      {
        status: "accepted",
        acceptedAt: new Date()
      },
      { new: true }
    );

    if (!rec) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    // Archive to history
    await RecommendationHistoryModel.create({
      recommendationId: rec._id,
      user: req.user.id,
      type: rec.type,
      topic: rec.topic,
      finalStatus: "accepted",
      userAction: "accepted",
      wasHelpful: true
    });

    // Trigger feedback learning asynchronously (fire and forget)
    updateHistoricalAccuracyAsync();

    try {
      await transitionLifecycle(rec._id, "resolved", "Recommendation accepted by user");
    } catch (err) {
      console.warn("[RecommendationRoute] lifecycle sync warning:", err.message);
    }

    await cache.del(`user:${req.user.id}:recommendations`);

    res.status(200).json({ message: "Recommendation accepted", recommendation: rec });
  } catch (error) {
    console.error("[RecommendationRoute] POST /accept error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recommendations/:id/reject
 * User rejects a recommendation
 */
router.post("/:id/reject", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const rec = await RecommendationModel.findByIdAndUpdate(
      id,
      {
        status: "rejected",
        rejectedAt: new Date(),
        rejectionReason: reason
      },
      { new: true }
    );

    if (!rec) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    // Archive to history
    await RecommendationHistoryModel.create({
      recommendationId: rec._id,
      user: req.user.id,
      type: rec.type,
      topic: rec.topic,
      finalStatus: "rejected",
      feedbackReason: reason,
      userAction: "rejected",
      wasHelpful: false
    });

    // Trigger feedback learning asynchronously (fire and forget)
    updateHistoricalAccuracyAsync();

    try {
      await transitionLifecycle(rec._id, "ignored", "Recommendation rejected by user");
    } catch (err) {
      console.warn("[RecommendationRoute] lifecycle sync warning:", err.message);
    }

    await cache.del(`user:${req.user.id}:recommendations`);

    res.status(200).json({ message: "Recommendation rejected", recommendation: rec });
  } catch (error) {
    console.error("[RecommendationRoute] POST /reject error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/recommendations/:id/complete
 * User marks recommendation as completed
 */
router.post("/:id/complete", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const rec = await RecommendationModel.findByIdAndUpdate(
      id,
      {
        status: "completed",
        completedAt: new Date()
      },
      { new: true }
    );

    if (!rec) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    // Archive to history
    await RecommendationHistoryModel.create({
      recommendationId: rec._id,
      user: req.user.id,
      type: rec.type,
      topic: rec.topic,
      finalStatus: "completed",
      userAction: "completed",
      wasHelpful: true
    });

    // Trigger feedback learning asynchronously (fire and forget)
    updateHistoricalAccuracyAsync();

    try {
      await transitionLifecycle(rec._id, "resolved", "Recommendation completed by user");
    } catch (err) {
      console.warn("[RecommendationRoute] lifecycle sync warning:", err.message);
    }

    await cache.del(`user:${req.user.id}:recommendations`);

    res.status(200).json({ message: "Recommendation completed", recommendation: rec });
  } catch (error) {
    console.error("[RecommendationRoute] POST /complete error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/recommendations/history
 * Get user's recommendation history (for analytics)
 */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const history = await RecommendationHistoryModel.find({
      user: req.user.id
    })
      .sort({ archivedAt: -1 })
      .limit(100);

    res.status(200).json({ history });
  } catch (error) {
    console.error("[RecommendationRoute] GET /history error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

module.exports = { recommendationsRouter: router };
