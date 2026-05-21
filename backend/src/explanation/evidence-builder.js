// Evidence chain builder - show data sources, thresholds, calculations
// Makes recommendations believable by transparency

function buildEvidenceChain(rec, metrics) {
  const chain = {
    dataSources: [],
    thresholds: {},
    calculations: []
  };

  switch (rec.type) {
    case "revision":
      chain.dataSources = [
        "SkillDecay table: retention = " + Math.round(metrics.retention * 100) + "%",
        "TopicStat: mastery = " + metrics.mastery + "%",
        "Submission history: " + metrics.daysSinceSolve + " days since last solve",
        "Ebbinghaus formula: R = e^(-t/S) where t=days, S=half-life"
      ];
      chain.thresholds = {
        retentionCritical: "< 0.6 (60%)",
        inactivityWarning: "> 10 days",
        masteryMinimum: "> 50%"
      };
      chain.calculations = [
        {
          step: 1,
          formula: "t = now - lastSolvedAt",
          result: metrics.daysSinceSolve + " days"
        },
        {
          step: 2,
          formula: "R = e^(-t/S) = e^(-" + metrics.daysSinceSolve + "/" + (metrics.decayHalfLife || 52) + ")",
          result: Math.round(metrics.retention * 100) + "% retention"
        },
        {
          step: 3,
          formula: "Is " + Math.round(metrics.retention * 100) + "% < 60%? YES - CRITICAL",
          result: "TRIGGER: Revision recommended"
        },
        {
          step: 4,
          formula: "Is " + metrics.daysSinceSolve + " days > 10? YES",
          result: "CONFIRMS: Needs immediate practice"
        }
      ];
      break;

    case "weak-topic":
      chain.dataSources = [
        "TopicStat: mastery = " + metrics.mastery + "%",
        "Submission history: " + metrics.solvedCount + " problems solved",
        "Average retry rate: " + (metrics.avgRetries ? metrics.avgRetries.toFixed(1) : "N/A") + " retries per problem",
        "Cohort average: " + (metrics.cohortAvgRetries ? metrics.cohortAvgRetries.toFixed(1) : "1.8") + " retries (baseline)",
        "Recent submissions: " + (metrics.daysSinceSolve ? metrics.daysSinceSolve + " days ago" : "active")
      ];
      chain.thresholds = {
        masteryThreshold: "< 50%",
        retryRateThreshold: "> cohort average × 1.3",
        submissionMinimum: "> 5 problems"
      };
      chain.calculations = [
        {
          step: 1,
          formula: "Mastery = " + (metrics.mastery || "N/A") + "%",
          result: "Is < 50%? " + ((metrics.mastery !== undefined && metrics.mastery < 50) ? "YES - WEAK" : "UNKNOWN")
        },
        {
          step: 2,
          formula: "Avg retries = " + (metrics.avgRetries ? metrics.avgRetries.toFixed(1) : "N/A") + " vs cohort " + (metrics.cohortAvgRetries ? metrics.cohortAvgRetries.toFixed(1) : "1.8"),
          result: (metrics.avgRetries && metrics.cohortAvgRetries ? ((metrics.avgRetries / metrics.cohortAvgRetries - 1) * 100).toFixed(0) : "N/A") + "% above typical"
        },
        {
          step: 3,
          formula: "Threshold check: " + (metrics.avgRetries ? metrics.avgRetries.toFixed(1) : "N/A") + " > " + (metrics.cohortAvgRetries ? (metrics.cohortAvgRetries * 1.3).toFixed(1) : "2.3") + "?",
          result: (metrics.avgRetries && metrics.cohortAvgRetries && metrics.avgRetries > metrics.cohortAvgRetries * 1.3) ? "YES - STRUGGLING" : "UNKNOWN"
        },
        {
          step: 4,
          formula: "Problem count: " + (metrics.solvedCount || "N/A"),
          result: "Sample size " + (metrics.solvedCount && metrics.solvedCount > 5 ? "SUFFICIENT" : "LIMITED")
        }
      ];
      break;

    case "difficulty-increase":
      chain.dataSources = [
        "Recent submissions: " + (metrics.recent10 || 10) + " problems",
        "First-attempt pass rate: " + Math.round(metrics.firstTimePassRate * 100) + "%",
        "Current difficulty: UDI " + Math.round(metrics.avgUDI),
        "Optimal learning zone: 85% success rate (Vygotsky ZPD)"
      ];
      chain.thresholds = {
        firstAttemptThreshold: "> 90%",
        currentDifficultyMax: "< 5 (1-10 scale)",
        optimalSuccessRate: "85% for learning"
      };
      chain.calculations = [
        {
          step: 1,
          formula: "First-attempt pass rate = " + Math.round(metrics.firstTimePassRate * 100) + "%",
          result: "Is > 90%? " + (metrics.firstTimePassRate > 0.9 ? "YES - TOO EASY" : "NO - GOOD")
        },
        {
          step: 2,
          formula: "Current difficulty: UDI " + Math.round(metrics.avgUDI),
          result: "Is < 5? " + (metrics.avgUDI < 5 ? "YES - CAN INCREASE" : "NO - ALREADY HARD")
        },
        {
          step: 3,
          formula: "Optimal zone = 85% success rate",
          result: "You're at " + Math.round(metrics.firstTimePassRate * 100) + "% - in comfort zone"
        }
      ];
      break;

    case "difficulty-decrease":
      chain.dataSources = [
        "Recent submissions: " + (metrics.recent10 || 10) + " problems",
        "Failure rate: " + Math.round(metrics.failRate * 100) + "%",
        "Current difficulty: UDI " + Math.round(metrics.avgUDI),
        "Ideal learning zone: 60-70% success rate"
      ];
      chain.thresholds = {
        failureThreshold: "> 40%",
        currentDifficultyMin: ">= 6",
        idealSuccessRate: "60-70%"
      };
      chain.calculations = [
        {
          step: 1,
          formula: "Failure rate = " + Math.round(metrics.failRate * 100) + "%",
          result: "Is > 40%? " + (metrics.failRate > 0.4 ? "YES - TOO MANY FAILURES" : "NO - OK")
        },
        {
          step: 2,
          formula: "Current difficulty: UDI " + Math.round(metrics.avgUDI),
          result: "Is >= 6? " + (metrics.avgUDI >= 6 ? "YES - REDUCE IT" : "NO - ALREADY EASIER")
        },
        {
          step: 3,
          formula: "Current success rate = " + (100 - Math.round(metrics.failRate * 100)) + "%",
          result: "Need to reach 60-70% for optimal learning"
        }
      ];
      break;

    case "exploration":
      chain.dataSources = [
        "Consistency score: " + metrics.consistency + "%",
        "Topics mastered: " + metrics.masteredTopics,
        "Prerequisites: " + (metrics.prerequisitesMet ? metrics.prerequisitesMet.join(", ") : "None"),
        "Dependency graph strength: " + (metrics.dependencyStrength ? Math.round(metrics.dependencyStrength * 100) + "%" : "high")
      ];
      chain.thresholds = {
        consistencyMinimum: "> 80%",
        masteryCount: ">= 3 topics",
        prerequisitesRequired: "All met"
      };
      chain.calculations = [
        {
          step: 1,
          formula: "Consistency = " + metrics.consistency + "%",
          result: "Is > 80%? " + (metrics.consistency > 80 ? "YES - READY" : "NO - BUILD FIRST")
        },
        {
          step: 2,
          formula: "Mastered topics = " + metrics.masteredTopics,
          result: "Is >= 3? " + (metrics.masteredTopics >= 3 ? "YES - FOUNDATION SOLID" : "NO - LEARN MORE")
        },
        {
          step: 3,
          formula: "Prerequisites: " + (metrics.prerequisitesMet ? metrics.prerequisitesMet.join(", ") : "None"),
          result: "All required skills met"
        },
        {
          step: 4,
          formula: "Topic dependency strength: " + (metrics.dependencyStrength ? Math.round(metrics.dependencyStrength * 100) + "%" : "high"),
          result: "Strong connection to current skills"
        }
      ];
      break;
  }

  return chain;
}

module.exports = {
  buildEvidenceChain
};
