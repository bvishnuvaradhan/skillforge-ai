const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { CodingProfileModel } = require("../models/CodingProfile");
const { UserModel } = require("../models/User");
const { scrapingQueue, isRedisConnected } = require("../lib/queue");
const { performSync } = require("../services/sync.service");
const { z } = require("zod");

const router = Router();

const linkProfileSchema = z.object({
  platform: z.enum(["leetcode", "codechef", "github"]),
  username: z.string().min(1),
});

/**
 * Link a coding profile and trigger sync
 * Also updates the main User profile for consistency
 */
router.post("/link", requireAuth, async (req, res) => {
  try {
    const { platform, username } = linkProfileSchema.parse(req.body);
    const userId = req.user.id;

    // 1. Update/Create CodingProfile document
    let profile = await CodingProfileModel.findOne({ user: userId, platform });
    if (!profile) {
      profile = await CodingProfileModel.create({ user: userId, platform, username });
    } else {
      profile.username = username;
      await profile.save();
    }

    // 2. SYNC WITH USER MODEL: Update the nested codingProfiles in User
    await UserModel.findByIdAndUpdate(userId, {
      $set: { [`profile.codingProfiles.${platform}`]: username }
    });

    // 3. Trigger sync (Direct or Background)
    if (isRedisConnected()) {
      await scrapingQueue.add(`sync-${userId}-${platform}`, { userId, platform, username });
      res.status(200).json({ message: "Profile linked and sync started", profile });
    } else {
      console.log(`[DirectSync] Redis offline. Performing immediate sync for ${username}`);
      await performSync(userId, platform, username);
      res.status(200).json({ message: "Profile linked and real-time sync completed", profile });
    }
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
 * Unlink a coding profile and clear from User profile
 */
router.delete("/:platform", requireAuth, async (req, res) => {
  try {
    const { platform } = req.params;
    const userId = req.user.id;

    // 1. Remove CodingProfile document
    await CodingProfileModel.deleteOne({ user: userId, platform });

    // 2. SYNC WITH USER MODEL: Clear the username from User profile
    await UserModel.findByIdAndUpdate(userId, {
      $set: { [`profile.codingProfiles.${platform}`]: "" }
    });

    res.status(200).json({ message: "Profile unlinked successfully" });
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
    if (!profile) return res.status(404).json({ error: "Profile not found" });

    if (isRedisConnected()) {
      await scrapingQueue.add(`manual-sync-${userId}-${platform}`, { userId, platform, username: profile.username });
      res.status(200).json({ message: "Sync triggered in background" });
    } else {
      await performSync(userId, platform, profile.username);
      res.status(200).json({ message: "Real-time sync completed successfully" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { profileRouter: router };
