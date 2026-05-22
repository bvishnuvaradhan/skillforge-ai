// DNA Profile Insights Enricher
// Enriches learner profile classification with probabilistic language
// CRITICAL: Must use "indication of" NOT "you are" language

function extractSignalsForDNA(dnaData) {
  const signals = [];

  // Signal 1: Consistency pattern
  if (dnaData.consistencyScore !== undefined) {
    signals.push({
      name: "Consistency Pattern",
      calculation: `${Math.round(dnaData.consistencyScore)}% active days per month`,
      supports: dnaData.profileType === "Consistent Learner",
      weight: 0.35
    });
  }

  // Signal 2: Submission frequency
  if (dnaData.submissionFrequency !== undefined) {
    signals.push({
      name: "Submission Frequency",
      calculation: `${dnaData.submissionFrequency} problems per week average`,
      supports: dnaData.profileType !== "Speed Strategist", // Regular pace
      weight: 0.25
    });
  }

  // Signal 3: Difficulty progression
  if (dnaData.difficultyProgression !== undefined) {
    const isProgressing = dnaData.difficultyProgression > 0.1;
    signals.push({
      name: "Difficulty Progression",
      calculation: `${Math.round(dnaData.difficultyProgression * 100)}% difficulty increase`,
      supports: isProgressing,
      weight: 0.25
    });
  }

  // Signal 4: Topic depth vs breadth
  if (dnaData.depthBreadthRatio !== undefined) {
    const isDeep = dnaData.depthBreadthRatio > 0.6;
    signals.push({
      name: "Topic Exploration Style",
      calculation: `${(dnaData.depthBreadthRatio * 100).toFixed(0)}% deep vs broad`,
      supports: isDeep === (dnaData.profileType === "Deep Diver"),
      weight: 0.15
    });
  }

  return signals;
}

function buildEvidenceForDNA(dnaData) {
  return {
    dataSources: [
      `Consistency score: ${Math.round(dnaData.consistencyScore || 0)}% active days`,
      `Total submissions analyzed: ${dnaData.totalSubmissions || 0}`,
      `Observation period: ${dnaData.observationDays || 30} days`,
      `Topics explored: ${dnaData.topicsExplored || 0}`,
      `Average difficulty progression: ${Math.round((dnaData.difficultyProgression || 0) * 100)}%`
    ],
    thresholds: {
      consistencyThreshold: ">70% active days = Consistent",
      depthThreshold: ">60% same topic = Deep Diver",
      speedThreshold: ">3 problems/week = Speed Strategist",
      observationMinimum: "20+ days recommended"
    },
    calculations: [
      {
        step: 1,
        formula: `Active days = ${Math.round(dnaData.consistencyScore || 0)}%`,
        result: dnaData.consistencyScore > 70 ? "Consistent pattern" : "Variable pattern"
      },
      {
        step: 2,
        formula: `Topics explored = ${dnaData.topicsExplored || 0}`,
        result: dnaData.topicsExplored < 5 ? "Depth focus" : "Breadth focus"
      },
      {
        step: 3,
        formula: `Difficulty change = ${Math.round((dnaData.difficultyProgression || 0) * 100)}%`,
        result: dnaData.difficultyProgression > 0.1 ? "Progressive learner" : "Stable learner"
      }
    ]
  };
}

function generateCaveatsForDNA(dnaData) {
  const caveats = {};

  const limitations = [];

  // Observation window too short
  if (dnaData.observationDays && dnaData.observationDays < 20) {
    limitations.push(
      `Observation window is ${dnaData.observationDays} days - may change with more data`
    );
  }

  // Insufficient submissions
  if (dnaData.totalSubmissions && dnaData.totalSubmissions < 20) {
    limitations.push(`Limited submissions (${dnaData.totalSubmissions}) - profile may evolve`);
  }

  if (limitations.length > 0) {
    caveats.limitations = limitations;
  }

  const notes = [];
  notes.push("Learning profiles are behavioral classifications based on patterns");
  notes.push("Profiles can shift as your learning strategy evolves");
  notes.push("Use this as a guide, not a fixed label");

  if (notes.length > 0) {
    caveats.notes = notes;
  }

  return caveats;
}

module.exports = {
  extractSignalsForDNA,
  buildEvidenceForDNA,
  generateCaveatsForDNA
};
