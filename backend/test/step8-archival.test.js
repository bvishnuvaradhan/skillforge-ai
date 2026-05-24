const { runArchival } = require("../src/services/observability/archival-job");

async function run() {
  console.log("\n=== STEP 8 ARCHIVAL TEST ===\n");

  console.log("TEST 1: Archival dry-run reports candidate count");
  const result = await runArchival({ dryRun: true, retentionDays: 1 });
  console.assert(typeof result.candidates === "number", "expected numeric candidate count");
  console.log("✅ Archival dry-run validated");

  console.log("\n=== STEP 8 ARCHIVAL TEST COMPLETE ===");
}

run().catch((err) => {
  console.error("Archival test failed:", err);
  process.exit(1);
});
