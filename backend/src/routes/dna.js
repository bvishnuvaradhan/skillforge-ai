const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { DNAProfileModel } = require("../models/DNAProfile");
const { DNATransitionModel } = require("../models/DNATransition");
const { generateDNAInsights } = require("../services/dna-v2/dna-insights");

const router = Router();

/**
 * Get current DNA profile
 */
router.get("/profile", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await DNAProfileModel.findOne({ user: userId })
      .sort({ timestamp: -1 });

    if (!profile) {
      return res.status(404).json({ error: "No DNA profile found" });
    }

    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get DNA history over time
 */
router.get("/history", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const days = parseInt(req.query.days) || 90;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const history = await DNAProfileModel.find({
      user: userId,
      timestamp: { $gte: cutoff }
    }).sort({ timestamp: -1 });

    res.status(200).json({
      history,
      total: history.length,
      days
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get DNA transitions
 */
router.get("/transitions", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const transitions = await DNATransitionModel.find({ user: userId })
      .sort({ toTimestamp: -1 })
      .limit(20);

    res.status(200).json({
      transitions,
      total: transitions.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Accept DNA transition (feedback)
 */
router.post("/transitions/:id/accept", requireAuth, async (req, res) => {
  try {
    const transitionId = req.params.id;
    await DNATransitionModel.findByIdAndUpdate(transitionId, {
      userReaction: "accepted"
    });

    res.status(200).json({ message: "Transition accepted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Reject DNA transition (feedback)
 */
router.post("/transitions/:id/reject", requireAuth, async (req, res) => {
  try {
    const transitionId = req.params.id;
    await DNATransitionModel.findByIdAndUpdate(transitionId, {
      userReaction: "rejected"
    });

    res.status(200).json({ message: "Transition rejected" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get DNA insights (enriched)
 */
router.get("/insights", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const profile = await DNAProfileModel.findOne({ user: userId })
      .sort({ timestamp: -1 });

    if (!profile) {
      return res.status(404).json({ error: "No DNA profile found" });
    }

    // Get latest transition if exists
    const transition = await DNATransitionModel.findOne({ user: userId })
      .sort({ toTimestamp: -1 });

    const insights = await generateDNAInsights(profile, transition);

    res.status(200).json({
      insights,
      total: insights.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { dnaRouter: router };
