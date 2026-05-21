const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { scrapingQueue, analyticsQueue } = require("../lib/queue");
const { CodingProfileModel } = require("../models/CodingProfile");
const { ScrapingCacheModel } = require("../models/ScrapingCache");

const router = Router();

/**
 * Middleware to check for admin role
 */
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Access denied. Admin role required." });
  }
  next();
};

/**
 * Get system-wide queue health and ingestion status
 */
router.get("/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const scrapingJobs = await scrapingQueue.getJobCounts();
    const analyticsJobs = await analyticsQueue.getJobCounts();

    const syncFailures = await CodingProfileModel.countDocuments({ syncStatus: 'failed' });
    const totalProfiles = await CodingProfileModel.countDocuments();

    res.status(200).json({
      queues: {
        scraping: scrapingJobs,
        analytics: analyticsJobs
      },
      health: {
        totalProfiles,
        syncFailures,
        failureRate: totalProfiles > 0 ? (syncFailures / totalProfiles * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Monitor scraping cache health (CodeChef resilience)
 */
router.get("/scraping-monitor", requireAuth, requireAdmin, async (req, res) => {
  try {
    const cacheHealth = await ScrapingCacheModel.find()
      .sort({ failureCount: -1 })
      .limit(20);

    const stats = {
      totalCached: await ScrapingCacheModel.countDocuments(),
      failingScrapers: await ScrapingCacheModel.countDocuments({ $gt: { failureCount: 0 } }),
      staleCache: await ScrapingCacheModel.countDocuments({ isStale: true }),
      recent: cacheHealth
    };

    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { adminRouter: router };
