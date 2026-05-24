const { ScoreProvenanceModel } = require("../../models/ScoreProvenance");

function buildScoreProvenanceRecords(userId, runId, candidates = []) {
  return (candidates || []).map((candidate) => ({
    user: userId,
    runId,
    recommendationId: String(candidate._id || ""),
    topic: candidate.topic,
    type: candidate.type,
    sourceEngine: candidate.sourceEngine,
    weightedBaseScore: candidate.weightedBaseScore,
    finalPriorityScore: candidate.finalPriorityScore,
    components: {
      urgency: candidate.urgency,
      impact: candidate.impact,
      confidence: candidate.confidence,
      dependencyImportance: candidate.dependencyImportance,
      diversityAdjustment: candidate.diversityAdjustment
    },
    boosts: candidate.boosts || {},
    penalties: candidate.penalties || {},
    winnerReason: candidate.winnerReason,
    metadata: {
      hardFlags: candidate.hardFlags || {},
      sourceAlgorithm: candidate.sourceAlgorithm
    }
  }));
}

async function persistScoreProvenance(records = [], options = {}) {
  if (options.persist === false || !records.length) return [];
  return ScoreProvenanceModel.insertMany(records, { ordered: false });
}

module.exports = {
  buildScoreProvenanceRecords,
  persistScoreProvenance
};
