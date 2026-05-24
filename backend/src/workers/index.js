/**
 * Initialize all background workers
 */
function initWorkers() {
  console.log("Initializing background workers...");
  const { registerConsumer, EVENT_TYPES } = require("../services/events");
  const { handleDecayEvent } = require("./consumers/DecayConsumer");
  const { handleDNAEvent } = require("./consumers/DNAConsumer");
  const { handleDependencyEvent } = require("./consumers/DependencyConsumer");
  const { handleRecommendationEvent } = require("./consumers/RecommendationConsumer");
  const { handleArbitrationEvent } = require("./consumers/ArbitrationConsumer");

  registerConsumer(EVENT_TYPES.SubmissionAdded, "DecayConsumer", handleDecayEvent);
  registerConsumer(EVENT_TYPES.SubmissionAdded, "DNAConsumer", handleDNAEvent);
  registerConsumer(EVENT_TYPES.DecayUpdated, "RecommendationConsumer", handleRecommendationEvent);
  registerConsumer(EVENT_TYPES.RecommendationGenerated, "ArbitrationConsumer", handleArbitrationEvent);
  registerConsumer(EVENT_TYPES.ArbitrationCompleted, "RecommendationConsumer", handleRecommendationEvent);
  registerConsumer(EVENT_TYPES.LifecycleChanged, "DependencyConsumer", handleDependencyEvent);

  require("./scraping.worker");
  require("./analytics.worker");
}

module.exports = { initWorkers };
