// DNA v2 Type Scorer
// Scores all 4 DNA types probabilistically (0-100 each, not binary)

async function scoreDNATypes(factors) {
  try {
    console.log(`[DNA] Scoring all 4 DNA types`);

    const { consistency, frequency, retryPattern, difficultyProgression, topicDepth, topicBreadth, speedScore, learnerVelocity } = factors;

    // CONSISTENT LEARNER SCORE
    // High weight: consistency (0.4), frequency (0.35)
    // Med weight: topicDepth (0.15), velocity (0.1)
    const consistentLearnerScore = Math.round(
      0.4 * consistency +
      0.35 * frequency +
      0.15 * topicDepth +
      0.1 * learnerVelocity
    );

    // PERSISTENT EXPLORER SCORE
    // High weight: retryPattern INVERSE (0.45), topicDepth (0.35)
    // Low weight: frequency (0.1), speedScore (0.1)
    // High retries = learns through struggle = higher score
    const persistentExplorerScore = Math.round(
      0.45 * (100 - retryPattern) +  // INVERSE: low retry rate = lower persistence
      0.35 * topicDepth +
      0.1 * frequency +
      0.1 * (100 - speedScore)  // INVERSE: slow solver = more deliberate exploration
    );

    // SPEED STRATEGIST SCORE
    // High weight: frequency (0.35), speedScore (0.35)
    // Med weight: retryPattern (0.2), difficultyProgression (0.1)
    // High frequency + low retries + fast = high score
    const speedStrategistScore = Math.round(
      0.35 * frequency +
      0.35 * speedScore +
      0.2 * retryPattern +  // High first-try rate = speed
      0.1 * difficultyProgression
    );

    // DEEP DIVER SCORE
    // High weight: difficultyProgression (0.4), topicDepth (0.35)
    // Med weight: learnerVelocity (0.15), frequency (0.1)
    // Seeks hard problems + deep focus + improving = high score
    const deepDiverScore = Math.round(
      0.4 * difficultyProgression +
      0.35 * topicDepth +
      0.15 * learnerVelocity +
      0.1 * frequency
    );

    const scores = {
      consistentLearnerScore: Math.max(0, Math.min(100, consistentLearnerScore)),
      persistentExplorerScore: Math.max(0, Math.min(100, persistentExplorerScore)),
      speedStrategistScore: Math.max(0, Math.min(100, speedStrategistScore)),
      deepDiverScore: Math.max(0, Math.min(100, deepDiverScore))
    };

    console.log(`[DNA] Scores:`, scores);

    return scores;
  } catch (error) {
    console.error(`[DNA] Error scoring types:`, error);
    throw error;
  }
}

module.exports = {
  scoreDNATypes
};
