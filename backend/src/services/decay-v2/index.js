// Decay v2 Orchestrator
// Main service coordinating all decay v2 operations
// Integrates extraction, curve fitting, forecasting, alerting, and adaptation

const { extractDecayHistory, archiveObservations } = require("./history-extractor");
const { estimateHalfLife } = require("./halflife-estimator");
const { forecastDecay } = require("./forecaster");
const { calculateSpacedRepetition, generateReviewSchedule } = require("./spaced-repetition");
const { calculateOptimalReviewTiming } = require("./review-timing");
const { generateDecayAlerts, deduplicateAlerts, saveAlerts } = require("./alert-generator");
const { adaptRecommendationsByDecay } = require("./recommendation-adapter");
const { analyzeRoleSpecificDecay, getPrimaryRole } = require("./role-decay");

const { DecayProfileModel } = require("../../models/DecayProfile");
const { DecayForecastModel } = require("../../models/DecayForecast");

async function computeDecayV2(userId) {
  try {
    console.log(`[Decay] Starting Decay v2 computation for user ${userId}`);

    // Step 1: Extract historical data for all topics
    const allHistories = await extractDecayHistoryAllTopics(userId, 90);

    if (!allHistories || Object.keys(allHistories).length === 0) {
      console.log(`[Decay] Insufficient history for decay computation`);
      return null;
    }

    // Step 2: Get user's DNA for context (if available)
    let userDNA = null;
    try {
      const { DNAProfileModel } = require("../../models/DNAProfile");
      const latestDNA = await DNAProfileModel.findOne({ user: userId }).sort({
        createdAt: -1
      });
      if (latestDNA) {
        userDNA = latestDNA.classification;
        console.log(`[Decay] Using DNA context: ${userDNA.primaryType}`);
      }
    } catch (err) {
      console.log(`[Decay] DNA profile not available; proceeding without`);
    }

    // Step 3: Process each topic
    const decayProfiles = {};
    const decayForecasts = {};
    const timingByTopic = {};
    const allAlerts = [];

    for (const [topic, history] of Object.entries(allHistories)) {
      console.log(`[Decay] Processing topic: ${topic}`);

      try {
        // 3a: Estimate halfLife via curve fitting
        const halfLifeEstimate = await estimateHalfLife(history.observations);

        if (!halfLifeEstimate) {
          console.log(`[Decay] Could not estimate halfLife for ${topic}; skipping`);
          continue;
        }

        // 3b: Create decay profile
        const profile = new DecayProfileModel({
          user: userId,
          topic: topic,
          estimatedHalfLife: halfLifeEstimate.estimatedHalfLife,
          halfLifeConfidence: halfLifeEstimate.confidence,
          modelAccuracy: halfLifeEstimate.modelAccuracy,
          predictionError: halfLifeEstimate.predictionError,
          samplesUsed: halfLifeEstimate.samplesUsed,
          observationWindow: history.metadata.windowDays
        });

        await profile.save();
        decayProfiles[topic] = profile;

        // 3c: Forecast retention
        const dnaType = userDNA?.primaryType || "Consistent Learner";
        const forecast = await forecastDecay(
          history.observations[history.observations.length - 1].observedRetention,
          halfLifeEstimate.estimatedHalfLife,
          halfLifeEstimate.confidence,
          dnaType
        );

        // 3d: Calculate optimal timing
        const timing = calculateOptimalReviewTiming(
          history.observations[history.observations.length - 1].observedRetention,
          halfLifeEstimate.estimatedHalfLife,
          dnaType
        );

        // 3e: Create forecast document
        const forecastDoc = new DecayForecastModel({
          user: userId,
          topic: topic,
          currentRetention: forecast.forecasts.day3.retention,
          forecasts: {
            day3: forecast.forecasts.day3,
            day7: forecast.forecasts.day7,
            day30: forecast.forecasts.day30
          },
          optimalReviewTiming: {
            windowOpensAt: timing.windowOpensAt,
            windowClosesAt: timing.windowClosesAt,
            optimalDay: timing.optimalDay,
            delayPenalty: timing.delayPenalty
          },
          spacedRepetition: {
            interval1: 1,
            interval2: 3,
            interval3: 7,
            intervals: [] // Will be set by spaced-repetition service
          },
          riskLevel: forecast.riskLevel,
          basedOnHalfLife: halfLifeEstimate.estimatedHalfLife,
          usedActualCurve: true,
          validUntil: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
        });

        await forecastDoc.save();
        decayForecasts[topic] = forecast;
        timingByTopic[topic] = timing;

        // 3f: Generate alerts
        const topicAlerts = await generateDecayAlerts(userId, topic, forecast, timing);
        allAlerts.push(...topicAlerts);

        // 3g: Archive observations
        await archiveObservations(userId, topic, history.observations);

        console.log(`[Decay] ✓ ${topic}: halfLife=${halfLifeEstimate.estimatedHalfLife.toFixed(1)}d, risk=${forecast.riskLevel}`);
      } catch (topicError) {
        console.error(`[Decay] Error processing ${topic}:`, topicError);
        continue;
      }
    }

    // Step 4: Deduplicate and save alerts
    const uniqueAlerts = await deduplicateAlerts(userId, allAlerts);
    if (uniqueAlerts.length > 0) {
      await saveAlerts(userId, uniqueAlerts);
    }

    // Step 5: Analyze role-specific decay
    let roleDecayAnalysis = null;
    try {
      roleDecayAnalysis = await analyzeAllRoles(userId);
    } catch (err) {
      console.log(`[Decay] Role decay analysis failed:`, err.message);
    }

    console.log(
      `[Decay] ✓ Computation complete: ${Object.keys(decayProfiles).length} topics, ${allAlerts.length} alerts`
    );

    return {
      profiles: decayProfiles,
      forecasts: decayForecasts,
      timing: timingByTopic,
      alerts: allAlerts,
      roleAnalysis: roleDecayAnalysis,
      summary: {
        topicsProcessed: Object.keys(decayProfiles).length,
        alertsGenerated: allAlerts.length,
        computedAt: new Date()
      }
    };
  } catch (error) {
    console.error(`[Decay] Error computing Decay v2:`, error);
    throw error;
  }
}

// Update existing recommendations with decay context
async function updateDecayRecommendations(userId, recommendations) {
  try {
    if (!recommendations || recommendations.length === 0) {
      return [];
    }

    console.log(`[Decay] Adapting ${recommendations.length} recommendations with decay context`);

    // Get latest forecasts for user
    const forecastDocs = await DecayForecastModel.find({
      user: userId,
      validUntil: { $gte: new Date() }
    });

    const decayForecasts = {};
    const timingByTopic = {};

    for (const doc of forecastDocs) {
      decayForecasts[doc.topic] = {
        riskLevel: doc.riskLevel,
        currentRetention: doc.currentRetention,
        forecasts: doc.forecasts
      };
      timingByTopic[doc.topic] = {
        windowOpensAt: doc.optimalReviewTiming.windowOpensAt,
        windowClosesAt: doc.optimalReviewTiming.windowClosesAt,
        optimalDay: doc.optimalReviewTiming.optimalDay,
        windowDurationDays: Math.round(
          (doc.optimalReviewTiming.windowClosesAt - doc.optimalReviewTiming.windowOpensAt) /
            (1000 * 60 * 60 * 24)
        ),
        delayPenalty: doc.optimalReviewTiming.delayPenalty
      };
    }

    // Adapt recommendations
    const adapted = await adaptRecommendationsByDecay(
      recommendations,
      decayForecasts,
      timingByTopic
    );

    return adapted;
  } catch (error) {
    console.error(`[Decay] Error updating recommendations:`, error);
    return recommendations; // Return originals if adaptation fails
  }
}

// Helper: Extract history for all topics
async function extractDecayHistoryAllTopics(userId, windowDays = 90) {
  const { SkillDecayModel } = require("../../models/SkillDecay");
  const cutoff = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000);

  const topics = await SkillDecayModel.find({
    user: userId,
    checkedAt: { $gte: cutoff }
  }).distinct("topic");

  const results = {};
  for (const topic of topics) {
    const history = await extractDecayHistory(userId, topic, windowDays);
    if (history) {
      results[topic] = history;
    }
  }

  return results;
}

module.exports = {
  computeDecayV2,
  updateDecayRecommendations,
  extractDecayHistoryAllTopics
};
