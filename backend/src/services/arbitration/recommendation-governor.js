const { RecommendationLifecycleModel } = require("../../models/RecommendationLifecycle");

function categoryOf(rec) {
  if (["revision", "weak-topic", "difficulty-decrease"].includes(rec.type)) return "maintenance";
  if (rec.type === "difficulty-increase") return "growth";
  if (rec.type === "exploration") return "exploration";
  return "growth";
}

async function getTopicCooldownMap(userId, hours = 24) {
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recent = await RecommendationLifecycleModel.find({
    user: userId,
    lastSurfacedAt: { $gte: since },
    state: { $in: ["active", "snoozed"] }
  }).select("topic");

  return new Set(recent.map((r) => r.topic));
}

async function governRecommendations(candidates, options = {}) {
  const maxDaily = options.maxDaily || 3;
  const userId = options.userId;
  const cooldownTopics = userId && options.persist !== false
    ? await getTopicCooldownMap(userId, 24)
    : new Set();

  const sorted = [...candidates].sort((a, b) => b.finalPriorityScore - a.finalPriorityScore);
  const selected = [];
  const deferred = [];
  const categoryUsed = new Set();

  for (const rec of sorted) {
    const category = categoryOf(rec);
    const isCritical = rec.hardFlags?.criticalDecay === true;

    if (cooldownTopics.has(rec.topic) && !isCritical) {
      deferred.push({ ...rec, deferredReason: "Deferred by topic cooldown" });
      continue;
    }

    if (selected.length >= maxDaily) {
      deferred.push({ ...rec, deferredReason: "Deferred by daily recommendation cap" });
      continue;
    }

    if (!categoryUsed.has(category) || selected.length >= 2) {
      selected.push(rec);
      categoryUsed.add(category);
    } else {
      deferred.push({ ...rec, deferredReason: "Deferred to preserve diversity balance" });
    }
  }

  return { selected, deferred };
}

module.exports = {
  governRecommendations,
  categoryOf
};
