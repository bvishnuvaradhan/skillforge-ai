const { Schema, model } = require("mongoose");

const governanceAuditSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    runId: { type: String, required: true },
    recommendationId: { type: String, required: true },
    topic: String,
    action: {
      type: String,
      enum: ["surfaced", "deferred", "suppressed", "overridden"],
      required: true
    },
    rule: String,
    reason: String,
    isCritical: { type: Boolean, default: false },
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

governanceAuditSchema.index({ user: 1, createdAt: -1 });
governanceAuditSchema.index({ user: 1, runId: 1, createdAt: -1 });
governanceAuditSchema.index({ user: 1, recommendationId: 1, createdAt: -1 });

const GovernanceAuditModel = model("GovernanceAudit", governanceAuditSchema);

module.exports = { GovernanceAuditModel };
