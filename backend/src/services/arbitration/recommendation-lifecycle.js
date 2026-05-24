const { RecommendationLifecycleModel } = require("../../models/RecommendationLifecycle");

const ALLOWED_TRANSITIONS = {
  active: ["snoozed", "stale", "superseded", "resolved", "ignored"],
  snoozed: ["active", "stale", "ignored"],
  stale: ["active", "superseded", "ignored"],
  superseded: ["active"],
  resolved: [],
  ignored: ["active"]
};

async function upsertActiveLifecycle(userId, recommendation) {
  return RecommendationLifecycleModel.findOneAndUpdate(
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

  return RecommendationLifecycleModel.findOneAndUpdate({ recommendationId }, patch, { new: true });
}

async function markStaleForDeferred(userId, deferredRecs) {
  const ids = deferredRecs.map((r) => r._id).filter(Boolean);
  if (!ids.length) return;

  await RecommendationLifecycleModel.updateMany(
    { user: userId, recommendationId: { $in: ids } },
    {
      state: "stale",
      stateReason: "Deferred by arbitration",
      staleDetectedAt: new Date()
    }
  );
}

module.exports = {
  ALLOWED_TRANSITIONS,
  upsertActiveLifecycle,
  transitionLifecycle,
  markStaleForDeferred
};
