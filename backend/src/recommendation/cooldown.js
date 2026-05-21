/**
 * Cool-down system to prevent recommendation spam
 */

const COOLDOWN_PERIODS = {
  revision: 5,
  "weak-topic": 7,
  exploration: 14,
  "difficulty-increase": 3,
  "difficulty-decrease": 7
};

/**
 * Check if a recommendation should be shown to user
 * Respects cool-down and urgency escalation
 */
function shouldShowRecommendation(rec, currentTime = new Date()) {
  if (!rec.lastRecommendedAt) {
    return true; // Never shown before
  }

  const timeSinceLastShow = (currentTime - new Date(rec.lastRecommendedAt)) / (1000 * 60 * 60 * 24);
  const baseCooldown = COOLDOWN_PERIODS[rec.type] || 7;

  // Urgency escalation: high-urgency recommendations can bypass cooldown
  const urgencyMultiplier = rec.urgencyScore > 80 ? 0.5 : 1.0;
  const effectiveCooldown = baseCooldown * urgencyMultiplier;

  return timeSinceLastShow >= effectiveCooldown;
}

/**
 * Filter recommendations by cool-down, returning only showable ones
 */
async function filterByCooldown(recommendations, currentTime = new Date()) {
  return recommendations.filter(rec => shouldShowRecommendation(rec, currentTime));
}

/**
 * Update cool-down tracking after recommendation is shown
 */
async function recordRecommendationShown(recommendationId, RecommendationModel) {
  return await RecommendationModel.findByIdAndUpdate(
    recommendationId,
    {
      lastRecommendedAt: new Date(),
      $inc: { timesShown: 1 },
      cooldownUntil: calculateCooldownUntil(null, null) // Will be set based on type
    },
    { new: true }
  );
}

/**
 * Calculate when recommendation can be shown again
 */
function calculateCooldownUntil(rec, currentTime = new Date()) {
  if (!rec) return null;

  const baseCooldown = COOLDOWN_PERIODS[rec.type] || 7;
  const urgencyMultiplier = rec.urgencyScore > 80 ? 0.5 : 1.0;
  const effectiveCooldown = baseCooldown * urgencyMultiplier;

  return new Date(currentTime.getTime() + effectiveCooldown * 24 * 60 * 60 * 1000);
}

module.exports = {
  COOLDOWN_PERIODS,
  shouldShowRecommendation,
  filterByCooldowm,
  recordRecommendationShown,
  calculateCooldownUntil
};
