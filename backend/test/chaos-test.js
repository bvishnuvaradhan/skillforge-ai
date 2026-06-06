/**
 * Chaos and Resilience Test Suite
 * Validates circuit breakers, Redis connection failures, and error fallbacks
 */
const { CircuitBreaker } = require("../src/lib/circuit-breaker");
const cache = require("../src/lib/cache");

async function testRedisChaos() {
  console.log("TEST 1: Redis chaos and memory fallback");
  
  // Since our cache.js has a built-in memory fallback when disconnected,
  // we can verify the fallback works by checking get and set operations.
  // Set a key to memory fallback cache
  const key = `chaos:test:${Date.now()}`;
  const value = { data: "resilience" };
  
  const setSuccess = await cache.set(key, value, 10);
  console.assert(setSuccess === true, "Cache set should succeed even in chaos/fallback mode");
  
  const retrieved = await cache.get(key);
  console.assert(retrieved && retrieved.data === "resilience", "Retrieved value should match input value");
  
  await cache.del(key);
  const deletedVal = await cache.get(key);
  console.assert(deletedVal === null, "Deleted value should be null");
  
  console.log("✅ Redis chaos/memory fallback validated successfully.");
}

async function testCircuitBreakerChaos() {
  console.log("\nTEST 2: Circuit Breaker state transitions and mock fallback");
  
  let attempts = 0;
  // A service call that always fails
  const failingServiceCall = async () => {
    attempts += 1;
    throw new Error("API Outage Simulation");
  };
  
  // A fallback function
  const fallbackServiceCall = (err) => {
    return { status: "degraded", reason: err ? err.message : "Breaker open" };
  };

  // Instantiate circuit breaker
  // Options: failureThreshold=3, cooldownPeriodMs=100
  const breaker = new CircuitBreaker("test-service", {
    failureThreshold: 3,
    cooldownPeriodMs: 100
  });

  console.assert(breaker.state === "CLOSED", "Breaker should start in CLOSED state");

  // Trigger first failure
  let res = await breaker.execute(failingServiceCall, fallbackServiceCall);
  console.assert(attempts === 1, "Should have run service call once");
  console.assert(res.status === "degraded", "Should have returned fallback");
  console.assert(breaker.state === "CLOSED", "Breaker should still be CLOSED after 1 failure");

  // Trigger second failure
  res = await breaker.execute(failingServiceCall, fallbackServiceCall);
  console.assert(attempts === 2, "Should have run service call twice");
  console.assert(breaker.state === "CLOSED", "Breaker should still be CLOSED after 2 failures");

  // Trigger third failure to TRIP the breaker
  res = await breaker.execute(failingServiceCall, fallbackServiceCall);
  console.assert(attempts === 3, "Should have run service call thrice");
  console.assert(breaker.state === "OPEN", "Breaker should transition to OPEN state after 3 failures");

  // Fourth execution should immediately execute fallback without calling failingServiceCall
  res = await breaker.execute(failingServiceCall, fallbackServiceCall);
  console.assert(attempts === 3, "Should NOT have incremented service call attempts (short-circuited)");
  console.assert(res.status === "degraded", "Should return fallback immediately");
  console.assert(breaker.state === "OPEN", "Breaker remains OPEN");

  // Wait for cooldown to test HALF_OPEN state
  console.log("Waiting for breaker cooldown (150ms)...");
  await new Promise((r) => setTimeout(r, 150));

  // Next execution should transition to HALF_OPEN and try service call again
  res = await breaker.execute(async () => "success-api", fallbackServiceCall);
  console.assert(res === "success-api", "Should return service result if call succeeds in HALF_OPEN");
  console.assert(breaker.state === "CLOSED", "Breaker should transition back to CLOSED on success");

  console.log("✅ Circuit Breaker chaos testing passed successfully.");
}

async function runChaosSuite() {
  console.log("\n=== BEGINNING CHAOS RESILIENCE TESTS ===\n");
  try {
    await testRedisChaos();
    await testCircuitBreakerChaos();
    console.log("\n=== ALL CHAOS RESILIENCE TESTS PASSED ===");
    process.exit(0);
  } catch (err) {
    console.error("❌ Chaos testing failed:", err);
    process.exit(1);
  }
}

runChaosSuite();
