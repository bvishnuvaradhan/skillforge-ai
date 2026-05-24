const { Schema, model } = require("mongoose");

const learningPathSnapshotSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetTopic: { type: String, required: true },

    commonPath: [
      {
        topic: String,
        currentMastery: Number,
        targetMastery: Number,
        estimatedDays: String,
        readinessBand: String
      }
    ],

    alternativePaths: [
      {
        topics: [String],
        successRate: Number,
        frequency: Number,
        confidence: Number
      }
    ],

    estimate: {
      estimatedDaysRange: String,
      confidence: Number,
      sampleSize: Number,
      disclaimer: String
    },

    metadata: {
      recalculatedAt: { type: Date, default: Date.now },
      engineVersion: { type: String, default: "step6-v1" },
      uncertaintyNotes: String
    }
  },
  { timestamps: true }
);

learningPathSnapshotSchema.index({ user: 1, targetTopic: 1, createdAt: -1 });

module.exports = model("LearningPathSnapshot", learningPathSnapshotSchema);
