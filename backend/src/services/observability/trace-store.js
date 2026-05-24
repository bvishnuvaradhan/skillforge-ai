const { RecommendationTraceModel } = require("../../models/RecommendationTrace");
const { NormalizationFailureModel } = require("../../models/NormalizationFailure");
const { LifecycleAuditModel } = require("../../models/LifecycleAudit");
const {
  buildScoreProvenanceRecords,
  persistScoreProvenance
} = require("./score-provenance");
const {
  buildGovernanceAuditRecords,
  persistGovernanceAudits
} = require("./governance-audit");
const { shouldSampleTrace, buildRetentionMetadata } = require("./retention");

function buildRecommendationTraceRecords(tracePayload, results = {}, arbitrationTraceId) {
  const winners = results.winners || [];
  const deferred = results.deferred || [];
  const all = [
    ...winners.map((item) => ({ ...item, __outcome: "winner" })),
    ...deferred.map((item) => ({ ...item, __outcome: "deferred" }))
  ];

  return all.map((item) => ({
    user: tracePayload.user,
    runId: tracePayload.runId,
    arbitrationTraceId,
    recommendationId: String(item._id || ""),
    topic: item.topic,
    type: item.type,
    outcome: item.__outcome,
    reason: item.__outcome === "winner" ? item.winnerReason : item.deferredReason,
    stage: item.__outcome === "winner" ? "arbitration" : "governance",
    winningSignal: item.hardFlags?.criticalDecay
      ? "decay"
      : item.hardFlags?.foundationRisk
      ? "dependency"
      : item.sourceEngine || "fallback",
    finalPriorityScore: item.finalPriorityScore,
    sourceEngine: item.sourceEngine,
    sourceAlgorithm: item.sourceAlgorithm,
    lineage: {
      summary: item.explainability?.summary,
      evidence: item.explainability?.evidence,
      caveats: item.explainability?.caveats || []
    },
    ancestry: {
      hardFlags: item.hardFlags || {},
      governance: item.governance || {}
    },
    metadata: {
      boosts: item.boosts || {},
      penalties: item.penalties || {}
    }
  }));
}

function buildNormalizationFailureRecords(tracePayload, results = {}) {
  return (results.failures || []).map((failure) => ({
    user: tracePayload.user,
    runId: tracePayload.runId,
    recommendationId: failure?.recommendationId ? String(failure.recommendationId) : undefined,
    topic: failure.topic,
    error: failure.error,
    source: "signal-normalizer",
    payload: failure
  }));
}

async function persistObservabilityArtifacts(tracePayload, results = {}, options = {}) {
  if (options.persist === false) {
    return {
      recommendationTraces: 0,
      normalizationFailures: 0,
      scoreProvenance: 0,
      governanceAudits: 0
    };
  }

  const sampled = shouldSampleTrace(tracePayload, options.sampling || {});
  if (!sampled) {
    return {
      recommendationTraces: 0,
      normalizationFailures: 0,
      scoreProvenance: 0,
      governanceAudits: 0,
      sampled: false
    };
  }

  const retention = buildRetentionMetadata(tracePayload);

  const recommendationTraceRecords = buildRecommendationTraceRecords(
    tracePayload,
    results,
    options.arbitrationTraceId
  ).map((record) => ({ ...record, metadata: { ...(record.metadata || {}), retention } }));
  const normalizationFailureRecords = buildNormalizationFailureRecords(tracePayload, results);
  const scoreProvenanceRecords = buildScoreProvenanceRecords(
    tracePayload.user,
    tracePayload.runId,
    results.scored || []
  );
  const governanceAuditRecords = buildGovernanceAuditRecords(
    tracePayload.user,
    tracePayload.runId,
    results.winners || [],
    results.deferred || []
  );

  if (recommendationTraceRecords.length) {
    await RecommendationTraceModel.insertMany(recommendationTraceRecords, { ordered: false });
  }
  if (normalizationFailureRecords.length) {
    await NormalizationFailureModel.insertMany(normalizationFailureRecords, { ordered: false });
  }

  await persistScoreProvenance(scoreProvenanceRecords, options);
  await persistGovernanceAudits(governanceAuditRecords, options);

  return {
    recommendationTraces: recommendationTraceRecords.length,
    normalizationFailures: normalizationFailureRecords.length,
    scoreProvenance: scoreProvenanceRecords.length,
    governanceAudits: governanceAuditRecords.length,
    sampled: true,
    retention
  };
}

async function logLifecycleAudit(entry, options = {}) {
  if (options.persist === false) return null;

  const payload = {
    user: entry.userId,
    recommendationId: String(entry.recommendationId || ""),
    topic: entry.topic,
    fromState: entry.fromState,
    toState: entry.toState,
    reason: entry.reason,
    source: entry.source || "arbitration",
    metadata: entry.metadata || {}
  };

  return LifecycleAuditModel.create(payload);
}

module.exports = {
  persistObservabilityArtifacts,
  logLifecycleAudit
};
