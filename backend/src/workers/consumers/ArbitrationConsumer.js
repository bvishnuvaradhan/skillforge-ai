async function handleArbitrationEvent(event) {
  if (!event?.payload?.userId) return;
  console.log(`[ArbitrationConsumer] handled ${event.type} for user ${event.payload.userId}`);
}

module.exports = {
  handleArbitrationEvent
};
