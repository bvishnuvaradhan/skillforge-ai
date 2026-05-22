// Mastery Drop Insights Enricher
// Alerts about critical retention drops

function extractSignalsForMasteryDrop(dropData) {
  const signals = [];

  // Signal 1: Retention critically low
  if (dropData.retentionScore !== undefined) {
    signals.push({
      name: "Retention Critical",
      calculation: `${Math.round(dropData.retentionScore * 100)}% < 60% threshold`,
      supports: dropData.retentionScore < 0.6,
      weight: 0.5
    });
  }

  // Signal 2: Inactivity period
  if (dropData.daysSinceLastSolve !== undefined) {
    signals.push({
      name: "Inactivity Period",
      calculation: `${dropData.daysSinceLastSolve} days without practice`,
      supports: dropData.daysSinceLastSolve > 10,
      weight: 0.3
    });
  }

  // Signal 3: Historical mastery strong
  if (dropData.mastery !== undefined) {
    signals.push({
      name: "Previous Mastery",
      calculation: `${Math.round(dropData.mastery)}% mastery achieved before`,
      supports: dropData.mastery > 50,
      weight: 0.2
    });
  }

  return signals;
}

function buildEvidenceForMasteryDrop(dropData) {
  return {
    dataSources: [
      `Current retention: ${Math.round((dropData.retentionScore || 0) * 100)}%`,
      `Days inactive: ${dropData.daysSinceLastSolve || 0}`,
      `Previous mastery: ${Math.round((dropData.mastery || 0))}%`,
      `Formula: R = e^(-t/S) = e^(-${dropData.daysSinceLastSolve}/${dropData.halfLife || 52})`
    ],
    thresholds: {
      criticalRetention: "< 60%",
      inactivityThreshold: "> 10 days",
      masteryMinimum: "> 50%"
    },
    calculations: [
      {
        step: 1,
        formula: `Days since last solve: ${dropData.daysSinceLastSolve || 0}`,
        result: `${dropData.daysSinceLastSolve || 0} days`
      },
      {
        step: 2,
        formula: `Retention formula: R = e^(-${dropData.daysSinceLastSolve || 0}/${dropData.halfLife || 52})`,
        result: `${Math.round((dropData.retentionScore || 0) * 100)}% retention`
      },
      {
        step: 3,
        formula: `Is ${Math.round((dropData.retentionScore || 0) * 100)}% < 60%?`,
        result: "YES - CRITICAL RETENTION DROP"
      }
    ]
  };
}

function generateCaveatsForMasteryDrop(dropData) {
  const caveats = {};

  const limitations = [];
  if (dropData.daysSinceLastSolve < 7) {
    limitations.push("Recent retention drop - data is fresh and reliable");
  }

  if (limitations.length > 0) {
    caveats.limitations = limitations;
  }

  const notes = [];
  notes.push("Ebbinghaus Forgetting Curve model predicts average memory decay");
  notes.push("Your actual retention may be better or worse than formula predicts");
  notes.push("Immediate practice will restore retention to near-perfect");

  if (notes.length > 0) {
    caveats.notes = notes;
  }

  return caveats;
}

module.exports = {
  extractSignalsForMasteryDrop,
  buildEvidenceForMasteryDrop,
  generateCaveatsForMasteryDrop
};
