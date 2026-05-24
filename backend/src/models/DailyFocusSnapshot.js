const { Schema, model } = require("mongoose");

const focusItemSchema = new Schema(
  {
    recommendationId: { type: Schema.Types.ObjectId, ref: "Recommendation" },
    topic: String,
    reason: String,
    confidence: Number
  },
  { _id: false }
);

const dailyFocusSnapshotSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    criticalTask: focusItemSchema,
    growthTask: focusItemSchema,
    optionalExploration: focusItemSchema,
    fatigueMode: { type: Boolean, default: false },
    maxCardsShown: { type: Number, default: 3 },
    whyTheseWon: [String],
    whatWasDeferred: [String]
  },
  { timestamps: true }
);

dailyFocusSnapshotSchema.index({ user: 1, date: -1 });

const DailyFocusSnapshotModel = model("DailyFocusSnapshot", dailyFocusSnapshotSchema);

module.exports = { DailyFocusSnapshotModel };
