const { runCompaction } = require("../src/services/observability/compaction-job");

async function run() {
  console.log("\n=== STEP 8 COMPACTION TEST ===\n");

  console.log("TEST 1: Compaction dry-run returns summary array");
  const res = await runCompaction({ olderThanDays: 1, dryRun: true });
  console.assert(Array.isArray(res.summary), "expected summary array from compaction");
  console.log("✅ Compaction dry-run validated");

  console.log("\n=== STEP 8 COMPACTION TEST COMPLETE ===");
}

run().catch((err) => {
  console.error("Compaction test failed:", err);
  process.exit(1);
});
