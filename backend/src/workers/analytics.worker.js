const { Worker } = require("bullmq");
const { connection } = require("../lib/queue");
const { processUserAnalytics } = require("../services/analytics.service");
const { generateRecommendations } = require("../recommendation/detector");
const { computeDNAv2 } = require("../services/dna-v2");
const { adaptRecommendationByDNA } = require("../recommendation/dna-adapter");
const { DNAProfileModel } = require("../models/DNAProfile");

const analyticsWorker = new Worker(
  "analytics",
  async (job) => {
    const { userId } = job.data;
    console.log(`Processing analytics job for user: ${userId}`);

    // 1. Process analytics (mastery, decay, DNA)
    await processUserAnalytics(userId);

    // 2. Compute DNA v2
    const dnaResult = await computeDNAv2(userId);
    const dnaProfile = dnaResult?.profile;

    // 3. Generate recommendations based on new analytics
    let recommendations = await generateRecommendations(userId);

    // 4. Adapt recommendations by DNA
    if (dnaProfile) {
      recommendations = await Promise.all(
        recommendations.map(rec =>
          adaptRecommendationByDNA(rec, dnaProfile.classification)
        )
      );
    }

    return {
      analyticsProcessed: true,
      dnaComputed: !!dnaProfile,
      recommendationsGenerated: recommendations.length,
      recommendationsAdapted: !!dnaProfile
    };
  },
  { connection, concurrency: 2 }
);

analyticsWorker.on("completed", (job) => {
  console.log(`Analytics job ${job.id} completed: ${job.returnvalue?.recommendationsGenerated || 0} recommendations`);
});

analyticsWorker.on("failed", (job, err) => {
  console.error(`Analytics job ${job.id} failed: ${err.message}`);
});

analyticsWorker.on("error", () => {
  // Nuclear silence for connection issues
});

module.exports = analyticsWorker;

