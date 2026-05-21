const { Worker } = require("bullmq");
const { connection } = require("../lib/queue");
const { processUserAnalytics } = require("../services/analytics.service");
const { generateRecommendations } = require("../recommendation/detector");

const analyticsWorker = new Worker(
  "analytics",
  async (job) => {
    const { userId } = job.data;
    console.log(`Processing analytics job for user: ${userId}`);

    // 1. Process analytics (mastery, decay, DNA)
    await processUserAnalytics(userId);

    // 2. Generate recommendations based on new analytics
    const recommendations = await generateRecommendations(userId);

    return {
      analyticsProcessed: true,
      recommendationsGenerated: recommendations.length
    };
  },
  { connection, concurrency: 2 }
);

analyticsWorker.on("completed", (job) => {
  console.log(`Analytics job ${job.id} completed with ${job.returnvalue?.recommendationsGenerated || 0} recommendations`);
});

analyticsWorker.on("failed", (job, err) => {
  console.error(`Analytics job ${job.id} failed: ${err.message}`);
});

analyticsWorker.on("error", () => {
  // Nuclear silence for connection issues
});

module.exports = analyticsWorker;
