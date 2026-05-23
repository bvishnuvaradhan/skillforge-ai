// Optimal Review Timing Calculator
// Determines when user should start reviewing for maximum benefit

function calculateOptimalReviewTiming(currentRetention, estimatedHalfLife, dnaType = "neutral") {
  try {
    console.log(
      `[Decay] Calculating optimal review timing: R=${currentRetention.toFixed(2)}, S=${estimatedHalfLife.toFixed(1)}d`
    );

    // Key retention thresholds:
    // 70% = still memorable but fading (good time to start reviewing)
    // 50% = starting to forget badly (critical threshold)

    // Solve for t when R = 0.70: 0.70 = e^(-t/S) → t = -S * ln(0.70)
    const t_70percent = -estimatedHalfLife * Math.log(0.7);

    // Solve for t when R = 0.50: 0.50 = e^(-t/S) → t = -S * ln(0.50)
    const t_50percent = -estimatedHalfLife * Math.log(0.5);

    // Optimal window: start 1 day before optimal, end 2 days after optimal
    // This allows flexible reviewing within a window
    const windowStart = Math.max(0, t_70percent - 1);
    const windowEnd = t_70percent + 2;

    // Single optimal day (70% retention point)
    const optimalDay = t_70percent;

    // Delay penalty: % effectiveness lost per day delayed past optimal
    // Effectiveness at day X = R(X) / R(optimal) * 100%
    // Example: if delayed 2 days, effectiveness = R(optimal+2) / R(optimal)
    const delayPenalty = calculateDelayPenalty(estimatedHalfLife, optimalDay);

    // DNA adjustments to window width
    let windowWidth = windowEnd - windowStart;
    if (dnaType === "Persistent Explorer") {
      windowWidth *= 1.5; // Wider window (they benefit from struggle)
    } else if (dnaType === "Speed Strategist") {
      windowWidth *= 0.7; // Narrower window (prefer tight timing)
    } else if (dnaType === "Deep Diver") {
      windowWidth *= 1.2; // Slightly wider (deep learning benefit from flexibility)
    }
    // Consistent Learner: no adjustment

    // Calculate effectiveness at different delays
    const effectiveness = {};
    for (let delayDays = 0; delayDays <= 7; delayDays++) {
      const daysSince = optimalDay + delayDays;
      const retentionAtDelay = currentRetention * Math.exp(-daysSince / estimatedHalfLife);
      const retentionAtOptimal = currentRetention * Math.exp(-optimalDay / estimatedHalfLife);
      effectiveness[`day${delayDays}`] = Math.round(
        (retentionAtDelay / retentionAtOptimal) * 100
      );
    }

    // Convert from days from now to absolute dates
    const now = new Date();
    const windowOpensAt = new Date(now);
    windowOpensAt.setDate(windowOpensAt.getDate() + windowStart);

    const windowClosesAt = new Date(now);
    windowClosesAt.setDate(windowClosesAt.getDate() + windowEnd);

    const optimalDateObj = new Date(now);
    optimalDateObj.setDate(optimalDateObj.getDate() + optimalDay);

    const result = {
      windowOpensAt: windowOpensAt,
      windowClosesAt: windowClosesAt,
      optimalDay: optimalDateObj,
      daysUntilWindow: Math.round(windowStart),
      windowDurationDays: Math.round(windowEnd - windowStart),
      delayPenalty: Math.round(delayPenalty),
      effectiveness: effectiveness,
      dnaType: dnaType,
      description:
        `Review window opens in ${Math.round(windowStart)}d, ` +
        `closes in ${Math.round(windowEnd)}d. Optimal day: +${Math.round(optimalDay)}d`
    };

    console.log(
      `[Decay] Window: ${result.daysUntilWindow}d from now, ` +
        `optimal: ${Math.round(optimalDay)}d, penalty: ${delayPenalty}%/day`
    );

    return result;
  } catch (error) {
    console.error(`[Decay] Error calculating review timing:`, error);
    throw error;
  }
}

// Calculate delay penalty (% effectiveness loss per day delayed)
function calculateDelayPenalty(halfLife, optimalDay) {
  try {
    // Effectiveness at optimal vs +1 day late
    const retentionOptimal = Math.exp(-optimalDay / halfLife);
    const retentionDelayed = Math.exp(-(optimalDay + 1) / halfLife);
    const effectivenessRatio = retentionDelayed / retentionOptimal;
    const penalty = (1 - effectivenessRatio) * 100;

    return Math.round(penalty);
  } catch (error) {
    console.error(`[Decay] Error calculating penalty:`, error);
    return 0;
  }
}

// Check if current time is within optimal window
function isWithinOptimalWindow(timing) {
  const now = new Date();
  return now >= timing.windowOpensAt && now <= timing.windowClosesAt;
}

// Calculate effectiveness at a specific future date
function getEffectivenessAt(baseDate, estimatedHalfLife, optimalDay, daysIntoFuture) {
  const retentionOptimal = Math.exp(-optimalDay / estimatedHalfLife);
  const retentionFuture = Math.exp(-(optimalDay + daysIntoFuture) / estimatedHalfLife);
  return Math.round((retentionFuture / retentionOptimal) * 100);
}

module.exports = {
  calculateOptimalReviewTiming,
  calculateDelayPenalty,
  isWithinOptimalWindow,
  getEffectivenessAt
};
