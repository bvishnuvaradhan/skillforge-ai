const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { DecayProfileModel } = require("../models/DecayProfile");
const { DecayForecastModel } = require("../models/DecayForecast");
const { DecayAlertModel } = require("../models/DecayAlert");
const { DecayHistoryModel } = require("../models/DecayHistory");

const router = Router();

/**
 * Get decay profile for a topic
 */
router.get("/profile/:topic", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const topic = req.params.topic;

    const profile = await DecayProfileModel.findOne({
      user: userId,
      topic: topic
    }).sort({ lastUpdated: -1 });

    if (!profile) {
      return res.status(404).json({ error: `No decay profile found for ${topic}` });
    }

    res.status(200).json({ profile });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get decay forecast for a topic
 */
router.get("/forecast/:topic", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const topic = req.params.topic;

    const forecast = await DecayForecastModel.findOne({
      user: userId,
      topic: topic
    }).sort({ createdAt: -1 });

    if (!forecast) {
      return res.status(404).json({ error: `No forecast found for ${topic}` });
    }

    res.status(200).json({ forecast });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get optimal review timing for a topic
 */
router.get("/review-timing/:topic", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const topic = req.params.topic;

    const forecast = await DecayForecastModel.findOne({
      user: userId,
      topic: topic
    }).sort({ createdAt: -1 });

    if (!forecast || !forecast.optimalReviewTiming) {
      return res.status(404).json({ error: `No review timing found for ${topic}` });
    }

    res.status(200).json({ timing: forecast.optimalReviewTiming });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get spaced repetition schedule
 */
router.get("/schedule/:topic", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const topic = req.params.topic;

    const forecast = await DecayForecastModel.findOne({
      user: userId,
      topic: topic
    }).sort({ createdAt: -1 });

    if (!forecast || !forecast.spacedRepetition) {
      return res.status(404).json({ error: `No schedule found for ${topic}` });
    }

    res.status(200).json({ schedule: forecast.spacedRepetition });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get all pending decay alerts
 */
router.get("/alerts", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;

    const alerts = await DecayAlertModel.find({
      user: userId,
      dismissed: false
    }).sort({ severity: -1, triggersAt: -1 });

    res.status(200).json({
      alerts,
      total: alerts.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Dismiss an alert
 */
router.post("/alerts/:id/dismiss", requireAuth, async (req, res) => {
  try {
    const alertId = req.params.id;
    const { reason } = req.body;

    await DecayAlertModel.findByIdAndUpdate(alertId, {
      dismissed: true,
      dismissedAt: new Date(),
      dismissedReason: reason
    });

    res.status(200).json({ message: "Alert dismissed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Record action taken on alert
 */
router.post("/alerts/:id/action", requireAuth, async (req, res) => {
  try {
    const alertId = req.params.id;

    await DecayAlertModel.findByIdAndUpdate(alertId, {
      actionTaken: true,
      actionDate: new Date()
    });

    res.status(200).json({ message: "Action recorded" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get decay history for a topic
 */
router.get("/history/:topic", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const topic = req.params.topic;
    const days = parseInt(req.query.days) || 90;

    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const history = await DecayHistoryModel.find({
      user: userId,
      topic: topic,
      createdAt: { $gte: cutoff }
    }).sort({ observedAt: 1 });

    res.status(200).json({
      history,
      total: history.length,
      topic: topic,
      days: days
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Get role-specific decay analysis
 */
router.get("/role/:role", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const role = req.params.role;

    // Get profiles for this role's topics
    const { analyzeRoleSpecificDecay } = require("../services/decay-v2/role-decay");
    const roleAnalysis = await analyzeRoleSpecificDecay(userId, role);

    if (!roleAnalysis) {
      return res.status(404).json({ error: `No decay data for role ${role}` });
    }

    res.status(200).json({ roleAnalysis });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { decayRouter: router };
