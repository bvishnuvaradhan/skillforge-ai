const { Schema, model } = require("mongoose");

const recommendationTraceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    runId: { type: String, required: true },
    arbitrationTraceId: { type: Schema.Types.ObjectId, ref: "ArbitrationTrace" },
    recommendationId: { type: String, required: true },
    topic: String,
    type: String,
    outcome: {
      type: String,
      enum: ["winner", "deferred"],
      required: true
    },
    reason: String,
    stage: { type: String, default: "arbitration" },
    winningSignal: String,
    finalPriorityScore: Number,
    sourceEngine: String,
    sourceAlgorithm: String,
    lineage: {
      summary: String,
      evidence: Schema.Types.Mixed,
      caveats: [String]
    },
    ancestry: {
      hardFlags: Schema.Types.Mixed,
      governance: Schema.Types.Mixed
    },
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

recommendationTraceSchema.index({ user: 1, recommendationId: 1, createdAt: -1 });
recommendationTraceSchema.index({ user: 1, runId: 1, createdAt: -1 });
recommendationTraceSchema.index({ user: 1, outcome: 1, createdAt: -1 });

const RecommendationTraceModel = model("RecommendationTrace", recommendationTraceSchema);

module.exports = { RecommendationTraceModel };
