async function handleDNAEvent(event) {
  if (!event?.payload?.userId) return;
  console.log(`[DNAConsumer] handled ${event.type} for user ${event.payload.userId}`);
}

module.exports = {
  handleDNAEvent
};
