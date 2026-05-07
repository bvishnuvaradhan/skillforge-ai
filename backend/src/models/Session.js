const { Schema, model } = require("mongoose");

const sessionSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    tokenHash: { type: String, required: true, unique: true, index: true },
    userAgent: { type: String, default: "" },
    ipAddress: { type: String, default: "" },
    revokedAt: { type: Date, default: null },
    lastUsedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true },
);

const SessionModel = model("Session", sessionSchema);

module.exports = { SessionModel };