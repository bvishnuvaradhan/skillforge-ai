const { Router } = require("express");
const { createHash } = require("crypto");
const { requireAuth } = require("../middleware/auth");
const { RecommendationModel } = require("../models/Recommendation");
const { RecommendationConflictModel } = require("../models/RecommendationConflict");
const { RecommendationLifecycleModel } = require("../models/RecommendationLifecycle");
const { DailyFocusSnapshotModel } = require("../models/DailyFocusSnapshot");
const { ArbitrationTraceModel } = require("../models/ArbitrationTrace");
const { orchestrateRecommendations } = require("../services/arbitration");
const { transitionLifecycle } = require("../services/arbitration/recommendation-lifecycle");
const { findTraceByIdempotency } = require("../services/arbitration/telemetry");

const router = Router();

function buildRequestHash(candidates) {
  const payload = (candidates || []).map((candidate) => ({
    id: String(candidate._id),
    topic: candidate.topic,
    type: candidate.type,
    status: candidate.status,
    updatedAt: candidate.updatedAt ? new Date(candidate.updatedAt).toISOString() : null
  }));

  return createHash("sha256").update(JSON.stringify(payload)).digest("hex");
}

router.post("/run", requireAuth, async (req, res) => {
  try {
    const idempotencyKey = String(
      req.headers["x-idempotency-key"] || req.body.idempotencyKey || ""
    ).trim() || undefined;

    const pending = await RecommendationModel.find({
      user: req.user.id,
      status: { $in: ["pending", "stale"] }
    }).sort({ createdAt: -1 }).limit(50);

    const requestHash = buildRequestHash(pending);

    if (idempotencyKey) {
      const priorTrace = await findTraceByIdempotency(req.user.id, idempotencyKey);

      if (priorTrace) {
        if (priorTrace.idempotency?.requestHash && priorTrace.idempotency.requestHash !== requestHash) {
          return res.status(409).json({
            error: "Idempotency key reused with different arbitration input"
          });
        }

        const winners = priorTrace.output?.winnerIds?.length
          ? await RecommendationModel.find({ _id: { $in: priorTrace.output.winnerIds } })
          : [];
        const deferred = priorTrace.output?.deferredIds?.length
          ? await RecommendationModel.find({ _id: { $in: priorTrace.output.deferredIds } })
          : [];

        return res.status(200).json({
          replayed: true,
          winners,
          deferred,
          failures: priorTrace.normalizationFailures || [],
          dailyFocus: null,
          trace: priorTrace
        });
      }
    }

    const result = await orchestrateRecommendations(req.user.id, pending, {
      persist: true,
      idempotencyKey,
      requestHash,
      eventMetadata: {
        source: "api",
        trigger: "manual",
        replaySafe: true,
        sequence: Number(req.body.sequence || 0)
      }
    });

    res.status(200).json({
      replayed: false,
      winners: result.winners,
      deferred: result.deferred,
      failures: result.failures,
      dailyFocus: result.dailyFocus,
      trace: result.trace
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/focus/today", requireAuth, async (req, res) => {
  try {
    const focus = await DailyFocusSnapshotModel.findOne({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({ focus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/conflicts", requireAuth, async (req, res) => {
  try {
    const conflicts = await RecommendationConflictModel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ conflicts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/lifecycle", requireAuth, async (req, res) => {
  try {
    const lifecycle = await RecommendationLifecycleModel.find({ user: req.user.id })
      .sort({ updatedAt: -1 })
      .limit(100);
    res.status(200).json({ lifecycle });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/traces", requireAuth, async (req, res) => {
  try {
    const traces = await ArbitrationTraceModel.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ traces });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/lifecycle/:id/snooze", requireAuth, async (req, res) => {
  try {
    const recommendationId = req.params.id;
    const hours = Number(req.body.hours || 24);
    const until = new Date(Date.now() + hours * 60 * 60 * 1000);
    const updated = await transitionLifecycle(recommendationId, "snoozed", "User snoozed recommendation", {
      snoozedUntil: until
    });
    res.status(200).json({ lifecycle: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/lifecycle/:id/resolve", requireAuth, async (req, res) => {
  try {
    const recommendationId = req.params.id;
    const updated = await transitionLifecycle(recommendationId, "resolved", "User resolved recommendation");
    res.status(200).json({ lifecycle: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/lifecycle/:id/ignore", requireAuth, async (req, res) => {
  try {
    const recommendationId = req.params.id;
    const updated = await transitionLifecycle(recommendationId, "ignored", "User ignored recommendation");
    res.status(200).json({ lifecycle: updated });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = { arbitrationRouter: router };
