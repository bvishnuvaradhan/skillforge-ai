const { registerConsumer, unregisterAllConsumers } = require("../src/services/events/event-consumer");
const { emitEvent } = require("../src/services/events/event-producer");
const { EVENT_TYPES } = require("../src/services/events/event-types");

async function run() {
  console.log("\n=== STEP 8 EVENT IDEMPOTENCY TEST ===\n");

  console.log("TEST 1: Duplicate events (same idempotency key) are ignored");
  let runCount = 0;
  registerConsumer(EVENT_TYPES.ArbitrationCompleted, "IdempoTest", async (event) => {
    runCount += 1;
  });

  emitEvent(EVENT_TYPES.ArbitrationCompleted, { runId: "r1" }, { idempotencyKey: "k1", sequence: 1, userId: "u1" });
  emitEvent(EVENT_TYPES.ArbitrationCompleted, { runId: "r1" }, { idempotencyKey: "k1", sequence: 1, userId: "u1" });
  await new Promise((r) => setTimeout(r, 20));
  console.assert(runCount === 1, `expected consumer to run once, ran ${runCount} times`);
  console.log("✅ Duplicate event ignored");

  unregisterAllConsumers();

  console.log("TEST 2: Out-of-order sequence events are dropped");
  let seqCount = 0;
  registerConsumer(EVENT_TYPES.ArbitrationCompleted, "SeqTest", async (event) => {
    seqCount += 1;
  });

  // emit higher sequence first
  emitEvent(EVENT_TYPES.ArbitrationCompleted, { runId: "r2" }, { idempotencyKey: "s1", sequence: 3, userId: "u2" });
  // then a stale lower sequence
  emitEvent(EVENT_TYPES.ArbitrationCompleted, { runId: "r2" }, { idempotencyKey: "s2", sequence: 2, userId: "u2" });
  await new Promise((r) => setTimeout(r, 20));
  console.assert(seqCount === 1, `expected only first sequence to be processed, got ${seqCount}`);
  console.log("✅ Out-of-order stale sequence dropped");

  unregisterAllConsumers();

  console.log("\n=== STEP 8 EVENT IDEMPOTENCY TEST COMPLETE ===");
}

run().catch((err) => {
  console.error("Event idempotency test failed:", err);
  process.exit(1);
});
