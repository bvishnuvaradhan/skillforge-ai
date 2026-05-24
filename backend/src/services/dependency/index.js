const { validatePrerequisites } = require("./prerequisite-validator");
const { propagateMasteryGain } = require("./mastery-propagation");
const { suggestNextTopics } = require("./smart-exploration");
const { detectWeakFoundations } = require("./weak-foundation-detector");
const {
  initializeDependencyGraph,
  getRoleGraph,
  getGraphSnapshot,
  rollbackGraphVersion
} = require("./graph-builder");
const { suggestLearningPath } = require("./learning-path");
const TopicDependencyModel = require("../../models/TopicDependency");
const { TopicStatModel } = require("../../models/TopicStat");
const DependencyHistoryModel = require("../../models/DependencyHistory");
const { SubmissionModel } = require("../../models/Submission");

function getCommonOrder(topics) {
  return topics
    .sort((a, b) => (a.suggestedPosition || 999) - (b.suggestedPosition || 999))
    .map((t) => t.topic);
}

function computeOrderDeviation(commonOrder, actualOrder) {
  if (!commonOrder.length || !actualOrder.length) return 0;
  const commonIdx = new Map(commonOrder.map((topic, idx) => [topic, idx]));
  let inversions = 0;
  let comparisons = 0;

  for (let i = 0; i < actualOrder.length; i += 1) {
    for (let j = i + 1; j < actualOrder.length; j += 1) {
      const ai = commonIdx.get(actualOrder[i]);
      const aj = commonIdx.get(actualOrder[j]);
      if (ai === undefined || aj === undefined) continue;
      comparisons += 1;
      if (ai > aj) inversions += 1;
    }
  }

  return comparisons ? inversions / comparisons : 0;
}

async function computeDependencies(userId) {
  console.log(`[DEPENDENCY] computeDependencies user=${userId}`);
  const topics = await TopicDependencyModel.find({}).select("topic prerequisites");
  const validations = [];

  for (const dep of topics) {
    const validation = await validatePrerequisites(userId, dep.topic);
    validations.push({ topic: dep.topic, ...validation });
  }

  const weakFoundations = await detectWeakFoundations(userId);

  const submissions = await SubmissionModel.find({ user: userId }).sort({ solvedAt: 1 }).select("topics solvedAt");
  const actualOrder = submissions
    .flatMap((s) => s.topics || [])
    .filter((t, i, arr) => t && arr.indexOf(t) === i);
  const allTopics = await TopicDependencyModel.find({}).select("topic suggestedPosition");
  const commonOrder = getCommonOrder(allTopics);
  const orderDeviation = computeOrderDeviation(commonOrder, actualOrder);

  const skips = [];
  const topicSet = new Set(actualOrder);
  for (const dep of allTopics) {
    const full = await TopicDependencyModel.findOne({ topic: dep.topic });
    if (!topicSet.has(dep.topic)) continue;
    const unmet = (full?.prerequisites || []).filter((p) => !topicSet.has(p.topic));
    if (unmet.length) {
      console.log(`[ALTERNATIVE_PATH] detected deviation topic=${dep.topic} unmet=${unmet.map((u) => u.topic).join(",")}`);
      skips.push({
        path: [dep.topic, ...unmet.map((u) => u.topic)],
        startDate: new Date(),
        completionDate: new Date(),
        successRate: 60,
        deviatedFromCommon: true,
        successDespiteDeviation: true
      });
    }
  }

  await DependencyHistoryModel.findOneAndUpdate(
    { user: userId },
    {
      user: userId,
      optimalOrder: commonOrder,
      actualOrder,
      orderDeviation,
      totalAlternativePaths: skips.length,
      alternativePathSuccessRate: skips.length ? 0.6 : 0,
      alternativePathsTaken: skips,
      analysisPerformed: new Date(),
      lastUpdated: new Date(),
      totalMasteredTopics: (await TopicStatModel.countDocuments({ user: userId, masteryScore: { $gte: 70 } })) || 0
    },
    { upsert: true, new: true }
  );

  return {
    validations,
    weakFoundations,
    summary: {
      topicsEvaluated: validations.length,
      weakFoundationIssues: weakFoundations.totalIssues || 0,
      alternativePathsTracked: skips.length
    }
  };
}

async function suggestSmartExploration(userId, options = {}) {
  return suggestNextTopics(userId, options);
}

async function onMasteryImprovement(userId, topic, previousMastery, newMastery) {
  const propagation = await propagateMasteryGain(userId, topic, previousMastery, newMastery);
  const weakFoundations = await detectWeakFoundations(userId);

  return {
    propagation,
    weakFoundations,
    triggeredAt: new Date()
  };
}

module.exports = {
  computeDependencies,
  suggestSmartExploration,
  onMasteryImprovement,
  validatePrerequisites,
  detectWeakFoundations,
  initializeDependencyGraph,
  getRoleGraph,
  getGraphSnapshot,
  rollbackGraphVersion,
  suggestLearningPath
};
