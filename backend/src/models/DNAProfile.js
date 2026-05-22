const { Schema, model } = require("mongoose");

const dnaProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    timestamp: { type: Date, default: Date.now },

    // 8 DNA Factors (0-100 normalized)
    factors: {
      consistency: { type: Number, min: 0, max: 100 },
      frequency: { type: Number, min: 0, max: 100 },
      retryPattern: { type: Number, min: 0, max: 100 },
      difficultyProgression: { type: Number, min: 0, max: 100 },
      topicDepth: { type: Number, min: 0, max: 100 },
      topicBreadth: { type: Number, min: 0, max: 100 },
      speedScore: { type: Number, min: 0, max: 100 },
      learnerVelocity: { type: Number, min: 0, max: 100 }
    },

    // Probabilistic Type Scores (0-100)
    scores: {
      consistentLearnerScore: { type: Number, min: 0, max: 100 },
      persistentExplorerScore: { type: Number, min: 0, max: 100 },
      speedStrategistScore: { type: Number, min: 0, max: 100 },
      deepDiverScore: { type: Number, min: 0, max: 100 }
    },

    // Final Classification
    classification: {
      primaryType: {
        type: String,
        enum: ["Consistent Learner", "Persistent Explorer", "Speed Strategist", "Deep Diver"],
        required: true
      },
      secondaryType: String,
      blend: Schema.Types.Mixed,  // { "type": percentage, ... }
      confidence: { type: Number, min: 0, max: 85, required: true }
    },

    // Transition Info (if applicable)
    transition: {
      detected: { type: Boolean, default: false },
      fromType: String,
      toType: String,
      fromTimestamp: Date,
      confidence: { type: Number, min: 0, max: 95 },
      signals: [String]
    },

    // Metadata
    metadata: {
      observationDays: Number,
      submissionCount: Number,
      topicsExplored: Number,
      maxUDI: Number,
      avgUDI: Number
    }
  },
  { timestamps: true }
);

dnaProfileSchema.index({ user: 1, timestamp: -1 });
dnaProfileSchema.index({ "classification.primaryType": 1, user: 1 });

module.exports = { DNAProfileModel: model("DNAProfile", dnaProfileSchema) };
