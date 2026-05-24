const { Worker } = require("bullmq");
const { connection } = require("../lib/queue");
const { processUserAnalytics } = require("../services/analytics.service");
const { generateRecommendations } = require("../recommendation/detector");
const { computeDNAv2 } = require("../services/dna-v2");
const { adaptRecommendationByDNA } = require("../recommendation/dna-adapter");
const { computeDecayV2, updateDecayRecommendations } = require("../services/decay-v2");
const { DNAProfileModel } = require("../models/DNAProfile");
const {
  computeDependencies,
  suggestSmartExploration,
  initializeDependencyGraph
} = require("../services/dependency");

const analyticsWorker = new Worker(
  "analytics",
  async (job) => {
    const { userId } = job.data;
    console.log(`Processing analytics job for user: ${userId}`);

    try {
      // 1. Process analytics (mastery, decay, DNA)
      await processUserAnalytics(userId);

      // 2. Compute DNA v2
      const dnaResult = await computeDNAv2(userId);
      const dnaProfile = dnaResult?.profile;

      // 3. Compute Decay v2
      let decayResult = null;
      try {
        decayResult = await computeDecayV2(userId);
        console.log(`[Analytics] Decay v2 computed: ${Object.keys(decayResult?.profiles || {}).length} topics`);
      } catch (decayError) {
        console.warn(`[Analytics] Decay v2 computation failed:`, decayError.message);
      }

      // 4. Generate recommendations based on new analytics
      let recommendations = await generateRecommendations(userId);

      // 4b. Ensure static dependency graph exists
      try {
        await initializeDependencyGraph({ reason: "analytics-worker bootstrap" });
      } catch (graphError) {
        console.warn(`[Analytics] Dependency graph init skipped:`, graphError.message);
      }

      // 4c. Compute dependency assessment and smart exploration context
      let dependencyAssessment = null;
      let smartExploration = null;
      try {
        dependencyAssessment = await computeDependencies(userId);
        smartExploration = await suggestSmartExploration(userId, { limit: 5 });
      } catch (dependencyError) {
        console.warn(`[Analytics] Dependency computation failed:`, dependencyError.message);
      }

      // 5. Adapt recommendations by DNA
      if (dnaProfile) {
        recommendations = await Promise.all(
          recommendations.map(rec =>
            adaptRecommendationByDNA(rec, dnaProfile.classification)
          )
        );
      }

      // 6. Adapt recommendations by Decay
      if (decayResult) {
        try {
          recommendations = await updateDecayRecommendations(userId, recommendations);
          console.log(`[Analytics] Adapted ${recommendations.length} recommendations with decay context`);
        } catch (decayAdaptError) {
          console.warn(`[Analytics] Decay adaptation failed:`, decayAdaptError.message);
        }
      }

      return {
        analyticsProcessed: true,
        dnaComputed: !!dnaProfile,
        decayComputed: !!decayResult,
        dependencyComputed: !!dependencyAssessment,
        recommendationsGenerated: recommendations.length,
        recommendationsAdapted: !!(dnaProfile || decayResult),
        smartExplorationCount: smartExploration?.suggestions?.length || 0
      };
    } catch (error) {
      console.error(`[Analytics] Job failed:`, error);
      throw error;
    }
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

