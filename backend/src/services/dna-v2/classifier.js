// DNA v2 Classifier
// Determines primary type, secondary type, blend, and confidence

async function classifyDNA(scores, factors) {
  try {
    console.log(`[DNA] Classifying DNA`);

    const typeNames = {
      consistentLearnerScore: "Consistent Learner",
      persistentExplorerScore: "Persistent Explorer",
      speedStrategistScore: "Speed Strategist",
      deepDiverScore: "Deep Diver"
    };

    // 1. RANK SCORES
    const sortedScores = Object.entries(scores)
      .map(([key, value]) => ({ type: typeNames[key], score: value }))
      .sort((a, b) => b.score - a.score);

    // 2. DETECT PRIMARY AND SECONDARY
    const primaryType = sortedScores[0].type;
    const primaryScore = sortedScores[0].score;

    let secondaryType = null;
    let secondaryScore = 0;
    if (sortedScores[1].score > (primaryScore * 0.6) && sortedScores[1].score > 40) {
      secondaryType = sortedScores[1].type;
      secondaryScore = sortedScores[1].score;
    }

    // 3. BLEND CALCULATION
    let blend = {};
    if (secondaryType) {
      const totalScore = primaryScore + secondaryScore;
      blend[primaryType] = Math.round((primaryScore / totalScore) * 1000) / 1000;
      blend[secondaryType] = Math.round((secondaryScore / totalScore) * 1000) / 1000;
    } else {
      blend[primaryType] = 1.0;
    }

    // 4. CONFIDENCE SCORING
    // Factor in:
    // - Signal alignment: how many factors > 65?
    // - Score separation: how clear is the primary?
    // - Data volume: more data = higher confidence
    const factorsArray = Object.values(factors);
    const strongFactors = factorsArray.filter(f => f > 65).length;
    const signalAlignment = strongFactors / factorsArray.length;

    const scoreGap = sortedScores[1] ? (primaryScore - sortedScores[1].score) / 100 : 1;
    const scoreClarity = Math.min(1, scoreGap * 2);  // 0.5+ gap = clear winner

    // Combine signals
    let confidence = Math.round(
      signalAlignment * 0.5 +  // 50% from factor alignment
      scoreClarity * 0.3 +     // 30% from score separation
      Math.min(1, (factors.consistency + factors.frequency) / 200) * 0.2  // 20% from activity signals
    ) * 100;

    // Cap at 85% (DNA is behavioral, not definitive)
    confidence = Math.min(85, Math.max(40, confidence));

    // Edge cases
    if (primaryScore < 40) {
      console.log(`[DNA] All scores < 40, defaulting to Consistent Learner`);
      return {
        primaryType: "Consistent Learner",
        confidence: 40,
        blend: { "Consistent Learner": 1.0 }
      };
    }

    const classification = {
      primaryType,
      secondaryType,
      blend,
      confidence
    };

    console.log(`[DNA] Classification:`, classification);

    return classification;
  } catch (error) {
    console.error(`[DNA] Error classifying:`, error);
    throw error;
  }
}

module.exports = {
  classifyDNA
};
