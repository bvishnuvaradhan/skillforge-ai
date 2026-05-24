const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const {
  getTraceByRecommendation,
  getUserTraceOverview,
  getArbitrationRunTrace
} = require("../services/observability/trace-query");

const router = Router();

router.get("/user/:userId", requireAuth, async (req, res) => {
  try {
    if (String(req.user.id) !== String(req.params.userId) && req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    const result = await getUserTraceOverview(req.params.userId, {
      limit: req.query.limit
    });

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/arbitration/:id", requireAuth, async (req, res) => {
  try {
    const result = await getArbitrationRunTrace(req.user.id, String(req.params.id));
    if (!result) return res.status(404).json({ error: "Arbitration trace not found" });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/:recommendationId", requireAuth, async (req, res) => {
  try {
    const result = await getTraceByRecommendation(req.user.id, req.params.recommendationId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = { tracesRouter: router };
