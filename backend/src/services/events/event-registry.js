const registry = {
  SubmissionAdded: { owner: "analytics", consumers: ["DecayConsumer", "DNAConsumer"] },
  DecayUpdated: { owner: "decay", consumers: ["RecommendationConsumer"] },
  RecommendationGenerated: { owner: "recommendation", consumers: ["ArbitrationConsumer"] },
  ArbitrationCompleted: { owner: "arbitration", consumers: ["RecommendationConsumer"] },
  LifecycleChanged: { owner: "lifecycle", consumers: ["RecommendationConsumer"] },
  ForecastExpired: { owner: "decay", consumers: ["DecayConsumer"] }
};

function getEventDescriptor(eventType) {
  return registry[eventType];
}

function listEventRegistry() {
  return registry;
}

module.exports = {
  getEventDescriptor,
  listEventRegistry
};
