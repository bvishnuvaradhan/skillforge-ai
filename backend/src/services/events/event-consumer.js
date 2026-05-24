const { subscribeEvent } = require("./event-bus");
const { getEventDlqQueue } = require("../../lib/queue");

const handlers = new Map();
const processedEvents = new Map();
const lastSequenceByKey = new Map();

const DEFAULT_RETRY_POLICY = {
  maxAttempts: 3,
  backoffMs: 100,
  maxBackoffMs: 1500
};

function getOrderingKey(event, consumerName) {
  return `${consumerName}:${event.type}:${String(event.metadata?.userId || "global")}`;
}

function getIdempotencyKey(event, consumerName) {
  const key = event.metadata?.idempotencyKey;
  if (key) return `${consumerName}:${key}`;
  return `${consumerName}:${event.id}`;
}

function isStaleSequence(event, consumerName) {
  const current = Number(event.metadata?.sequence || 0);
  const orderingKey = getOrderingKey(event, consumerName);
  const previous = Number(lastSequenceByKey.get(orderingKey) || 0);
  if (current < previous) return true;
  lastSequenceByKey.set(orderingKey, current);
  return false;
}

function isDuplicateEvent(event, consumerName) {
  const idempotencyKey = getIdempotencyKey(event, consumerName);
  if (processedEvents.has(idempotencyKey)) return true;
  processedEvents.set(idempotencyKey, Date.now());
  return false;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pushToDeadLetter(event, consumerName, error, attempts) {
  const queue = getEventDlqQueue();
  await queue.add(
    "event-dead-letter",
    {
      event,
      consumerName,
      attempts,
      error: {
        message: error?.message,
        stack: error?.stack
      },
      failedAt: new Date().toISOString()
    },
    {
      attempts: 1,
      removeOnComplete: true,
      removeOnFail: 100
    }
  );
}

async function executeWithRetry(handler, event, consumerName, retryPolicy = {}) {
  const maxAttempts = Number(retryPolicy.maxAttempts || DEFAULT_RETRY_POLICY.maxAttempts);
  const baseBackoff = Number(retryPolicy.backoffMs || DEFAULT_RETRY_POLICY.backoffMs);
  const maxBackoff = Number(retryPolicy.maxBackoffMs || DEFAULT_RETRY_POLICY.maxBackoffMs);

  let attempt = 0;
  let lastError = null;

  while (attempt < maxAttempts) {
    try {
      attempt += 1;
      await handler(event);
      return;
    } catch (error) {
      lastError = error;
      if (attempt >= maxAttempts) break;
      const waitMs = Math.min(baseBackoff * 2 ** (attempt - 1), maxBackoff);
      await delay(waitMs);
    }
  }

  await pushToDeadLetter(event, consumerName, lastError, maxAttempts);
  throw lastError;
}

function registerConsumer(eventType, consumerName, handler, options = {}) {
  const key = `${eventType}:${consumerName}`;
  if (handlers.has(key)) return;

  const unsubscribe = subscribeEvent(eventType, async (event) => {
    if (isDuplicateEvent(event, consumerName)) {
      return;
    }

    if (isStaleSequence(event, consumerName)) {
      console.warn(`[EventConsumer] stale sequence dropped for ${consumerName} ${eventType}`);
      return;
    }

    try {
      await executeWithRetry(handler, event, consumerName, options.retryPolicy);
    } catch (error) {
      console.warn(`[EventConsumer] ${consumerName} failed for ${eventType}:`, error.message);
    }
  });

  handlers.set(key, unsubscribe);
}

function unregisterAllConsumers() {
  for (const unsubscribe of handlers.values()) {
    unsubscribe();
  }
  handlers.clear();
  processedEvents.clear();
  lastSequenceByKey.clear();
}

module.exports = {
  registerConsumer,
  unregisterAllConsumers
};
