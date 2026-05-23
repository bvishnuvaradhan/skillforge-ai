// HalfLife Estimator
// Uses curve fitting (least-squares regression) to learn personalized halfLife
// Fits R = e^(-t/S) to actual observations

async function estimateHalfLife(observations) {
  try {
    if (!observations || observations.length < 5) {
      console.log(`[Decay] Insufficient observations (${observations?.length}); need >=5 for curve fit`);
      return null;
    }

    console.log(`[Decay] Estimating halfLife from ${observations.length} observations`);

    // Use least-squares regression to find best S
    // Minimize: Σ(R_predicted - R_observed)²
    // Where: R_predicted = e^(-t/S)

    // Since we're fitting exponential decay, we can linearize:
    // R = e^(-t/S) → ln(R) = -t/S → ln(R) = -(1/S)*t
    // This becomes linear: y = m*x where y = ln(R), x = t, m = -1/S

    let sumX = 0; // Σt
    let sumY = 0; // Σln(R)
    let sumXY = 0; // Σ(t * ln(R))
    let sumXX = 0; // Σ(t²)
    let n = 0;

    for (const obs of observations) {
      const t = obs.daysSinceSolve;
      const R = obs.observedRetention;

      // Skip observations with zero or negative retention (can't take ln)
      if (R <= 0 || R >= 1) continue;

      const lnR = Math.log(R);
      sumX += t;
      sumY += lnR;
      sumXY += t * lnR;
      sumXX += t * t;
      n++;
    }

    if (n < 5) {
      console.log(`[Decay] Not enough valid points after filtering (${n}); need >=5`);
      return null;
    }

    // Linear regression: m = (n*ΣXY - ΣX*ΣY) / (n*ΣXX - (ΣX)²)
    const numerator = n * sumXY - sumX * sumY;
    const denominator = n * sumXX - sumX * sumX;

    if (Math.abs(denominator) < 1e-10) {
      console.log(`[Decay] Cannot fit curve (denominator near zero)`);
      return null;
    }

    const slope = numerator / denominator; // This is -1/S
    const estimatedHalfLife = -1 / slope; // S = -1/slope

    // Validate: halfLife should be positive and reasonable (0.1 to 365 days)
    if (estimatedHalfLife < 0.1 || estimatedHalfLife > 365) {
      console.log(
        `[Decay] Estimated halfLife outside valid range: ${estimatedHalfLife.toFixed(2)} days`
      );
      return null;
    }

    // Calculate model accuracy: % of predictions within 10% of actual
    let withinThreshold = 0;
    let totalError = 0;

    for (const obs of observations) {
      const predicted = Math.exp(-obs.daysSinceSolve / estimatedHalfLife);
      const actual = obs.observedRetention;
      const error = Math.abs(predicted - actual);
      totalError += error;

      if (error <= 0.1) {
        withinThreshold++;
      }
    }

    const modelAccuracy = (withinThreshold / observations.length) * 100;
    const avgPredictionError = totalError / observations.length;

    // Confidence: higher if more observations, higher if better fit
    // Base: 50% from sample size, 50% from fit quality
    const sampleConfidence = Math.min(95, 40 + observations.length * 2); // 40% base + 2% per observation (capped at 95)
    const fitConfidence = Math.min(95, modelAccuracy); // Use model accuracy directly
    const confidence = (sampleConfidence + fitConfidence) / 2;

    const result = {
      estimatedHalfLife: parseFloat(estimatedHalfLife.toFixed(2)),
      confidence: Math.round(confidence),
      modelAccuracy: Math.round(modelAccuracy),
      predictionError: parseFloat(avgPredictionError.toFixed(3)),
      samplesUsed: observations.length,
      slope: slope,
      intercept: (sumY - slope * sumX) / n
    };

    console.log(`[Decay] Estimated halfLife: ${result.estimatedHalfLife}d (confidence: ${result.confidence}%)`);
    console.log(`[Decay] Model accuracy: ${result.modelAccuracy}% within 10%`);

    return result;
  } catch (error) {
    console.error(`[Decay] Error estimating halfLife:`, error);
    throw error;
  }
}

// Compare estimated vs formula-based halfLife
function compareHalfLifeEstimates(estimatedHalfLife, solveCount) {
  const formulaBased = solveCount * 2;
  const difference = Math.abs(estimatedHalfLife - formulaBased);
  const percentDifference = (difference / formulaBased) * 100;

  return {
    estimated: estimatedHalfLife,
    formulaBased: formulaBased,
    difference: parseFloat(difference.toFixed(2)),
    percentDifference: parseFloat(percentDifference.toFixed(1)),
    recommendation: percentDifference > 30 ? "Use estimated" : "Formula-based is similar"
  };
}

module.exports = {
  estimateHalfLife,
  compareHalfLifeEstimates
};
