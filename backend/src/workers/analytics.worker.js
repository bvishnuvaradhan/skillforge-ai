const { Worker } = require("bullmq");
const { connection } = require("../lib/queue");
const { processUserAnalytics } = require("../services/analytics.service");

const analyticsWorker = new Worker(
  "analytics",
  async (job) => {
    const { userId } = job.data;
    console.log(`Processing analytics job for user: ${userId}`);
    return await processUserAnalytics(userId);
  },
  { connection, concurrency: 2 }
);

analyticsWorker.on("completed", (job) => {
  console.log(`Analytics job ${job.id} completed`);
});

analyticsWorker.on("failed", (job, err) => {
  console.error(`Analytics job ${job.id} failed: ${err.message}`);
});

module.exports = analyticsWorker;
