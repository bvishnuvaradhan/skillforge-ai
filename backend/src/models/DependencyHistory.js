const { Schema, model } = require("mongoose");

const dependencyHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },

    // Learning sequence
    learnedSequence: [
      {
        date: Date,
        topic: String,
        masteryAchieved: Number,
        prerequisitesMet: { type: Number, default: 0 },
        allPrereqsMet: Boolean,
        foundationStrength: Number, // Avg mastery of prerequisites
        readinessBandAtTime: {
          type: String,
          enum: ["NOT_READY", "DEVELOPING", "READY", "MASTERED"]
        }
      }
    ],

    // CRITICAL SAFEGUARD: Track violations (alternative paths)
    violations: [
      {
        date: Date,
        advancedTopic: String,
        prerequisite: String,
        advancedMastery: Number,
        prerequisiteMastery: Number,
        severity: { type: Number, min: 0, max: 5 },
        recommendation: String,
        resolutionDate: Date, // When user eventually met prerequisite
        userSucceeded: Boolean // Did user succeed despite violation?
      }
    ],

    // CRITICAL SAFEGUARD: Track alternative paths
    alternativePathsTaken: [
      {
        path: [String],
        startDate: Date,
        completionDate: Date,
        successRate: Number, // % mastery achieved
        deviatedFromCommon: Boolean,
        successDespiteDeviation: Boolean
      }
    ],

    // Optimal vs actual
    optimalOrder: [String],
    actualOrder: [String],
    orderDeviation: { type: Number, min: 0, max: 1 }, // % of optimal violated

    totalMasteredTopics: { type: Number, default: 0 },
    totalAlternativePaths: { type: Number, default: 0 },
    alternativePathSuccessRate: Number, // Track if alternatives work

    // Metadata
    lastUpdated: Date,
    analysisPerformed: Date,

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

dependencyHistorySchema.index({ user: 1, createdAt: -1 });
dependencyHistorySchema.index({ user: 1, "learnedSequence.date": 1 });

module.exports = model("DependencyHistory", dependencyHistorySchema);
