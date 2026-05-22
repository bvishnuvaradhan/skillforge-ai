// DNA v2 Factor Calculator
// Computes 8 independent DNA factors from submission data

const { TopicStatModel } = require("../../models/TopicStat");
const { SkillDecayModel } = require("../../models/SkillDecay");
const { SubmissionModel } = require("../../models/Submission");
const { AnalyticsSnapshotModel } = require("../../models/AnalyticsSnapshot");

async function calculateDNAFactors(userId, observationWindowDays = 90) {
  try {
    console.log(`[DNA] Calculating factors for user ${userId} (${observationWindowDays} days)`);

    // Fetch data
    const cutoffDate = new Date(Date.now() - observationWindowDays * 24 * 60 * 60 * 1000);
    const submissions = await SubmissionModel.find({
      user: userId,
      solvedAt: { $gte: cutoffDate }
    }).sort({ solvedAt: -1 });

    const topicStats = await TopicStatModel.find({ user: userId });
    const decayLogs = await SkillDecayModel.find({ user: userId })
      .sort({ checkedAt: -1 })
      .limit(10);
    const snapshot = await AnalyticsSnapshotModel.findOne({ user: userId })
      .sort({ date: -1 });

    if (submissions.length < 5) {
      console.log(`[DNA] Insufficient submissions (${submissions.length})`);
      return null;  // Not enough data
    }

    // Factor 1: CONSISTENCY (% of calendar days with >= 1 submission)
    const dateSet = new Set();
    for (const sub of submissions) {
      const day = new Date(sub.solvedAt).toDateString();
      dateSet.add(day);
    }
    const activeDays = dateSet.size;
    const consistency = Math.round((activeDays / observationWindowDays) * 100);

    // Factor 2: SUBMISSION FREQUENCY (problems per week)
    const weeksActive = Math.max(1, Math.ceil(observationWindowDays / 7));
    const frequency = Math.round((submissions.length / weeksActive) * 10);  // Scale 0-100

    // Factor 3: RETRY PATTERN (avg retries per problem, INVERSE scored)
    const totalRetries = submissions.reduce((sum, s) => sum + (s.retries || 0), 0);
    const avgRetries = totalRetries / submissions.length;
    // Inverse: fewer retries = higher score. Cap at 100.
    const retryPattern = Math.max(0, 100 - Math.round(avgRetries * 15));

    // Factor 4: DIFFICULTY PROGRESSION (UDI trend)
    const recentUDIs = submissions.slice(0, Math.ceil(submissions.length / 2)).map(s => s.udi || 5);
    const olderUDIs = submissions.slice(Math.ceil(submissions.length / 2)).map(s => s.udi || 5);
    const recentAvgUDI = recentUDIs.reduce((a, b) => a + b, 0) / recentUDIs.length;
    const olderAvgUDI = olderUDIs.reduce((a, b) => a + b, 0) / olderUDIs.length;
    const progression = recentAvgUDI - olderAvgUDI;
    // Positive progression = higher score. Normalize: -2 to +2 → 0-100
    const difficultyProgression = Math.round(((progression + 2) / 4) * 100);

    // Factor 5: TOPIC DEPTH (% submissions on same topic)
    const topicCounts = {};
    for (const sub of submissions) {
      const topic = sub.topics?.[0] || "unknown";
      topicCounts[topic] = (topicCounts[topic] || 0) + 1;
    }
    const maxTopicCount = Math.max(...Object.values(topicCounts));
    const topicDepth = Math.round((maxTopicCount / submissions.length) * 100);

    // Factor 6: TOPIC BREADTH (# unique topics explored)
    const uniqueTopics = Object.keys(topicCounts).length;
    // Scale: 1-5 topics = 20%, 5-10 = 50%, 10+ = 100%
    const topicBreadth = Math.round(Math.min(100, (uniqueTopics / 10) * 100));

    // Factor 7: SPEED SCORE (time-to-solve trend, if timing data available)
    // Simple heuristic: if submissions increasing AND retries decreasing = speedup
    const firstHalf = submissions.slice(0, Math.ceil(submissions.length / 2));
    const secondHalf = submissions.slice(Math.ceil(submissions.length / 2));
    const firstRetries = firstHalf.reduce((a, b) => a + (b.retries || 0), 0) / firstHalf.length;
    const secondRetries = secondHalf.reduce((a, b) => a + (b.retries || 0), 0) / secondHalf.length;
    const speedTrend = firstRetries - secondRetries;  // Positive = speedup
    const speedScore = Math.round(((speedTrend + 1) / 2) * 100);

    // Factor 8: LEARNER VELOCITY (mastery trend)
    const latestSnapshot = await AnalyticsSnapshotModel.findOne({ user: userId })
      .sort({ date: -1 });
    const oldSnapshot = await AnalyticsSnapshotModel.findOne({ user: userId })
      .sort({ date: 1 });

    let learnerVelocity = 50;  // Default neutral
    if (latestSnapshot && oldSnapshot && latestSnapshot._id !== oldSnapshot._id) {
      const velocityChange = (latestSnapshot.avgMastery || 0) - (oldSnapshot.avgMastery || 0);
      // Normalize: -10 to +10 → 0-100
      learnerVelocity = Math.round(((velocityChange + 10) / 20) * 100);
    }

    const factors = {
      consistency: Math.min(100, consistency),
      frequency: Math.min(100, frequency),
      retryPattern,
      difficultyProgression: Math.max(0, Math.min(100, difficultyProgression)),
      topicDepth,
      topicBreadth,
      speedScore: Math.max(0, Math.min(100, speedScore)),
      learnerVelocity: Math.max(0, Math.min(100, learnerVelocity))
    };

    const metadata = {
      observationDays,
      submissionCount: submissions.length,
      topicsExplored: uniqueTopics,
      maxUDI: Math.max(...submissions.map(s => s.udi || 0)),
      avgUDI: submissions.reduce((a, b) => a + (b.udi || 0), 0) / submissions.length
    };

    console.log(`[DNA] Factors calculated:`, factors);

    return { factors, metadata };
  } catch (error) {
    console.error(`[DNA] Error calculating factors:`, error);
    throw error;
  }
}

module.exports = {
  calculateDNAFactors
};
