// Decay-Aware Recommendation Adapter
// Boosts recommendation urgency based on decay forecast risk

async function adaptRecommendationByDecay(recommendation, decayForecast, optimalTiming) {
  try {
    if (!decayForecast) {
      console.log(`[Decay] No decay forecast; returning original recommendation`);
      return recommendation;
    }

    console.log(
      `[Decay] Adapting recommendation for ${recommendation.topic} (risk: ${decayForecast.riskLevel})`
    );

    let multiplier = 1.0;
    let decayContext = {
      currentRetention: decayForecast.currentRetention,
      forecast7Day: decayForecast.forecasts.day7.retention,
      riskLevel: decayForecast.riskLevel,
      reason: ""
    };

    // Apply multiplier based on risk level
    if (decayForecast.riskLevel === "critical") {
      multiplier = 1.5;
      decayContext.reason = "Critical retention risk detected";
    } else if (decayForecast.riskLevel === "warning") {
      multiplier = 1.2;
      decayContext.reason = "Warning: retention declining";
    }

    // Check if now is optimal review time
    if (optimalTiming) {
      const now = new Date();
      const isOptimal = now >= optimalTiming.windowOpensAt && now <= optimalTiming.windowClosesAt;

      if (isOptimal) {
        multiplier *= 1.3; // "Now is best time!" boost
        decayContext.optimalWindowDays = optimalTiming.windowDurationDays;
        decayContext.reason = "Optimal review window is active (×1.3 boost)";
      } else if (now > optimalTiming.windowClosesAt) {
        // Past optimal window - add caveat but don't reduce urgency
        const daysPast = Math.round(
          (now.getTime() - optimalTiming.windowClosesAt.getTime()) / (1000 * 60 * 60 * 24)
        );
        decayContext.caveat = `Effectiveness declining (${Math.max(
          0,
          100 - daysPast * optimalTiming.delayPenalty
        )}% of optimal)`;
      }
    }

    // Apply global urgency cap
    const originalUrgency = recommendation.urgencyScore || 50;
    const adjustedUrgency = Math.min(95, Math.round(originalUrgency * multiplier));

    const adapted = {
      ...recommendation,
      urgencyScore: adjustedUrgency,
      decayAdaptation: {
        originalUrgency: originalUrgency,
        adjustedUrgency: adjustedUrgency,
        multiplier: parseFloat((multiplier).toFixed(2)),
        decayContext: decayContext
      }
    };

    console.log(
      `[Decay] Adapted urgency: ${originalUrgency} → ${adjustedUrgency} (×${multiplier.toFixed(2)})`
    );

    return adapted;
  } catch (error) {
    console.error(`[Decay] Error adapting recommendation:`, error);
    return recommendation; // Return original on error
  }
}

// Batch adapt multiple recommendations
async function adaptRecommendationsByDecay(recommendations, decayForecasts, timingByTopic) {
  try {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    const adapted = [];

    for (const rec of recommendations) {
      const forecast = decayForecasts[rec.topic];
      const timing = timingByTopic[rec.topic];

      const adaptedRec = await adaptRecommendationByDecay(rec, forecast, timing);
      adapted.push(adaptedRec);
    }

    console.log(`[Decay] Adapted ${adapted.length} recommendations`);
    return adapted;
  } catch (error) {
    console.error(`[Decay] Error batch adapting recommendations:`, error);
    return recommendations; // Return originals on error
  }
}

// Generate human-readable reason for decay adaptation
function getAdaptationReason(riskLevel, isOptimal, daysPast, delayPenalty) {
  if (riskLevel === "critical") {
    return "Critical retention risk: immediate practice needed";
  } else if (riskLevel === "warning") {
    return "Retention declining: practice recommended";
  } else if (isOptimal) {
    return "Optimal review window active: best time to practice";
  } else if (daysPast > 0) {
    const effectiveness = Math.max(0, 100 - daysPast * delayPenalty);
    return `Past optimal window: ${effectiveness}% of peak effectiveness remains`;
  }
  return "Decay-based adjustment applied";
}

module.exports = {
  adaptRecommendationByDecay,
  adaptRecommendationsByDecay,
  getAdaptationReason
};
