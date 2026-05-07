const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { CodingProfileModel } = require("../models/CodingProfile");
const { scrapingQueue } = require("../lib/queue");
const { z } = require("zod");

const router = Router();

const linkProfileSchema = z.object({
  platform: z.enum(["leetcode", "codechef", "github"]),
  username: z.string().min(1),
});

/**
 * Link a coding profile and trigger initial sync
 */
router.post("/link", requireAuth, async (req, res) => {
  try {
    const { platform, username } = linkProfileSchema.parse(req.body);
    const userId = req.user.id;

    let profile = await CodingProfileModel.findOne({ user: userId, platform });

    if (profile) {
      profile.username = username;
      profile.syncStatus = "idle";
      await profile.save();
    } else {
      profile = await CodingProfileModel.create({
        user: userId,
        platform,
        username,
      });
    }

    // Add to scraping queue
    await scrapingQueue.add(`sync-${userId}-${platform}`, {
      userId,
      platform,
      username,
    });

    res.status(200).json({ message: "Profile linked and sync started", profile });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

/**
 * Get all linked profiles for a user
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const profiles = await CodingProfileModel.find({ user: req.user.id });
    res.status(200).json({ profiles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Trigger manual sync
 */
router.post("/sync/:platform", requireAuth, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user.id;

    const profile = await CodingProfileModel.findOne({ user: userId, platform });

    if (!profile) {
      return res.status(404).json({ error: "Profile not found" });
    }

    await scrapingQueue.add(`manual-sync-${userId}-${platform}`, {
      userId,
      platform,
      username: profile.username,
    });

    res.status(200).json({ message: "Sync triggered" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { profileRouter: router };
