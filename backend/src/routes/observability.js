const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const { getGovernanceEvents, getLineage } = require("../services/observability/trace-query");
const { dryRunGovernance } = require("../services/governance/policy-engine");

const router = Router();

router.get("/governance", requireAuth, async (req, res) => {
  try {
    const result = await getGovernanceEvents(req.user.id, {
      limit: req.query.limit,
      action: req.query.action
    });
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.get("/lineage", requireAuth, async (req, res) => {
  try {
    if (!req.query.recommendationId) {
      return res.status(400).json({ error: "recommendationId query param is required" });
    }

    const result = await getLineage(req.user.id, req.query.recommendationId);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

router.post("/governance/dry-run", requireAuth, async (req, res) => {
  try {
    const candidates = Array.isArray(req.body?.candidates) ? req.body.candidates : [];
    const context = {
      cooldownTopics: new Set(req.body?.cooldownTopics || []),
      selectedCount: Number(req.body?.selectedCount || 0),
      maxDaily: Number(req.body?.maxDaily || 3),
      shouldPreserveDiversity: Boolean(req.body?.shouldPreserveDiversity),
      policyOverrides: req.body?.policyOverrides
    };

    const result = dryRunGovernance(candidates, context);
    return res.status(200).json({ result });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = { observabilityRouter: router };
