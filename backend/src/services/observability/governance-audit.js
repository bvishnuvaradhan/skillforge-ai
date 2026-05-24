const { GovernanceAuditModel } = require("../../models/GovernanceAudit");

function inferRule(rec) {
  const reason = String(rec.deferredReason || "").toLowerCase();
  if (reason.includes("cooldown")) return "topic_cooldown";
  if (reason.includes("daily recommendation cap")) return "daily_cap";
  if (reason.includes("diversity")) return "diversity_balance";
  if (!reason) return "selection";
  return "governance_filter";
}

function buildGovernanceAuditRecords(userId, runId, selected = [], deferred = []) {
  const surfaced = (selected || []).map((rec) => ({
    user: userId,
    runId,
    recommendationId: String(rec._id || ""),
    topic: rec.topic,
    action: "surfaced",
    rule: "selection",
    reason: rec.winnerReason || "Selected by arbitration",
    isCritical: rec.hardFlags?.criticalDecay === true,
    metadata: {
      finalPriorityScore: rec.finalPriorityScore,
      sourceEngine: rec.sourceEngine
    }
  }));

  const deferredAudits = (deferred || []).map((rec) => ({
    user: userId,
    runId,
    recommendationId: String(rec._id || ""),
    topic: rec.topic,
    action: "deferred",
    rule: inferRule(rec),
    reason: rec.deferredReason || "Deferred by governance",
    isCritical: rec.hardFlags?.criticalDecay === true,
    metadata: {
      finalPriorityScore: rec.finalPriorityScore,
      sourceEngine: rec.sourceEngine
    }
  }));

  return [...surfaced, ...deferredAudits];
}

async function persistGovernanceAudits(records = [], options = {}) {
  if (options.persist === false || !records.length) return [];
  return GovernanceAuditModel.insertMany(records, { ordered: false });
}

module.exports = {
  buildGovernanceAuditRecords,
  persistGovernanceAudits
};
