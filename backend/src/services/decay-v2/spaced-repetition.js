// Spaced Repetition Scheduler (SM-2 Algorithm)
// Calculates optimal review intervals based on SM-2 with DNA-type adjustments

function calculateSpacedRepetition(dnaType = "Consistent Learner", easinessFactor = 2.5) {
  try {
    console.log(`[Decay] Calculating SM-2 intervals for ${dnaType}`);

    // Base SM-2 intervals (in days)
    // I(1) = 1, I(2) = 3, I(3) = 7, then I(n) = I(n-1) * EF
    let intervals = [1, 3, 7];

    // Extend with additional intervals using SM-2 formula
    // I(n) = I(n-1) * EF
    for (let i = 3; i < 10; i++) {
      intervals.push(Math.round(intervals[i - 1] * easinessFactor));
    }

    // Apply DNA-based multipliers
    // These affect how quickly intervals grow
    let dnaMultiplier = 1.0;

    if (dnaType === "Persistent Explorer") {
      dnaMultiplier = 1.2; // Longer intervals (they like to struggle)
    } else if (dnaType === "Speed Strategist") {
      dnaMultiplier = 0.8; // Shorter intervals (want faster mastery)
    } else if (dnaType === "Consistent Learner") {
      dnaMultiplier = 1.0; // Standard intervals
    } else if (dnaType === "Deep Diver") {
      dnaMultiplier = 1.15; // Slightly longer (deeper retention)
    }

    // Apply multiplier to all intervals except the first (always 1 day)
    const adjustedIntervals = [
      intervals[0],
      ...intervals.slice(1).map((i) => Math.round(i * dnaMultiplier))
    ];

    const result = {
      interval1: adjustedIntervals[0], // First review (days after solve)
      interval2: adjustedIntervals[1], // Second review (days from interval1)
      interval3: adjustedIntervals[2], // Third review (days from interval2)
      intervals: adjustedIntervals,
      dnaType: dnaType,
      dnaMultiplier: dnaMultiplier,
      baseSM2Intervals: intervals,
      easinessFactor: easinessFactor,
      description:
        `Review schedule for ${dnaType} learner. ` +
        `First: ${adjustedIntervals[0]}d, Second: ${adjustedIntervals[1]}d, Third: ${adjustedIntervals[2]}d`
    };

    console.log(`[Decay] SM-2 intervals: ${result.interval1}d → ${result.interval2}d → ${result.interval3}d`);

    return result;
  } catch (error) {
    console.error(`[Decay] Error calculating spaced repetition:`, error);
    throw error;
  }
}

// Calculate next review date based on current submission and interval
function getNextReviewDate(lastSolveDate, intervalDays) {
  const nextDate = new Date(lastSolveDate);
  nextDate.setDate(nextDate.getDate() + intervalDays);
  return nextDate;
}

// Generate review dates for full schedule
function generateReviewSchedule(baseDate, intervals) {
  try {
    const schedule = [];
    let currentDate = new Date(baseDate);

    for (let i = 0; i < intervals.length; i++) {
      currentDate = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + intervals[i]);
      schedule.push({
        reviewNumber: i + 1,
        daysFromNow: intervals[i],
        scheduledDate: currentDate,
        description: `Review ${i + 1}`
      });
    }

    return schedule;
  } catch (error) {
    console.error(`[Decay] Error generating review schedule:`, error);
    return [];
  }
}

module.exports = {
  calculateSpacedRepetition,
  getNextReviewDate,
  generateReviewSchedule
};
