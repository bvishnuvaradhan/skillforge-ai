const { Schema, model } = require("mongoose");

const decayForecastSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },

    // Current state at time of forecast
    currentRetention: { type: Number, min: 0, max: 1 }, // R(t) now

    // Future retention predictions with confidence
    forecasts: {
      day3: {
        retention: { type: Number, min: 0, max: 1 },
        confidence: { type: Number, min: 0, max: 95 }
      },
      day7: {
        retention: { type: Number, min: 0, max: 1 },
        confidence: { type: Number, min: 0, max: 95 }
      },
      day30: {
        retention: { type: Number, min: 0, max: 1 },
        confidence: { type: Number, min: 0, max: 95 }
      }
    },

    // Optimal review timing
    optimalReviewTiming: {
      windowOpensAt: { type: Date },
      windowClosesAt: { type: Date },
      optimalDay: { type: Date },
      delayPenalty: { type: Number } // % effectiveness loss per day
    },

    // Spaced repetition schedule (SM-2)
    spacedRepetition: {
      interval1: { type: Number }, // First review (days)
      interval2: { type: Number }, // Second review (days from interval1)
      interval3: { type: Number }, // Third review (days from interval2)
      intervals: [Number] // Full SM-2 schedule
    },

    // Risk classification
    riskLevel: { type: String, enum: ["safe", "warning", "critical"] },

    // Metadata about forecast
    basedOnHalfLife: { type: Number }, // Which halfLife was used
    usedActualCurve: { type: Boolean }, // true = learned, false = formula-based
    validUntil: { type: Date }, // When forecast becomes stale

    // Timestamps
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for fast queries
decayForecastSchema.index({ user: 1, topic: 1, createdAt: -1 });
decayForecastSchema.index({ user: 1, "riskLevel": 1 });
decayForecastSchema.index({ user: 1, validUntil: 1 }); // For stale forecast detection

const DecayForecastModel = model("DecayForecast", decayForecastSchema);

module.exports = { DecayForecastModel };
