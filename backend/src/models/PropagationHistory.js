const { Schema, model } = require("mongoose");

const propagationHistorySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: String, required: true },
    triggerTopic: { type: String, required: true },
    sourceType: { type: String, enum: ["direct_mastery_update", "manual", "system"], default: "system" },

    directGain: { type: Number, default: 0 },
    totalPropagatedGain: { type: Number, default: 0 },
    cappedByRule: { type: Boolean, default: true },

    lineage: [
      {
        fromTopic: String,
        toTopic: String,
        amount: Number,
        confidence: Number,
        reason: String
      }
    ],

    dailyCapApplied: { type: Boolean, default: false },
    maxDepth: { type: Number, default: 1 },
    visitedTopics: [String],

    audit: {
      calculatedAt: { type: Date, default: Date.now },
      notes: String
    }
  },
  { timestamps: true }
);

propagationHistorySchema.index({ user: 1, createdAt: -1 });
propagationHistorySchema.index({ user: 1, triggerTopic: 1, createdAt: -1 });

module.exports = model("PropagationHistory", propagationHistorySchema);
