// Prerequisite Validator Service
// Checks if user is ready to learn a topic
// CRITICAL SAFEGUARD: All prerequisites are soft recommendations

const TopicDependencyModel = require("../../models/TopicDependency");
const PrerequisiteValidationModel = require("../../models/PrerequisiteValidation");
const { TopicStatModel } = require("../../models/TopicStat");
const { SAFE_TEMPLATES, enforceSoftLanguage } = require("./language-governance");

const READINESS_BANDS = {
  NOT_READY_MAX: 50,
  DEVELOPING_MAX: 75,
  READY_MAX: 90
};

function scoreToBand(score) {
  if (score < READINESS_BANDS.NOT_READY_MAX) return "NOT_READY";
  if (score < READINESS_BANDS.DEVELOPING_MAX) return "DEVELOPING";
  if (score < READINESS_BANDS.READY_MAX) return "READY";
  return "MASTERED";
}

async function validatePrerequisites(userId, targetTopic) {
  try {
    console.log(`[READINESS] validating user=${userId} topic=${targetTopic}`);

    // 1. Fetch target topic dependencies
    const topicDeps = await TopicDependencyModel.findOne({ topic: targetTopic });
    if (!topicDeps) {
      console.log(`[Dependency] No dependencies found for ${targetTopic}`);
      return {
        allMet: true,
        readinessBand: "MASTERED",
        internalReadinessScore: 100,
        readinessConfidence: 60,
        prerequisites: [],
        weakFoundations: [],
        caveat: SAFE_TEMPLATES.uncertainty
      };
    }

    // 2. Evaluate each prerequisite
    const prerequisites = [];
    for (const prereq of topicDeps.prerequisites || []) {
      const userMastery = await getUserMastery(userId, prereq.topic);
      const isMet = userMastery >= prereq.minMasteryRequired;

      prerequisites.push({
        topic: prereq.topic,
        required: prereq.dependencyType === "foundational",
        userMastery: userMastery || 0,
        requiredMastery: prereq.minMasteryRequired,
        isMet: isMet,
        confidence: prereq.confidence,
        recommendation: isMet ? "ready" :
                        userMastery >= prereq.minMasteryRequired - 10 ? "almost_ready" :
                        "needs_work"
      });
    }

    // 3. Calculate overall readiness
    const weighted = prerequisites.map((p) => {
      const normalized = p.requiredMastery > 0 ? Math.min(1, p.userMastery / p.requiredMastery) : 1;
      return Math.round(normalized * 100);
    });
    const internalReadinessScore = weighted.length
      ? Math.round(weighted.reduce((sum, v) => sum + v, 0) / weighted.length)
      : 100;
    const readinessBand = scoreToBand(internalReadinessScore);

    const allMet = prerequisites.every(p => p.isMet);
    const lowDataPenalty = prerequisites.length < 2 ? 10 : 0;
    const readinessConfidence = Math.max(45, Math.min(95, 85 - lowDataPenalty));
    const explorationReadiness = allMet || readinessBand === "DEVELOPING";

    // 4. Detect weak foundations
    const weakFoundations = [];
    if (topicDeps.prerequisites && topicDeps.prerequisites.length > 0) {
      const targetMastery = await getUserMastery(userId, targetTopic);
      for (const prereq of topicDeps.prerequisites) {
        const prereqMastery = await getUserMastery(userId, prereq.topic);
        if (targetMastery > prereqMastery + 15) {
          // CRITICAL SAFEGUARD: Soft language only
          weakFoundations.push({
            advancedTopic: targetTopic,
            prerequisite: prereq.topic,
            advancedMastery: targetMastery || 0,
            prerequisiteMastery: prereqMastery || 0,
            gap: (targetMastery || 0) - (prereqMastery || 0),
            explanation: `Strengthening ${prereq.topic} may deepen ${targetTopic} understanding`
          });
        }
      }
    }

    // 5. Estimate time to readiness
    const notMetPrereqs = prerequisites.filter(p => !p.isMet);
    let estimatedDaysToReadiness = 0;
    if (notMetPrereqs.length > 0) {
      // Rough estimate: each prerequisite at 0 mastery = 14 days per 20% gap
      estimatedDaysToReadiness = notMetPrereqs.reduce((sum, p) => {
        const gap = p.requiredMastery - (p.userMastery || 0);
        return sum + Math.ceil((gap / 20) * 14);
      }, 0);
    }

    // 6. Store validation
    await PrerequisiteValidationModel.findOneAndUpdate(
      { user: userId, topic: targetTopic },
      {
        prerequisites,
        readinessScore: internalReadinessScore,
        readinessBand,
        readinessConfidence,
        allPrerequisitesMet: allMet,
        strongestPrerequisite: prerequisites.length > 0 ?
          prerequisites.reduce((max, p) => p.userMastery > max.userMastery ? p : max).topic :
          null,
        weakestPrerequisite: prerequisites.length > 0 ?
          prerequisites.reduce((min, p) => (p.userMastery || 0) < (min.userMastery || 0) ? p : min).topic :
          null,
        suggestedPreparation: notMetPrereqs.map(p => p.topic),
        estimatedDaysToReadiness,
        weakFoundationDetected: weakFoundations.length > 0,
        lastEvaluated: new Date(),
        evaluationReason: "On-demand prerequisite check"
      },
      { upsert: true, new: true }
    );

    console.log(`[READINESS] band=${readinessBand}, score=${internalReadinessScore}, met=${allMet}`);

    return {
      allMet,
      readinessBand,
      internalReadinessScore,
      readinessConfidence,
      prerequisites,
      weakFoundations,
      explorationReadiness,
      estimatedDaysToReadiness,
      caveat: SAFE_TEMPLATES.uncertainty,
      shortMessage: allMet ?
        enforceSoftLanguage(SAFE_TEMPLATES.manyLearners, SAFE_TEMPLATES.manyLearners) :
        enforceSoftLanguage(SAFE_TEMPLATES.optionalPrep, SAFE_TEMPLATES.optionalPrep)
    };
  } catch (error) {
    console.error(`[READINESS] validation error:`, error);
    // SAFE FALLBACK: Don't block learning
    return {
      allMet: true,
      readinessBand: "DEVELOPING",
      internalReadinessScore: 50,
      prerequisites: [],
      error: true,
      shortMessage: "Unable to validate prerequisites (fallback: allowing)"
    };
  }
}

// Helper: Get user's mastery for a topic
async function getUserMastery(userId, topic) {
  const topicStat = await TopicStatModel.findOne({ user: userId, topic });
  return topicStat?.masteryScore || 0;
}

module.exports = {
  validatePrerequisites,
  getUserMastery,
  scoreToBand
};
