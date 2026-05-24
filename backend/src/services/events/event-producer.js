const { randomUUID } = require("crypto");
const { publishEvent } = require("./event-bus");

function emitEvent(type, payload = {}, metadata = {}) {
  const event = {
    id: randomUUID(),
    type,
    payload,
    metadata: {
      source: metadata.source || "system",
      userId: metadata.userId,
      runId: metadata.runId,
      idempotencyKey: metadata.idempotencyKey,
      sequence: Number(metadata.sequence || 0),
      createdAt: new Date().toISOString()
    }
  };

  publishEvent(event);
  return event;
}

module.exports = {
  emitEvent
};
