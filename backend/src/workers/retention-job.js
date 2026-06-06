const { RecommendationTraceModel } = require("../models/RecommendationTrace");
const { ArbitrationTraceModel } = require("../models/ArbitrationTrace");
const { TelemetryMetricModel } = require("../models/TelemetryMetric");
const { AuditLogModel } = require("../models/AuditLog");

/**
 * Runs the data retention cleanup process.
 * Deletes transient traces/telemetry older than 30 days, and audit logs older than 90 days.
 */
async function runDataRetentionCleanup() {
  const cutoff30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const cutoff90Days = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  console.log("[RetentionJob] Starting database retention cleanup task...");

  try {
    if (process.env.SKIP_DB === "true") {
      console.log("[RetentionJob:stub] Skipping database operations (SKIP_DB=true)");
      return;
    }

    // 1. Purge transient recommendation traces older than 30 days
    const recTracesResult = await RecommendationTraceModel.deleteMany({
      createdAt: { $lt: cutoff30Days }
    });
    console.log(`[RetentionJob] Cleared ${recTracesResult.deletedCount} recommendation traces older than 30 days.`);

    // 2. Purge transient arbitration traces older than 30 days
    const arbTracesResult = await ArbitrationTraceModel.deleteMany({
      createdAt: { $lt: cutoff30Days }
    });
    console.log(`[RetentionJob] Cleared ${arbTracesResult.deletedCount} arbitration traces older than 30 days.`);

    // 3. Purge operational telemetry metrics older than 30 days
    const telemetryResult = await TelemetryMetricModel.deleteMany({
      createdAt: { $lt: cutoff30Days }
    });
    console.log(`[RetentionJob] Cleared ${telemetryResult.deletedCount} telemetry metrics older than 30 days.`);

    // 4. Purge administrative audit logs older than 90 days to conserve space while maintaining history
    const auditLogsResult = await AuditLogModel.deleteMany({
      createdAt: { $lt: cutoff90Days }
    });
    console.log(`[RetentionJob] Cleared ${auditLogsResult.deletedCount} security/admin audit logs older than 90 days.`);

    console.log("[RetentionJob] Database retention cleanup completed successfully.");
  } catch (error) {
    console.error("[RetentionJob] Failed to execute database retention cleanup. Error:", error.message);
  }
}

module.exports = { runDataRetentionCleanup };
