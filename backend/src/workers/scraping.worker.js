const { Worker } = require("bullmq");
const { connection } = require("../lib/queue");
const { performSync } = require("../services/sync.service");

const scrapingWorker = new Worker(
  "scraping",
  async (job) => {
    const { userId, platform, username } = job.data;
    return performSync(userId, platform, username);
  },
  { connection }
);

scrapingWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with ${err.message}`);
});

scrapingWorker.on("error", () => {
  // Nuclear silence for connection issues
});

module.exports = scrapingWorker;
