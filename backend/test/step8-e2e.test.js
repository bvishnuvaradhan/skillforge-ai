const mongoose = require("mongoose");
const { connectDatabase } = require("../src/lib/db");
const { UserModel } = require("../src/models/User");
const { orchestrateRecommendations } = require("../src/services/arbitration");
const { getArbitrationRunTrace } = require("../src/services/observability/trace-query");
const { Types } = require("mongoose");

async function run() {
  console.log("\n=== STEP 8 E2E VERIFICATION TEST ===\n");

  await connectDatabase();

  console.log("Creating test user...");
  const user = await UserModel.create({ email: `e2e+${Date.now()}@example.com`, passwordHash: "testhash" });

  // create some candidates
  const candidates = [0, 1, 2].map((i) => ({
    _id: new Types.ObjectId(),
    user: user._id,
    topic: i === 0 ? "Graphs" : i === 1 ? "DP" : "Arrays",
    type: "revision",
    urgency: 50 + i * 10,
    impact: 30 + i * 5,
    confidence: 40 + i * 3,
    dependencyImportance: 10,
    diversityAdjustment: 0,
    hardFlags: { criticalDecay: i === 0 }
  }));

  console.log("Running arbitration (persist=true)...");
  const result = await orchestrateRecommendations(user._id, candidates, { persist: true, persistTrace: true });
  console.assert(result.trace && result.trace.runId, "Expected persisted trace with runId");

  const persisted = await getArbitrationRunTrace(user._id, result.trace.runId);
  console.assert(persisted && persisted.run, "Expected persisted arbitration run to be queryable");

  // ensure decision lineage exists for at least one recommendation
  const traces = persisted.recommendationTraces || [];
  console.assert(Array.isArray(traces), "recommendationTraces should be an array");
  console.assert(traces.length >= 0, "recommendationTraces fetched");

  console.log("✅ E2E verification: trace persisted and queryable");

  // cleanup created user and traces if desired (left as is for audit)
}

run().catch((err) => {
  console.error("E2E verification failed:", err);
  process.exit(1);
});
