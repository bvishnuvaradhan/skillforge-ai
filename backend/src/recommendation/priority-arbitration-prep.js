const RecommendationPriorityModel = require("../models/RecommendationPriority");

const PRIORITY_ORDER = ["decay", "dependency", "dna"];

function inferSignals(rec) {
  const signals = [];
  if (["revision", "weak-topic"].includes(rec.type)) signals.push("decay");
  if (rec.type === "exploration" || rec.dependencyContext) signals.push("dependency");
  if (rec.sourceAlgorithm && String(rec.sourceAlgorithm).toLowerCase().includes("dna")) signals.push("dna");
  return Array.from(new Set(signals));
}

function selectWinningSignal(signals) {
  for (const signal of PRIORITY_ORDER) {
    if (signals.includes(signal)) return signal;
  }
  return "fallback";
}

async function logRecommendationPriority(userId, recommendation, metadata = {}) {
  const signals = inferSignals(recommendation);
  const winningSignal = selectWinningSignal(signals);
  const conflictingSignals = signals.filter((s) => s !== winningSignal);

  await RecommendationPriorityModel.create({
    user: userId,
    recommendationId: recommendation._id,
    winningSignal,
    conflictingSignals,
    priorityOrder: PRIORITY_ORDER,
    arbitrationMetadata: {
      reason: metadata.reason || "Conservative arbitration order",
      decayUrgency: recommendation.type === "revision" ? recommendation.urgencyScore : 0,
      dependencyReadiness: recommendation.dependencyContext?.readinessConfidence || 0,
      dnaBoost: metadata.dnaBoost || 0
    }
  });

  return { winningSignal, conflictingSignals };
}

module.exports = {
  PRIORITY_ORDER,
  logRecommendationPriority
};
