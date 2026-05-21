// Rule definitions for recommendations

const COHORT_AVG_RETRIES = 1.8; // TEMPORARY: Phase 3.8 will replace with real benchmarking

const RULES = {
  REVISION: {
    name: "RULE_REVISION",
    condition: (topic, decay, mastery) =>
      decay && decay.retentionScore < 0.6 &&
      topic.daysSinceSolve > 10 &&
      mastery > 50,
    urgencyScore: 85,
    impactScore: 90,
    reason: (topic, decay) =>
      `Retention dropped to ${Math.round(decay.retentionScore * 100)}%. Last solve: ${topic.daysSinceSolve} days ago.`,
    generate: (topic, decay) => ({
      type: "revision",
      topic: topic.topic,
      difficulty: undefined,
      urgencyScore: 85,
      impactScore: 90,
      metrics: {
        mastery: topic.masteryScore,
        retention: decay.retentionScore,
        daysSinceSolve: topic.daysSinceSolve,
        stability: topic.stability
      },
      sourceAlgorithm: "RULE_REVISION"
    })
  },

  WEAK_TOPIC: {
    name: "RULE_WEAK_TOPIC",
    condition: (topic, mastery, submissions) => {
      if (mastery >= 50 || submissions.length <= 5) return false;
      const avgRetries = submissions.reduce((sum, s) => sum + (s.retries || 0), 0) / submissions.length;
      return avgRetries > COHORT_AVG_RETRIES * 1.3;
    },
    urgencyScore: 70,
    impactScore: 75,
    reason: (topic, mastery, avgRetries) =>
      `Mastery only ${mastery}%. Retry rate ${Math.round((avgRetries / COHORT_AVG_RETRIES - 1) * 100)}% above typical.`,
    generate: (topic, mastery, topicSubmissions) => {
      const avgRetries = topicSubmissions.reduce((sum, s) => sum + (s.retries || 0), 0) / topicSubmissions.length;
      return {
        type: "weak-topic",
        topic: topic.topic,
        difficulty: undefined,
        urgencyScore: 70,
        impactScore: 75,
        metrics: {
          mastery: mastery,
          avgRetries: avgRetries,
          cohortAvgRetries: COHORT_AVG_RETRIES,
          solvedCount: topicSubmissions.length
        },
        sourceAlgorithm: "RULE_WEAK_TOPIC"
      };
    }
  },

  DIFFICULTY_INCREASE: {
    name: "RULE_DIFFICULTY_INCREASE",
    condition: (recent) =>
      recent.firstTimePassRate > 0.9 &&
      recent.avgUDI < 5,
    urgencyScore: 50,
    impactScore: 60,
    reason: () => "You've mastered this level. Time for harder challenges.",
    generate: (topic, recent) => ({
      type: "difficulty-increase",
      topic: topic.topic,
      difficulty: Math.min(10, Math.floor(recent.avgUDI) + 2),
      urgencyScore: 50,
      impactScore: 60,
      metrics: {
        mastery: topic.masteryScore,
        avgUDI: recent.avgUDI,
        firstTimePassRate: recent.firstTimePassRate
      },
      sourceAlgorithm: "RULE_DIFFICULTY_INCREASE"
    })
  },

  DIFFICULTY_DECREASE: {
    name: "RULE_DIFFICULTY_DECREASE",
    condition: (recent) =>
      recent.failRate > 0.4 &&
      recent.avgUDI >= 6,
    urgencyScore: 65,
    impactScore: 70,
    reason: (recent) =>
      `Recent attempts are ${Math.round(recent.failRate * 100)}% failures. Consider easier problems.`,
    generate: (topic, recent) => ({
      type: "difficulty-decrease",
      topic: topic.topic,
      difficulty: Math.max(1, Math.floor(recent.avgUDI) - 1),
      urgencyScore: 65,
      impactScore: 70,
      metrics: {
        mastery: topic.masteryScore,
        avgUDI: recent.avgUDI,
        failRate: recent.failRate
      },
      sourceAlgorithm: "RULE_DIFFICULTY_DECREASE"
    })
  },

  EXPLORATION: {
    name: "RULE_EXPLORATION",
    condition: (snapshot, topicStats) =>
      snapshot && snapshot.consistencyScore > 80 &&
      topicStats.length >= 3 &&
      topicStats.every(t => t.masteryScore >= 50),
    urgencyScore: 30,
    impactScore: 70,
    reason: () => "You're performing well. Explore new territory.",
    generate: (candidateTopic, masteredCount) => ({
      type: "exploration",
      topic: candidateTopic.topic,
      difficulty: candidateTopic.suggestedUDI || 4,
      urgencyScore: 30,
      impactScore: 70,
      metrics: {
        consistency: undefined, // Will be filled by detector
        masteredTopics: masteredCount,
        prerequisitesMet: candidateTopic.prerequisites || [],
        dependencyStrength: candidateTopic.strength || 0.8
      },
      sourceAlgorithm: "RULE_EXPLORATION"
    })
  }
};

module.exports = { RULES, COHORT_AVG_RETRIES };
