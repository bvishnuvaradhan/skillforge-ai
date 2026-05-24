const { Router } = require("express");
const { requireAuth } = require("../middleware/auth");
const TopicDependencyModel = require("../models/TopicDependency");
const { TopicStatModel } = require("../models/TopicStat");
const DependencyHistoryModel = require("../models/DependencyHistory");
const PropagationHistoryModel = require("../models/PropagationHistory");
const {
  validatePrerequisites,
  suggestSmartExploration,
  detectWeakFoundations,
  initializeDependencyGraph,
  getRoleGraph,
  getGraphSnapshot,
  rollbackGraphVersion,
  suggestLearningPath,
  onMasteryImprovement
} = require("../services/dependency");

const router = Router();

router.post("/init", requireAuth, async (_req, res) => {
  try {
    const seeded = await initializeDependencyGraph({ reason: "manual init route" });
    res.status(200).json(seeded);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/graph", requireAuth, async (_req, res) => {
  try {
    const graph = await getGraphSnapshot();
    if (!graph) return res.status(404).json({ error: "Graph not initialized" });
    res.status(200).json(graph);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/graph/rollback/:version", requireAuth, async (req, res) => {
  try {
    const version = Number(req.params.version);
    const result = await rollbackGraphVersion(version, "api-user");
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/prerequisites/:topic", requireAuth, async (req, res) => {
  try {
    const doc = await TopicDependencyModel.findOne({ topic: req.params.topic });
    if (!doc) return res.status(404).json({ error: "Topic not found" });
    res.status(200).json({
      topic: doc.topic,
      soft: true,
      prerequisites: doc.prerequisites || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/readiness/:topic", requireAuth, async (req, res) => {
  try {
    const readiness = await validatePrerequisites(req.user.id, req.params.topic);
    res.status(200).json({
      topic: req.params.topic,
      readinessBand: readiness.readinessBand,
      readinessConfidence: Math.min(95, Math.max(45, readiness.internalReadinessScore || 50)),
      prerequisites: readiness.prerequisites,
      suggestedPreparation: (readiness.prerequisites || []).filter((p) => !p.isMet).map((p) => p.topic),
      message: readiness.shortMessage,
      note: "Readiness is probabilistic and not a guarantee."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/suggestions", requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 8);
    const suggestions = await suggestSmartExploration(req.user.id, { limit });
    res.status(200).json(suggestions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/explore", requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query.limit || 8);
    const result = await suggestSmartExploration(req.user.id, { limit });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/learning-path/:targetTopic", requireAuth, async (req, res) => {
  try {
    const result = await suggestLearningPath(req.user.id, req.params.targetTopic);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/path/:topic", requireAuth, async (req, res) => {
  try {
    const result = await suggestLearningPath(req.user.id, req.params.topic);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/weak-foundations", requireAuth, async (req, res) => {
  try {
    const result = await detectWeakFoundations(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/foundation", requireAuth, async (req, res) => {
  try {
    const result = await detectWeakFoundations(req.user.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/alternatives/:topic", requireAuth, async (req, res) => {
  try {
    const history = await DependencyHistoryModel.findOne({ user: req.user.id });
    const alternatives = (history?.alternativePathsTaken || []).filter((p) => (p.path || []).includes(req.params.topic));
    res.status(200).json({
      topic: req.params.topic,
      alternatives,
      note: "Alternative paths are valid and often successful."
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/propagation-history", requireAuth, async (req, res) => {
  try {
    const history = await PropagationHistoryModel.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(50);
    res.status(200).json({ history });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/unlocks/:topic", requireAuth, async (req, res) => {
  try {
    const doc = await TopicDependencyModel.findOne({ topic: req.params.topic });
    if (!doc) return res.status(404).json({ error: "Topic not found" });
    res.status(200).json({ topic: doc.topic, unlocksTopics: doc.unlocksTopics || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/role/:role", requireAuth, async (req, res) => {
  try {
    const role = req.params.role;
    const graph = await getRoleGraph(role);
    res.status(200).json({ role, graph });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/propagate/:topic", requireAuth, async (req, res) => {
  try {
    const topic = req.params.topic;
    const previousMastery = Number(req.body.previousMastery || 0);
    const newMastery = Number(req.body.newMastery || 0);

    const result = await onMasteryImprovement(req.user.id, topic, previousMastery, newMastery);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/history/snapshot", requireAuth, async (req, res) => {
  try {
    const stats = await TopicStatModel.find({ user: req.user.id }).sort({ masteryScore: -1 }).limit(20);
    res.status(200).json({
      userId: req.user.id,
      generatedAt: new Date(),
      topics: stats.map((s) => ({ topic: s.topic, masteryScore: s.masteryScore }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = { dependenciesRouter: router };
