const { Queue } = require("bullmq");
const IORedis = require("ioredis");
const { env } = require("../config/env");

const connection = new IORedis(env.REDIS_URL || "redis://127.0.0.1:6379", {
  maxRetriesPerRequest: null,
});

// Create Queues
const scrapingQueue = new Queue("scraping", { connection });
const analyticsQueue = new Queue("analytics", { connection });

module.exports = {
  connection,
  scrapingQueue,
  analyticsQueue,
};
