async function handleRecommendationEvent(event) {
  if (!event?.payload?.userId) return;
  console.log(`[RecommendationConsumer] handled ${event.type} for user ${event.payload.userId}`);
}

module.exports = {
  handleRecommendationEvent
};
