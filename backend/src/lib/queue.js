const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const { env } = require("../config/env");

const redisConfig = {
  maxRetriesPerRequest: null,
  enableOfflineQueue: false,
  lazyConnect: true,
  retryStrategy(times) {
    return Math.min(times * 100, 10000); // Gradual backoff up to 10s
  },
};

const connection = new IORedis(env.REDIS_URL || "redis://127.0.0.1:6379", redisConfig);

// Surface Redis client errors for observability
connection.on("error", (err) => {
  console.error('[Redis] connection error:', err && err.message);
});

/**
 * Robust Queue Factory
 * Only attaches error listeners to prevent unhandled exceptions
 */
const createSafeQueue = (name) => {
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
const isRedisConnected = () => connection.status === "ready";

module.exports = {
  connection,
  scrapingQueue,
  analyticsQueue,
  getEventDlqQueue,
  isRedisConnected
};
