const { Schema, model } = require("mongoose");

const scrapingCacheSchema = new Schema(
  {
    platform: { type: String, enum: ["codechef", "github", "leetcode"], required: true },
    username: { type: String, required: true },
    data: { type: Schema.Types.Mixed, required: true },
    lastSuccessfulFetch: { type: Date, required: true },
    failureCount: { type: Number, default: 0 },
    lastFailureMessage: { type: String },
    isStale: { type: Boolean, default: false }
  },
  { timestamps: true }
);

scrapingCacheSchema.index({ platform: 1, username: 1 }, { unique: true });

const ScrapingCacheModel = model("ScrapingCache", scrapingCacheSchema);

module.exports = { ScrapingCacheModel };
