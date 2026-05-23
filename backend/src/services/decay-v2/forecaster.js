// Decay Forecaster
// Predicts retention at future timepoints (3, 7, 30 days)
// Uses Ebbinghaus formula with confidence degradation over horizons

async function forecastDecay(currentRetention, estimatedHalfLife, modelConfidence, dnaType = "neutral") {
  try {
    if (!currentRetention || estimatedHalfLife <= 0) {
      throw new Error("Invalid input: currentRetention and estimatedHalfLife required");
    }

    console.log(
      `[Decay] Forecasting decay: R=${currentRetention.toFixed(2)}, S=${estimatedHalfLife.toFixed(1)}d, DNA=${dnaType}`
    );

    // DNA-based decay adjustment
    // Some DNA types may have different decay patterns
    let halfLifeAdjustment = 1.0;
    if (dnaType === "Persistent Explorer") {
      halfLifeAdjustment = 0.85; // They revisit topics more, effectively extending halfLife
    } else if (dnaType === "Deep Diver") {
      halfLifeAdjustment = 0.9; // Deep divers better retain complex material
    } else if (dnaType === "Speed Strategist") {
      halfLifeAdjustment = 1.1; // Less depth → faster decay
    }
    // Consistent Learner: no adjustment

    const adjustedHalfLife = estimatedHalfLife * halfLifeAdjustment;

    // Forecast at 3, 7, 30 days
    const forecasts = {
      day3: forecastAtHorizon(currentRetention, adjustedHalfLife, 3, modelConfidence),
      day7: forecastAtHorizon(currentRetention, adjustedHalfLife, 7, modelConfidence),
      day30: forecastAtHorizon(currentRetention, adjustedHalfLife, 30, modelConfidence)
    };

    // Risk level classification
    let riskLevel = "safe";
    if (forecasts.day7.retention < 0.5) riskLevel = "critical";
    else if (forecasts.day7.retention < 0.7) riskLevel = "warning";

    const result = {
      forecasts: forecasts,
      riskLevel: riskLevel,
      estimatedHalfLife: parseFloat(estimatedHalfLife.toFixed(2)),
      adjustedHalfLife: parseFloat(adjustedHalfLife.toFixed(2)),
      dnaAdjustment: halfLifeAdjustment,
      computedAt: new Date()
    };

    console.log(`[Decay] Forecast complete: Risk=${riskLevel}, Day7=${forecasts.day7.retention.toFixed(2)}`);

    return result;
  } catch (error) {
    console.error(`[Decay] Error forecasting decay:`, error);
    throw error;
  }
}

// Helper: Forecast at specific horizon
function forecastAtHorizon(currentRetention, halfLife, daysAhead, baselineConfidence) {
  try {
    // Ebbinghaus formula: R(t) = e^(-t/S)
    const predictedRetention = currentRetention * Math.exp(-daysAhead / halfLife);

    // Confidence degrades over time
    // Day 3: 95% of baseline
    // Day 7: 85% of baseline
    // Day 30: 70% of baseline
    let confidenceDegradation = 1.0;
    if (daysAhead <= 3) {
      confidenceDegradation = 0.95;
    } else if (daysAhead <= 7) {
      confidenceDegradation = 0.85;
    } else if (daysAhead <= 30) {
      confidenceDegradation = 0.7;
    } else {
      confidenceDegradation = 0.5; // Very low confidence beyond 30 days
    }

    const confidence = Math.round(baselineConfidence * confidenceDegradation);

    return {
      retention: Math.max(0, Math.min(1, predictedRetention)), // Clamp 0-1
      confidence: Math.min(95, Math.max(30, confidence)), // Clamp 30-95
      daysAhead: daysAhead
    };
  } catch (error) {
    console.error(`[Decay] Error forecasting horizon ${daysAhead}d:`, error);
    return {
      retention: currentRetention * 0.5, // Conservative fallback
      confidence: 40,
      daysAhead: daysAhead,
      error: true
    };
  }
}

// Determine critical retention threshold
function getRetentionThreshold(risklevel) {
  const thresholds = {
    safe: 0.7,
    warning: 0.5,
    critical: 0.3
  };
  return thresholds[risklevel] || 0.5;
}

module.exports = {
  forecastDecay,
  forecastAtHorizon,
  getRetentionThreshold
};
