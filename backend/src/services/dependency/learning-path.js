const TopicDependencyModel = require("../../models/TopicDependency");
const { TopicStatModel } = require("../../models/TopicStat");
const LearningPathSnapshotModel = require("../../models/LearningPathSnapshot");
const DependencyHistoryModel = require("../../models/DependencyHistory");

function estimateDaysRange(currentMastery, targetMastery) {
  const gap = Math.max(0, targetMastery - currentMastery);
  const base = Math.max(4, Math.round((gap / 10) * 4));
  return `${base}\u00b1${Math.max(2, Math.round(base * 0.4))}`;
}

async function suggestLearningPath(userId, targetTopic) {
  console.log(`[LEARNING_PATH] generating user=${userId} target=${targetTopic}`);
  const [allDeps, stats] = await Promise.all([
    TopicDependencyModel.find({}),
    TopicStatModel.find({ user: userId })
  ]);

  const byTopic = new Map(allDeps.map((d) => [d.topic, d]));
  const mastery = new Map(stats.map((s) => [s.topic, s.masteryScore || 0]));

  if (!byTopic.has(targetTopic)) {
    return {
      commonPath: [],
      estimatedDays: "Unknown",
      confidence: 40,
      disclaimer: "This is a probabilistic estimate, actual time varies widely"
    };
  }

  const visited = new Set();
  const ordered = [];

  function visit(topic) {
    if (visited.has(topic)) return;
    visited.add(topic);
    const node = byTopic.get(topic);
    for (const prereq of node?.prerequisites || []) {
      visit(prereq.topic);
    }
    ordered.push(topic);
  }

  visit(targetTopic);

  const commonPath = ordered.map((topic) => {
    const node = byTopic.get(topic);
    const currentMastery = mastery.get(topic) || 0;
    const targetMastery = node?.isAdvanced ? 75 : 65;

    return {
      topic,
      currentMastery,
      targetMastery,
      estimatedDays: estimateDaysRange(currentMastery, targetMastery),
      isComplete: currentMastery >= targetMastery
    };
  });

  const incomplete = commonPath.filter((step) => !step.isComplete);
  const baseDays = incomplete.reduce((sum, step) => {
    const [avg] = String(step.estimatedDays).split("\u00b1");
    return sum + Number(avg || 0);
  }, 0);

  const response = {
    commonPath,
    estimatedDays: `${Math.max(7, baseDays)}\u00b1${Math.max(4, Math.round(baseDays * 0.35))}`,
    confidence: Math.min(90, Math.max(50, Math.round(85 - incomplete.length * 4))),
    disclaimer: "This is a probabilistic estimate, actual time varies widely"
  };

  const history = await DependencyHistoryModel.findOne({ user: userId });
  const alternativePaths = (history?.alternativePathsTaken || []).slice(0, 3).map((p) => ({
    topics: p.path,
    successRate: p.successRate || 0,
    frequency: 0,
    confidence: Math.min(0.9, Math.max(0.4, (p.successRate || 0) / 100))
  }));

  await LearningPathSnapshotModel.create({
    user: userId,
    targetTopic,
    commonPath,
    alternativePaths,
    estimate: {
      estimatedDaysRange: response.estimatedDays,
      confidence: response.confidence,
      sampleSize: history?.totalMasteredTopics || 0,
      disclaimer: response.disclaimer
    },
    metadata: {
      recalculatedAt: new Date(),
      uncertaintyNotes: "Range-based estimate with uncertainty bounds"
    }
  });

  return {
    ...response,
    alternativePaths,
    recalculatedAt: new Date()
  };
}

module.exports = {
  suggestLearningPath,
  estimateDaysRange
};
