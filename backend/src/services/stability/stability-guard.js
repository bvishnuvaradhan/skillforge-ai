const { DailyFocusSnapshotModel } = require("../../models/DailyFocusSnapshot");
const { Types } = require("mongoose");
const { getRecentSurfacedIds, applyStickinessBoost } = require("./stickiness-engine");
const { smoothRecommendationOrdering } = require("./recommendation-smoother");
const { computeChurnMetrics } = require("./churn-detector");

async function getLastFocusRecommendationIds(userId) {
  if (!userId || !Types.ObjectId.isValid(String(userId))) return [];
  const latest = await DailyFocusSnapshotModel.findOne({ user: userId }).sort({ date: -1 }).lean();
  if (!latest) return [];

  return [
    latest.criticalTask?.recommendationId,
    latest.growthTask?.recommendationId,
    latest.optionalExploration?.recommendationId
  ]
    .filter(Boolean)
    .map((id) => String(id));
}

async function stabilizeRecommendationSet(userId, selected = [], deferred = [], options = {}) {
  if (!selected.length) {
    return {
      selected,
      deferred,
      metrics: {
        churnRate: 0,
        retained: 0,
        added: 0,
        removed: 0,
        reorderFrequency: 0,
        supersedeFrequency: 0,
        resurfacingFrequency: 0,
        userStabilityScore: 100
      }
    };
  }

  const [stickyIds, previousIds] = await Promise.all([
    getRecentSurfacedIds(userId, options.stickinessHours || 24),
    getLastFocusRecommendationIds(userId)
  ]);

  const boosted = applyStickinessBoost(selected, stickyIds);
  let smoothed = smoothRecommendationOrdering(boosted, {
    minDisplayHours: options.minDisplayHours || 6,
    reentryCooldownHours: options.reentryCooldownHours || 24,
    now: options.now
  });
  const churn = computeChurnMetrics(previousIds, smoothed.map((item) => item._id));
  const currentIds = smoothed.map((item) => String(item._id));
  const previousIndex = new Map(previousIds.map((id, index) => [String(id), index]));
  const retainedInOrder = currentIds.filter((id) => previousIndex.has(id)).map((id) => previousIndex.get(id));

  let reorderFrequency = 0;
  if (retainedInOrder.length > 1) {
    const sortedRetained = [...retainedInOrder].sort((a, b) => a - b);
    const reordered = retainedInOrder.filter((value, index) => value !== sortedRetained[index]).length;
    reorderFrequency = Number(((reordered / retainedInOrder.length) * 100).toFixed(2));
  }

  const stickySet = new Set((stickyIds || []).map(String));
  const resurfacingFrequency = currentIds.length
    ? Number(((currentIds.filter((id) => stickySet.has(id)).length / currentIds.length) * 100).toFixed(2))
    : 0;
  const supersedeFrequency = previousIds.length
    ? Number((((previousIds.length - churn.retained) / previousIds.length) * 100).toFixed(2))
    : 0;
  const userStabilityScore = Number(
    Math.max(0, Math.min(100, 100 - churn.churnRate * 0.45 - reorderFrequency * 0.25 + resurfacingFrequency * 0.2)).toFixed(2)
  );

  const churnThreshold = Number(options.churnThreshold || 80);
  if (churn.churnRate > churnThreshold && previousIds.length) {
    const prevSet = new Set(previousIds);
    const retained = smoothed.filter((item) => prevSet.has(String(item._id)));
    const swappedOut = smoothed.filter((item) => !prevSet.has(String(item._id)));

    if (retained.length) {
      const keep = retained[0];
      const candidates = [keep, ...swappedOut].slice(0, options.maxDaily || 3);
      smoothed = smoothRecommendationOrdering(candidates);
    }
  }

  return {
    selected: smoothed,
    deferred,
    metrics: {
      ...churn,
      reorderFrequency,
      supersedeFrequency,
      resurfacingFrequency,
      userStabilityScore
    }
  };
}

module.exports = {
  stabilizeRecommendationSet
};
