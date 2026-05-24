const { z } = require("zod");

const candidateSchema = z.object({
  _id: z.any().optional(),
  topic: z.string().min(1),
  type: z.string().min(1),
  urgencyScore: z.number().min(0).max(100),
  impactScore: z.number().min(0).max(100),
  reason: z.string().optional(),
  evidence: z.any().optional(),
  sourceAlgorithm: z.string().optional()
});

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, Number(value || 0)));
}

function inferSourceEngine(candidate) {
  if (["revision", "weak-topic"].includes(candidate.type)) return "decay";
  if (candidate.type === "exploration") return "dependency";
  if (String(candidate.sourceAlgorithm || "").toLowerCase().includes("dna")) return "dna";
  if (candidate.type === "difficulty-increase") return "momentum";
  return "review_timing";
}

function normalizeSignals(candidates) {
  const normalized = [];
  const failures = [];

  for (const candidate of candidates || []) {
    const parsed = candidateSchema.safeParse(candidate);
    if (!parsed.success) {
      failures.push({
        recommendationId: candidate?._id,
        topic: candidate?.topic,
        error: parsed.error.message
      });
      continue;
    }

    const sourceEngine = inferSourceEngine(candidate);
    const confidence = clamp(candidate.evidence?.confidence?.score || 70, 0, 100);

    normalized.push({
      ...candidate,
      sourceEngine,
      urgency: clamp(candidate.urgencyScore, 0, 100),
      impact: clamp(candidate.impactScore, 0, 100),
      confidence,
      dependencyImportance: clamp(candidate.metrics?.dependencyStrength ? candidate.metrics.dependencyStrength * 100 : 50, 0, 100),
      diversityAdjustment: clamp(candidate.type === "exploration" ? 8 : 0, -20, 20),
      hardFlags: {
        criticalDecay: candidate.type === "revision" && candidate.urgencyScore >= 80,
        foundationRisk: candidate.type === "weak-topic",
        contradictionRisk: false,
        fatigueRisk: false
      },
      governance: {
        topicCooldownHours: 24,
        globalCooldownHours: 8,
        maxDailyDisplays: 3
      },
      explainability: {
        summary: candidate.reason || "Recommendation generated",
        evidence: candidate.evidence || {},
        caveats: ["This is probabilistic guidance, not a guarantee."]
      }
    });
  }

  return { normalized, failures };
}

module.exports = {
  normalizeSignals,
  candidateSchema,
  clamp
};
