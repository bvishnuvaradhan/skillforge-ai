const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { TopicStatModel } = require("../models/TopicStat");
const { AnalyticsSnapshotModel } = require("../models/AnalyticsSnapshot");
const { SkillDecayModel } = require("../models/SkillDecay");

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

module.exports = { analyticsRouter: router };
