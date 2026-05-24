const { Schema, model } = require("mongoose");

const recommendationPrioritySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recommendationId: { type: Schema.Types.ObjectId, ref: "Recommendation" },

    winningSignal: {
      type: String,
      enum: ["decay", "dependency", "dna", "fallback"],
      required: true
    },
    conflictingSignals: [{ type: String }],

    priorityOrder: {
      type: [String],
      default: ["decay", "dependency", "dna"]
    },

    arbitrationMetadata: {
      reason: String,
      decayUrgency: Number,
      dependencyReadiness: Number,
      dnaBoost: Number
    }
  },
  { timestamps: true }
);

recommendationPrioritySchema.index({ user: 1, createdAt: -1 });

module.exports = model("RecommendationPriority", recommendationPrioritySchema);
