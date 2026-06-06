const { Schema, model } = require("mongoose");

const featureFlagSchema = new Schema(
  {
    key: { type: String, required: true, unique: true, index: true },
    enabled: { type: Boolean, required: true, default: false },
    description: String
  },
  { timestamps: true }
);

const FeatureFlagModel = model("FeatureFlag", featureFlagSchema);

module.exports = { FeatureFlagModel };
