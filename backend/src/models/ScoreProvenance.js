const { Schema, model } = require("mongoose");

const scoreProvenanceSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    runId: { type: String, required: true },
    recommendationId: { type: String, required: true },
    topic: String,
    type: String,
    sourceEngine: String,
    weightedBaseScore: Number,
    finalPriorityScore: Number,
    components: {
      urgency: Number,
      impact: Number,
      confidence: Number,
      dependencyImportance: Number,
      diversityAdjustment: Number
    },
    boosts: Schema.Types.Mixed,
    penalties: Schema.Types.Mixed,
    winnerReason: String,
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

scoreProvenanceSchema.index({ user: 1, runId: 1, createdAt: -1 });
scoreProvenanceSchema.index({ user: 1, recommendationId: 1, createdAt: -1 });

const ScoreProvenanceModel = model("ScoreProvenance", scoreProvenanceSchema);

module.exports = { ScoreProvenanceModel };
