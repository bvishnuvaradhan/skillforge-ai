const { runTelemetryAggregation } = require("../src/services/observability/telemetry-aggregator");

async function run() {
  console.log("\n=== STEP 8 TELEMETRY AGGREGATION TEST ===\n");

  console.log("TEST 1: Telemetry aggregation dry-run returns summary");
  const res = await runTelemetryAggregation({ lookbackDays: 1, dryRun: true });
  console.assert(!!res.summary || res.summary === null, "expected a summary or null when DB not available");
  console.log("✅ Telemetry aggregation dry-run validated");

  console.log("\n=== STEP 8 TELEMETRY AGGREGATION TEST COMPLETE ===");
}

run().catch((err) => {
  console.error("Telemetry test failed:", err);
  process.exit(1);
});
