const { Schema, model } = require("mongoose");

const recommendationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["revision", "weak-topic", "difficulty-increase", "difficulty-decrease", "exploration"],
      required: true
    },
    topic: { type: String, required: true },
    difficulty: { type: Number, min: 1, max: 10 },

    // 2-Dimensional Scoring (Stored)
    urgencyScore: { type: Number, min: 0, max: 100, required: true },
    impactScore: { type: Number, min: 0, max: 100, required: true },

    reason: { type: String, required: true },

    // Step 1 outputs
    metrics: {
      mastery: Number,
      retention: Number,
      daysSinceSolve: Number,
      avgRetries: Number,
      consistency: Number,
      prerequisitesMet: [String],
      dependencyStrength: Number,
      targetRole: String
    },

    // Step 2 outputs
    evidence: {
      triggers: [String],
      relatedMetrics: Schema.Types.Mixed
    },

    // Cool-down & display tracking
    lastRecommendedAt: Date,
    timesShown: { type: Number, default: 0 },
    cooldownUntil: Date,

    // Staleness detection
    isStale: { type: Boolean, default: false },
    staleReason: String,
    staleDetectedAt: Date,

    // User interaction tracking
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed", "stale", "expired"],
      default: "pending"
    },
    acceptedAt: Date,
    rejectedAt: Date,
    rejectionReason: String,
    completedAt: Date,

    // Metadata
    generatedAt: { type: Date, default: Date.now },
    expiresAt: Date,
    sourceAlgorithm: String
  },
  { timestamps: true }
);

// Computed property for dynamic priority
recommendationSchema.methods.getFinalPriority = function(confidenceScore = 50) {
  const rawPriority = (this.urgencyScore * 0.5 + this.impactScore * 0.3 + confidenceScore * 0.2) / 100;
  return Math.min(1, Math.max(0, rawPriority));
};

// Indexes
recommendationSchema.index({ user: 1, status: 1, urgencyScore: -1 });
recommendationSchema.index({ user: 1, topic: 1, status: 1 });
recommendationSchema.index({ user: 1, expiresAt: 1 });

const RecommendationModel = model("Recommendation", recommendationSchema);

module.exports = { RecommendationModel };
