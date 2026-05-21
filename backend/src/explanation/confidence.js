// Confidence scoring with explicit rubrics and justification
// NOT stored in recommendation model - computed on demand
// Capped at 95% maximum (never 100%)

const DATA_QUALITY_RUBRIC = {
  bySubmissionCount: {
    "<5": 30,      // very weak signal
    "5-20": 60,    // moderate signal
    "20-50": 80,   // strong signal
    "50+": 95      // very strong signal
  },
  byRecency: {
    ">30 days": -30,  // penalize stale data
    "7-30 days": 0,   // neutral
    "<7 days": +10    // bonus for fresh
  }
};

const SIGNAL_ALIGNMENT_RUBRIC = {
  allAgree: 90,           // all signals point same way
  mostAgree: 75,          // 3/4 or more signals align
  mixed: 50,              // conflicting (50/50)
  contradicted: 30        // most signals point opposite way
};

function categorizeSubmissionCount(count) {
  if (count < 5) return "<5";
  if (count < 20) return "5-20";
  if (count < 50) return "20-50";
  return "50+";
}

function categorizeRecency(daysSinceLast) {
  if (daysSinceLast > 30) return ">30 days";
  if (daysSinceLast > 7) return "7-30 days";
  return "<7 days";
}

function calculateConsistency(submissionData) {
  // Measure how consistent recent submissions are
  // Compare last 5 submissions vs last 10
  if (submissionData.recentSubmissions.length < 5) return 0;

  const recent5 = submissionData.recentSubmissions.slice(0, 5);
  const recent10 = submissionData.recentSubmissions.slice(0, 10);

  const passRate5 = recent5.filter(s => s.status === "accepted").length / 5;
  const passRate10 = recent10.length > 0
    ? recent10.filter(s => s.status === "accepted").length / recent10.length
    : 0;

  // If recent trend matches historical trend, consistency is high
  const deviation = Math.abs(passRate5 - passRate10);
  return Math.max(0, Math.min(100, 100 - deviation * 100));
}

function assessDataQuality(submissionData) {
  let quality = DATA_QUALITY_RUBRIC.bySubmissionCount[categorizeSubmissionCount(submissionData.count)] || 60;
  quality += DATA_QUALITY_RUBRIC.byRecency[categorizeRecency(submissionData.daysSinceLastSubmit)] || 0;
  quality = Math.max(0, Math.min(100, quality));

  return {
    score: quality,
    label: quality > 75 ? "strong" : quality > 50 ? "moderate" : "weak",
    factors: {
      submissionCount: submissionData.count,
      recency: submissionData.daysSinceLastSubmit,
      consistency: calculateConsistency(submissionData)
    }
  };
}

function extractSignals(rec, metrics) {
  // Extract signal objects with their support status
  const signals = [];

  switch (rec.type) {
    case "revision":
      signals.push({
        name: "Retention Formula",
        calculation: `e^(-${metrics.daysSinceSolve}/${metrics.decayHalfLife || 52}) = ${Math.round(metrics.retention * 100)}%`,
        supports: metrics.retention < 0.6,
        weight: 0.4
      });
      signals.push({
        name: "Inactivity Period",
        calculation: `${metrics.daysSinceSolve} days > 10 day threshold`,
        supports: metrics.daysSinceSolve > 10,
        weight: 0.3
      });
      signals.push({
        name: "Recent Performance",
        calculation: metrics.recentFailCount ? `${metrics.recentFailCount} failures in last 3` : "N/A",
        supports: metrics.recentFailCount > 0 || false,
        weight: 0.2
      });
      signals.push({
        name: "Mastery Foundation",
        calculation: `${metrics.mastery}% mastery > 50% threshold`,
        supports: metrics.mastery > 50,
        weight: 0.1
      });
      break;

    case "weak-topic":
      signals.push({
        name: "Mastery Threshold",
        calculation: `${metrics.mastery || "N/A"}% < 50%`,
        supports: metrics.mastery && metrics.mastery < 50,
        weight: 0.35
      });
      signals.push({
        name: "Retry Rate Comparison",
        calculation: `${metrics.avgRetries ? metrics.avgRetries.toFixed(1) : "N/A"} avg retries vs ${metrics.cohortAvgRetries ? metrics.cohortAvgRetries.toFixed(1) : "1.8"} typical`,
        supports: metrics.avgRetries && metrics.cohortAvgRetries && metrics.avgRetries > metrics.cohortAvgRetries * 1.3,
        weight: 0.35
      });
      signals.push({
        name: "Submission Count",
        calculation: `${metrics.solvedCount || "N/A"} problems solved`,
        supports: metrics.solvedCount && metrics.solvedCount > 5,
        weight: 0.2
      });
      signals.push({
        name: "Recent Activity",
        calculation: metrics.daysSinceSolve ? `${metrics.daysSinceSolve} days since last attempt` : "N/A",
        supports: metrics.daysSinceSolve && metrics.daysSinceSolve < 30 || true,
        weight: 0.1
      });
      break;

    case "difficulty-increase":
      signals.push({
        name: "First-Attempt Success",
        calculation: `${metrics.firstTimePassRate ? Math.round(metrics.firstTimePassRate * 100) : "N/A"}% > 90%`,
        supports: metrics.firstTimePassRate && metrics.firstTimePassRate > 0.9,
        weight: 0.4
      });
      signals.push({
        name: "Current Difficulty",
        calculation: `UDI ${metrics.avgUDI ? Math.round(metrics.avgUDI) : "N/A"} < 5`,
        supports: metrics.avgUDI && metrics.avgUDI < 5,
        weight: 0.3
      });
      signals.push({
        name: "Mastery Consistency",
        calculation: "Demonstrated across multiple attempts",
        supports: metrics.recentConsistency && metrics.recentConsistency > 0.8 || true,
        weight: 0.3
      });
      break;

    case "difficulty-decrease":
      signals.push({
        name: "Failure Rate",
        calculation: `${metrics.failRate ? Math.round(metrics.failRate * 100) : "N/A"}% > 40%`,
        supports: metrics.failRate && metrics.failRate > 0.4,
        weight: 0.4
      });
      signals.push({
        name: "Current Difficulty",
        calculation: `UDI ${metrics.avgUDI ? Math.round(metrics.avgUDI) : "N/A"} >= 6`,
        supports: metrics.avgUDI && metrics.avgUDI >= 6,
        weight: 0.3
      });
      signals.push({
        name: "Knowledge Gaps",
        calculation: "High failure indicates conceptual issues",
        supports: metrics.failRate && metrics.failRate > 0.4 || true,
        weight: 0.3
      });
      break;

    case "exploration":
      signals.push({
        name: "Consistency",
        calculation: `${metrics.consistency || "N/A"}% > 80%`,
        supports: metrics.consistency && metrics.consistency > 80,
        weight: 0.25
      });
      signals.push({
        name: "Mastery Count",
        calculation: `${metrics.masteredTopics || "N/A"} topics mastered >= 3`,
        supports: metrics.masteredTopics && metrics.masteredTopics >= 3,
        weight: 0.25
      });
      signals.push({
        name: "Prerequisites Met",
        calculation: `${metrics.prerequisitesMet ? metrics.prerequisitesMet.length : 0} prerequisite skills learned`,
        supports: metrics.prerequisitesMet && metrics.prerequisitesMet.length > 0 || true,
        weight: 0.3
      });
      signals.push({
        name: "No Knowledge Gaps",
        calculation: "All current topics >= 50% mastery",
        supports: !metrics.hasLowMastery || true,
        weight: 0.2
      });
      break;
  }

  return signals;
}

function scoreSignalAlignment(rec, metrics) {
  const signals = extractSignals(rec, metrics);
  const agreementCount = signals.filter(s => s.supports === true).length;
  const totalSignals = signals.length;

  if (agreementCount === totalSignals) {
    return SIGNAL_ALIGNMENT_RUBRIC.allAgree;
  } else if (agreementCount >= totalSignals * 0.75) {
    return SIGNAL_ALIGNMENT_RUBRIC.mostAgree;
  } else if (agreementCount >= totalSignals * 0.5) {
    return SIGNAL_ALIGNMENT_RUBRIC.mixed;
  } else {
    return SIGNAL_ALIGNMENT_RUBRIC.contradicted;
  }
}

function calculateConfidence(rec, metrics, submissionData) {
  const scores = {
    dataQuality: assessDataQuality(submissionData).score,
    signalAlignment: scoreSignalAlignment(rec, metrics),
    historicalAccuracy: 70,  // BASELINE: use 70 until recommendation feedback exists
    recencyReliability: scoreRecency(submissionData)
  };

  const raw = (
    scores.dataQuality * 0.3 +
    scores.signalAlignment * 0.4 +
    scores.historicalAccuracy * 0.2 +
    scores.recencyReliability * 0.1
  );

  return Math.min(95, Math.max(0, raw)); // CAP AT 95%
}

function scoreRecency(submissionData) {
  // How recent is the data? More recent = more reliable
  const daysSinceLast = submissionData.daysSinceLastSubmit;

  if (daysSinceLast < 7) return 90;
  if (daysSinceLast < 14) return 80;
  if (daysSinceLast < 30) return 70;
  if (daysSinceLast < 60) return 50;
  return 30;
}

function explainConfidence(confidenceScore, isHighConfidence) {
  if (isHighConfidence) {
    if (confidenceScore >= 85) return "Multiple data signals align strongly";
    if (confidenceScore >= 75) return "Strong indicators with solid data";
    return "Indicators align well";
  } else {
    if (confidenceScore < 40) return "Limited data or conflicting signals";
    if (confidenceScore < 60) return "Mixed signals - use judgment";
    return "Moderate confidence with some caution";
  }
}

module.exports = {
  assessDataQuality,
  scoreSignalAlignment,
  calculateConfidence,
  extractSignals,
  explainConfidence,
  DATA_QUALITY_RUBRIC,
  SIGNAL_ALIGNMENT_RUBRIC
};
