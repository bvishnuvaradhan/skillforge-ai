// Insight Type Registry
// Central mapping of all insight types to their enrichment logic
// Allows generic insight enrichment pipeline

module.exports = {
  // Recommendation insights (Step 2)
  recommendation: {
    label: "Recommendation",
    enricher: "enrichRecommendationWithExplanation", // From explainability.service
    signals: ["retention", "inactivity", "mastery", "performance"],
    hasLearning: true, // Tracked in RecommendationHistory
    confidenceCap: 95  // Can reach up to 95%
  },

  // Trend insights
  trend: {
    label: "Performance Trend",
    enricher: "enrichTrendInsight",
    signals: ["pass_rate_change", "consistency", "direction"],
    hasLearning: false, // Future: track if trend predictions came true
    confidenceCap: 85
  },

  // Skill connection insights
  skill_connection: {
    label: "Skill Connection",
    enricher: "enrichSkillConnectionInsight",
    signals: ["prerequisite_strength", "topic_overlap", "dependency"],
    hasLearning: false,
    confidenceCap: 80
  },

  // Frequency pattern insights
  frequency_pattern: {
    label: "Practice Frequency",
    enricher: "enrichFrequencyInsight",
    signals: ["practice_gap", "frequency_trend", "recent_activity"],
    hasLearning: false,
    confidenceCap: 75
  },

  // Mastery drop alerts
  mastery_drop: {
    label: "Mastery Alert",
    enricher: "enrichMasteryDropInsight",
    signals: ["retention_critical", "mastery_threshold", "recency"],
    hasLearning: false,
    confidenceCap: 90
  },

  // Growth streak insights
  growth_streak: {
    label: "Growth Streak",
    enricher: "enrichGrowthStreakInsight",
    signals: ["mastery_improvement", "submission_count", "consistency"],
    hasLearning: false,
    confidenceCap: 85
  },

  // Learner DNA profile
  dna_profile: {
    label: "Learning Profile",
    enricher: "enrichDNAProfileInsight",
    signals: ["consistency_score", "submission_pattern", "difficulty_progression"],
    hasLearning: false,
    confidenceCap: 85  // DNA is probabilistic, never exceeds 85%
  }
};
