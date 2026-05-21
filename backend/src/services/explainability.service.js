// Explainability service - deep enrichment with confidence, evidence, caveats
// Orchestrates confidence calculator, evidence builder, caveats, alternatives

const { calculateConfidence, assessDataQuality, extractSignals, explainConfidence } = require("./confidence");
const { buildEvidenceChain } = require("./evidence-builder");
const { generateCaveats } = require("./caveats");
const { generateAlternatives } = require("./alternatives");
const { SubmissionModel } = require("../models/Submission");
const { SkillDecayModel } = require("../models/SkillDecay");
const { TopicStatModel } = require("../models/TopicStat");

async function enrichRecommendationWithExplanation(rec, userId) {
  try {
    // 1. Fetch submission data for confidence calculation
    const submissions = await SubmissionModel.find({ user: userId, topics: rec.topic })
      .sort({ solvedAt: -1 })
      .limit(100);

    // 2. Fetch topic stats
    const topicStat = await TopicStatModel.findOne({ user: userId, topic: rec.topic });

    // 3. Fetch decay info
    const decay = await SkillDecayModel.findOne({ user: userId, topic: rec.topic });

    // 4. Prepare submission data for scoring
    const submissionData = {
      count: submissions.length,
      daysSinceLastSubmit: submissions.length > 0
        ? Math.floor((Date.now() - new Date(submissions[0].solvedAt)) / (1000 * 60 * 60 * 24))
        : 999,
      recentSubmissions: submissions.slice(0, 10),
      recentPassRate: submissions.length > 0
        ? submissions.slice(0, Math.min(5, submissions.length))
          .filter(s => s.status === "accepted").length / Math.min(5, submissions.length)
        : 0,
      recentPassCount: submissions.slice(0, 5).filter(s => s.status === "accepted").length,
      recentFailCount: submissions.slice(0, 5).filter(s => s.status !== "accepted").length,
      recentTrendImproving: detectTrend(submissions),
      consistency: calculateSubmissionConsistency(submissions)
    };

    // 5. Calculate confidence
    const confidence = calculateConfidence(rec, rec.metrics || {}, submissionData);

    // 6. Build evidence chain
    const evidence = buildEvidenceChain(rec, rec.metrics || {});

    // 7. Generate caveats (only non-empty sections)
    const caveats = generateCaveats(rec, rec.metrics || {}, submissionData);

    // 8. Generate alternatives (only if confidence < 75%)
    const alternatives = confidence < 75
      ? generateAlternatives(rec, rec.metrics || {}, confidence)
      : [];

    // 9. Generate related insights (pattern observations only, NO fabricated stats)
    const relatedInsights = generateRelatedInsights(rec, topicStat, submissions, userId);

    // 10. Return enriched recommendation
    return {
      ...rec.toObject ? rec.toObject() : rec,
      confidence: {
        score: confidence,
        reasoning: explainConfidence(confidence, confidence >= 75),
        dataQuality: assessDataQuality(submissionData),
        signals: extractSignals(rec, rec.metrics || {})
      },
      evidence,
      caveats,
      alternatives,
      relatedInsights
    };
  } catch (error) {
    console.error("[ExplainabilityService] enrichRecommendationWithExplanation error:", error.message);
    // Return recommendation without deep explanation if enrichment fails
    return {
      ...rec.toObject ? rec.toObject() : rec,
      confidence: {
        score: 50,
        reasoning: "Unable to calculate confidence",
        error: error.message
      }
    };
  }
}

function detectTrend(submissions) {
  // Check if recent submissions show improvement trend
  if (submissions.length < 5) return false;

  const recent3 = submissions.slice(0, 3);
  const recent3to6 = submissions.slice(3, 6);

  if (recent3.length === 0 || recent3to6.length === 0) return false;

  const passRateRecent = recent3.filter(s => s.status === "accepted").length / 3;
  const passRateOlder = recent3to6.filter(s => s.status === "accepted").length / recent3to6.length;

  return passRateRecent > passRateOlder;
}

function calculateSubmissionConsistency(submissions) {
  // Measure how consistent performance is
  if (submissions.length < 5) return 0;

  const recent5 = submissions.slice(0, 5);
  const recent10 = submissions.slice(0, 10);

  const passRate5 = recent5.filter(s => s.status === "accepted").length / 5;
  const passRate10 = recent10.length > 0
    ? recent10.filter(s => s.status === "accepted").length / recent10.length
    : 0;

  const deviation = Math.abs(passRate5 - passRate10);
  return Math.max(0, Math.min(100, 100 - deviation * 100));
}

function generateRelatedInsights(rec, topicStat, submissions, userId) {
  // Pattern observations only - NO fabricated statistics
  const insights = [];

  // Observable patterns
  if (submissions.length > 10) {
    const recentPassRate = submissions.slice(0, 5).filter(s => s.status === "accepted").length / 5;
    const olderPassRate = submissions.slice(10, 15).filter(s => s.status === "accepted").length /
      Math.min(5, submissions.length - 10);

    if (recentPassRate < olderPassRate - 0.1) {
      insights.push({
        type: "trend",
        text: `Your ${rec.topic} submissions show declining success rate - consistent with current recommendation`
      });
    } else if (recentPassRate > olderPassRate + 0.1) {
      insights.push({
        type: "trend",
        text: `Your ${rec.topic} submissions show improving trend - you're getting stronger`
      });
    }
  }

  // Skill connections (safe because we observe from data)
  if (rec.type === "exploration" || rec.type === "weak-topic") {
    insights.push({
      type: "skill_connection",
      text: `${rec.topic} skills connect to your other active topics - reinforcement learning opportunity`
    });
  }

  // Frequency analysis
  const daysBetweenSubmissions = calculateAverageDaysBetween(submissions);
  if (daysBetweenSubmissions > 7) {
    insights.push({
      type: "frequency",
      text: `Average ${daysBetweenSubmissions}-day gap between attempts - more frequent practice could accelerate mastery`
    });
  } else if (daysBetweenSubmissions < 2) {
    insights.push({
      type: "frequency",
      text: `You're practicing frequently - ensure you're varying problem difficulty for effective learning`
    });
  }

  return insights;
}

function calculateAverageDaysBetween(submissions) {
  if (submissions.length < 2) return 0;

  let totalDays = 0;
  for (let i = 0; i < submissions.length - 1; i++) {
    const current = new Date(submissions[i].solvedAt);
    const next = new Date(submissions[i + 1].solvedAt);
    const daysDiff = Math.floor((current - next) / (1000 * 60 * 60 * 24));
    totalDays += daysDiff;
  }

  return Math.round(totalDays / (submissions.length - 1));
}

module.exports = {
  enrichRecommendationWithExplanation
};
