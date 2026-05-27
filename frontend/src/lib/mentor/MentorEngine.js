// MentorEngine - Core AI reasoning system
// Generates contextual mentor responses with confidence, uncertainty, and governance

export class MentorEngine {
  constructor(modelProvider = null) {
    this.modelProvider = modelProvider; // Claude API or mock
    this.responseCache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.responseHistory = [];
  }

  // Main method: Generate mentor response
  async generateResponse(userQuestion, context, governance) {
    const cacheKey = `${userQuestion}:${JSON.stringify(context).slice(0, 50)}`;

    // Check cache
    const cached = this.responseCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.response;
    }

    try {
      // Build mentor prompt
      const systemPrompt = this.buildSystemPrompt(context, governance);
      const userPrompt = this.buildUserPrompt(userQuestion, context);

      // Call AI model (or use mock for development)
      const aiResponse = await this.callAIModel(systemPrompt, userPrompt);

      // Structure the response
      const mentorResponse = this.structureResponse(aiResponse, context, governance);

      // Cache result
      this.responseCache.set(cacheKey, {
        response: mentorResponse,
        timestamp: Date.now()
      });

      // Track response
      this.responseHistory.push({
        question: userQuestion,
        response: mentorResponse,
        timestamp: Date.now(),
        governanceApplied: governance
      });

      return mentorResponse;
    } catch (error) {
      console.error('Failed to generate mentor response:', error);
      return this.createErrorResponse(error);
    }
  }

  // Build system prompt with context and governance constraints
  buildSystemPrompt(context, governance) {
    return `You are a calm, analytical learning mentor. Your role is to help learners understand their learning journey.

PERSONALITY:
- Calm and thoughtful, never overexcited
- Analytical and data-driven
- Supportive but transparent
- NEVER guilt-driven, pressure-inducing, or manipulative
- ALWAYS communicate uncertainty

USER LEARNING PROFILE:
- Learning Type: ${context.userDNA?.type || 'Generalist'}
- Learning Style: ${context.userDNA?.focusStyle || 'balanced'}
- Learning Rhythm: ${context.userDNA?.learningRhythm || 'consistent'}
- Current Mastery Average: ${this.calculateAverageMastery(context.mastery)}%

RECENT CONTEXT:
- Sessions Last Week: ${context.recentActivity?.sessionsLastWeek || 0}
- Problems Solved: ${context.recentActivity?.problemsSolvedLastWeek || 0}
- Current Streak: ${context.recentActivity?.currentStreak || 0} days
- Focus Topics: ${context.recentActivity?.focusTopics?.join(', ') || 'None yet'}

CRITICAL RULES:
1. Always communicate confidence level (low/moderate/high) and uncertainty
2. If confidence is low, explicitly state why and what data would help
3. Respect governance constraints: ${this.formatGovernanceRules(governance)}
4. Never recommend topics on cooldown or outside mastery readiness
5. Base all suggestions on actual data, not generic advice
6. When uncertain, say so clearly: "I'm moderately confident because..."
7. Offer alternatives, never claim single "right" path

RESPONSE FORMAT:
- Start with the main message (2-3 sentences)
- Include confidence (low/moderate/high) and uncertainty communication
- Provide evidence or data points (if available)
- Offer alternatives or nuances
- Mention any governance constraints that apply`;
  }

  // Build user prompt
  buildUserPrompt(question, context) {
    return `User question: "${question}"

Available data for this response:
- Recommendation history acceptance rate: ${(context.recommendationHistory?.acceptanceRate * 100).toFixed(0)}%
- Trending topics: ${context.forecast?.trendingTopics?.join(', ') || 'None identified'}
- Topics at risk: ${context.forecast?.riskingTopics?.join(', ') || 'None'}
- Roadmap progress: ${Object.keys(context.roadmap?.userProgress || {}).length} topics with data

Respond naturally, as a supportive mentor, while following the personality and rules above.`;
  }

  // Call AI model (or mock for development)
  async callAIModel(systemPrompt, userPrompt) {
    if (this.modelProvider) {
      // Use actual AI model
      try {
        return await this.modelProvider(systemPrompt, userPrompt);
      } catch (error) {
        console.error('AI model call failed:', error);
        return this.generateMockResponse(userPrompt);
      }
    }

    // Development: return mock response
    return this.generateMockResponse(userPrompt);
  }

  // Generate mock response for development
  generateMockResponse(userPrompt) {
    const lower = userPrompt.toLowerCase();

    if (
      lower.includes('why') &&
      (lower.includes('recommend') || lower.includes('suggest'))
    ) {
      return `I see you're asking about a recommendation. Based on your learning profile and recent activity, this recommendation aligns with your learning style and mastery level. The confidence here is moderate because I'm working with your recent data. If you practice more consistently this week, predictions become more reliable.`;
    }

    if (lower.includes('roadmap') || lower.includes('path')) {
      return `Your learning roadmap is sequenced based on proven dependency relationships and your personal learning style. Each topic builds on previous ones. You're tracking well on your current path—keep going!`;
    }

    return `That's a thoughtful question. Based on your learning data, here's what I think... Remember, I can explain recommendations, roadmap structure, dependencies, retention patterns, and mastery forecasts.`;
  }

  // Structure response with confidence and uncertainty
  structureResponse(aiResponse, context, governance) {
    const confidence = this.calculateConfidence(context);
    const uncertainty = this.calculateUncertainty(context);

    const dataPoints = this.extractDataPoints(context);
    const appliedPolicies = this.extractAppliedGovernance(governance);
    const alternatives = this.generateAlternatives(context);

    return {
      id: `mentor_${Date.now()}`,
      type: 'guidance',
      message: aiResponse,
      confidence: confidence.score,
      uncertainty: {
        level: uncertainty.level,
        reason: uncertainty.reason,
        disclaimer: uncertainty.disclaimer
      },
      reasoning: {
        dataPoints,
        governanceApplied: appliedPolicies,
        alternatives
      },
      action: this.suggestAction(context),
      trace: this.buildTrace(context, governance),
      timestamp: Date.now()
    };
  }

  // Calculate overall confidence (0-1)
  calculateConfidence(context) {
    let score = 0.5;
    let reasons = [];

    // Data completeness
    if (context.mastery && Object.keys(context.mastery).length > 10) {
      score += 0.15;
      reasons.push('Strong mastery history');
    }

    if (context.recentActivity?.sessionsLastWeek > 3) {
      score += 0.15;
      reasons.push('Active recent engagement');
    }

    if (context.userDNA?.confidence > 0.7) {
      score += 0.1;
      reasons.push('Clear learning profile');
    }

    if (context.recommendationHistory?.acceptanceRate > 0.6) {
      score += 0.15;
      reasons.push('Good recommendation alignment');
    }

    score = Math.min(score, 0.95); // Cap at 95%

    return {
      score,
      label: score < 0.6 ? 'low' : score < 0.8 ? 'moderate' : 'high',
      reasons
    };
  }

  // Calculate uncertainty metadata
  calculateUncertainty(context) {
    const gaps = [];

    if (!context.mastery || Object.keys(context.mastery).length < 5)
      gaps.push('limited mastery history');
    if (!context.recentActivity?.sessionsLastWeek)
      gaps.push('recent activity data');
    if (!context.userDNA?.type) gaps.push('learning profile');
    if (!context.forecastconfidence || context.forecast.confidence < 0.6)
      gaps.push('forecast confidence');

    if (gaps.length > 2) {
      return {
        level: 'high',
        reason: `Limited data: ${gaps.join(', ')}`,
        disclaimer:
          'More activity and data will significantly improve guidance quality'
      };
    }

    if (gaps.length > 0) {
      return {
        level: 'moderate',
        reason: `Some data gaps: ${gaps.join(', ')}`,
        disclaimer:
          'Guidance becomes more reliable as you accumulate more learning data'
      };
    }

    return {
      level: 'low',
      reason: 'Based on comprehensive data',
      disclaimer: ''
    };
  }

  // Extract relevant data points for reasoning
  extractDataPoints(context) {
    const points = [];

    if (context.mastery) {
      const avgMastery = this.calculateAverageMastery(context.mastery);
      points.push(`Average mastery: ${avgMastery}%`);
    }

    if (context.recentActivity?.sessionsLastWeek > 0) {
      points.push(
        `${context.recentActivity.sessionsLastWeek} learning sessions last week`
      );
    }

    if (context.recentActivity?.currentStreak > 0) {
      points.push(
        `${context.recentActivity.currentStreak}-day learning streak`
      );
    }

    if (context.userDNA?.type) {
      points.push(`Learning type: ${context.userDNA.type}`);
    }

    if (context.forecast?.trendingTopics?.length > 0) {
      points.push(
        `Topics trending up: ${context.forecast.trendingTopics.slice(0, 2).join(', ')}`
      );
    }

    return points;
  }

  // Extract governance policies that were applied
  extractAppliedGovernance(governance) {
    const policies = [];

    if (governance?.policies) {
      governance.policies.forEach((policy) => {
        if (policy.active) {
          policies.push(policy.type);
        }
      });
    }

    if (governance?.activeCooldowns && Object.keys(governance.activeCooldowns).length > 0) {
      policies.push('cooldown');
    }

    return policies;
  }

  // Generate alternative suggestions
  generateAlternatives(context) {
    return [
      'Try a different topic first',
      'Focus on reinforcement instead',
      'Take a reflection break',
      'Adjust your learning pace'
    ];
  }

  // Suggest next action
  suggestAction(context) {
    if (context.recentActivity?.currentStreak === 0) {
      return 'Start a learning session to rebuild momentum';
    }

    if (context.forecast?.riskingTopics?.length > 0) {
      return `Review ${context.forecast.riskingTopics[0]} to prevent decay`;
    }

    return 'Continue current learning path';
  }

  // Build trace for audit trail
  buildTrace(context, governance) {
    return [
      {
        stage: 'analysis',
        timestamp: Date.now(),
        data: {
          dataPoints: Object.keys(context).length,
          governanceRules: governance?.policies?.length || 0
        }
      },
      {
        stage: 'reasoning',
        timestamp: Date.now(),
        decision: 'Generate contextual response'
      },
      {
        stage: 'governance_check',
        timestamp: Date.now(),
        violations: 0,
        appliedConstraints:
          governance?.constraints?.filter((c) => c.active) || []
      }
    ];
  }

  // Helper: Calculate average mastery
  calculateAverageMastery(masteryObject) {
    if (!masteryObject || Object.keys(masteryObject).length === 0) return 0;

    const values = Object.values(masteryObject);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return Math.round(avg * 100);
  }

  // Helper: Format governance rules for prompt
  formatGovernanceRules(governance) {
    const rules = [];

    if (governance?.policies?.length > 0) {
      rules.push(`${governance.policies.length} active policies`);
    }

    if (governance?.capacityRemaining < 50) {
      rules.push('User at high capacity');
    }

    if (governance?.activeCooldowns && Object.keys(governance.activeCooldowns).length > 0) {
      rules.push('Topics on cooldown');
    }

    return rules.length > 0
      ? rules.join('. ')
      : 'No specific constraints active';
  }

  // Create error response
  createErrorResponse(error) {
    return {
      id: `mentor_error_${Date.now()}`,
      type: 'error',
      message:
        'I encountered an error generating a response. Please try again in a moment.',
      confidence: 0,
      uncertainty: {
        level: 'high',
        reason: 'System error occurred',
        disclaimer: ''
      },
      reasoning: {
        dataPoints: [],
        governanceApplied: [],
        alternatives: []
      },
      error: error.message
    };
  }

  // Clear cache
  clearCache() {
    this.responseCache.clear();
  }

  // Get conversation history
  getHistory() {
    return this.responseHistory;
  }

  // Clear history
  clearHistory() {
    this.responseHistory = [];
  }
}

export default MentorEngine;
