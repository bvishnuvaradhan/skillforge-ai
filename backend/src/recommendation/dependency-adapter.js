const { validatePrerequisites } = require("../services/dependency/prerequisite-validator");
const { SAFE_TEMPLATES, enforceSoftLanguage, buildSoftRecommendation } = require("../services/dependency/language-governance");

async function adaptExplorationByDependencies(recommendation, userId) {
  if (!recommendation || recommendation.type !== "exploration") {
    return recommendation;
  }

  const validation = await validatePrerequisites(userId, recommendation.topic);

  const augmented = {
    ...recommendation,
    dependencyContext: {
      readinessBand: validation.readinessBand,
      readinessConfidence: Math.min(95, Math.max(45, validation.internalReadinessScore || 50)),
      prerequisites: validation.prerequisites || [],
      weakFoundations: validation.weakFoundations || [],
      message: validation.shortMessage
    }
  };

  if (validation.readinessBand === "NOT_READY") {
    const firstPrep = (validation.prerequisites || []).find((p) => !p.isMet);

    return {
      ...augmented,
      urgencyScore: Math.max(20, Math.round((recommendation.urgencyScore || 30) * 0.7)),
      reason: firstPrep
        ? buildSoftRecommendation(recommendation.topic, firstPrep.topic)
        : enforceSoftLanguage(SAFE_TEMPLATES.optionalPrep, SAFE_TEMPLATES.optionalPrep)
    };
  }

  if (validation.readinessBand === "DEVELOPING") {
    return {
      ...augmented,
      reason: enforceSoftLanguage(
        `Many learners begin ${recommendation.topic} in this stage; optional preparation may improve confidence.`,
        SAFE_TEMPLATES.manyLearners
      )
    };
  }

  return {
    ...augmented,
    urgencyScore: Math.min(90, Math.round((recommendation.urgencyScore || 30) * 1.1)),
    reason: enforceSoftLanguage(
      `Common successful next step: ${recommendation.topic}. Many learners with similar foundations succeed here.`,
      SAFE_TEMPLATES.manyLearners
    )
  };
}

module.exports = {
  adaptExplorationByDependencies
};
