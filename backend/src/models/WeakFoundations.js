const { Schema, model } = require("mongoose");

const weakFoundationsSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    createdAt: { type: Date, default: Date.now },

    // CRITICAL SAFEGUARD: Flagged issues with soft language
    issues: [
      {
        advancedTopic: String,
        prerequisite: String,
        advancedMastery: { type: Number, min: 0, max: 100 },
        prerequisiteMastery: { type: Number, min: 0, max: 100 },
        gap: { type: Number, default: function() {
          return this.advancedMastery - this.prerequisiteMastery;
        }},
        severity: { type: Number, min: 0, max: 5, default: function() {
          const gap = this.advancedMastery - this.prerequisiteMastery;
          if (gap > 40) return 5;
          if (gap > 30) return 4;
          if (gap > 20) return 3;
          if (gap > 10) return 2;
          return 1;
        }},

        // CRITICAL SAFEGUARD: Soft language only, never accusatory
        // DO NOT USE: "weak", "poor", "deficient", "missing"
        // USE: "opportunity", "reinforcement", "may strengthen"
        explanation: String, // "Optional: Strengthening X may deepen Y understanding"
        recommendation: String, // "Consider reinforcing X (currently Y%) for stronger foundation"

        // CRITICAL: Cooldown tracking for Phase 3.8
        lastAlerted: Date,
        alertCount: { type: Number, default: 0 },
        shouldAlert: { type: Boolean, default: true },

        detectedAt: Date
      }
    ],

    totalIssues: { type: Number, default: 0 },
    highSeverityCount: { type: Number, default: 0 },
    mediumSeverityCount: { type: Number, default: 0 },
    lowSeverityCount: { type: Number, default: 0 },

    lastEvaluated: Date,

    // CRITICAL SAFEGUARD: Track sentiment
    allMessagesHaveSoftLanguage: Boolean,
    sentimentAudit: String // Log of language review
  },
  { timestamps: true }
);

weakFoundationsSchema.index({ user: 1, createdAt: -1 });
weakFoundationsSchema.index({ user: 1, "issues.severity": -1 });

module.exports = model("WeakFoundations", weakFoundationsSchema);
