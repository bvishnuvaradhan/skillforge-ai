const { Schema, model } = require("mongoose");

const recommendationLifecycleSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recommendationId: { type: Schema.Types.ObjectId, ref: "Recommendation", required: true },
    topic: { type: String, required: true },
    state: {
      type: String,
      enum: ["active", "snoozed", "stale", "superseded", "resolved", "ignored"],
      default: "active"
    },
    stateReason: String,
    activatedAt: Date,
    snoozedUntil: Date,
    staleDetectedAt: Date,
    supersededBy: { type: Schema.Types.ObjectId, ref: "Recommendation" },
    resolvedAt: Date,
    ignoredAt: Date,
    interactionCount: { type: Number, default: 0 },
    timesSurfaced: { type: Number, default: 0 },
    lastSurfacedAt: Date
  },
  { timestamps: true }
);

recommendationLifecycleSchema.index({ user: 1, recommendationId: 1 }, { unique: true });
recommendationLifecycleSchema.index({ user: 1, state: 1, updatedAt: -1 });
recommendationLifecycleSchema.index({ user: 1, topic: 1, updatedAt: -1 });

const RecommendationLifecycleModel = model("RecommendationLifecycle", recommendationLifecycleSchema);

module.exports = { RecommendationLifecycleModel };
