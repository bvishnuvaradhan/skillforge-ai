// Feedback Learning Service
// Tracks recommendation helpfulness and calibrates confidence scores
// Runs async after user feedback (accept/reject/complete)

const { RecommendationHistoryModel } = require("../models/RecommendationHistory");
const { ConfidenceCalibrationModel } = require("../models/ConfidenceCalibration");

// Minimum sample size required before using learned accuracy (not 70% baseline)
// CRITICAL: Prevents spurious learning from 1/1 = 100% problem
const MINIMUM_FEEDBACK_SAMPLE_SIZE = 10;

// Last time calibration was updated (prevent duplicate runs)
let lastCalibrationUpdate = new Date();

async function updateHistoricalAccuracy() {
  try {
    console.log("[Feedback Learning] Starting accuracy calibration...");

    // 1. Query recent feedback since last update
    const history = await RecommendationHistoryModel.find({
      archivedAt: { $gte: lastCalibrationUpdate }
    });

    if (history.length === 0) {
      console.log("[Feedback Learning] No new feedback to process");
      return null;
    }

    console.log(`[Feedback Learning] Processing ${history.length} feedback records`);

    // 2. Group by recommendation type
    const byType = {};
    for (const record of history) {
      const type = record.type;
      if (!byType[type]) {
        byType[type] = { helpful: 0, total: 0 };
      }
      byType[type].total++;
      if (record.wasHelpful) {
        byType[type].helpful++;
      }
    }

    // 3. Calculate accuracy per type (only if sample size >= 10)
    const calibration = {
      byRecommendationType: {},
      totalPerType: {}
    };

    for (const [type, counts] of Object.entries(byType)) {
      if (counts.total >= MINIMUM_FEEDBACK_SAMPLE_SIZE) {
        // Use learned accuracy only if we have enough data
        calibration.byRecommendationType[type] = counts.helpful / counts.total;
        calibration.totalPerType[type] = counts.total;
        console.log(
          `[Feedback Learning] ${type}: ${counts.helpful}/${counts.total} = ${(
            (counts.helpful / counts.total) * 100
          ).toFixed(1)}% helpful`
        );
      } else {
        // Keep NULL, will fallback to 70% baseline
        console.log(
          `[Feedback Learning] ${type}: ${counts.total} samples < ${MINIMUM_FEEDBACK_SAMPLE_SIZE} minimum, using baseline`
        );
      }
    }

    // 4. Store in ConfidenceCalibration collection
    const record = await ConfidenceCalibrationModel.create({
      date: new Date(),
      byRecommendationType: calibration.byRecommendationType,
      totalPerType: calibration.totalPerType,
      totalFeedback: history.length,
      lastUpdated: new Date()
    });

    console.log("[Feedback Learning] Calibration stored successfully");

    // 5. Update last update time
    lastCalibrationUpdate = new Date();

    return calibration.byRecommendationType;
  } catch (error) {
    console.error("[Feedback Learning] Error updating accuracy:", error.message);
    return null;
  }
}

async function getHistoricalAccuracy(recommendationType) {
  try {
    // Query latest calibration
    const latest = await ConfidenceCalibrationModel.findOne()
      .sort({ date: -1 })
      .limit(1);

    if (!latest) {
      // No calibration exists yet, use baseline
      return 70;
    }

    // Check if this type has learned accuracy
    const learnedAccuracy = latest.byRecommendationType[recommendationType];

    if (learnedAccuracy !== undefined && learnedAccuracy !== null) {
      // Convert from 0-1 range to 0-100 range for confidence formula
      const accuracy100 = learnedAccuracy * 100;
      return accuracy100;
    }

    // Type has no learned accuracy yet (< 10 samples), use baseline
    return 70;
  } catch (error) {
    console.error("[Feedback Learning] Error getting historical accuracy:", error.message);
    return 70; // Fallback to baseline on error
  }
}

async function getLearningStats() {
  try {
    const latest = await ConfidenceCalibrationModel.findOne()
      .sort({ date: -1 })
      .limit(1);

    if (!latest) {
      return null;
    }

    return {
      date: latest.date,
      stats: latest.byRecommendationType,
      samples: latest.totalPerType,
      totalRecords: latest.totalFeedback
    };
  } catch (error) {
    console.error("[Feedback Learning] Error getting stats:", error.message);
    return null;
  }
}

module.exports = {
  updateHistoricalAccuracy,
  updateHistoricalAccuracyAsync,
  getHistoricalAccuracy,
  getLearningStats,
  MINIMUM_FEEDBACK_SAMPLE_SIZE
};

// Async wrapper: trigger learning without blocking
function updateHistoricalAccuracyAsync() {
  // Fire and forget - don't wait for response
  setImmediate(async () => {
    await updateHistoricalAccuracy().catch(err =>
      console.error("[Feedback Learning] Background update failed:", err.message)
    );
  });
}
