/**
 * Generic Circuit Breaker implementation for external network calls (Mistral, GitHub, etc.)
 */
class CircuitBreaker {
  constructor(name, options = {}) {
    this.name = name;
    this.failureThreshold = options.failureThreshold || 5; // Max failures before trip
    this.cooldownPeriodMs = options.cooldownPeriodMs || 15000; // 15 seconds cooldown
    
    this.state = "CLOSED"; // CLOSED, OPEN, HALF_OPEN
    this.failureCount = 0;
    this.lastStateChange = Date.now();
  }

  /**
   * Executes the asynchronous action wrapped in the circuit breaker
   */
  async execute(action, fallback) {
    if (this.state === "OPEN") {
      const now = Date.now();
      if (now - this.lastStateChange > this.cooldownPeriodMs) {
        this.transitionTo("HALF_OPEN");
      } else {
        console.warn(`[CircuitBreaker:${this.name}] Breaker is OPEN. Failing fast and running fallback.`);
        return typeof fallback === "function" ? fallback() : fallback;
      }
    }

    try {
      const result = await action();
      if (this.state === "HALF_OPEN") {
        this.transitionTo("CLOSED");
      }
      return result;
    } catch (error) {
      this.handleFailure();
      console.error(`[CircuitBreaker:${this.name}] Attempt failed:`, error.message);
      return typeof fallback === "function" ? fallback(error) : fallback;
    }
  }

  handleFailure() {
    this.failureCount++;
    console.warn(`[CircuitBreaker:${this.name}] Failure count: ${this.failureCount}/${this.failureThreshold}`);
    
    if (this.state === "CLOSED" && this.failureCount >= this.failureThreshold) {
      this.transitionTo("OPEN");
    } else if (this.state === "HALF_OPEN") {
      this.transitionTo("OPEN");
    }
  }

  transitionTo(newState) {
    console.log(`[CircuitBreaker:${this.name}] State transition: ${this.state} -> ${newState}`);
    this.state = newState;
    this.lastStateChange = Date.now();
    if (newState === "CLOSED") {
      this.failureCount = 0;
    }
  }
}

const registry = new Map();

/**
 * Gets or creates a circuit breaker instance by name
 */
function getBreaker(name, options = {}) {
  if (!registry.has(name)) {
    registry.set(name, new CircuitBreaker(name, options));
  }
  return registry.get(name);
}

module.exports = { CircuitBreaker, getBreaker };
