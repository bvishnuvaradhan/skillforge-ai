// Trend Insights Enricher
// Analyzes improving/declining pass rates with explicit temporal windows
// CRITICAL: Must show "Last X vs Previous Y" to avoid noisy trends

function extractSignalsForTrend(trendData) {
  const signals = [];

  // Signal 1: Pass rate direction
  if (trendData.recentPassRate !== undefined && trendData.olderPassRate !== undefined) {
    const declining = trendData.recentPassRate < trendData.olderPassRate;
    signals.push({
      name: "Pass Rate Trend",
      calculation: `Recent: ${Math.round(trendData.recentPassRate * 100)}% vs Previous: ${Math.round(
        trendData.olderPassRate * 100
      )}%`,
      supports: declining,
      weight: 0.5
    });
  }

  // Signal 2: Consistency of recent performance
  if (trendData.recentConsistency !== undefined) {
    signals.push({
      name: "Recent Consistency",
      calculation: `${Math.round(trendData.recentConsistency)}% consistent`,
      supports: trendData.recentConsistency < 70, // Low consistency = less stable
      weight: 0.3
    });
  }

  // Signal 3: Trend duration
  if (trendData.consecutiveDays !== undefined) {
    signals.push({
      name: "Trend Duration",
      calculation: `${trendData.consecutiveDays} consecutive days`,
      supports: trendData.consecutiveDays >= 5, // At least 5 days shows pattern
      weight: 0.2
    });
  }

  return signals;
}

function buildEvidenceForTrend(trendData) {
  return {
    dataSources: [
      `Recent submissions (last ${trendData.recentDays || 5} days): ${trendData.recentCount || 0} problems`,
      `Previous submissions (${trendData.olderDays || "7-15"} days prior): ${trendData.olderCount || 0} problems`,
      `Pass rate change: ${Math.round((trendData.recentPassRate - trendData.olderPassRate) * 100)}%`
    ],
    thresholds: {
      trendSignificance: "Pass rate change > 10%",
      minimumWindow: "At least 5 recent submissions",
      temporalComparison: `Last ${trendData.recentDays} vs previous ${trendData.olderDays}`
    },
    calculations: [
      {
        step: 1,
        formula: `Recent window: ${trendData.recentDays} days, ${trendData.recentCount} problems`,
        result: `${Math.round(trendData.recentPassRate * 100)}% pass rate`
      },
      {
        step: 2,
        formula: `Previous window: ${trendData.olderDays} days, ${trendData.olderCount} problems`,
        result: `${Math.round(trendData.olderPassRate * 100)}% pass rate`
      },
      {
        step: 3,
        formula: `Comparison: ${Math.round(trendData.recentPassRate * 100)}% vs ${Math.round(
          trendData.olderPassRate * 100
        )}%`,
        result: trendData.recentPassRate < trendData.olderPassRate ? "DECLINING" : "IMPROVING"
      }
    ]
  };
}

function generateCaveatsForTrend(trendData) {
  const caveats = {};

  const limitations = [];
  if (trendData.recentCount < 5) {
    limitations.push(
      `Only ${trendData.recentCount} recent submissions - small sample may be noisy`
    );
  }
  if (trendData.olderCount < 10) {
    limitations.push(
      `Previous sample has ${trendData.olderCount} submissions - baseline less reliable`
    );
  }
  if (limitations.length > 0) {
    caveats.limitations = limitations;
  }

  const contradictions = [];
  const passRateDiff = Math.abs(trendData.recentPassRate - trendData.olderPassRate);
  if (passRateDiff < 0.1) {
    contradictions.push(
      "Pass rate difference is small (<10%) - trend may be normal variance"
    );
  }
  if (contradictions.length > 0) {
    caveats.contradictions = contradictions;
  }

  return caveats;
}

module.exports = {
  extractSignalsForTrend,
  buildEvidenceForTrend,
  generateCaveatsForTrend
};
