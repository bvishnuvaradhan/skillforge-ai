async function handleDependencyEvent(event) {
  if (!event?.payload?.userId) return;
  console.log(`[DependencyConsumer] handled ${event.type} for user ${event.payload.userId}`);
}

module.exports = {
  handleDependencyEvent
};
