// Growth Streak Insights Enricher
// Alerts about rapid mastery improvements

function extractSignalsForGrowthStreak(streakData) {
  const signals = [];

  // Signal 1: Mastery improvement
  if (streakData.masteryImprovement !== undefined) {
    signals.push({
      name: "Mastery Improvement",
      calculation: `+${Math.round(streakData.masteryImprovement)}% over observation period`,
      supports: streakData.masteryImprovement > 5,
      weight: 0.4
    });
  }

  // Signal 2: Recent activity
  if (streakData.recentSubmissionCount !== undefined) {
    signals.push({
      name: "Recent Activity",
      calculation: `${streakData.recentSubmissionCount} submissions in last ${streakData.streakDays || 7} days`,
      supports: streakData.recentSubmissionCount >= 5,
      weight: 0.3
    });
  }

  // Signal 3: Pass rate improving
  if (
    streakData.recentPassRate !== undefined &&
    streakData.olderPassRate !== undefined
  ) {
    signals.push({
      name: "Performance Trend",
      calculation: `${Math.round(streakData.recentPassRate * 100)}% vs ${Math.round(
        streakData.olderPassRate * 100
      )}% previously`,
      supports: streakData.recentPassRate > streakData.olderPassRate,
      weight: 0.3
    });
  }

  return signals;
}

function buildEvidenceForGrowthStreak(streakData) {
  return {
    dataSources: [
      `Mastery improvement: +${Math.round(streakData.masteryImprovement || 0)}%`,
      `Recent submissions: ${streakData.recentSubmissionCount || 0} in ${streakData.streakDays || 7} days`,
      `Recent pass rate: ${Math.round((streakData.recentPassRate || 0) * 100)}%`,
      `Previous pass rate: ${Math.round((streakData.olderPassRate || 0) * 100)}%`
    ],
    thresholds: {
      improvementThreshold: "> 5% mastery gain",
      activityThreshold: "> 5 submissions",
      streakMinimum: "> 5 consecutive days"
    },
    calculations: [
      {
        step: 1,
        formula: `Mastery change: ${streakData.masterOld || 0}% → ${streakData.masterNew || 0}%`,
        result: `+${Math.round(streakData.masteryImprovement || 0)}% improvement`
      },
      {
        step: 2,
        formula: `Recent activity: ${streakData.recentSubmissionCount || 0} problems`,
        result: streakData.recentSubmissionCount >= 5 ? "Active engagement" : "Limited activity"
      },
      {
        step: 3,
        formula: `Pass rate: ${Math.round((streakData.recentPassRate || 0) * 100)}% vs ${Math.round(
          (streakData.olderPassRate || 0) * 100
        )}%`,
        result: streakData.recentPassRate > streakData.olderPassRate ? "IMPROVING" : "STABLE"
      }
    ]
  };
}

function generateCaveatsForGrowthStreak(streakData) {
  const caveats = {};

  const notes = [];
  notes.push("Growth streaks can be temporary - sustained improvement over weeks confirms progress");
  notes.push("Momentum is powerful - keep practicing to maintain this streak");
  notes.push("Increased difficulty next would accelerate learning");

  if (streakData.streakDays && streakData.streakDays < 7) {
    notes.push(
      "Streak is just beginning - give it a few more days to confirm pattern"
    );
  }

  if (notes.length > 0) {
    caveats.notes = notes;
  }

  return caveats;
}

module.exports = {
  extractSignalsForGrowthStreak,
  buildEvidenceForGrowthStreak,
  generateCaveatsForGrowthStreak
};
