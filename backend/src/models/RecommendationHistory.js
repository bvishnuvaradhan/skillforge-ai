const { Schema, model } = require("mongoose");

const recommendationHistorySchema = new Schema(
  {
    recommendationId: { type: Schema.Types.ObjectId, ref: "Recommendation" },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: String,
    topic: String,
    finalStatus: String,
    interactionTime: Number,
    feedbackReason: String,
    wasHelpful: Boolean,
    userAction: String,
    archivedAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for analytics
recommendationHistorySchema.index({ user: 1, wasHelpful: 1 });
recommendationHistorySchema.index({ topic: 1, wasHelpful: 1 });

const RecommendationHistoryModel = model("RecommendationHistory", recommendationHistorySchema);

module.exports = { RecommendationHistoryModel };
