const { RecommendationConflictModel } = require("../../models/RecommendationConflict");

function groupByTopic(candidates) {
  const groups = new Map();
  for (const candidate of candidates) {
    const key = `topic:${candidate.topic}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(candidate);
  }
  return groups;
}

async function resolveConflicts(candidates, options = {}) {
  const groups = groupByTopic(candidates);
  const winners = [];
  const deferred = [];
  const conflicts = [];

  for (const [group, groupCandidates] of groups.entries()) {
    if (groupCandidates.length === 1) {
      winners.push(groupCandidates[0]);
      continue;
    }

    const sorted = [...groupCandidates].sort((a, b) => b.finalPriorityScore - a.finalPriorityScore);
    const winner = sorted[0];
    const losers = sorted.slice(1);

    winners.push(winner);
    deferred.push(...losers.map((loser) => ({
      ...loser,
      deferredReason: `Deferred due to stronger ${winner.type} recommendation on same topic`
    })));

    const conflictPayload = {
      user: winner.user,
      conflictGroup: group,
      recommendations: sorted.map((c) => c._id).filter(Boolean),
      winnerRecommendation: winner._id,
      loserRecommendations: losers.map((c) => c._id).filter(Boolean),
      conflictType: "same_topic",
      resolverStrategy: "objective_priority",
      rationale: `Winner selected by highest finalPriorityScore (${winner.finalPriorityScore})`
    };

    if (options.persist !== false) {
      await RecommendationConflictModel.create(conflictPayload);
    }

    conflicts.push(conflictPayload);
  }

  return { winners, deferred, conflicts };
}

module.exports = {
  resolveConflicts
};
