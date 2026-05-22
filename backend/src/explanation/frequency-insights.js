// Frequency Pattern Insights Enricher
// Analyzes practice frequency gaps and optimization opportunities

function extractSignalsForFrequency(frequencyData) {
  const signals = [];

  // Signal 1: Gap between sessions
  if (frequencyData.averageGapDays !== undefined) {
    const optimalGap = frequencyData.optimalGapDays || 3;
    signals.push({
      name: "Practice Gap",
      calculation: `${frequencyData.averageGapDays} days between sessions vs ${optimalGap} optimal`,
      supports: frequencyData.averageGapDays > optimalGap,
      weight: 0.4
    });
  }

  // Signal 2: Recent frequency trend
  if (frequencyData.recentTrend !== undefined) {
    signals.push({
      name: "Recent Activity Trend",
      calculation: `${frequencyData.recentTrend > 0 ? "+" : ""}${Math.round(frequencyData.recentTrend)}% change`,
      supports: frequencyData.recentTrend < -10, // Declining activity
      weight: 0.3
    });
  }

  // Signal 3: Submission consistency
  if (frequencyData.varianceInFrequency !== undefined) {
    signals.push({
      name: "Frequency Consistency",
      calculation: `${Math.round(frequencyData.varianceInFrequency)}% variance in gaps`,
      supports: frequencyData.varianceInFrequency > 0.3, // High variance = inconsistent
      weight: 0.3
    });
  }

  return signals;
}

function buildEvidenceForFrequency(frequencyData) {
  return {
    dataSources: [
      `Average gap: ${frequencyData.averageGapDays || 0} days between submissions`,
      `Recent trend: ${frequencyData.recentTrend > 0 ? "+" : ""}${Math.round(frequencyData.recentTrend || 0)}% change`,
      `Consistency variance: ${Math.round(frequencyData.varianceInFrequency * 100 || 0)}%`,
      `Active days per month: ${frequencyData.activeDaysPerMonth || 0}`
    ],
    thresholds: {
      optimalGap: `${frequencyData.optimalGapDays || 3} days between sessions`,
      consistencyTarget: "<30% variance in gap",
      accelerationThreshold: ">+20% frequency increase"
    },
    calculations: [
      {
        step: 1,
        formula: `Average gap = ${frequencyData.averageGapDays || 0} days`,
        result: frequencyData.averageGapDays > (frequencyData.optimalGapDays || 3)
          ? "Gap exceeds optimal"
          : "Gap within range"
      },
      {
        step: 2,
        formula: `Variance = ${Math.round(frequencyData.varianceInFrequency * 100 || 0)}%`,
        result: frequencyData.varianceInFrequency > 0.3 ? "Inconsistent pattern" : "Consistent pattern"
      },
      {
        step: 3,
        formula: `Recent change = ${frequencyData.recentTrend > 0 ? "+" : ""}${Math.round(frequencyData.recentTrend || 0)}%`,
        result: frequencyData.recentTrend > 10
          ? "Accelerating"
          : frequencyData.recentTrend < -10
          ? "Declining"
          : "Stable"
      }
    ]
  };
}

function generateCaveatsForFrequency(frequencyData) {
  const caveats = {};

  const notes = [];
  notes.push("Optimal practice frequency varies by individual and topic complexity");
  notes.push("Consistency matters more than absolute frequency");
  notes.push("Quality over quantity - focused sessions beat unfocused volume");

  if (frequencyData.averageGapDays > 14) {
    notes.push("Large gaps between sessions may impact retention");
  }

  if (notes.length > 0) {
    caveats.notes = notes;
  }

  return caveats;
}

module.exports = {
  extractSignalsForFrequency,
  buildEvidenceForFrequency,
  generateCaveatsForFrequency
};
