const { Schema, model } = require("mongoose");

const auditLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    action: { type: String, required: true }, // e.g. "auth_login", "policy_changed", "governance_override"
    category: { type: String, enum: ["security", "governance", "admin", "system"], required: true },
    details: Schema.Types.Mixed, // Flexible metadata
    ipAddress: String,
    userAgent: String,
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

const AuditLogModel = model("AuditLog", auditLogSchema);

module.exports = { AuditLogModel };
