const { DailyFocusSnapshotModel } = require("../../models/DailyFocusSnapshot");
const { categoryOf } = require("./recommendation-governor");

function toFocusItem(rec) {
  if (!rec) return undefined;
  return {
    recommendationId: rec._id,
    topic: rec.topic,
    reason: rec.winnerReason || rec.reason,
    confidence: rec.confidence
  };
}

async function generateDailyFocus(userId, recommendations, options = {}) {
  const maintenance = recommendations.find((r) => categoryOf(r) === "maintenance");
  const growth = recommendations.find((r) => categoryOf(r) === "growth");
  const exploration = recommendations.find((r) => categoryOf(r) === "exploration");

  const payload = {
    user: userId,
    date: new Date(),
    criticalTask: toFocusItem(maintenance || recommendations[0]),
    growthTask: toFocusItem(growth),
    optionalExploration: toFocusItem(exploration),
    fatigueMode: Boolean(options.fatigueMode),
    maxCardsShown: 3,
    whyTheseWon: recommendations.map((r) => `${r.topic}: ${r.winnerReason || r.reason}`),
    whatWasDeferred: (options.deferred || []).map((r) => `${r.topic}: ${r.deferredReason || "Deferred"}`)
  };

  if (options.persist !== false) {
    await DailyFocusSnapshotModel.create(payload);
  }

  return payload;
}

module.exports = {
  generateDailyFocus
};
