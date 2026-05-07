const { Schema, model } = require("mongoose");

const skillDecaySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },
    retentionScore: { type: Number, required: true }, // R = e^(-t/S)
    stability: { type: Number, required: true }, // S
    daysSinceLastSolve: { type: Number, required: true }, // t
    status: { type: String, enum: ["stable", "decaying", "critical"], default: "stable" },
    checkedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

skillDecaySchema.index({ user: 1, topic: 1 });
skillDecaySchema.index({ user: 1, checkedAt: -1 });

const SkillDecayModel = model("SkillDecay", skillDecaySchema);

module.exports = { SkillDecayModel };
