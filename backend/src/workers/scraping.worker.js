const { Worker } = require("bullmq");
const { connection, SKIP_QUEUES } = require("../lib/queue");
const { performSync } = require("../services/sync.service");
const { env } = require("../config/env");

if (SKIP_QUEUES) {
  const stub = {
    on: () => {},
    close: async () => {},
  };
  module.exports = stub;
} else {
  const scrapingWorker = new Worker(
    "scraping",
    async (job) => {
      const { userId, platform, username } = job.data;
      return performSync(userId, platform, username);
    },
    { connection, concurrency: env.CONCURRENCY_SCRAPING }
  );

  scrapingWorker.on("failed", (job, err) => {
    console.error(`Job ${job.id} failed with ${err.message}`);
  });

  scrapingWorker.on("error", () => {
    // Nuclear silence for connection issues
  });

  module.exports = scrapingWorker;
}
