const { randomUUID, createHash } = require("crypto");
const { ArbitrationTraceModel } = require("../../models/ArbitrationTrace");

function computeCandidateOrderHash(candidates = []) {
  const payload = candidates.map((candidate) => ({
    id: String(candidate?._id || ""),
    topic: candidate?.topic || "",
    type: candidate?.type || "",
    updatedAt: candidate?.updatedAt ? new Date(candidate.updatedAt).toISOString() : ""
  }));

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

function buildWorkerIdempotencyKey(userId, jobId, requestHash) {
  const safeUser = String(userId || "unknown");
  const safeJob = String(jobId || "unknown");
  const hashPrefix = String(requestHash || "nohash").slice(0, 16);
  return `worker:analytics:${safeUser}:${safeJob}:${hashPrefix}`;
}

function isReplaySafeMatch(existingTrace, requestHash) {
  if (!existingTrace || !requestHash) return false;
  return existingTrace.idempotency?.requestHash === requestHash;
}

function createRunContext(userId, candidates = [], metadata = {}) {
  return {
    runId: randomUUID(),
    userId,
    startedAt: Date.now(),
    marks: {
      normalizeEnd: 0,
      scoreEnd: 0,
      conflictEnd: 0,
      governEnd: 0,
      lifecycleEnd: 0,
      focusEnd: 0
    },
    inputCount: candidates.length,
    idempotencyKey: metadata.idempotencyKey,
    requestHash: metadata.requestHash,
    eventMetadata: {
      source: metadata.eventMetadata?.source || "api",
      trigger: metadata.eventMetadata?.trigger || "manual",
      replaySafe: metadata.eventMetadata?.replaySafe !== false,
      sequence: metadata.eventMetadata?.sequence
    },
    ordering: {
      candidateIds: candidates.map((candidate) => candidate?._id).filter(Boolean),
      candidateOrderHash: computeCandidateOrderHash(candidates)
    }
  };
}

function markStage(context, stageName) {
  if (!context || !context.marks) return;
  context.marks[stageName] = Date.now();
}

function countBy(list, keyGetter) {
  const counts = {};
  for (const item of list || []) {
    const key = keyGetter(item) || "unknown";
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function toDuration(start, end) {
  if (!start || !end || end < start) return 0;
  return end - start;
}

function buildTracePayload(context, results) {
  const now = Date.now();
  const completedAtMs = context.marks.focusEnd || now;
  const winners = results.winners || [];
  const deferred = results.deferred || [];
  const failures = results.failures || [];
  const conflicts = results.conflicts || [];

  const cooldownBlocks = deferred.filter((d) =>
    String(d.deferredReason || "").toLowerCase().includes("cooldown")
  ).length;

  const suppressionRate = context.inputCount
    ? Number(((deferred.length / context.inputCount) * 100).toFixed(2))
    : 0;

  return {
    user: context.userId,
    runId: context.runId,
    status: results.status || "completed",
    idempotency: {
      key: context.idempotencyKey,
      requestHash: context.requestHash,
      replayedFromRunId: results.replayedFromRunId
    },
    eventMetadata: context.eventMetadata,
    ordering: context.ordering,
    startedAt: new Date(context.startedAt),
    completedAt: new Date(completedAtMs),
    latencyMs: toDuration(context.startedAt, completedAtMs),
    stageDurations: {
      normalizeMs: toDuration(context.startedAt, context.marks.normalizeEnd),
      scoreMs: toDuration(context.marks.normalizeEnd, context.marks.scoreEnd),
      conflictMs: toDuration(context.marks.scoreEnd, context.marks.conflictEnd),
      governMs: toDuration(context.marks.conflictEnd, context.marks.governEnd),
      lifecycleMs: toDuration(context.marks.governEnd, context.marks.lifecycleEnd),
      focusMs: toDuration(context.marks.lifecycleEnd, context.marks.focusEnd)
    },
    counts: {
      inputCandidates: context.inputCount,
      normalizedCandidates: results.normalizedCount || 0,
      normalizationFailures: failures.length,
      winners: winners.length,
      deferred: deferred.length,
      conflicts: conflicts.length
    },
    metrics: {
      suppressionRate,
      cooldownBlocks,
      governanceConflicts: conflicts.length,
      lifecycleTransitions: results.lifecycleTransitions || 0,
      winnerDistributionByType: countBy(winners, (item) => item.type),
      winnerDistributionByEngine: countBy(winners, (item) => item.sourceEngine)
    },
    output: {
      winnerIds: winners.map((item) => item._id).filter(Boolean),
      deferredIds: deferred.map((item) => item._id).filter(Boolean),
      failureCount: failures.length
    },
    normalizationFailures: failures.map((f) => ({
      recommendationId: f.recommendationId,
      topic: f.topic,
      error: f.error
    })),
    suppressedRecommendations: deferred.map((item) => ({
      recommendationId: item._id,
      topic: item.topic,
      type: item.type,
      deferredReason: item.deferredReason,
      finalPriorityScore: item.finalPriorityScore
    })),
    signalAncestry: (results.normalized || []).map((item) => ({
      recommendationId: item._id,
      topic: item.topic,
      type: item.type,
      sourceAlgorithm: item.sourceAlgorithm,
      sourceEngine: item.sourceEngine
    })),
    decisionLineage: winners.map((item) => ({
      recommendationId: item._id,
      topic: item.topic,
      winnerReason: item.winnerReason,
      winningSignal: item.hardFlags?.criticalDecay
        ? "decay"
        : item.hardFlags?.foundationRisk
        ? "dependency"
        : item.sourceEngine || "fallback",
      finalPriorityScore: item.finalPriorityScore
    }))
  };
}

async function persistTrace(tracePayload, options = {}) {
  if (options.persist === false) return null;
  return ArbitrationTraceModel.create(tracePayload);
}

async function findTraceByIdempotency(userId, idempotencyKey) {
  if (!idempotencyKey) return null;
  return ArbitrationTraceModel.findOne({
    user: userId,
    "idempotency.key": idempotencyKey
  }).sort({ createdAt: -1 });
}

module.exports = {
  createRunContext,
  markStage,
  buildTracePayload,
  persistTrace,
  findTraceByIdempotency,
  computeCandidateOrderHash,
  buildWorkerIdempotencyKey,
  isReplaySafeMatch
};
