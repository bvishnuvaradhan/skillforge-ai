const { Schema, model } = require("mongoose");

const topicStatSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true }, // e.g., "Graphs", "DP", "Arrays"
    masteryScore: { type: Number, default: 0, min: 0, max: 100 },
    solvedCount: { type: Number, default: 0 },
    difficultyDistribution: {
      easy: { type: Number, default: 0 },
      medium: { type: Number, default: 0 },
      hard: { type: Number, default: 0 },
    },
    lastSolvedAt: { type: Date },
    stability: { type: Number, default: 10 }, // For Skill Decay (S value)
  },
  { timestamps: true }
);

topicStatSchema.index({ user: 1, topic: 1 }, { unique: true });

const TopicStatModel = model("TopicStat", topicStatSchema);

module.exports = { TopicStatModel };
