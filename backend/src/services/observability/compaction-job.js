const { RecommendationTraceModel } = require("../../models/RecommendationTrace");
const { CompactionSummaryModel } = require("../../models/CompactionSummary");
const { env } = require("../../config/env");

/**
 * Compaction job: aggregate recommendation traces into simple rollups.
 * By default runs as dryRun and returns aggregation results without modifying DB.
 */
async function runCompaction({ olderThanDays = Number(env.COMPACTION_OLDER_THAN_DAYS) || 30, dryRun = true } = {}) {
  const cutoff = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

  try {
    const pipeline = [
      { $match: { createdAt: { $lt: cutoff } } },
      {
        $group: {
          _id: { topic: "$topic", outcome: "$outcome" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          topic: "$_id.topic",
          outcome: "$_id.outcome",
          count: 1,
          _id: 0
        }
      }
    ];

    const summary = await RecommendationTraceModel.aggregate(pipeline).allowDiskUse(true);

    if (dryRun) {
      return { dryRun: true, cutoff, summary };
    }

    // Persist compaction summary documents and delete originals older than cutoff
    try {
      const docs = (summary || []).map((s) => ({ topic: s.topic, outcome: s.outcome, count: s.count, cutoff }));
      if (docs.length) {
        await CompactionSummaryModel.insertMany(docs, { ordered: false });
      }
    } catch (err) {
      console.warn("[compaction-job] failed to persist summaries:", err && err.message);
    }

    const res = await RecommendationTraceModel.deleteMany({ createdAt: { $lt: cutoff } });
    return { dryRun: false, cutoff, deleted: res.deletedCount || res.n || 0, summary };
  } catch (err) {
    console.warn("[compaction-job] aggregation failed:", err && err.message);
    return { dryRun, cutoff, summary: [], error: String(err && err.message) };
  }
}

module.exports = { runCompaction };
