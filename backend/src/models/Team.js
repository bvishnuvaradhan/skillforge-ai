const { Schema, model } = require("mongoose");

const teamSchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    organization: { type: String, default: "" },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    members: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
  },
  { timestamps: true }
);

const TeamModel = model("Team", teamSchema);

module.exports = { TeamModel };
