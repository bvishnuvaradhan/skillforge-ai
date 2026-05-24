const { RecommendationTraceModel } = require("../../models/RecommendationTrace");
const { env } = require("../../config/env");

/**
 * Archival job for old traces
 * If `dryRun` is true the function returns the number of candidates without deleting.
 */
async function runArchival({ retentionDays = Number(env.TRACE_RETENTION_DAYS) || 90, dryRun = true } = {}) {
  const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);
  let candidates = 0;
  try {
    candidates = await RecommendationTraceModel.countDocuments({ createdAt: { $lt: cutoff } });
  } catch (err) {
    // Likely no DB connection in local/test environment; return safe default
    console.warn("[archival-job] countDocuments failed, assuming 0 candidates:", err && err.message);
    candidates = 0;
  }

  if (dryRun) {
    return { dryRun: true, cutoff, candidates };
  }

  try {
    const res = await RecommendationTraceModel.deleteMany({ createdAt: { $lt: cutoff } });
    return { dryRun: false, cutoff, deleted: res.deletedCount || res.n || 0 };
  } catch (err) {
    console.warn("[archival-job] deleteMany failed:", err && err.message);
    return { dryRun: false, cutoff, deleted: 0, error: String(err && err.message) };
  }
}

module.exports = { runArchival };
