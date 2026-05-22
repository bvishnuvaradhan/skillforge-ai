const { Schema, model } = require("mongoose");

const confidenceCalibrationSchema = new Schema(
  {
    date: { type: Date, default: Date.now },

    // Per-recommendation-type accuracy learned from feedback
    // Store actual accuracy ratios (0-1), not percentages
    byRecommendationType: {
      revision: { type: Number, min: 0, max: 1 },
      "weak-topic": { type: Number, min: 0, max: 1 },
      "difficulty-increase": { type: Number, min: 0, max: 1 },
      "difficulty-decrease": { type: Number, min: 0, max: 1 },
      exploration: { type: Number, min: 0, max: 1 }
    },

    // Metadata
    totalFeedback: { type: Number, default: 0 },  // Total records analyzed
    totalPerType: {
      // Track sample size per type
      revision: { type: Number, default: 0 },
      "weak-topic": { type: Number, default: 0 },
      "difficulty-increase": { type: Number, default: 0 },
      "difficulty-decrease": { type: Number, default: 0 },
      exploration: { type: Number, default: 0 }
    },
    samplingPeriod: { type: String, default: "daily" },
    lastUpdated: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Index for fast lookups
confidenceCalibrationSchema.index({ date: -1 });

const ConfidenceCalibrationModel = model("ConfidenceCalibration", confidenceCalibrationSchema);

module.exports = { ConfidenceCalibrationModel };
