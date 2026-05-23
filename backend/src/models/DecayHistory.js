const { Schema, model } = require("mongoose");

const decayHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },

    // Observation data
    observedAt: { type: Date, required: true },
    daysSinceSolve: { type: Number },
    observedRetention: { type: Number, min: 0, max: 1 }, // Actual R measured
    predictedRetention: { type: Number, min: 0, max: 1 }, // R from formula
    predictionError: { type: Number }, // |observed - predicted|

    // Context
    solveCount: { type: Number },
    halfLife: { type: Number },

    // Behavioral factors
    factors: {
      dayOfWeek: { type: String },
      timeSinceLastSession: { type: Number }, // Days
      consecutivePracticeDays: { type: Number },
      masteryTrend: { type: Number } // +/- indicating improvement/decline
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for curve fitting and analytics
decayHistorySchema.index({ user: 1, topic: 1, observedAt: -1 });
decayHistorySchema.index({ user: 1, observedAt: -1 }); // For extracting history
decayHistorySchema.index({ topic: 1, createdAt: -1 }); // For cross-user analytics

const DecayHistoryModel = model("DecayHistory", decayHistorySchema);

module.exports = { DecayHistoryModel };
