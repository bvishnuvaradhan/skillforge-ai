const { Schema, model } = require("mongoose");

const aiCostLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    promptVersion: { type: String, default: "1.0.0" },
    model: { type: String, required: true }, // e.g. "mistral-small-latest"
    action: { type: String, required: true }, // e.g. "mentor_response", "explain", "insight", "reflection"
    tokens: {
      input: { type: Number, default: 0 },
      output: { type: Number, default: 0 },
      total: { type: Number, default: 0 }
    },
    cost: { type: Number, default: 0 }, // Cost in USD
    timestamp: { type: Date, default: Date.now, index: true }
  },
  { timestamps: true }
);

const AICostLogModel = model("AICostLog", aiCostLogSchema);

module.exports = { AICostLogModel };
