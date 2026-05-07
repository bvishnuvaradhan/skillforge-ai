const { Schema, model } = require("mongoose");

const settingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true, index: true },
    theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    avatarUrl: { type: String, default: "" },
  },
  { timestamps: true },
);

const SettingModel = model("Setting", settingSchema);

module.exports = { SettingModel };