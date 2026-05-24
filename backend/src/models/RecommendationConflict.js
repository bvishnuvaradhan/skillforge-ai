const { Schema, model } = require("mongoose");

const recommendationConflictSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    conflictGroup: { type: String, required: true },
    recommendations: [{ type: Schema.Types.ObjectId, ref: "Recommendation" }],
    winnerRecommendation: { type: Schema.Types.ObjectId, ref: "Recommendation" },
    loserRecommendations: [{ type: Schema.Types.ObjectId, ref: "Recommendation" }],
    conflictType: {
      type: String,
      enum: ["same_topic", "contradictory_intensity", "roadmap_overlap", "window_timing"],
      required: true
    },
    resolverStrategy: {
      type: String,
      enum: ["objective_priority", "urgency_override", "governance_cap", "fallback"],
      default: "objective_priority"
    },
    rationale: { type: String, required: true },
    resolvedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

recommendationConflictSchema.index({ user: 1, resolvedAt: -1 });
recommendationConflictSchema.index({ user: 1, conflictGroup: 1, createdAt: -1 });

const RecommendationConflictModel = model("RecommendationConflict", recommendationConflictSchema);

module.exports = { RecommendationConflictModel };
