const { normalizeSignals } = require("./signal-normalizer");
const { computePriority } = require("./priority-engine");
const { resolveConflicts } = require("./conflict-resolver");
const { governRecommendations } = require("./recommendation-governor");
const {
  upsertActiveLifecycle,
  markStaleForDeferred
} = require("./recommendation-lifecycle");
const { generateDailyFocus } = require("./daily-focus-generator");
const { stabilizeRecommendationSet } = require("../stability/stability-guard");
const {
  createRunContext,
  markStage,
  buildTracePayload,
  persistTrace
} = require("./telemetry");
const { persistObservabilityArtifacts } = require("../observability/trace-store");
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
  const stabilized = await stabilizeRecommendationSet(userId, selected, deferred, {
    maxDaily: 3,
    churnThreshold: 80,
    stickinessHours: 24
  });
  const stabilizedSelected = stabilized.selected;
  const stabilizedDeferred = stabilized.deferred;
  let lifecycleTransitions = 0;

  if (persist) {
    const winnerIds = stabilizedSelected.map((r) => r._id).filter(Boolean);
    const deferredIds = stabilizedDeferred.map((r) => r._id).filter(Boolean);

    if (winnerIds.length) {
      await RecommendationModel.updateMany(
        { _id: { $in: winnerIds } },
        { status: "pending", staleReason: null, staleDetectedAt: null }
      );

      for (const winner of stabilizedSelected) {
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
      await markStaleForDeferred(userId, stabilizedDeferred);
      lifecycleTransitions += deferredIds.length;
    }
  }
  markStage(runContext, "lifecycleEnd");

  const dailyFocus = await generateDailyFocus(userId, stabilizedSelected, {
    persist,
    deferred: stabilizedDeferred
  });
  markStage(runContext, "focusEnd");

  const tracePayload = buildTracePayload(runContext, {
    normalized,
    scored,
    normalizedCount: normalized.length,
    failures,
    winners: stabilizedSelected,
    deferred: stabilizedDeferred,
    conflicts,
    lifecycleTransitions,
    stabilityMetrics: stabilized.metrics
  });

  const persistedTrace = await persistTrace(tracePayload, { persist: persistTraceEnabled });

  if (persistTraceEnabled) {
    await persistObservabilityArtifacts(
      tracePayload,
      {
        scored,
        winners: stabilizedSelected,
        deferred: stabilizedDeferred,
        failures
      },
      {
        persist: true,
        arbitrationTraceId: persistedTrace?._id
      }
    );
  }

  console.log(
    `[ARBITRATION_TRACE] run=${tracePayload.runId} user=${userId} ` +
      `latencyMs=${tracePayload.latencyMs} winners=${tracePayload.counts.winners} ` +
      `deferred=${tracePayload.counts.deferred} suppressionRate=${tracePayload.metrics.suppressionRate}`
  );

  return {
    winners: stabilizedSelected,
    deferred: stabilizedDeferred,
    conflicts,
    failures,
    dailyFocus,
    trace: persistedTrace || tracePayload
  };
}

module.exports = {
  orchestrateRecommendations
};
