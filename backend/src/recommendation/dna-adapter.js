// DNA-Adaptive Recommendation Scoring
// Modifies recommendation urgency based on user's DNA profile

async function adaptRecommendationByDNA(recommendation, dnaClassification) {
  try {
    if (!dnaClassification) {
      console.log(`[DNA] No DNA profile, returning original recommendation`);
      return recommendation;
    }

    console.log(`[DNA] Adapting recommendation for ${dnaClassification.primaryType}`);

    const primaryType = dnaClassification.primaryType;
    const blend = dnaClassification.blend || { [primaryType]: 1.0 };

    let multiplier = 1.0;

    // DNA-specific adaptation logic
    if (primaryType === "Consistent Learner") {
      // Consistent learners benefit from steady progress
      if (recommendation.type === "revision") multiplier = 1.2;  // Boost revision
      if (recommendation.type === "exploration") multiplier = 0.8;  // De-boost wild exploration
    } else if (primaryType === "Persistent Explorer") {
      // Persistent learners learn through struggle
      if (recommendation.type === "revision") multiplier = 1.3;  // Boost revision
      if (recommendation.type === "weak-topic") multiplier = 1.3;  // Boost weak topics (embrace challenge)
      if (recommendation.type === "difficulty-decrease") multiplier = 0.5;  // De-boost decreases
    } else if (primaryType === "Speed Strategist") {
      // Speed strategists want challenge and volume
      if (recommendation.type === "difficulty-increase") multiplier = 1.25;  // Boost increases
      if (recommendation.type === "exploration") multiplier = 1.2;  // Boost exploration (variety)
      if (recommendation.type === "revision") multiplier = 0.75;  // De-boost revision (forward motion)
    } else if (primaryType === "Deep Diver") {
      // Deep divers seek advanced material
      if (recommendation.type === "exploration") multiplier = 1.3;  // Boost exploration
      if (recommendation.type === "difficulty-increase") multiplier = 1.25;  // Boost increases
      if (recommendation.type === "weak-topic") multiplier = 0.85;  // De-boost random weak topics
    }

    // Apply blend weighting if secondary type exists
    if (dnaClassification.secondaryType && Object.keys(blend).length > 1) {
      const secondaryType = dnaClassification.secondaryType;
      const primaryWeight = blend[primaryType] || 1.0;
      const secondaryWeight = blend[secondaryType] || 0.0;

      console.log(`[DNA] Applying blend: ${primaryWeight}% ${primaryType} + ${secondaryWeight}% ${secondaryType}`);

      // Compute secondary multiplier
      let secondaryMultiplier = 1.0;
      if (secondaryType === "Consistent Learner") {
        if (recommendation.type === "revision") secondaryMultiplier = 1.2;
        if (recommendation.type === "exploration") secondaryMultiplier = 0.8;
      } else if (secondaryType === "Persistent Explorer") {
        if (recommendation.type === "revision") secondaryMultiplier = 1.3;
        if (recommendation.type === "weak-topic") secondaryMultiplier = 1.3;
        if (recommendation.type === "difficulty-decrease") secondaryMultiplier = 0.5;
      } else if (secondaryType === "Speed Strategist") {
        if (recommendation.type === "difficulty-increase") secondaryMultiplier = 1.25;
        if (recommendation.type === "exploration") secondaryMultiplier = 1.2;
        if (recommendation.type === "revision") secondaryMultiplier = 0.75;
      } else if (secondaryType === "Deep Diver") {
        if (recommendation.type === "exploration") secondaryMultiplier = 1.3;
        if (recommendation.type === "difficulty-increase") secondaryMultiplier = 1.25;
        if (recommendation.type === "weak-topic") secondaryMultiplier = 0.85;
      }

      // Blend multipliers
      multiplier = (primaryWeight * multiplier) + (secondaryWeight * secondaryMultiplier);
    }

    // Apply global urgency cap (never exceed 95)
    const originalUrgency = recommendation.urgencyScore || 50;
    const adjustedUrgency = Math.min(95, Math.round(originalUrgency * multiplier));

    return {
      ...recommendation,
      urgencyScore: adjustedUrgency,
      dnaAdaptation: {
        appliedDNA: `${primaryType}${dnaClassification.secondaryType ? ` + ${dnaClassification.secondaryType}` : ""}`,
        originalUrgency,
        adjustedUrgency,
        multiplier: Math.round(multiplier * 100) / 100,
        reason: getAdaptationReason(primaryType, recommendation.type, multiplier)
      }
    };
  } catch (error) {
    console.error(`[DNA] Error adapting recommendation:`, error);
    return recommendation;  // Return original if adaptation fails
  }
}

function getAdaptationReason(dnaType, recommendationType, multiplier) {
  if (multiplier > 1.1) {
    if (dnaType === "Persistent Explorer" && recommendationType === "weak-topic") {
      return "Persistent explorers benefit from tackling challenging weak topics";
    }
    if (dnaType === "Speed Strategist" && recommendationType === "difficulty-increase") {
      return "Speed strategists thrive on progressively harder challenges";
    }
    if (dnaType === "Deep Diver" && recommendationType === "exploration") {
      return "Deep divers excel when exploring advanced related topics";
    }
  } else if (multiplier < 0.9) {
    if (dnaType === "Consistent Learner" && recommendationType === "exploration") {
      return "Consistent learners prefer a structured learning path";
    }
    if (dnaType === "Speed Strategist" && recommendationType === "revision") {
      return "Speed strategists prefer forward momentum over repetition";
    }
  }
  return "DNA-adapted based on learning style";
}

module.exports = {
  adaptRecommendationByDNA
};
