const { ArbitrationTraceModel } = require("../../models/ArbitrationTrace");
const { RecommendationTraceModel } = require("../../models/RecommendationTrace");
const { GovernanceAuditModel } = require("../../models/GovernanceAudit");
const { ScoreProvenanceModel } = require("../../models/ScoreProvenance");
const { NormalizationFailureModel } = require("../../models/NormalizationFailure");
const { LifecycleAuditModel } = require("../../models/LifecycleAudit");

async function getTraceByRecommendation(userId, recommendationId) {
  const recId = String(recommendationId || "");
  const [recommendationTraces, scoreProvenance, governanceAudit, lifecycleAudit, normalizationFailures] =
    await Promise.all([
      RecommendationTraceModel.find({ user: userId, recommendationId: recId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      ScoreProvenanceModel.find({ user: userId, recommendationId: recId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      GovernanceAuditModel.find({ user: userId, recommendationId: recId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean(),
      LifecycleAuditModel.find({ user: userId, recommendationId: recId })
        .sort({ createdAt: -1 })
        .limit(100)
        .lean(),
      NormalizationFailureModel.find({ user: userId, recommendationId: recId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean()
    ]);

  return {
    recommendationId: recId,
    recommendationTraces,
    scoreProvenance,
    governanceAudit,
    lifecycleAudit,
    normalizationFailures
  };
}

async function getUserTraceOverview(userId, options = {}) {
  const limit = Math.min(Number(options.limit || 50), 200);
  const traces = await ArbitrationTraceModel.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return { userId: String(userId), traces };
}

async function getArbitrationRunTrace(userId, runId) {
  const run = await ArbitrationTraceModel.findOne({ user: userId, runId }).lean();
  if (!run) return null;

  const [recommendationTraces, governanceAudit, scoreProvenance, normalizationFailures] = await Promise.all([
    RecommendationTraceModel.find({ user: userId, runId }).sort({ createdAt: -1 }).lean(),
    GovernanceAuditModel.find({ user: userId, runId }).sort({ createdAt: -1 }).lean(),
    ScoreProvenanceModel.find({ user: userId, runId }).sort({ createdAt: -1 }).lean(),
    NormalizationFailureModel.find({ user: userId, runId }).sort({ createdAt: -1 }).lean()
  ]);

  return {
    run,
    recommendationTraces,
    governanceAudit,
    scoreProvenance,
    normalizationFailures
  };
}

async function getGovernanceEvents(userId, options = {}) {
  const limit = Math.min(Number(options.limit || 100), 300);
  const filter = { user: userId };
  if (options.action) filter.action = options.action;

  const events = await GovernanceAuditModel.find(filter).sort({ createdAt: -1 }).limit(limit).lean();
  return { userId: String(userId), events };
}

async function getLineage(userId, recommendationId) {
  const recId = String(recommendationId || "");
  const recommendationTraces = await RecommendationTraceModel.find({ user: userId, recommendationId: recId })
    .sort({ createdAt: 1 })
    .lean();

  const lifecycle = await LifecycleAuditModel.find({ user: userId, recommendationId: recId })
    .sort({ createdAt: 1 })
    .lean();

  return {
    recommendationId: recId,
    lineage: recommendationTraces.map((trace) => ({
      at: trace.createdAt,
      stage: trace.stage,
      outcome: trace.outcome,
      reason: trace.reason,
      winningSignal: trace.winningSignal,
      finalPriorityScore: trace.finalPriorityScore
    })),
    lifecycle: lifecycle.map((entry) => ({
      at: entry.createdAt,
      fromState: entry.fromState,
      toState: entry.toState,
      reason: entry.reason
    }))
  };
}

module.exports = {
  getTraceByRecommendation,
  getUserTraceOverview,
  getArbitrationRunTrace,
  getGovernanceEvents,
  getLineage
};
