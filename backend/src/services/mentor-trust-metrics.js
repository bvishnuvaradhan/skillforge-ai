"use strict";
// Simple server-side MentorTrustMetrics service for Phase 5 tests.
// CommonJS module so backend tests can require it easily.

class MentorTrustMetrics {
  constructor(userId) {
    this.userId = userId || 'anon';
    this.metrics = {
      trustScore: 0.5,
      userSatisfaction: 0.5,
      governanceViolations: 0,
      toneViolationRate: 0.0,
      averageResponseTime: 1.0, // seconds
      totalResponses: 0,
      recentResponses: []
    };
  }

  // Record a response and optional user feedback object {satisfaction, toneViolations, governanceViolation, responseTime}
  recordResponse(response, userFeedback = {}) {
    const r = {
      timestamp: Date.now(),
      response: response || null,
      satisfaction: typeof userFeedback.satisfaction === 'number' ? userFeedback.satisfaction : null,
      toneViolations: typeof userFeedback.toneViolations === 'number' ? userFeedback.toneViolations : 0,
      governanceViolation: !!userFeedback.governanceViolation,
      responseTime: typeof userFeedback.responseTime === 'number' ? userFeedback.responseTime : null
    };

    this.metrics.recentResponses.unshift(r);
    if (this.metrics.recentResponses.length > 200) this.metrics.recentResponses.pop();

    this.metrics.totalResponses += 1;

    if (r.satisfaction != null) {
      // exponentially-weighted moving average for user satisfaction
      const alpha = 0.2;
      this.metrics.userSatisfaction = (alpha * r.satisfaction) + (1 - alpha) * this.metrics.userSatisfaction;
    }

    if (r.toneViolations) {
      // count per response -> keep a rolling rate across recentResponses
      const violations = this.metrics.recentResponses.reduce((acc, x) => acc + (x.toneViolations || 0), 0);
      const denom = Math.max(1, this.metrics.recentResponses.length);
      this.metrics.toneViolationRate = violations / denom;
    }

    if (r.governanceViolation) this.metrics.governanceViolations += 1;

    if (r.responseTime != null) {
      // simple moving average
      const prev = this.metrics.averageResponseTime || 0;
      this.metrics.averageResponseTime = (prev * Math.min(this.metrics.totalResponses - 1, 20) + r.responseTime) / Math.min(this.metrics.totalResponses, 21);
    }

    this.recalculateTrustScore();
    return r;
  }

  recalculateTrustScore() {
    // Combine signals into a single trust score in [0,1]. Tunable weights.
    const sat = clamp01(this.metrics.userSatisfaction);
    const tone = 1 - clamp01(this.metrics.toneViolationRate); // higher is better
    const gov = clamp01(1 - Math.min(this.metrics.governanceViolations / 5, 1));
    // normalize average response time into [0,1], assuming 0.2s is excellent, 5s is poor
    const artNorm = 1 - clamp01((this.metrics.averageResponseTime - 0.2) / (5 - 0.2));

    const w = { sat: 0.5, tone: 0.2, gov: 0.2, art: 0.1 };
    const score = (w.sat * sat) + (w.tone * tone) + (w.gov * gov) + (w.art * artNorm);
    this.metrics.trustScore = clamp01(score);
    return this.metrics.trustScore;
  }

  getMetrics() {
    // return a shallow copy to avoid accidental mutation
    return Object.assign({}, this.metrics, { recentResponses: this.metrics.recentResponses.slice(0, 50) });
  }

  getGateStatus() {
    const criteria = {
      trustScore: this.metrics.trustScore >= 0.7,
      userSatisfaction: this.metrics.userSatisfaction >= 0.6,
      governanceViolations: this.metrics.governanceViolations === 0,
      toneViolationRate: this.metrics.toneViolationRate < 0.05
    };
    const allPass = Object.values(criteria).every(Boolean);
    return { criteria, allPass };
  }

  canPassGate() {
    return this.getGateStatus().allPass;
  }

  reset() {
    this.metrics = {
      trustScore: 0.5,
      userSatisfaction: 0.5,
      governanceViolations: 0,
      toneViolationRate: 0.0,
      averageResponseTime: 1.0,
      totalResponses: 0,
      recentResponses: []
    };
  }
}

function clamp01(v) {
  if (Number.isFinite(v) === false) return 0;
  return Math.max(0, Math.min(1, v));
}

// Simple singleton registry per user for tests / short-lived server
const registry = new Map();

function getForUser(userId) {
  const id = String(userId || 'anon');
  if (!registry.has(id)) registry.set(id, new MentorTrustMetrics(id));
  return registry.get(id);
}

module.exports = {
  MentorTrustMetrics,
  getForUser
};
