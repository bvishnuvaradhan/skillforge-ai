const { ArbitrationTraceModel } = require("../../models/ArbitrationTrace");
const { RecommendationTraceModel } = require("../../models/RecommendationTrace");
const { CompactionSummaryModel } = require("../../models/CompactionSummary");
const { TelemetryMetricModel } = require("../../models/TelemetryMetric");

/**
 * Aggregate basic telemetry: daily trace counts, avg arbitration latency, average suppressionRate
 * This job is resilient to missing DB in test/dev and returns an object summary when dryRun.
 */
async function runTelemetryAggregation({ lookbackDays = 7, dryRun = true } = {}) {
  const end = new Date();
  const start = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);

  try {
    const traces = await ArbitrationTraceModel.find({ createdAt: { $gte: start, $lt: end } }).lean();
    const total = traces.length;
    const avgLatency = traces.length ? traces.reduce((s, t) => s + (t.latencyMs || 0), 0) / traces.length : 0;
    const avgSuppression = traces.length ? traces.reduce((s, t) => s + (t.metrics?.suppressionRate || 0), 0) / traces.length : 0;

    // simple rollup from compaction summaries for trace counts per topic
    const compaction = await CompactionSummaryModel.find({ createdAt: { $gte: start, $lt: end } }).lean().catch(()=>[]);

    const summary = {
      intervalStart: start,
      intervalEnd: end,
      traceCount: total,
      avgLatency: Math.round(avgLatency),
      avgSuppression: Math.round(avgSuppression * 100) / 100,
      compactionCount: compaction.length
    };

    if (dryRun) return { dryRun: true, summary };

    // persist telemetry metric
    await TelemetryMetricModel.create({ name: "arbitration-weekly", value: summary, intervalStart: start, intervalEnd: end });
    return { dryRun: false, summary };
  } catch (err) {
    console.warn("[telemetry-aggregator] failed:", err && err.message);
    return { dryRun, error: String(err && err.message), summary: null };
  }
}

module.exports = { runTelemetryAggregation };
