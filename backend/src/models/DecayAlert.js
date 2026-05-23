const { Schema, model } = require("mongoose");

const decayAlertSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: String, required: true },

    // Alert classification
    type: {
      type: String,
      enum: ["review_window_open", "reaching_critical", "delay_penalty", "reactivation_needed"],
      required: true
    },
    severity: { type: Number, min: 1, max: 5 }, // 1=info, 5=critical

    // Notification content
    triggersAt: { type: Date, required: true },
    message: { type: String, required: true },
    reason: { type: String },

    // Action to take
    action: {
      type: { type: String, enum: ["revision", "practice", "maintenance"] },
      topic: { type: String },
      recommendedCount: { type: Number },
      difficulty: { type: Number, min: 1, max: 10 }
    },

    // User interaction
    dismissed: { type: Boolean, default: false },
    dismissedAt: { type: Date },
    dismissedReason: { type: String },
    actionTaken: { type: Boolean, default: false },
    actionDate: { type: Date },

    // Metadata
    createdAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

// Indexes for fast queries
decayAlertSchema.index({ user: 1, dismissed: 1, triggersAt: 1 });
decayAlertSchema.index({ user: 1, topic: 1, type: 1 });
decayAlertSchema.index({ triggersAt: 1 }); // For alert dispatcher
decayAlertSchema.index({ user: 1, createdAt: -1 }); // For alert history

const DecayAlertModel = model("DecayAlert", decayAlertSchema);

module.exports = { DecayAlertModel };
