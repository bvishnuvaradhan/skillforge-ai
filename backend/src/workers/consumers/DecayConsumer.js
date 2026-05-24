async function handleDecayEvent(event) {
  if (!event?.payload?.userId) return;
  // Placeholder for decay-boundary side effects and future retries.
  console.log(`[DecayConsumer] handled ${event.type} for user ${event.payload.userId}`);
}

module.exports = {
  handleDecayEvent
};
