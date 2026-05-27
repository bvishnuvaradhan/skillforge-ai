// MentorTrustMetrics - Track mentor performance and quality
// Used in admin console to validate mentor before Phase 5.3+ gates pass

export class MentorTrustMetrics {
  constructor() {
    this.metrics = {
      totalResponses: 0,
      userRatings: [],
      confidenceScores: [],
      uncertaintyDisclaimer usage: 0,
      governanceViolations: 0,
      averageResponseTime: 0,
      userSatisfaction: 0, // 0-100
      responseQuality: 0, // 0-100
      trustScore: 0.5, // 0-1 overall trust
      tone violations: [] // Track any tone issues
    };

    this.history = [];
    this.loadFromStorage();
  }

  // Record a mentor response
  recordResponse(response, userFeedback = null) {
    this.metrics.totalResponses++;

    // Track confidence
    if (response.confidence) {
      this.metrics.confidenceScores.push(response.confidence);
    }

    // Track uncertainty communication
    if (response.uncertainty && response.uncertainty.level !== 'none') {
      this.metrics.uncertaintyDisclaimer usage++;
    }

    // Track user rating if provided
    if (userFeedback?.rating) {
      this.metrics.userRatings.push(userFeedback.rating); // 1-5 stars
    }

    // Check for tone issues
    const toneIssues = this.analyzeTone(response.message);
    if (toneIssues.length > 0) {
      this.metrics.toneViolations.push({
        timestamp: Date.now(),
        issues: toneIssues,
        responseId: response.id
      });
    }

    // Add to history
    this.history.push({
      timestamp: Date.now(),
      response,
      feedback: userFeedback,
      toneIssues
    });

    // Recalculate trust score
    this.recalculateTrustScore();
    this.saveToStorage();
  }

  // Analyze response for tone issues
  analyzeTone(message) {
    const issues = [];

    const guiltyWords = ['guilt', 'shame', 'failed', 'wasted', 'lost'];
    const pressureWords = ['must', 'have to', 'urgent', 'critical', 'immediately'];
    const manipulativePatterns = ['everyone', 'best', 'only way', 'guaranteed'];

    guiltyWords.forEach((word) => {
      if (message.toLowerCase().includes(word)) {
        issues.push(`Guilt-inducing: "${word}"`);
      }
    });

    pressureWords.forEach((word) => {
      if (message.toLowerCase().includes(word)) {
        issues.push(`Pressure-inducing: "${word}"`);
      }
    });

    manipulativePatterns.forEach((pattern) => {
      if (message.toLowerCase().includes(pattern)) {
        issues.push(`Manipulative pattern: "${pattern}"`);
      }
    });

    return issues;
  }

  // Record governance violation
  recordGovernanceViolation(violationType, details) {
    this.metrics.governanceViolations++;
    this.history.push({
      timestamp: Date.now(),
      type: 'governance_violation',
      violationType,
      details
    });

    this.recalculateTrustScore();
    this.saveToStorage();
  }

  // Recalculate overall trust score
  recalculateTrustScore() {
    let score = 0.5;

    // Confidence consistency (0.2 points)
    if (this.metrics.confidenceScores.length > 0) {
      const avgConfidence =
        this.metrics.confidenceScores.reduce((a, b) => a + b, 0) /
        this.metrics.confidenceScores.length;
      // Prefer 0.6-0.8 confidence (not too high, not too low)
      if (avgConfidence >= 0.6 && avgConfidence <= 0.8) {
        score += 0.2;
      } else if (avgConfidence >= 0.5 && avgConfidence <= 0.9) {
        score += 0.1;
      }
    }

    // Uncertainty communication (0.2 points)
    const uncertaintyRate = this.metrics.uncertaintyDisclaimer usage / Math.max(this.metrics.totalResponses, 1);
    if (uncertaintyRate > 0.7) {
      score += 0.2; // Communicates uncertainty well
    } else if (uncertaintyRate > 0.4) {
      score += 0.1;
    }

    // User satisfaction (0.3 points)
    if (this.metrics.userRatings.length > 0) {
      const avgRating =
        this.metrics.userRatings.reduce((a, b) => a + b, 0) /
        this.metrics.userRatings.length;
      const satisfaction = (avgRating / 5) * 100;
      this.metrics.userSatisfaction = Math.round(satisfaction);

      if (satisfaction >= 80) {
        score += 0.3;
      } else if (satisfaction >= 60) {
        score += 0.2;
      } else if (satisfaction >= 40) {
        score += 0.1;
      }
    }

    // Tone compliance (0.2 points)
    const toneViolationRate = this.metrics.toneViolations.length / Math.max(this.metrics.totalResponses, 1);
    if (toneViolationRate === 0) {
      score += 0.2;
    } else if (toneViolationRate < 0.05) {
      score += 0.1;
    }

    // Governance compliance (0.1 points)
    if (this.metrics.governanceViolations === 0) {
      score += 0.1;
    }

    this.metrics.trustScore = Math.min(Math.max(score, 0), 1);
  }

  // Get metrics for display
  getMetrics() {
    return {
      ...this.metrics,
      averageConfidence: this.metrics.confidenceScores.length > 0
        ? (this.metrics.confidenceScores.reduce((a, b) => a + b, 0) /
            this.metrics.confidenceScores.length).toFixed(2)
        : 'N/A',
      uncertaintyRate: (
        (this.metrics.uncertaintyDisclaimer usage / Math.max(this.metrics.totalResponses, 1)) * 100
      ).toFixed(1),
      toneViolationRate: (
        (this.metrics.toneViolations.length / Math.max(this.metrics.totalResponses, 1)) * 100
      ).toFixed(1),
      trustStatus: this.getTrustStatus()
    };
  }

  // Get human-readable trust status
  getTrustStatus() {
    const score = this.metrics.trustScore;

    if (score >= 0.9) return '🟢 Excellent';
    if (score >= 0.8) return '🟢 Good';
    if (score >= 0.7) return '🟡 Acceptable';
    if (score >= 0.6) return '🟡 Caution';
    return '🔴 Needs Improvement';
  }

  // Check if gate criteria are met
  canPassGate() {
    return {
      trustScoreOK: this.metrics.trustScore >= 0.7,
      satisfactionOK: this.metrics.userSatisfaction >= 60 || this.metrics.userRatings.length === 0,
      governanceOK: this.metrics.governanceViolations === 0,
      toneOK: (this.metrics.toneViolations.length / Math.max(this.metrics.totalResponses, 1)) < 0.05,
      overallPass: this.metrics.trustScore >= 0.7 &&
                    (this.metrics.userSatisfaction >= 60 || this.metrics.userRatings.length === 0) &&
                    this.metrics.governanceViolations === 0
    };
  }

  // Get gate status for display
  getGateStatus() {
    const criteria = this.canPassGate();

    return {
      trustScore: {
        name: 'Trust Score',
        required: '≥ 0.7',
        actual: this.metrics.trustScore.toFixed(2),
        pass: criteria.trustScoreOK
      },
      satisfaction: {
        name: 'User Satisfaction',
        required: '≥ 60% or N/A',
        actual: `${this.metrics.userSatisfaction}%`,
        pass: criteria.satisfactionOK
      },
      governance: {
        name: 'Governance Violations',
        required: '0',
        actual: this.metrics.governanceViolations,
        pass: criteria.governanceOK
      },
      tone: {
        name: 'Tone Compliance',
        required: '< 5% violations',
        actual: `${((this.metrics.toneViolations.length / Math.max(this.metrics.totalResponses, 1)) * 100).toFixed(1)}%`,
        pass: criteria.toneOK
      },
      overallStatus: criteria.overallPass ? '✅ GATE PASS' : '⏳ CONTINUE MONITORING'
    };
  }

  // Get recent responses
  getRecentResponses(count = 10) {
    return this.history.slice(-count).reverse();
  }

  // Export data to JSON
  exportData() {
    return {
      metrics: this.metrics,
      history: this.history,
      timestamp: Date.now()
    };
  }

  // Save to localStorage
  saveToStorage() {
    try {
      localStorage.setItem(
        'mentor_trust_metrics',
        JSON.stringify({ metrics: this.metrics, history: this.history })
      );
    } catch (error) {
      console.warn('Failed to save trust metrics:', error);
    }
  }

  // Load from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem('mentor_trust_metrics');
      if (stored) {
        const data = JSON.parse(stored);
        this.metrics = { ...this.metrics, ...data.metrics };
        this.history = data.history || [];
      }
    } catch (error) {
      console.warn('Failed to load trust metrics:', error);
    }
  }

  // Reset metrics (for testing)
  reset() {
    this.metrics = {
      totalResponses: 0,
      userRatings: [],
      confidenceScores: [],
      uncertaintyDisclaimer usage: 0,
      governanceViolations: 0,
      userSatisfaction: 0,
      responseQuality: 0,
      trustScore: 0.5,
      toneViolations: []
    };
    this.history = [];
    this.saveToStorage();
  }
}

export default MentorTrustMetrics;
