const { Worker } = require("bullmq");
const { connection, analyticsQueue } = require("../lib/queue");
const { CodingProfileModel } = require("../models/CodingProfile");
const { SubmissionModel } = require("../models/Submission");
const { normalizeToUDI } = require("../constants/udi");

const githubService = require("../services/github.service");
const leetcodeService = require("../services/leetcode.service");
const codechefService = require("../services/codechef.service");

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0'
];

const getRandomUserAgent = () => USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const scrapingWorker = new Worker(
  "scraping",
  async (job) => {
    const { userId, platform, username } = job.data;
    
    // Random delay to avoid patterns (1s - 5s)
    const delay = Math.floor(Math.random() * 4000) + 1000;
    await sleep(delay);
    
    const userAgent = getRandomUserAgent();
    console.log(`Processing scraping job for ${username} on ${platform} with UA: ${userAgent.substring(0, 30)}...`);

    try {
      // 1. Update status to syncing
      await CodingProfileModel.findOneAndUpdate(
        { user: userId, platform },
        { syncStatus: "syncing" }
      );

      let rawData;
      let normalizedData;

      // 2. Fetch and Normalize based on platform
      switch (platform) {
        case "github":
          rawData = await githubService.fetchGithubData(username);
          normalizedData = githubService.normalizeGithubData(rawData);
          break;

        case "leetcode":
          rawData = await leetcodeService.fetchLeetcodeData(username, userAgent);
          normalizedData = leetcodeService.normalizeLeetcodeData(rawData);
          
          // Fetch and save submissions
          const submissions = await leetcodeService.fetchLeetcodeSubmissions(username, userAgent);
          for (const sub of submissions) {
            if (sub.statusDisplay === 'Accepted') {
              await SubmissionModel.findOneAndUpdate(
                { user: userId, platform, externalId: sub.timestamp + sub.titleSlug },
                {
                  problemName: sub.title,
                  solvedAt: new Date(parseInt(sub.timestamp) * 1000),
                  udi: normalizeToUDI('leetcode', 'Medium'), // Simplified for now
                  status: 'accepted',
                  language: sub.lang
                },
                { upsert: true }
              );
            }
          }
          break;

        case "codechef":
          rawData = await codechefService.fetchCodechefData(username, userAgent);
          normalizedData = codechefService.normalizeCodechefData(rawData);
          break;

        default:
          throw new Error(`Unsupported platform: ${platform}`);
      }

      // 3. Update Profile Stats
      await CodingProfileModel.findOneAndUpdate(
        { user: userId, platform },
        {
          syncStatus: "success",
          lastSyncedAt: new Date(),
          stats: {
            rating: normalizedData.rating || 0,
            globalRank: normalizedData.globalRank || 0,
            totalSolved: normalizedData.totalSolved || 0,
          },
          error: null,
        }
      );

      // 4. Trigger Analytics Job
      await analyticsQueue.add(`analytics-${userId}`, { userId });

      return { success: true };
    } catch (error) {
      console.error(`Scraping job failed for ${username}:`, error.message);
      
      await CodingProfileModel.findOneAndUpdate(
        { user: userId, platform },
        { syncStatus: "failed", error: error.message }
      );
      
      throw error;
    }
  },
  { connection, concurrency: 5 }
);

scrapingWorker.on("completed", (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

scrapingWorker.on("failed", (job, err) => {
  console.error(`Job ${job.id} failed with ${err.message}`);
});

module.exports = scrapingWorker;
