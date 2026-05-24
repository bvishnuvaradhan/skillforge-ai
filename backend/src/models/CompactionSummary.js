const { Schema, model } = require("mongoose");

const compactionSummarySchema = new Schema(
  {
    topic: { type: String, required: true },
    outcome: { type: String, required: true },
    count: { type: Number, required: true },
    cutoff: { type: Date, required: true },
    meta: Schema.Types.Mixed
  },
  { timestamps: true }
);

compactionSummarySchema.index({ topic: 1, outcome: 1 });

const CompactionSummaryModel = model("CompactionSummary", compactionSummarySchema);

module.exports = { CompactionSummaryModel };
