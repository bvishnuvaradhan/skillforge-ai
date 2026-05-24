const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const { env } = require("../config/env");

// Allow tests/environments to opt-out of starting real queues.
const SKIP_QUEUES = String(env.SKIP_QUEUES || process.env.SKIP_QUEUES || "").toLowerCase() === "true";

const redisConfig = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy(times) {
    return Math.min(times * 100, 10000); // Gradual backoff up to 10s
  },
};

// Create a Redis connection only when queues are enabled to avoid noisy logs in tests
const connection = SKIP_QUEUES
  ? null
  : new IORedis(env.REDIS_URL || "redis://127.0.0.1:6379", redisConfig);

if (connection) {
  // Surface Redis client errors for observability
  connection.on("error", (err) => {
    console.error('[Redis] connection error:', err && err.message);
  });
}

/**
 * No-op stub queue used when `SKIP_QUEUES=true` to silence external broker noise
 */
class NoopQueue {
  constructor(name) {
    this.name = name;
    this._handlers = {};
    console.info(`[Queue:stub] ${name} created (SKIP_QUEUES=true)`);
  }
  // mimic API shape minimally
  async add(jobName, data, opts) {
    return { id: `${this.name}-stub-${Date.now()}`, name: jobName, data };
  }
  async addBulk(jobs) {
    return jobs.map((j, i) => ({ id: `${this.name}-stub-${Date.now()}-${i}`, ...j }));
  }
  on(event, handler) {
    // store for potential test triggers
    this._handlers[event] = this._handlers[event] || [];
    this._handlers[event].push(handler);
  }
  async close() { return; }
  async pause() { return; }
  async resume() { return; }
}

/**
 * Robust Queue Factory
 * Only attaches error listeners to prevent unhandled exceptions
 */
const createSafeQueue = (name) => {
  if (SKIP_QUEUES) return new NoopQueue(name);

  const q = new Queue(name, {
    connection,
    defaultJobOptions: {
      removeOnComplete: true,
      removeOnFail: 100,
      attempts: 3,
      backoff: { type: 'exponential', delay: 5000 }
    }
  });

  // Log queue-level errors for debugging
  q.on("error", (err) => {
    console.error(`[BullMQ:${name}] queue error:`, err && err.message);
  });

  return q;
};

const scrapingQueue = createSafeQueue("scraping");
const analyticsQueue = createSafeQueue("analytics");
let eventDlqQueue = null;

const getEventDlqQueue = () => {
  if (!eventDlqQueue) {
    eventDlqQueue = createSafeQueue("event-dlq");
  }
  return eventDlqQueue;
};

// Helper to check status without throwing
const isRedisConnected = () => (connection ? connection.status === "ready" : false);

module.exports = {
  connection,
  scrapingQueue,
  analyticsQueue,
  getEventDlqQueue,
  isRedisConnected,
  SKIP_QUEUES
};
