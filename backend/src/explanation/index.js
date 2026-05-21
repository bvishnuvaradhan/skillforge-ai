const {
  buildExplanation,
  formatExplanationForDisplay,
  getRecommendationTitle,
  getRecommendationIcon,
  getRecommendationColor
} = require("./basic");

const {
  calculateConfidence,
  assessDataQuality,
  scoreSignalAlignment,
  extractSignals,
  explainConfidence
} = require("./confidence");

const { buildEvidenceChain } = require("./evidence-builder");
const { generateCaveats } = require("./caveats");
const { generateAlternatives } = require("./alternatives");

module.exports = {
  // Basic explanation (Step 1)
  buildExplanation,
  formatExplanationForDisplay,
  getRecommendationTitle,
  getRecommendationIcon,
  getRecommendationColor,

  // Deep explanation (Step 2)
  calculateConfidence,
  assessDataQuality,
  scoreSignalAlignment,
  extractSignals,
  explainConfidence,
  buildEvidenceChain,
  generateCaveats,
  generateAlternatives
};
