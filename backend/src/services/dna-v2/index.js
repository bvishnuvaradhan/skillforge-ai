// DNA v2 Orchestrator
// Main service that coordinates DNA v2 computation and storage

const { calculateDNAFactors } = require("./factor-calculator");
const { scoreDNATypes } = require("./type-scorer");
const { classifyDNA } = require("./classifier");
const { DNAProfileModel } = require("../../models/DNAProfile");
const { DNATransitionModel } = require("../../models/DNATransition");

async function computeDNAv2(userId) {
  try {
    console.log(`[DNA] Starting DNA v2 computation for user ${userId}`);

    // 1. Calculate factors
    const factorData = await calculateDNAFactors(userId);
    if (!factorData) {
      console.log(`[DNA] Insufficient data for DNA computation`);
      return null;
    }

    const { factors, metadata } = factorData;

    // 2. Score all 4 types
    const scores = await scoreDNATypes(factors);

    // 3. Classify with blend and confidence
    const classification = await classifyDNA(scores, factors);

    // 4. Record snapshot
    const dnaProfile = new DNAProfileModel({
      user: userId,
      factors,
      scores,
      classification,
      metadata
    });

    await dnaProfile.save();
    console.log(`[DNA] DNA profile saved: ${dnaProfile._id}`);

    // 5. Detect transitions
    const transition = await detectTransition(userId, classification);

    return {
      profile: dnaProfile,
      transition
    };
  } catch (error) {
    console.error(`[DNA] Error computing DNA v2:`, error);
    throw error;
  }
}

async function detectTransition(userId, currentClassification) {
  try {
    // Fetch previous DNA (skip current)
    const profiles = await DNAProfileModel.find({ user: userId })
      .sort({ timestamp: -1 })
      .limit(2);

    if (profiles.length < 2) {
      console.log(`[DNA] First DNA profile, no transition detection`);
      return null;
    }

    const prevProfile = profiles[1];  // Previous one
    const prevType = prevProfile.classification.primaryType;
    const currentType = currentClassification.primaryType;

    if (prevType === currentType) {
      console.log(`[DNA] No type change detected`);
      return null;
    }

    console.log(`[DNA] Transition detected: ${prevType} → ${currentType}`);

    // Calculate transition confidence
    const scoreChange = Math.abs(currentClassification.confidence - prevProfile.classification.confidence);
    const transitionConfidence = Math.round(
      (scoreChange / 100) * 0.5 +  // 50% from score change
      currentClassification.confidence * 0.5  // 50% from current confidence
    );

    const transition = new DNATransitionModel({
      user: userId,
      fromType: prevType,
      toType: currentType,
      fromTimestamp: prevProfile.timestamp,
      toTimestamp: new Date(),
      transitionConfidence: Math.min(95, Math.max(40, transitionConfidence)),
      signals: detectTransitionSignals(prevProfile.factors, currentClassification)
    });

    await transition.save();
    console.log(`[DNA] Transition recorded: ${transition._id}`);

    return transition;
  } catch (error) {
    console.error(`[DNA] Error detecting transition:`, error);
    return null;
  }
}

function detectTransitionSignals(prevFactors, currentClassification) {
  const signals = [];

  // Analyze what changed
  if (currentClassification.primaryType === "Deep Diver") {
    signals.push("increased_difficulty_selection");
    signals.push("deeper_topic_focus");
  } else if (currentClassification.primaryType === "Speed Strategist") {
    signals.push("faster_problem_solving");
    signals.push("increased_submission_frequency");
  } else if (currentClassification.primaryType === "Persistent Explorer") {
    signals.push("higher_retry_engagement");
    signals.push("deeper_problem_exploration");
  } else {
    signals.push("consistent_learning_pattern");
  }

  return signals;
}

module.exports = {
  computeDNAv2,
  detectTransition
};
