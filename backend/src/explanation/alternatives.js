// Alternatives generator - only show when confidence < 75%
// Showing too many alternatives when confident reduces trust

function generateAlternatives(rec, metrics, confidence) {
  // ONLY show alternatives when confidence is LOW
  if (confidence >= 75) {
    return []; // Don't confuse user with alternatives to high-confidence recommendation
  }

  const alternatives = [];

  switch (rec.type) {
    case "revision":
      alternatives.push({
        scenario: "Memory is stronger than formula predicts",
        likelihood: calculateLikelihood(metrics, "strong-memory"),
        explanation: "Ebbinghaus is average - your spaced repetition practice may give you above-average retention"
      });
      alternatives.push({
        scenario: "Recent success contradicts decay model",
        likelihood: calculateLikelihood(metrics, "recent-success"),
        explanation: "You might have successfully practiced this without tracking - formula doesn't see that"
      });
      break;

    case "weak-topic":
      alternatives.push({
        scenario: "You're improving rapidly",
        likelihood: calculateLikelihood(metrics, "improving-trend"),
        explanation: "One successful solve might be the start of improvement - weakness may be temporary"
      });
      alternatives.push({
        scenario: "Different learning curve for this topic",
        likelihood: calculateLikelihood(metrics, "different-curve"),
        explanation: "Some concepts take longer to click - you might be on the verge of a breakthrough"
      });
      alternatives.push({
        scenario: "Sample size too small",
        likelihood: calculateLikelihood(metrics, "small-sample"),
        explanation: "With only " + (metrics.solvedCount || 3) + " problems, weakness is not yet confirmed"
      });
      break;

    case "difficulty-increase":
      alternatives.push({
        scenario: "Recent problems happened to be easy",
        likelihood: calculateLikelihood(metrics, "easy-sample"),
        explanation: "You might have solved the easier problems in your topic - harder ones await"
      });
      alternatives.push({
        scenario: "Consistency might be false signal",
        likelihood: calculateLikelihood(metrics, "false-consistency"),
        explanation: "High success rate might not reflect readiness - mental fatigue could hit at harder level"
      });
      break;

    case "difficulty-decrease":
      alternatives.push({
        scenario: "You're adapting, not struggling",
        likelihood: calculateLikelihood(metrics, "adapting"),
        explanation: "Initial struggle is normal when learning - you might adjust without reducing difficulty"
      });
      alternatives.push({
        scenario: "Feedback bias - hard problems loom large",
        likelihood: calculateLikelihood(metrics, "recency-bias"),
        explanation: "Recent failures feel more significant than they are - your average might be OK"
      });
      break;

    case "exploration":
      alternatives.push({
        scenario: "Build foundation deeper first",
        likelihood: calculateLikelihood(metrics, "consolidate-first"),
        explanation: "Mastery in fewer topics might be stronger than breadth - consider deepening instead"
      });
      alternatives.push({
        scenario: "Prerequisites less important than thought",
        likelihood: calculateLikelihood(metrics, "skip-prerequisites"),
        explanation: "You might learn the new topic effectively even with less prerequisite strength"
      });
      break;
  }

  return alternatives;
}

function calculateLikelihood(metrics, scenario) {
  // Estimate likelihood of alternative based on metrics
  // Returns percentage (0-100)

  switch (scenario) {
    case "strong-memory":
      // If they've historically had good retention, alternative is more likely
      if (metrics.historicalRetention && metrics.historicalRetention > 0.7) return "25%";
      if (metrics.recentPassRate && metrics.recentPassRate > 0.8) return "20%";
      return "15%";

    case "recent-success":
      if (metrics.recentPassRate && metrics.recentPassRate > 0.7) return "30%";
      if (metrics.recentSuccessCount && metrics.recentSuccessCount > 0) return "20%";
      return "10%";

    case "improving-trend":
      if (metrics.daysSinceSolve && metrics.daysSinceSolve < 7) return "35%";
      if (metrics.recentPassRate && metrics.recentPassRate > 0.5) return "25%";
      return "15%";

    case "different-curve":
      // Complex topics have different learning curves
      return "20%";

    case "small-sample":
      if (metrics.solvedCount && metrics.solvedCount < 5) return "40%";
      if (metrics.solvedCount && metrics.solvedCount < 10) return "25%";
      return "10%";

    case "easy-sample":
      if (metrics.recentConsistency && metrics.recentConsistency > 0.9) return "20%";
      return "15%";

    case "false-consistency":
      return "18%";

    case "adapting":
      if (metrics.daysSinceSolve && metrics.daysSinceSolve < 3) return "25%";
      if (metrics.recentTrendImproving) return "30%";
      return "15%";

    case "recency-bias":
      if (metrics.recentFailCount && metrics.recentFailCount <= 2) return "25%";
      return "15%";

    case "consolidate-first":
      if (metrics.masteredTopics && metrics.masteredTopics < 4) return "30%";
      return "15%";

    case "skip-prerequisites":
      if (metrics.dependencyStrength && metrics.dependencyStrength < 0.7) return "25%";
      return "15%";

    default:
      return "15%";
  }
}

module.exports = {
  generateAlternatives
};
