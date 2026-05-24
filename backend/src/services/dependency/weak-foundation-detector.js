const TopicDependencyModel = require("../../models/TopicDependency");
const WeakFoundationsModel = require("../../models/WeakFoundations");
const { TopicStatModel } = require("../../models/TopicStat");
const {
  BANNED_WORDS,
  enforceSoftLanguage,
  containsBannedWords,
  SAFE_TEMPLATES
} = require("./language-governance");

function containsBannedLanguage(text) {
  return containsBannedWords(text);
}

function buildSafeMessage(prerequisite, prerequisiteMastery, advancedTopic, targetMastery) {
  const raw = `Optional reinforcement: improving ${prerequisite} (${Math.round(prerequisiteMastery)}% to ~${Math.max(Math.round(prerequisiteMastery + 10), Math.round(targetMastery - 5))}%) may deepen ${advancedTopic} retention.`;
  return enforceSoftLanguage(raw, SAFE_TEMPLATES.optionalPrep);
}

async function detectWeakFoundations(userId, options = {}) {
  console.log(`[FOUNDATION] Evaluating reinforcement opportunities for user=${userId}`);
  const threshold = options.gapThreshold ?? 15;

  const dependencies = await TopicDependencyModel.find({});
  const issues = [];

  for (const dep of dependencies) {
    const advancedStat = await TopicStatModel.findOne({ user: userId, topic: dep.topic });
    const advancedMastery = advancedStat?.masteryScore || 0;

    for (const prereq of dep.prerequisites || []) {
      const prereqStat = await TopicStatModel.findOne({ user: userId, topic: prereq.topic });
      const prereqMastery = prereqStat?.masteryScore || 0;
      const gap = advancedMastery - prereqMastery;

      if (gap <= threshold) continue;

      const explanation = buildSafeMessage(prereq.topic, prereqMastery, dep.topic, advancedMastery);
      const recommendation = enforceSoftLanguage(
        `Many learners benefit from optional reinforcement in ${prereq.topic} before pushing further in ${dep.topic}.`,
        SAFE_TEMPLATES.manyLearners
      );

      issues.push({
        advancedTopic: dep.topic,
        prerequisite: prereq.topic,
        advancedMastery,
        prerequisiteMastery: prereqMastery,
        gap,
        severity: gap >= 35 ? 5 : gap >= 25 ? 4 : gap >= 20 ? 3 : 2,
        explanation,
        recommendation,
        detectedAt: new Date(),
        shouldAlert: gap >= 20
      });
    }
  }

  const allMessages = issues.map((i) => `${i.explanation} ${i.recommendation}`).join(" ");
  const allMessagesHaveSoftLanguage = !containsBannedLanguage(allMessages);

  const summary = {
    user: userId,
    issues,
    totalIssues: issues.length,
    highSeverityCount: issues.filter((i) => i.severity >= 4).length,
    mediumSeverityCount: issues.filter((i) => i.severity === 3).length,
    lowSeverityCount: issues.filter((i) => i.severity <= 2).length,
    allMessagesHaveSoftLanguage,
    sentimentAudit: allMessagesHaveSoftLanguage
      ? "Soft language check passed"
      : "Potentially harmful language detected",
    lastEvaluated: new Date()
  };

  await WeakFoundationsModel.findOneAndUpdate(
    { user: userId },
    summary,
    { upsert: true, new: true }
  );

  console.log(`[FOUNDATION] issues=${issues.length}, high=${summary.highSeverityCount}`);

  return summary;
}

module.exports = {
  detectWeakFoundations,
  containsBannedLanguage
};
