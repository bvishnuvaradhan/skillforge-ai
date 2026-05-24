function toDate(value) {
  if (!value) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function hoursSince(value, now = new Date()) {
  const parsed = toDate(value);
  if (!parsed) return Number.POSITIVE_INFINITY;
  return Math.max(0, (now.getTime() - parsed.getTime()) / (60 * 60 * 1000));
}

function smoothRecommendationOrdering(selected = [], options = {}) {
  const now = toDate(options.now) || new Date();
  const minDisplayHours = Number(options.minDisplayHours || 6);
  const reentryCooldownHours = Number(options.reentryCooldownHours || 24);

  const scored = selected.map((candidate) => {
    const baseScore = Number(candidate.finalPriorityScore || 0);
    const existingStability = candidate.stability || {};
    const lastSurfacedAt = toDate(candidate.lastSurfacedAt || existingStability.lastSurfacedAt);
    const surfacingAgeHours = hoursSince(lastSurfacedAt, now);
    const stickinessBonus = Number(existingStability.stickinessBonus || 0);
    const temporalHoldBonus = surfacingAgeHours <= minDisplayHours ? 8 : 0;
    const cooldownPenalty =
      surfacingAgeHours < reentryCooldownHours ? Math.max(0, 6 - surfacingAgeHours / 4) : 0;
    const trustScore = Number(
      Math.min(100, Math.max(0, baseScore + stickinessBonus + temporalHoldBonus - cooldownPenalty)).toFixed(2)
    );

    return {
      ...candidate,
      stability: {
        ...existingStability,
        lastSurfacedAt: lastSurfacedAt ? lastSurfacedAt.toISOString() : existingStability.lastSurfacedAt,
        temporalHoldBonus,
        cooldownPenalty,
        trustScore
      },
      finalPriorityScore: trustScore
    };
  });

  return scored.sort((a, b) => {
    const aScore = Number(a.finalPriorityScore || 0);
    const bScore = Number(b.finalPriorityScore || 0);
    const delta = bScore - aScore;

    if (Math.abs(delta) < 4) {
      const aTemporalHold = Number(a.stability?.temporalHoldBonus || 0);
      const bTemporalHold = Number(b.stability?.temporalHoldBonus || 0);
      if (aTemporalHold !== bTemporalHold) return bTemporalHold - aTemporalHold;

      const aStickiness = Number(a.stability?.stickinessBonus || 0);
      const bStickiness = Number(b.stability?.stickinessBonus || 0);
      if (aStickiness !== bStickiness) return bStickiness - aStickiness;
      return String(a._id || "").localeCompare(String(b._id || ""));
    }

    return delta;
  });
}

module.exports = {
  smoothRecommendationOrdering
};
