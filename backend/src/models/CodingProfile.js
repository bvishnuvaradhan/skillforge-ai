const { Schema, model } = require("mongoose");

const codingProfileSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    platform: { type: String, enum: ["leetcode", "codechef", "github"], required: true },
    username: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    lastSyncedAt: { type: Date },
    syncStatus: { type: String, enum: ["idle", "syncing", "failed", "success", "success_cached"], default: "idle" },
    error: { type: String },
    stats: {
      rating: { type: Number },
      globalRank: { type: Number },
      totalSolved: { type: Number },
      streak: { type: Number },
      totalContributions: { type: Number },
      totalRepos: { type: Number },
      totalStars: { type: Number },
    },
  },
  { timestamps: true }
);

// Ensure a user can only have one profile per platform
codingProfileSchema.index({ user: 1, platform: 1 }, { unique: true });

const CodingProfileModel = model("CodingProfile", codingProfileSchema);

module.exports = { CodingProfileModel };
