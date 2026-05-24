const { Schema, model } = require("mongoose");

const normalizationFailureSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    runId: { type: String, required: true },
    recommendationId: String,
    topic: String,
    error: { type: String, required: true },
    source: { type: String, default: "signal-normalizer" },
    payload: Schema.Types.Mixed
  },
  { timestamps: true }
);

normalizationFailureSchema.index({ user: 1, runId: 1, createdAt: -1 });
normalizationFailureSchema.index({ user: 1, recommendationId: 1, createdAt: -1 });

const NormalizationFailureModel = model("NormalizationFailure", normalizationFailureSchema);

module.exports = { NormalizationFailureModel };
