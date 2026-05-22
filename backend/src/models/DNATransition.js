const { Schema, model } = require("mongoose");

const dnaTransitionSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fromType: String,
    toType: String,
    fromTimestamp: Date,
    toTimestamp: Date,
    transitionConfidence: { type: Number, min: 0, max: 95 },
    signals: [String],
    userNotified: { type: Boolean, default: false },
    userReaction: {
      type: String,
      enum: ["accepted", "rejected", "ignored"],
      default: "ignored"
    },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

dnaTransitionSchema.index({ user: 1, toTimestamp: -1 });
dnaTransitionSchema.index({ user: 1, createdAt: -1 });

module.exports = { DNATransitionModel: model("DNATransition", dnaTransitionSchema) };
