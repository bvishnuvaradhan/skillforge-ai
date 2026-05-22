// Skill Connection Insights Enricher
// Enriches insights about related topics and skill reinforcement

function extractSignalsForConnection(connectionData) {
  const signals = [];

  // Signal 1: Prerequisite strength
  if (connectionData.prerequisiteStrength !== undefined) {
    signals.push({
      name: "Prerequisite Foundation",
      calculation: `${Math.round(connectionData.prerequisiteStrength * 100)}% mastery in prerequisites`,
      supports: connectionData.prerequisiteStrength > 0.6,
      weight: 0.35
    });
  }

  // Signal 2: Topic overlap
  if (connectionData.topicOverlap !== undefined) {
    signals.push({
      name: "Concept Overlap",
      calculation: `${Math.round(connectionData.topicOverlap * 100)}% shared concepts`,
      supports: connectionData.topicOverlap > 0.4,
      weight: 0.3
    });
  }

  // Signal 3: Learning sequence optimality
  if (connectionData.sequenceOptimal !== undefined) {
    signals.push({
      name: "Learning Sequence",
      calculation: connectionData.sequenceOptimal ? "Optimal order" : "Could optimize order",
      supports: connectionData.sequenceOptimal,
      weight: 0.35
    });
  }

  return signals;
}

function buildEvidenceForConnection(connectionData) {
  return {
    dataSources: [
      `Topic A: ${connectionData.topicA || "Unknown"} (${Math.round(
        (connectionData.masteryA || 0) * 100
      )}% mastery)`,
      `Topic B: ${connectionData.topicB || "Unknown"} (${Math.round(
        (connectionData.masteryB || 0) * 100
      )}% mastery)`,
      `Prerequisite strength: ${Math.round((connectionData.prerequisiteStrength || 0) * 100)}%`,
      `Concept overlap: ${Math.round((connectionData.topicOverlap || 0) * 100)}%`
    ],
    thresholds: {
      prerequisiteThreshold: ">60% mastery in prerequisites",
      overlapThreshold: ">40% concept sharing",
      recommendedSequence: `${connectionData.topicA} → ${connectionData.topicB}`
    },
    calculations: [
      {
        step: 1,
        formula: `${connectionData.topicA} mastery = ${Math.round((connectionData.masteryA || 0) * 100)}%`,
        result: connectionData.masteryA > 0.5 ? "Foundation solid" : "Build foundation first"
      },
      {
        step: 2,
        formula: `Prerequisite strength = ${Math.round((connectionData.prerequisiteStrength || 0) * 100)}%`,
        result: connectionData.prerequisiteStrength > 0.6 ? "Ready for ${topicB}" : "More practice needed"
      },
      {
        step: 3,
        formula: `Concept overlap = ${Math.round((connectionData.topicOverlap || 0) * 100)}%`,
        result:
          connectionData.topicOverlap > 0.4
            ? "Skills will reinforce each other"
            : "Skills are independent"
      }
    ]
  };
}

function generateCaveatsForConnection(connectionData) {
  const caveats = {};

  const limitations = [];
  if (connectionData.masteryA < 0.5) {
    limitations.push(
      `Foundation in ${connectionData.topicA} is still building - may impact learning speed`
    );
  }

  if (limitations.length > 0) {
    caveats.limitations = limitations;
  }

  const notes = [];
  notes.push("Learning order can significantly impact mastery speed");
  notes.push("Strong prerequisites make new concepts much easier to grasp");

  if (notes.length > 0) {
    caveats.notes = notes;
  }

  return caveats;
}

module.exports = {
  extractSignalsForConnection,
  buildEvidenceForConnection,
  generateCaveatsForConnection
};
