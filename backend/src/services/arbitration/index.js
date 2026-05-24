const { normalizeSignals } = require("./signal-normalizer");
const { computePriority } = require("./priority-engine");
const { resolveConflicts } = require("./conflict-resolver");
const { governRecommendations } = require("./recommendation-governor");
const {
  upsertActiveLifecycle,
  markStaleForDeferred
} = require("./recommendation-lifecycle");
const { generateDailyFocus } = require("./daily-focus-generator");
const {
  createRunContext,
  markStage,
  buildTracePayload,
  persistTrace
} = require("./telemetry");
const { RecommendationModel } = require("../../models/Recommendation");

async function orchestrateRecommendations(userId, candidates, options = {}) {
  const persist = options.persist !== false;
  const persistTraceEnabled = options.persistTrace === undefined ? persist : options.persistTrace;
  const runContext = createRunContext(userId, candidates, {
    idempotencyKey: options.idempotencyKey,
    requestHash: options.requestHash,
    eventMetadata: options.eventMetadata
  });

  const { normalized, failures } = normalizeSignals(candidates);
  markStage(runContext, "normalizeEnd");

  const scored = [];
  for (const candidate of normalized) {
    const scoredCandidate = await computePriority(candidate, { persist });
    scored.push(scoredCandidate);
  }
  markStage(runContext, "scoreEnd");

  const { winners, deferred: conflictDeferred, conflicts } = await resolveConflicts(scored, { persist });
  markStage(runContext, "conflictEnd");

  const { selected, deferred: governanceDeferred } = await governRecommendations(winners, {
    userId,
    persist,
    maxDaily: 3
  });
  markStage(runContext, "governEnd");

  const deferred = [...conflictDeferred, ...governanceDeferred];
  let lifecycleTransitions = 0;

  if (persist) {
    const winnerIds = selected.map((r) => r._id).filter(Boolean);
    const deferredIds = deferred.map((r) => r._id).filter(Boolean);

    if (winnerIds.length) {
      await RecommendationModel.updateMany(
        { _id: { $in: winnerIds } },
        { status: "pending", staleReason: null, staleDetectedAt: null }
      );

      for (const winner of selected) {
        await upsertActiveLifecycle(userId, winner);
        lifecycleTransitions += 1;
      }
    }

    if (deferredIds.length) {
      await RecommendationModel.updateMany(
        { _id: { $in: deferredIds } },
        {
          status: "stale",
          staleReason: "Deferred by arbitration",
          staleDetectedAt: new Date()
        }
      );
      await markStaleForDeferred(userId, deferred);
      lifecycleTransitions += deferredIds.length;
    }
  }
  markStage(runContext, "lifecycleEnd");

  const dailyFocus = await generateDailyFocus(userId, selected, {
    persist,
    deferred
  });
  markStage(runContext, "focusEnd");

  const tracePayload = buildTracePayload(runContext, {
    normalized,
    normalizedCount: normalized.length,
    failures,
    winners: selected,
    deferred,
    conflicts,
    lifecycleTransitions
  });

  const persistedTrace = await persistTrace(tracePayload, { persist: persistTraceEnabled });

  console.log(
    `[ARBITRATION_TRACE] run=${tracePayload.runId} user=${userId} ` +
      `latencyMs=${tracePayload.latencyMs} winners=${tracePayload.counts.winners} ` +
      `deferred=${tracePayload.counts.deferred} suppressionRate=${tracePayload.metrics.suppressionRate}`
  );

  return {
    winners: selected,
    deferred,
    conflicts,
    failures,
    dailyFocus,
    trace: persistedTrace || tracePayload
  };
}

module.exports = {
  orchestrateRecommendations
};
