const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { scrapingQueue, analyticsQueue } = require("../lib/queue");
const { CodingProfileModel } = require("../models/CodingProfile");

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

module.exports = { adminRouter: router };
