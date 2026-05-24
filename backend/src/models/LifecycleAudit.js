const { Schema, model } = require("mongoose");

const lifecycleAuditSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recommendationId: { type: String, required: true },
    topic: String,
    fromState: String,
    toState: { type: String, required: true },
    reason: String,
    source: { type: String, default: "arbitration" },
    metadata: Schema.Types.Mixed
  },
  { timestamps: true }
);

lifecycleAuditSchema.index({ user: 1, recommendationId: 1, createdAt: -1 });
lifecycleAuditSchema.index({ user: 1, createdAt: -1 });

const LifecycleAuditModel = model("LifecycleAudit", lifecycleAuditSchema);

module.exports = { LifecycleAuditModel };
