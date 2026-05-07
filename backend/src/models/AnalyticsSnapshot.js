const { Schema, model } = require("mongoose");

const analyticsSnapshotSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    overallMastery: { type: Number },
    consistencyScore: { type: Number },
    totalSolved: { type: Number },
    activeDays: { type: Number },
    platformBreakdown: {
      leetcode: { type: Number, default: 0 },
      codechef: { type: Number, default: 0 },
      github: { type: Number, default: 0 },
    },
    skillDNA: {
      type: { type: String }, // e.g., "Consistent Learner"
      confidence: { type: Number },
    },
    insights: [{
      type: { type: String }, // e.g., "mastery_drop", "growth_streak"
      message: { type: String },
      topic: { type: String },
      severity: { type: String, enum: ["info", "warning", "success"], default: "info" }
    }]
  },
  { timestamps: true }
);

analyticsSnapshotSchema.index({ user: 1, date: -1 });

const AnalyticsSnapshotModel = model("AnalyticsSnapshot", analyticsSnapshotSchema);

module.exports = { AnalyticsSnapshotModel };
