const { Schema, model } = require("mongoose");

const githubActivitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    commits: { type: Number, default: 0 },
    repositories: [{
      name: { type: String },
      url: { type: String },
      stars: { type: Number },
      language: { type: String },
      contributionCount: { type: Number },
    }],
    topLanguages: [{
      name: { type: String },
      count: { type: Number },
    }],
    streak: { type: Number, default: 0 },
    totalContributions: { type: Number, default: 0 },
  },
  { timestamps: true }
);

githubActivitySchema.index({ user: 1, date: -1 });

const GithubActivityModel = model("GithubActivity", githubActivitySchema);

module.exports = { GithubActivityModel };
