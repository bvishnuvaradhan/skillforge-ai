const { Schema, model } = require("mongoose");

const prerequisiteValidationSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },

    // CRITICAL SAFEGUARD: Prerequisite status
    prerequisites: [
      {
        topic: String,
        required: Boolean,
        userMastery: { type: Number, min: 0, max: 100 },
        requiredMastery: { type: Number, min: 0, max: 100, default: 60 },
        isMet: Boolean,
        confidence: { type: Number, min: 0, max: 95 },
        recommendation: {
          type: String,
          enum: ["ready", "almost_ready", "needs_work"],
          default: "needs_work"
        }
      }
    ],

    // CRITICAL SAFEGUARD: Overall readiness with bands (NOT percentages to user)
    readinessScore: { type: Number, min: 0, max: 100 },
    readinessBand: {
      type: String,
      enum: ["NOT_READY", "DEVELOPING", "READY", "MASTERED"],
      default: "NOT_READY"
    },
    readinessConfidence: { type: Number, min: 0, max: 95 },

    allPrerequisitesMet: Boolean,
    strongestPrerequisite: String,
    weakestPrerequisite: String,
    weakestPrerequisiteMastery: Number,

    // CRITICAL SAFEGUARD: Recommended preparation (soft language)
    suggestedPreparation: [String],
    estimatedDaysToReadiness: Number,

    // CRITICAL SAFEGUARD: Soft language for weak foundations
    weakFoundationDetected: Boolean,
    weakFoundationOpportunity: String, // "Strengthening X may enhance Y retention"

    // Metadata
    evaluatedAt: Date,
    lastEvaluated: Date,
    evaluationReason: String

  },
  { timestamps: true }
);

prerequisiteValidationSchema.index({ user: 1, topic: 1 });
prerequisiteValidationSchema.index({ user: 1, readinessBand: 1 });
prerequisiteValidationSchema.index({ lastEvaluated: -1 });

module.exports = model("PrerequisiteValidation", prerequisiteValidationSchema);
