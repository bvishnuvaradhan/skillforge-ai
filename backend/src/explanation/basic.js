/**
 * Quick explanation engine - adds evidence & triggers to recommendations
 * Step 1: Basic explanations (WHY was this triggered)
 * Step 2: Deep explanations (confidence, evidence sources, related metrics)
 */

/**
 * Build explanation evidence for each recommendation type
 */
function buildExplanation(rec, metrics) {
  const { type, topic } = rec;
  const evidence = {
    triggers: [],
    keyMetrics: {},
    explanation: ""
  };

  switch (type) {
    case "revision":
      evidence.triggers = [
        `Retention dropped to ${Math.round(metrics.retention * 100)}%`,
        `No practice in ${metrics.daysSinceSolve} days`,
        `Previously mastered (${metrics.mastery}% mastery)`
      ];
      evidence.keyMetrics = {
        retention: `${Math.round(metrics.retention * 100)}%`,
        daysSinceSolve: metrics.daysSinceSolve,
        masteryScore: metrics.mastery
      };
      evidence.explanation =
        `Your knowledge of ${topic} is fading. The Ebbinghaus Forgetting Curve suggests you'll forget 50% of what you learned in 24 hours without practice. ` +
        `Revising now will reset your retention to near-perfect and extend the retention curve.`;
      break;

    case "weak-topic":
      evidence.triggers = [
        `Mastery only ${metrics.mastery}% (threshold: 50%)`,
        `${Math.round(metrics.avgRetries)} avg retries vs ${Math.round(metrics.cohortAvgRetries)} typical`,
        `${metrics.solvedCount} problems solved in this topic`
      ];
      evidence.keyMetrics = {
        mastery: `${metrics.mastery}%`,
        avgRetries: metrics.avgRetries,
        cohortAvgRetries: metrics.cohortAvgRetries,
        solvedCount: metrics.solvedCount
      };
      evidence.explanation =
        `${topic} is your weakest area. Your retry rate is ${Math.round((metrics.avgRetries / metrics.cohortAvgRetries - 1) * 100)}% above average, ` +
        `indicating conceptual gaps. Focused practice will build muscle memory and confidence.`;
      break;

    case "difficulty-increase":
      evidence.triggers = [
        `${Math.round(metrics.firstTimePassRate * 100)}% first-attempt success rate`,
        `Current difficulty: UDI ${Math.round(metrics.avgUDI)} / 10`,
        `Consistent mastery demonstrated`
      ];
      evidence.keyMetrics = {
        firstTimePassRate: `${Math.round(metrics.firstTimePassRate * 100)}%`,
        avgUDI: metrics.avgUDI
      };
      evidence.explanation =
        `You're solving ${topic} problems too easily. Time to increase difficulty to maintain learning curve. ` +
        `Optimal learning happens at 85% success rate. Your 90%+ suggests you're in comfort zone.`;
      break;

    case "difficulty-decrease":
      evidence.triggers = [
        `${Math.round(metrics.failRate * 100)}% fail rate (threshold: 40%)`,
        `Current difficulty: UDI ${Math.round(metrics.avgUDI)} / 10`,
        `Too many failures indicate knowledge gaps`
      ];
      evidence.keyMetrics = {
        failRate: `${Math.round(metrics.failRate * 100)}%`,
        avgUDI: metrics.avgUDI
      };
      evidence.explanation =
        `You're struggling with current ${topic} difficulty. High failure rate causes frustration and kills motivation. ` +
        `Step back to easier problems, build confidence, then progress. 60-70% success rate is ideal for learning.`;
      break;

    case "exploration":
      evidence.triggers = [
        `${metrics.consistency}% consistency (very active)`,
        `${metrics.masteredTopics} topics already mastered`,
        `${topic} is a natural next step`
      ];
      evidence.keyMetrics = {
        consistency: `${metrics.consistency}%`,
        masteredTopics: metrics.masteredTopics,
        dependencyStrength: metrics.dependencyStrength ? `${Math.round(metrics.dependencyStrength * 100)}%` : "high"
      };
      evidence.explanation =
        `You've built a strong foundation. ${topic} is the logical next skill—it builds on what you already know ` +
        `and prepares you for more advanced problems. Consistent learners like you benefit from expanding breadth.`;
      break;

    default:
      evidence.explanation = "Recommendation generated based on your learning patterns.";
  }

  return evidence;
}

/**
 * Format explanation for display (for dashboard cards, notifications)
 */
function formatExplanationForDisplay(rec, evidence) {
  return {
    title: getRecommendationTitle(rec.type),
    reason: rec.reason,
    why: evidence.explanation,
    triggers: evidence.triggers,
    metrics: evidence.keyMetrics,
    icon: getRecommendationIcon(rec.type),
    color: getRecommendationColor(rec.type)
  };
}

/**
 * Helper: Get human-readable title for recommendation type
 */
function getRecommendationTitle(type) {
  const titles = {
    revision: "Revise & Reinforce",
    "weak-topic": "Strengthen Weak Area",
    "difficulty-increase": "Level Up Challenge",
    "difficulty-decrease": "Step Back & Solidify",
    exploration: "Explore New Territory"
  };
  return titles[type] || "Recommendation";
}

/**
 * Helper: Get icon for recommendation type
 */
function getRecommendationIcon(type) {
  const icons = {
    revision: "🔄",
    "weak-topic": "⚠️",
    "difficulty-increase": "📈",
    "difficulty-decrease": "📉",
    exploration: "🧭"
  };
  return icons[type] || "💡";
}

/**
 * Helper: Get color for recommendation type
 */
function getRecommendationColor(type) {
  const colors = {
    revision: "orange",
    "weak-topic": "red",
    "difficulty-increase": "green",
    "difficulty-decrease": "yellow",
    exploration: "blue"
  };
  return colors[type] || "gray";
}

module.exports = {
  buildExplanation,
  formatExplanationForDisplay,
  getRecommendationTitle,
  getRecommendationIcon,
  getRecommendationColor
};
