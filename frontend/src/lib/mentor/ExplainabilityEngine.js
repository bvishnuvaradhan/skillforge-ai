// ExplainabilityEngine - Generate contextual explanations for system decisions
// Core principle: Always communicate uncertainty, never fake authority

export class ExplainabilityEngine {
  constructor() {
    this.explanationCache = new Map();
    this.cacheExpiry = 5 * 60 * 1000; // 5 minutes
  }

  // Generate explanation based on question type + context
  async generateExplanation(questionType, context) {
    const cacheKey = `${questionType}:${JSON.stringify(context)}`;

    // Check cache
    const cached = this.explanationCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
      return cached.data;
    }

    let explanation;

    switch (questionType) {
      case 'recommendation':
        explanation = this.explainRecommendation(context);
        break;
      case 'roadmap':
        explanation = this.explainRoadmap(context);
        break;
      case 'dependency':
        explanation = this.explainDependency(context);
        break;
      case 'retention':
        explanation = this.explainRetention(context);
        break;
      case 'forecast':
        explanation = this.explainForecast(context);
        break;
      case 'governance':
        explanation = this.explainGovernance(context);
        break;
      default:
        explanation = this.defaultExplanation();
    }

    // Cache result
    this.explanationCache.set(cacheKey, {
      data: explanation,
      timestamp: Date.now()
    });

    return explanation;
  }

  // Explain why a specific recommendation was made
  explainRecommendation(context) {
    const { recommendation, userData, mastery, dependencies } = context;

    const dataPoints = [];
    const confidence = this.calculateConfidence(context);
    const uncertainty = this.calculateUncertainty(context);

    // Build evidence
    if (mastery && mastery[recommendation.topic]) {
      dataPoints.push(
        `Your mastery of ${recommendation.topic} is at ${(mastery[recommendation.topic] * 100).toFixed(0)}%`
      );
    }

    if (dependencies && dependencies.length > 0) {
      dataPoints.push(
        `This topic depends on: ${dependencies.join(', ')}`
      );
    }

    if (recommendation.rationale) {
      dataPoints.push(recommendation.rationale);
    }

    return {
      type: 'RecommendationExplanation',
      message: this.buildRecommendationMessage(recommendation, confidence),
      confidence,
      uncertainty: {
        level: uncertainty.level,
        reason: uncertainty.reason,
        disclaimer: uncertainty.disclaimer
      },
      reasoning: {
        dataPoints,
        governanceApplied: context.governance || [],
        alternatives: this.generateAlternatives(context)
      },
      linkedTo: {
        topic: recommendation.topic,
        recommendation: recommendation.id
      }
    };
  }

  // Explain roadmap structure
  explainRoadmap(context) {
    const { roadmap, mastery, userDNA } = context;

    const confidence = 0.8; // Roadmap is well-structured
    const uncertainty = {
      level: 'low',
      reason: 'Roadmap based on proven learning sequences',
      disclaimer: 'Your individual path may vary based on goals'
    };

    const dataPoints = [];

    if (userDNA) {
      dataPoints.push(`Your learning style: ${userDNA.type}`);
      dataPoints.push(`Preferred approach: ${userDNA.focusStyle}`);
    }

    if (roadmap && roadmap.nodes) {
      dataPoints.push(
        `Roadmap has ${roadmap.nodes.length} topics sequenced by dependency`
      );
    }

    return {
      type: 'RoadmapExplanation',
      message: 'Your learning roadmap is personalized based on your mastery and learning style.',
      confidence,
      uncertainty,
      reasoning: {
        dataPoints,
        governanceApplied: [],
        alternatives: [
          'Breadth-first exploration (learn many topics shallowly first)',
          'Weakness-focused path (remediate struggling areas first)',
          'Custom sequencing (choose your own order)'
        ]
      }
    };
  }

  // Explain dependency relationships
  explainDependency(context) {
    const { topic, prerequisite, masteryGap } = context;

    const confidence = 0.9; // Dependencies well-defined
    const uncertainty = {
      level: 'low',
      reason: 'Prerequisite relationships verified by expert mapping',
      disclaimer: 'If you have prior knowledge, you may skip prerequisites'
    };

    const dataPoints = [
      `${prerequisite} is a prerequisite for ${topic}`,
      `Your mastery of ${prerequisite}: ${masteryGap ? `${masteryGap}% below recommended` : '✓ Sufficient'}`
    ];

    if (masteryGap && masteryGap > 30) {
      dataPoints.push('Recommend reinforcing prerequisite before continuing');
    }

    return {
      type: 'DependencyExplanation',
      message: `${prerequisite} builds foundations needed for ${topic}. Learning both in sequence is more efficient.`,
      confidence,
      uncertainty,
      reasoning: {
        dataPoints,
        governanceApplied: [],
        alternatives: [
          'Skip prerequisite and try the main topic',
          'Learn them in parallel',
          'Reinforce prerequisite after main topic'
        ]
      }
    };
  }

  // Explain why retention is declining
  explainRetention(context) {
    const { topic, retentionRate, daysSincePractice, decayRate } = context;

    const daysSince = daysSincePractice || 7;
    const expectedDays = Math.round(1 / (decayRate || 0.15)); // Days until 50% retention

    const uncertainty = this.calculateDecayUncertainty(daysSince, expectedDays);

    const dataPoints = [
      `Current retention: ${(retentionRate * 100).toFixed(0)}%`,
      `Days since last practice: ${daysSince}`,
      `Expected half-life: ~${expectedDays} days`
    ];

    return {
      type: 'RetentionExplanation',
      message: `Your retention of ${topic} is declining through natural forgetting. Spaced reinforcement helps recover it.`,
      confidence: 0.85,
      uncertainty,
      reasoning: {
        dataPoints,
        governanceApplied: ['Spaced repetition policy'],
        alternatives: [
          'Practice immediately (best recovery)',
          'Wait 1-2 days then practice (still effective)',
          'Reinforce with related topics first'
        ]
      }
    };
  }

  // Explain mastery forecast
  explainForecast(context) {
    const { topic, currentMastery, projectedMastery, timeHorizon, activityData } = context;

    const improving = projectedMastery > currentMastery;
    const changePercent = ((projectedMastery - currentMastery) * 100).toFixed(0);

    const uncertainty = {
      level: 'moderate',
      reason: `Forecast based on ${timeHorizon || '7'}-day activity pattern. Changes in effort will affect outcome.`,
      disclaimer: 'This is a prediction based on current trajectory. Your effort level matters most.'
    };

    const dataPoints = [
      `Current mastery: ${(currentMastery * 100).toFixed(0)}%`,
      `Projected mastery in ${timeHorizon || '7'} days: ${(projectedMastery * 100).toFixed(0)}%`,
      improving ? `Expected improvement: +${changePercent}%` : `Expected decline: ${changePercent}%`
    ];

    if (activityData) {
      dataPoints.push(`Recent activity: ${activityData.sessionsPerWeek || 0} sessions/week`);
    }

    return {
      type: 'ForecastExplanation',
      message: improving
        ? `Based on your current activity, you're on track to improve ${topic}.`
        : `Your practice on ${topic} may decline if activity doesn't increase.`,
      confidence: 0.75,
      uncertainty,
      reasoning: {
        dataPoints,
        governanceApplied: [],
        alternatives: [
          'Increase practice frequency to improve faster',
          'Maintain current pace (steady growth)',
          'Focus on other topics for now'
        ]
      }
    };
  }

  // Explain governance policies
  explainGovernance(context) {
    const { policyType, reason, affectedRecommendation } = context;

    const explanations = {
      cooldown: `This recommendation is on cooldown to prevent over-learning the same topic too quickly. Spaced repetition is more effective than massed practice.`,
      readiness: `This recommendation requires higher mastery of prerequisites. Build foundation first, then tackle this.`,
      stability: `System is being conservative to maintain learning stability. Try this when your recent performance stabilizes.`,
      capacity: `You're at recommended daily learning capacity. Additional practice today may reduce effectiveness.`
    };

    return {
      type: 'GovernanceExplanation',
      message: explanations[policyType] || 'A governance policy is preventing this recommendation right now.',
      confidence: 0.95,
      uncertainty: {
        level: 'low',
        reason: 'Policy is rule-based and deterministic',
        disclaimer: 'Policies exist to optimize your learning outcomes'
      },
      reasoning: {
        dataPoints: [
          `Policy type: ${policyType}`,
          `Reason: ${reason || 'Optimize learning'}`
        ],
        governanceApplied: [policyType],
        alternatives: [
          'Wait for policy to expire',
          'Focus on different topic',
          'Review prerequisites'
        ]
      }
    };
  }

  // Helper: Calculate confidence based on data completeness
  calculateConfidence(context) {
    let confidence = 0.5;
    const { mastery, userData, dependencies, activityData } = context;

    if (mastery && Object.keys(mastery).length > 5) confidence += 0.15;
    if (userData && userData.history && userData.history.length > 20) confidence += 0.15;
    if (dependencies && dependencies.length > 0) confidence += 0.1;
    if (activityData && activityData.sessionsPerWeek > 0) confidence += 0.15;

    return Math.min(confidence, 0.95);
  }

  // Helper: Calculate uncertainty metadata
  calculateUncertainty(context) {
    const { mastery, activityData, userData } = context;

    const dataGaps = [];
    if (!mastery || Object.keys(mastery).length < 5) dataGaps.push('limited mastery history');
    if (!activityData) dataGaps.push('recent activity data');
    if (!userData || !userData.history) dataGaps.push('user learning history');

    if (dataGaps.length > 2) {
      return {
        level: 'high',
        reason: `Limited data: ${dataGaps.join(', ')}`,
        disclaimer: 'More activity will improve recommendation quality'
      };
    }

    if (dataGaps.length > 0) {
      return {
        level: 'moderate',
        reason: `Some data gaps: ${dataGaps.join(', ')}`,
        disclaimer: 'Recommendation becomes more reliable with more data'
      };
    }

    return {
      level: 'low',
      reason: 'Recommendation based on solid data',
      disclaimer: ''
    };
  }

  // Helper: Calculate decay-specific uncertainty
  calculateDecayUncertainty(daysSince, expectedDays) {
    if (daysSince > expectedDays * 2) {
      return {
        level: 'high',
        reason: `Well past expected decay period (${expectedDays} days). High uncertainty in exact retention.`,
        disclaimer: 'Practice now will show actual retention level'
      };
    }

    if (daysSince > expectedDays) {
      return {
        level: 'moderate',
        reason: `Beyond expected decay half-life. Retention estimate is approximate.`,
        disclaimer: 'Actual retention will become clear upon practice'
      };
    }

    return {
      level: 'low',
      reason: 'Decay model is accurate within this timeframe',
      disclaimer: ''
    };
  }

  // Helper: Build readable recommendation message
  buildRecommendationMessage(recommendation, confidence) {
    const confidenceText = confidence > 0.85 ? 'I\'m confident' : 'I think';
    return `${confidenceText} that ${recommendation.topic} is your best next step. `;
  }

  // Helper: Generate alternative explanations
  generateAlternatives(context) {
    return [
      'Focus on different topic',
      'Reinforce previous topic',
      'Take a break and reflect'
    ];
  }

  // Default explanation for unknown question types
  defaultExplanation() {
    return {
      type: 'DefaultExplanation',
      message: 'I can explain recommendations, roadmap structure, topic dependencies, retention patterns, mastery forecasts, or governance policies. What would you like to understand?',
      confidence: 1.0,
      uncertainty: {
        level: 'none',
        reason: '',
        disclaimer: ''
      },
      reasoning: {
        dataPoints: [],
        governanceApplied: [],
        alternatives: []
      }
    };
  }

  // Clear cache (useful for testing or when user updates)
  clearCache() {
    this.explanationCache.clear();
  }

  // Cache invalidation on specific events
  invalidateCacheFor(pattern) {
    for (const [key] of this.explanationCache) {
      if (key.includes(pattern)) {
        this.explanationCache.delete(key);
      }
    }
  }
}

export default ExplainabilityEngine;
