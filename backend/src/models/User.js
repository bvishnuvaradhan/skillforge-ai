const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["learner", "admin"], default: "learner" },
    profile: {
      fullName: { type: String, default: "" },
      targetRole: { type: String, default: "" },
      avatarUrl: { type: String, default: "" },
      goals: { type: [String], default: [] },
      codingProfiles: {
        leetcode: { type: String, default: "" },
        codechef: { type: String, default: "" },
        github: { type: String, default: "" },
      },
      theme: { type: String, enum: ["light", "dark", "system"], default: "system" },
    },
  },
  { timestamps: true },
);

const UserModel = model("User", userSchema);

module.exports = { UserModel };