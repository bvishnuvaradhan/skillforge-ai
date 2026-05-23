const { Schema, model } = require("mongoose");

const decayProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },

    // Personalized halfLife estimation
    estimatedHalfLife: { type: Number }, // Days (e.g., 12.5)
    halfLifeConfidence: { type: Number, min: 0, max: 95 }, // How confident in estimate

    // Model accuracy metrics
    modelAccuracy: { type: Number, min: 0, max: 100 }, // % predictions within 10%
    predictionError: { type: Number }, // Avg |predicted - actual|
    lastCalibrated: { type: Date },

    // Role-specific decay
    role: { type: String, enum: ["backend", "frontend", "fullstack"] },

    // Metadata about curve fit
    samplesUsed: { type: Number }, // # observations used
    observationWindow: { type: Number }, // Days of history analyzed

    // Timestamps
    lastUpdated: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for fast queries
decayProfileSchema.index({ user: 1, topic: 1 });
decayProfileSchema.index({ user: 1, role: 1 });
decayProfileSchema.index({ user: 1, lastUpdated: -1 });

const DecayProfileModel = model("DecayProfile", decayProfileSchema);

module.exports = { DecayProfileModel };
