const { RecommendationLifecycleModel } = require("../../models/RecommendationLifecycle");
const { logLifecycleAudit } = require("../observability/trace-store");
const { emitEvent, EVENT_TYPES } = require("../events");

const ALLOWED_TRANSITIONS = {
  active: ["snoozed", "stale", "superseded", "resolved", "ignored"],
  snoozed: ["active", "stale", "ignored"],
  stale: ["active", "superseded", "ignored"],
  superseded: ["active"],
  resolved: [],
  ignored: ["active"]
};

async function upsertActiveLifecycle(userId, recommendation) {
  const prior = await RecommendationLifecycleModel.findOne({ user: userId, recommendationId: recommendation._id });
  const updated = await RecommendationLifecycleModel.findOneAndUpdate(
    { user: userId, recommendationId: recommendation._id },
    {
      topic: recommendation.topic,
      state: "active",
      stateReason: "Arbitration winner",
      activatedAt: new Date(),
      $inc: { timesSurfaced: 1 },
      lastSurfacedAt: new Date()
    },
    { upsert: true, new: true }
  );

  await logLifecycleAudit({
    userId,
    recommendationId: recommendation._id,
    topic: recommendation.topic,
    fromState: prior?.state,
    toState: "active",
    reason: "Arbitration winner",
    source: "arbitration"
  });

  emitEvent(
    EVENT_TYPES.LifecycleChanged,
    {
      userId,
      recommendationId: String(recommendation._id),
      topic: recommendation.topic,
      fromState: prior?.state,
      toState: "active",
      reason: "Arbitration winner"
    },
    {
      source: "arbitration.lifecycle",
      userId,
      idempotencyKey: `lifecycle:${userId}:${recommendation._id}:active`,
      sequence: Number(prior?.timesSurfaced || 0)
    }
  );

  return updated;
}

async function transitionLifecycle(recommendationId, toState, reason, extras = {}) {
  const current = await RecommendationLifecycleModel.findOne({ recommendationId });
  if (!current) {
    throw new Error("Lifecycle record not found");
  }

  const allowed = ALLOWED_TRANSITIONS[current.state] || [];
  if (!allowed.includes(toState)) {
    throw new Error(`Invalid lifecycle transition: ${current.state} -> ${toState}`);
  }

  const patch = {
    state: toState,
    stateReason: reason,
    ...extras
  };

  if (toState === "stale") patch.staleDetectedAt = new Date();
  if (toState === "resolved") patch.resolvedAt = new Date();
  if (toState === "ignored") patch.ignoredAt = new Date();

  const updated = await RecommendationLifecycleModel.findOneAndUpdate(
    { recommendationId },
    patch,
    { new: true }
  );

  await logLifecycleAudit({
    userId: updated.user,
    recommendationId,
    topic: updated.topic,
    fromState: current.state,
    toState,
    reason,
    source: "api"
  });

  emitEvent(
    EVENT_TYPES.LifecycleChanged,
    {
      userId: String(updated.user),
      recommendationId: String(recommendationId),
      topic: updated.topic,
      fromState: current.state,
      toState,
      reason
    },
    {
      source: "api.lifecycle",
      userId: String(updated.user),
      idempotencyKey: `lifecycle:${updated.user}:${recommendationId}:${toState}`,
      sequence: Number(updated.interactionCount || 0)
    }
  );

  return updated;
}

async function markStaleForDeferred(userId, deferredRecs) {
  const candidates = deferredRecs
    .map((r) => ({ id: r._id, topic: r.topic, reason: r.deferredReason }))
    .filter((item) => item.id);
  const ids = candidates.map((item) => item.id);
  if (!ids.length) return;

  await RecommendationLifecycleModel.updateMany(
    { user: userId, recommendationId: { $in: ids } },
    {
      state: "stale",
      stateReason: "Deferred by arbitration",
      staleDetectedAt: new Date()
    }
  );

  for (const candidate of candidates) {
    await logLifecycleAudit({
      userId,
      recommendationId: candidate.id,
      topic: candidate.topic,
      fromState: "active",
      toState: "stale",
      reason: candidate.reason || "Deferred by arbitration",
      source: "arbitration"
    });

    emitEvent(
      EVENT_TYPES.LifecycleChanged,
      {
        userId: String(userId),
        recommendationId: String(candidate.id),
        topic: candidate.topic,
        fromState: "active",
        toState: "stale",
        reason: candidate.reason || "Deferred by arbitration"
      },
      {
        source: "arbitration.lifecycle",
        userId: String(userId),
        idempotencyKey: `lifecycle:${userId}:${candidate.id}:stale`,
        sequence: 1
      }
    );
  }
}

module.exports = {
  ALLOWED_TRANSITIONS,
  upsertActiveLifecycle,
  transitionLifecycle,
  markStaleForDeferred
};
