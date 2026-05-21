const leetcodeService = require("./leetcode.service");
const codechefService = require("./codechef.service");
const githubService = require("./github.service");
const { CodingProfileModel } = require("../models/CodingProfile");
const { SubmissionModel } = require("../models/Submission");
const { analyticsQueue, isRedisConnected } = require("../lib/queue");

const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
];

/**
 * Performs a real-time sync for a user on a specific platform.
 * Can be called by a worker or directly by a route.
 */
async function performSync(userId, platform, username) {
  const userAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
  console.log(`[SyncService] Starting sync for ${platform}/${username}`);

  try {
    // 1. Update status
    await CodingProfileModel.findOneAndUpdate(
      { user: userId, platform },
      { syncStatus: "syncing", error: null }
    );

    let rawData;
    let normalizedData;

    // 2. Fetch platform data
    switch (platform) {
      case "leetcode":
        rawData = await leetcodeService.fetchLeetcodeData(username, userAgent);
        const rawSubmissions = await leetcodeService.fetchLeetcodeSubmissions(username, userAgent);
        normalizedData = leetcodeService.normalizeLeetcodeData(rawData, rawSubmissions);
        break;

      case "codechef":
        rawData = await codechefService.fetchCodechefData(username, userAgent);
        normalizedData = codechefService.normalizeCodechefData(rawData);
        break;

      case "github":
        rawData = await githubService.fetchGithubData(username);
        normalizedData = githubService.normalizeGithubData(rawData);
        break;

      default:
        throw new Error("Unsupported platform");
    }

    // 3. Store submissions
    if (normalizedData.submissions && normalizedData.submissions.length > 0) {
      for (const sub of normalizedData.submissions) {
        await SubmissionModel.findOneAndUpdate(
          { user: userId, platform, externalId: sub.externalId },
          { ...sub, user: userId, platform },
          { upsert: true }
        );
      }
    }

    // 4. Update Profile Stats
    const statsToSave = {
      rating: normalizedData.rating || 0,
      globalRank: normalizedData.globalRank || 0,
      totalSolved: normalizedData.totalSolved || 0,
      totalContributions: normalizedData.totalContributions || 0,
      totalRepos: normalizedData.totalRepos || 0,
      totalStars: normalizedData.totalStars || 0
    };

    console.log(`[SyncService] Saving stats for ${platform}:`, JSON.stringify(statsToSave));

    const syncStatus = normalizedData._isCached ? "success_cached" : "success";
    const syncError = normalizedData._isCached ? normalizedData._warning : null;

    await CodingProfileModel.findOneAndUpdate(
      { user: userId, platform },
      {
        syncStatus,
        lastSyncedAt: new Date(),
        stats: statsToSave,
        error: syncError,
      }
    );

    console.log(`[SyncService] Successfully synced ${platform} for ${username}`);

    // 5. Trigger Analytics (Async if Redis, Sync if not)
    if (isRedisConnected()) {
      await analyticsQueue.add(`analytics-${userId}`, { userId });
    } else {
      const { processUserAnalytics } = require("./analytics.service");
      await processUserAnalytics(userId);
    }

    return normalizedData;
  } catch (error) {
    console.error(`[SyncService] Failed sync for ${platform}/${username}:`, error.message);
    await CodingProfileModel.findOneAndUpdate(
      { user: userId, platform },
      { syncStatus: "failed", error: error.message }
    );
    throw error;
  }
}

module.exports = { performSync };
