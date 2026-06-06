const { AuditLogModel } = require("../models/AuditLog");

/**
 * Creates a persistent audit log entry in MongoDB.
 * Falls back to structured console logs if SKIP_DB=true or DB is offline.
 */
async function logAudit(data) {
  try {
    if (process.env.SKIP_DB === "true") {
      console.log(
        `[AuditLog:stub] ${data.category.toUpperCase()} | action=${data.action} | user=${data.userId || "system"} | details=${JSON.stringify(data.details || {})}`
      );
      return null;
    }

    const log = await AuditLogModel.create({
      userId: data.userId,
      action: data.action,
      category: data.category,
      details: data.details,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent
    });

    console.log(`[AuditLog] Successfully logged: ${data.action} (${data.category})`);
    return log;
  } catch (err) {
    // Fail-safe: do not crash active user requests if audit logger fails
    console.error("[AuditLog] Failed to persist audit log event. Error:", err.message);
    return null;
  }
}

module.exports = { logAudit };
