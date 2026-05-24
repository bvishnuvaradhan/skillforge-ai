const RecommendationTrace = require("../../models/RecommendationTrace");
const { env } = require("../../config/env");

/**
 * Archival job for old traces
 * If `dryRun` is true the function returns the number of candidates without deleting.
 */
async function runArchival({ retentionDays = Number(env.TRACE_RETENTION_DAYS) || 90, dryRun = true } = {}) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  const candidates = await RecommendationTrace.countDocuments({ createdAt: { $lt: cutoff } });
  if (dryRun) {
    return { dryRun: true, cutoff, candidates };
  }

  const res = await RecommendationTrace.deleteMany({ createdAt: { $lt: cutoff } });
  return { dryRun: false, cutoff, deleted: res.deletedCount || res.n || 0 };
}

module.exports = { runArchival };
