// Generalized Insight Enrichment Service
// Enriches any insight type with confidence, evidence, caveats
// Uses learned historical accuracy from feedback learning

const { getHistoricalAccuracy } = require("./feedback-learning.service");
const INSIGHT_REGISTRY = require("./insight-registry");
const {
  calculateConfidence,
  assessDataQuality,
  extractSignals,
  explainConfidence
} = require("../explanation/confidence");

async function enrichInsight(insightType, insightData, userId) {
  try {
    // 1. Validate insight type
    const config = INSIGHT_REGISTRY[insightType];
    if (!config) {
      console.warn(`[InsightEnrichment] Unknown insight type: ${insightType}`);
      return insightData; // Return unadorned if type unknown
    }

    console.log(`[InsightEnrichment] Enriching ${insightType} insight for user ${userId}`);

    // 2. For recommendation insights, use existing Step 2 enrichment
    if (insightType === "recommendation") {
      const { enrichRecommendationWithExplanation } = require("./explainability.service");
      return await enrichRecommendationWithExplanation(insightData, userId);
    }

    // 3. For other insight types, use generic enrichment pipeline
    // Get learned historical accuracy for this type
    // (Only applies to recommendation types with tracking; others use default 50%)
    const historicalAccuracy = config.hasLearning
      ? await getHistoricalAccuracy(insightType)
      : 50;

    // 4. Build data structure for confidence calculation
    const submissionData = insightData.submissionData || {
      count: insightData.dataPoints || 0,
      daysSinceLastSubmit: insightData.recencyDays || 0,
      recentSubmissions: [],
      consistency: insightData.consistency || 0
    };

    // 5. Calculate confidence using shared 4-factor model
    // confidence = 0.3 × dataQuality + 0.4 × signalAlignment + 0.2 × historical + 0.1 × recency
    const dataQuality = assessDataQuality(submissionData);
    const signals = insightData.signals || [];
    const signalAlignment = calculateSignalAlignment(signals);
    const recencyReliability = scoreRecency(submissionData);

    const confidenceRaw =
      dataQuality.score * 0.3 +
      signalAlignment * 0.4 +
      historicalAccuracy * 0.2 +
      recencyReliability * 0.1;

    // Apply confidence cap (varies by insight type)
    const confidence = Math.min(config.confidenceCap, Math.max(0, confidenceRaw));

    console.log(
      `[InsightEnrichment] ${insightType} confidence: ${confidence.toFixed(0)} (cap: ${config.confidenceCap})`
    );

    // 6. Build evidence chain (use existing or placeholder)
    const evidence = insightData.evidence || {
      dataSources: insightData.dataSources || [],
      thresholds: insightData.thresholds || {},
      calculations: []
    };

    // 7. Generate caveats
    const caveats = generateCaveatsForType(insightType, insightData, dataQuality);

    // 8. Return enriched insight
    return {
      ...insightData,
      type: insightType,
      confidence: {
        score: Math.round(confidence),
        reasoning: explainConfidence(confidence, confidence >= 75),
        dataQuality: dataQuality,
        signals: signals,
        cap: config.confidenceCap
      },
      evidence,
      caveats
    };
  } catch (error) {
    console.error(
      `[InsightEnrichment] Error enriching ${insightType} insight:`,
      error.message
    );
    // Return insight without enrichment if error occurs
    return {
      ...insightData,
      type: insightType,
      confidence: { score: 50, reasoning: "Unable to calculate confidence" }
    };
  }
}

function calculateSignalAlignment(signals) {
  // Calculate how many signals agree
  if (!signals || signals.length === 0) {
    return 50; // No data = neutral
  }

  const agreementCount = signals.filter(s => s.supports === true).length;
  const totalSignals = signals.length;

  if (agreementCount === totalSignals) {
    return 90; // All agree
  } else if (agreementCount >= totalSignals * 0.75) {
    return 75; // Most agree
  } else if (agreementCount >= totalSignals * 0.5) {
    return 50; // Mixed
  } else {
    return 30; // Contradicted
  }
}

function scoreRecency(submissionData) {
  const daysSinceLast = submissionData.daysSinceLastSubmit;

  if (daysSinceLast < 7) return 90;
  if (daysSinceLast < 14) return 80;
  if (daysSinceLast < 30) return 70;
  if (daysSinceLast < 60) return 50;
  return 30;
}

function generateCaveatsForType(insightType, insightData, dataQuality) {
  const caveats = {};

  // Limitations: data quality issues
  const limitations = [];

  if (dataQuality.score < 50) {
    limitations.push("Data quality is weak - pattern may not be reliable");
  }
  if (dataQuality.score < 70) {
    limitations.push("Limited data available");
  }

  if (limitations.length > 0) {
    caveats.limitations = limitations;
  }

  // Type-specific caveats
  const typeSpecific = generateTypeCaveats(insightType, insightData);
  if (typeSpecific.length > 0) {
    caveats.notes = typeSpecific;
  }

  return Object.keys(caveats).length > 0 ? caveats : {};
}

function generateTypeCaveats(insightType, insightData) {
  const notes = [];

  switch (insightType) {
    case "trend":
      if (!insightData.temporalWindow) {
        notes.push("Trend analysis uses recent submissions vs historical baseline");
      }
      break;

    case "dna_profile":
      notes.push("Behavioral profiles are probabilistic classifications, not definitive");
      if (insightData.observationDays && insightData.observationDays < 20) {
        notes.push(
          "Profile is based on limited observation window - may change with more data"
        );
      }
      break;

    case "growth_streak":
      notes.push("Growth streaks can be temporary - sustained improvement takes time");
      break;

    case "frequency_pattern":
      notes.push("Optimal practice frequency varies by individual and topic");
      break;

    case "skill_connection":
      notes.push("Skill connections are based on topic relationships and your profile");
      break;

    case "mastery_drop":
      notes.push("Retention predictions use Ebbinghaus Forgetting Curve model");
      break;
  }

  return notes;
}

module.exports = {
  enrichInsight,
  calculateSignalAlignment,
  scoreRecency
};
