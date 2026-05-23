// Decay History Extractor
// Extracts raw decay observations from SkillDecayModel for curve fitting
// Uses Ebbinghaus formula as baseline for error calculation

const { SkillDecayModel } = require("../../models/SkillDecay");
const { DecayHistoryModel } = require("../../models/DecayHistory");

async function extractDecayHistory(userId, topic, windowDays = 90) {
  try {
    console.log(`[Decay] Extracting history for ${userId} / ${topic} (${windowDays} days)`);

    const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    // Query all decay snapshots for this topic in window
    const snapshots = await SkillDecayModel.find({
      user: userId,
      topic: topic,
      checkedAt: { $gte: cutoff }
    }).sort({ checkedAt: 1 });

    if (snapshots.length < 2) {
      console.log(`[Decay] Insufficient snapshots (${snapshots.length}); need >=2 for history`);
      return null;
    }

    const observations = [];

    // For each adjacent pair: calculate time delta and retention changes
    for (let i = 1; i < snapshots.length; i++) {
      const prev = snapshots[i - 1];
      const curr = snapshots[i];

      // Time between observations (days)
      const timeDelta =
        (curr.checkedAt.getTime() - prev.checkedAt.getTime()) / (1000 * 60 * 60 * 24);

      // Skip if same day (no decay occurred)
      if (timeDelta < 1) continue;

      const observedRetention = curr.retentionScore;
      const solveCount = curr.solveCount || 1;

      // Baseline halfLife (formula-based)
      const baselineHalfLife = solveCount * 2;

      // Expected retention from Ebbinghaus formula: R = e^(-t/S)
      const predictedRetention = Math.exp(-timeDelta / baselineHalfLife);

      // Prediction error
      const predictionError = Math.abs(observedRetention - predictedRetention);

      // Build observation record
      const observation = {
        observedAt: curr.checkedAt,
        daysSinceSolve: timeDelta,
        observedRetention: observedRetention,
        predictedRetention: predictedRetention,
        predictionError: predictionError,
        solveCount: solveCount,
        halfLife: baselineHalfLife,
        factors: {
          dayOfWeek: new Date(curr.checkedAt).toLocaleDateString("en-US", {
            weekday: "long"
          }),
          // Additional factors can be added if available
          masteryTrend: curr.masteryScore ? curr.masteryScore : 0
        }
      };

      observations.push(observation);
    }

    console.log(`[Decay] Extracted ${observations.length} observations from ${snapshots.length} snapshots`);

    return {
      observations: observations,
      metadata: {
        snapshotsUsed: snapshots.length,
        observationsUsed: observations.length,
        windowDays: windowDays,
        timeRange: {
          from: snapshots[0].checkedAt,
          to: snapshots[snapshots.length - 1].checkedAt
        }
      }
    };
  } catch (error) {
    console.error(`[Decay] Error extracting history:`, error);
    throw error;
  }
}

// Utility: Extract history for ALL topics for a user
async function extractDecayHistoryAllTopics(userId, windowDays = 90) {
  try {
    console.log(`[Decay] Extracting history for ALL topics (user: ${userId}, window: ${windowDays}d)`);

    const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

    // Get all unique topics in window
    const decaySnapshots = await SkillDecayModel.find({
      user: userId,
      checkedAt: { $gte: cutoff }
    }).distinct("topic");

    console.log(`[Decay] Found ${decaySnapshots.length} topics for extraction`);

    const results = {};

    for (const topic of decaySnapshots) {
      const history = await extractDecayHistory(userId, topic, windowDays);
      if (history) {
        results[topic] = history;
      }
    }

    return results;
  } catch (error) {
    console.error(`[Decay] Error extracting history for all topics:`, error);
    throw error;
  }
}

// Archive observations to DecayHistory collection
async function archiveObservations(userId, topic, observations) {
  try {
    if (!observations || observations.length === 0) {
      console.log(`[Decay] No observations to archive for ${topic}`);
      return 0;
    }

    const records = observations.map((obs) => ({
      user: userId,
      topic: topic,
      ...obs
    }));

    const result = await DecayHistoryModel.insertMany(records);
    console.log(`[Decay] Archived ${result.length} observations for ${topic}`);
    return result.length;
  } catch (error) {
    console.error(`[Decay] Error archiving observations:`, error);
    throw error;
  }
}

module.exports = {
  extractDecayHistory,
  extractDecayHistoryAllTopics,
  archiveObservations
};
