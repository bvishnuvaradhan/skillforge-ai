const { SkillDecayModel } = require("../models/SkillDecay");
const { TopicStatModel } = require("../models/TopicStat");

/**
 * Detect and mark stale recommendations
 * Recommendation becomes stale when its triggering condition improves
 */
async function detectStaleRecommendations(userId, RecommendationModel) {
  try {
    const pendingRecs = await RecommendationModel.find({
      user: userId,
      status: "pending"
    });

    const staleUpdates = [];

    for (const rec of pendingRecs) {
      const isStale = await checkIfStale(rec, userId);

      if (isStale.stale) {
        staleUpdates.push({
          updateOne: {
            filter: { _id: rec._id },
            update: {
              $set: {
                isStale: true,
                staleReason: isStale.reason,
                staleDetectedAt: new Date(),
                status: "stale"
              }
            }
          }
        });
      }
    }

    if (staleUpdates.length > 0) {
      await RecommendationModel.bulkWrite(staleUpdates);
      console.log(`[Staleness] Marked ${staleUpdates.length} recommendations as stale for user ${userId}`);
    }

    return staleUpdates.length;
  } catch (error) {
    console.error("[Staleness] Error detecting stale recommendations:", error.message);
    throw error;
  }
}

/**
 * Check if individual recommendation is stale
 */
async function checkIfStale(rec, userId) {
  const { type, topic } = rec;

  if (type === "revision") {
    const decay = await SkillDecayModel.findOne({
      user: userId,
      topic: topic
    }).sort({ checkedAt: -1 });

    // Retention improved above threshold
    if (decay && decay.retentionScore > 0.75) {
      return {
        stale: true,
        reason: `Retention improved to ${Math.round(decay.retentionScore * 100)}%. No longer critical.`
      };
    }
  }

  if (type === "weak-topic") {
    const topicStat = await TopicStatModel.findOne({
      user: userId,
      topic: topic
    });

    // Mastery improved above threshold
    if (topicStat && topicStat.masteryScore > 60) {
      return {
        stale: true,
        reason: `Mastery improved to ${topicStat.masteryScore}%. No longer weak.`
      };
    }
  }

  if (type === "difficulty-decrease") {
    const topicStat = await TopicStatModel.findOne({
      user: userId,
      topic: topic
    });

    // Pass rate improved
    const recentSubs = await require("../models/Submission").SubmissionModel
      .find({ user: userId, topics: topic })
      .sort({ solvedAt: -1 })
      .limit(10);

    const passCount = recentSubs.filter(s => s.status === "accepted").length;
    const passRate = passCount / recentSubs.length;

    if (passRate > 0.8) {
      return {
        stale: true,
        reason: `Pass rate improved to ${Math.round(passRate * 100)}%. Ready to progress.`
      };
    }
  }

  if (type === "difficulty-increase") {
    const topicStat = await TopicStatModel.findOne({
      user: userId,
      topic: topic
    });

    // Already mastered (can't increase further)
    if (topicStat && topicStat.masteryScore < 50) {
      return {
        stale: true,
        reason: "Conditions changed. Recommendation no longer applicable."
      };
    }
  }

  return { stale: false };
}

module.exports = {
  detectStaleRecommendations,
  checkIfStale
};
