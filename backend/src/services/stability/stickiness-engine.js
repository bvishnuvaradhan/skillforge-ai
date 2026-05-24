const { RecommendationLifecycleModel } = require("../../models/RecommendationLifecycle");
const { Types } = require("mongoose");

async function getRecentSurfacedIds(userId, hours = 24) {
  if (!userId || !Types.ObjectId.isValid(String(userId))) return [];
  const since = new Date(Date.now() - hours * 60 * 60 * 1000);
  const recs = await RecommendationLifecycleModel.find({
    user: userId,
    lastSurfacedAt: { $gte: since }
  }).select("recommendationId");

  return recs.map((item) => String(item.recommendationId));
}

function applyStickinessBoost(candidates = [], stickyIds = []) {
  const sticky = new Set((stickyIds || []).map(String));
  return candidates.map((candidate) => {
    const id = String(candidate._id || "");
    const stickinessBonus = sticky.has(id) ? 6 : 0;
    return {
      ...candidate,
      stability: {
        ...(candidate.stability || {}),
        stickinessBonus
      },
      finalPriorityScore: Number(Math.min(100, (candidate.finalPriorityScore || 0) + stickinessBonus).toFixed(2))
    };
  });
}

module.exports = {
  getRecentSurfacedIds,
  applyStickinessBoost
};
