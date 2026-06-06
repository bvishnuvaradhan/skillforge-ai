const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { TeamModel } = require("../models/Team");

const router = Router();

/**
 * Get all teams where the user is an owner or member
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.userId;
    const teams = await TeamModel.find({
      $or: [{ owner: userId }, { members: userId }]
    }).populate("owner", "username email").populate("members", "username email");
    
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Create a new team
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const { name, organization } = req.body;
    const userId = req.user.userId;

    const team = await TeamModel.create({
      name,
      organization,
      owner: userId,
      members: [userId]
    });

    res.status(201).json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { teamRouter: router };
