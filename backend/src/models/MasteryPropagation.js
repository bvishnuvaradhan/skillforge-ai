const { Schema, model } = require("mongoose");

const masteryPropagationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    triggerTopic: { type: String, required: true },

    // What changed
    previousMastery: { type: Number, min: 0, max: 100 },
    currentMastery: { type: Number, min: 0, max: 100 },
    directGain: { type: Number, default: 0 },

    // CRITICAL SAFEGUARD: Propagation with hard 20% cap
    propagationEvents: [
      {
        affectedTopic: String,
        spilloverFactor: { type: Number, min: 0, max: 1 },

        // MANDATORY: Track cap enforcement
        directGainAmount: Number,
        maxAllowedPropagation: { type: Number, default: function() {
          // 20% of direct gain
          return Math.max(this.directGainAmount * 0.2, 0.5); // Min 0.5%
        }},
        actualPropagation: Number,
        capEnforced: Boolean,
        capReason: { type: String, default: "CRITICAL: 20% hard cap rule" },

        previousMasteryAffected: Number,
        newMasteryAffected: Number,
        calculatedAt: Date
      }
    ],

    // Summary
    topicsAffected: { type: Number, default: 0 },
    totalPropagation: { type: Number, default: 0 },
    propagationPercentOfDirect: { type: Number, default: 0 },

    // CRITICAL SAFEGUARD: Timestamp for eventual propagation decay
    triggeredAt: { type: Date, default: Date.now },
    propagationDecayRate: { type: Number, min: 0, max: 1, default: 0 }, // For Phase 3.8

    // CRITICAL SAFEGUARD: Cycle detection
    visitedTopics: [String],
    recursionDepth: { type: Number, default: 1 },
    cycleDetected: Boolean,

    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

masteryPropagationSchema.index({ user: 1, triggerTopic: 1, createdAt: -1 });
masteryPropagationSchema.index({ user: 1, createdAt: -1 });

module.exports = model("MasteryPropagation", masteryPropagationSchema);
