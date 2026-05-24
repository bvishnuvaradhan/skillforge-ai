const RecommendationPriorityModel = require("../../models/RecommendationPriority");
const { clamp } = require("./signal-normalizer");

const WEIGHTS = {
  urgency: 0.35,
  impact: 0.25,
  confidence: 0.2,
  dependencyImportance: 0.1,
  diversityAdjustment: 0.1
};

function computeBaseScore(candidate) {
  return (
    WEIGHTS.urgency * candidate.urgency +
    WEIGHTS.impact * candidate.impact +
    WEIGHTS.confidence * candidate.confidence +
    WEIGHTS.dependencyImportance * candidate.dependencyImportance +
    WEIGHTS.diversityAdjustment * (candidate.diversityAdjustment + 20)
  );
}

function computeBoosts(candidate) {
  const criticalDecayBoost = candidate.hardFlags?.criticalDecay ? 15 : 0;
  const foundationRiskBoost = candidate.hardFlags?.foundationRisk ? 10 : 0;
  return {
    criticalDecayBoost: Math.min(20, criticalDecayBoost),
    foundationRiskBoost: Math.min(15, foundationRiskBoost)
  };
}

function computePenalties(candidate, context = {}) {
  const cooldownPenalty = context.cooldownActive ? 20 : 0;
  const fatiguePenalty = context.fatigueMode ? 10 : 0;
  const stalePenalty = context.isStale ? 12 : 0;
  return {
    cooldownPenalty,
    fatiguePenalty,
    stalePenalty
  };
}

function inferWinningSignal(candidate) {
  if (candidate.hardFlags?.criticalDecay) return "decay";
  if (candidate.hardFlags?.foundationRisk) return "dependency";
  if (candidate.sourceEngine === "dna") return "dna";
  if (candidate.sourceEngine === "dependency") return "dependency";
  if (candidate.sourceEngine === "decay") return "decay";
  return "fallback";
}

async function computePriority(candidate, options = {}) {
  const base = computeBaseScore(candidate);
  const boosts = computeBoosts(candidate);
  const penalties = computePenalties(candidate, options.context || {});

  const finalPriorityScore = clamp(
    base + boosts.criticalDecayBoost + boosts.foundationRiskBoost - penalties.cooldownPenalty - penalties.fatiguePenalty - penalties.stalePenalty,
    0,
    100
  );

  const priority = {
    ...candidate,
    weightedBaseScore: Number(base.toFixed(2)),
    finalPriorityScore: Number(finalPriorityScore.toFixed(2)),
    boosts,
    penalties,
    winnerReason: candidate.hardFlags?.criticalDecay
      ? "Critical decay risk prioritized over optional items"
      : candidate.hardFlags?.foundationRisk
      ? "Foundation reinforcement prioritized for learning integrity"
      : "Balanced arbitration score selected this recommendation"
  };

  if (options.persist !== false) {
    await RecommendationPriorityModel.create({
      user: candidate.user,
      recommendationId: candidate._id,
      winningSignal: inferWinningSignal(candidate),
      conflictingSignals: [],
      priorityOrder: ["decay", "dependency", "dna"],
      urgencyScore: candidate.urgency,
      impactScore: candidate.impact,
      confidenceScore: candidate.confidence,
      dependencyImportance: candidate.dependencyImportance,
      diversityAdjustment: candidate.diversityAdjustment,
      cooldownPenalty: penalties.cooldownPenalty,
      fatiguePenalty: penalties.fatiguePenalty,
      stalePenalty: penalties.stalePenalty,
      weightedBaseScore: priority.weightedBaseScore,
      finalPriorityScore: priority.finalPriorityScore,
      winnerReason: priority.winnerReason,
      arbitrationMetadata: {
        reason: priority.winnerReason,
        decayUrgency: candidate.hardFlags?.criticalDecay ? candidate.urgency : 0,
        dependencyReadiness: candidate.dependencyImportance,
        dnaBoost: candidate.sourceEngine === "dna" ? 5 : 0
      }
    });
  }

  return priority;
}

module.exports = {
  computePriority,
  WEIGHTS
};
