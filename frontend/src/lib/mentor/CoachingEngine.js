// CoachingEngine - Adaptive session planning and learning strategy coaching
// Non-interrupting insights that users can pull, not push

export class CoachingEngine {
  constructor() {
    this.coachingCache = new Map();
    this.cacheTTL = 60 * 60 * 1000; // 1 hour (coaching is slower-changing)
    this.coachingHistory = [];
  }

  // Generate coaching insights for learner
  async generateCoachingInsights(context, availableTimeMinutes = 60) {
    const cacheKey = `coaching_${context.userId}`;
    const cached = this.coachingCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.insights;
    }

    const insights = [
      this.analyzeStrategy(context),
      this.analyzePacing(context),
      this.analyzeBurnout(context),
      this.analyzeConsistency(context)
    ].filter((i) => i !== null);

    // Also plan today's session
    const sessionPlan = this.planTodaySession(context, availableTimeMinutes);

    const result = {
      insights,
      sessionPlan,
      timestamp: Date.now()
    };

    // Cache
    this.coachingCache.set(cacheKey, {
      insights: result,
      timestamp: Date.now()
    });

    this.coachingHistory.push(result);

    return result;
  }

  // Analyze learning strategy effectiveness
  analyzeStrategy(context) {
    const { userDNA, recentActivity, mastery } = context;

    if (!userDNA) return null;

    const isDeepDiver = userDNA.type === 'Deep Diver' || userDNA.focusStyle === 'concentrated';
    const isBreadthExplorer = userDNA.type === 'Breadth Explorer' || userDNA.explorationBehavior > 0.7;

    let recommendation = '';
    let dataPoints = [];

    if (isDeepDiver) {
      recommendation =
        'Your learning style favors deep mastery. Recommendations are sequenced for focused learning.';
      dataPoints = [
        `Retry behavior: ${(userDNA.retryBehavior * 100).toFixed(0)}% (high persistence)`,
        'Focus: Mastery depth over breadth',
        'Optimal approach: Complete topics before moving on'
      ];
    } else if (isBreadthExplorer) {
      recommendation =
        'Your learning style favors broad exploration. You benefit from variety and pattern discovery.';
      dataPoints = [
        `Exploration behavior: ${(userDNA.explorationBehavior * 100).toFixed(0)}%`,
        'Focus: Understanding connections across topics',
        'Optimal approach: Sample topics before going deep'
      ];
    } else {
      recommendation =
        'Your balanced learning style works well with mixed approaches.';
      dataPoints = [
        'Balanced depth and breadth preference',
        'Flexible approach works for you',
        'Adapt strategy based on topic difficulty'
      ];
    }

    return {
      type: 'strategy',
      insight: recommendation,
      supporting_data: dataPoints,
      recommendation:
        'Lean into your natural style—it leads to more effective learning.',
      canMute: true
    };
  }

  // Analyze learning pace and pacing recommendations
  analyzePacing(context) {
    const { recentActivity, mastery, forecast } = context;

    if (!recentActivity || recentActivity.sessionsLastWeek === 0) {
      return null;
    }

    const sessionsPerWeek = recentActivity.sessionsLastWeek;
    const problemsPerSession = recentActivity.problemsSolvedLastWeek / Math.max(sessionsPerWeek, 1);
    const averageSessionMinutes = recentActivity.averageSessionDuration || 0;

    let insight = '';
    let trend = 'stable';
    let recommendation = '';

    if (sessionsPerWeek < 3) {
      insight = `You're practicing ${sessionsPerWeek} sessions per week. Increasing to 3-4 would accelerate mastery.`;
      trend = 'declining';
      recommendation =
        'Try adding one more session this week to build momentum.';
    } else if (sessionsPerWeek > 5 && averageSessionMinutes > 90) {
      insight =
        "Your session load is high. Quality beats quantity—shorter, focused sessions often work better.";
      trend = 'stable';
      recommendation =
        'Consider 45-60 min sessions to maintain focus and prevent burnout.';
    } else {
      insight = `Your pace of ${sessionsPerWeek} sessions/week is well-calibrated for consistent learning.`;
      trend = 'stable';
      recommendation = 'Keep this rhythm—consistency is your strength.';
    }

    return {
      type: 'pacing',
      insight,
      supporting_data: [
        `Sessions last week: ${sessionsPerWeek}`,
        `Average session length: ${averageSessionMinutes} min`,
        `Problems solved: ${recentActivity.problemsSolvedLastWeek}`
      ],
      trend,
      recommendation,
      canMute: true
    };
  }

  // Detect burnout patterns
  analyzeBurnout(context) {
    const { recentActivity, mastery, forecast } = context;

    if (!recentActivity) return null;

    const sessionsLastWeek = recentActivity.sessionsLastWeek;
    const sessionsThisWeek = recentActivity.sessionsThisWeek || 0;
    const streak = recentActivity.currentStreak || 0;

    // Check for warning signs
    const warnings = [];

    if (sessionsThisWeek === 0 && sessionsLastWeek > 3) {
      warnings.push('Sudden stop in activity after high pace');
    }

    if (streak > 14 && sessionsLastWeek > 5) {
      warnings.push('Long streak with high load');
    }

    if (forecast?.riskingTopics?.length > 3) {
      warnings.push('Multiple topics at risk (possible overload)');
    }

    if (warnings.length > 0) {
      return {
        type: 'prevention',
        insight: `Possible burnout indicators detected: ${warnings.join(', ')}.`,
        supporting_data: warnings,
        recommendation:
          'Consider taking a lighter week. Burnout prevents long-term progress.',
        canMute: true
      };
    }

    return null;
  }

  // Analyze consistency patterns
  analyzeConsistency(context) {
    const { recentActivity } = context;

    if (!recentActivity) return null;

    const streak = recentActivity.currentStreak || 0;
    const sessionsLastWeek = recentActivity.sessionsLastWeek || 0;

    let insight = '';
    let trend = 'stable';

    if (streak > 10) {
      insight = `Excellent consistency! You've maintained a ${streak}-day streak.`;
      trend = 'improving';
    } else if (streak > 5) {
      insight = `Good momentum with a ${streak}-day streak. Keep going!`;
      trend = 'improving';
    } else if (sessionsLastWeek < 2) {
      insight = 'Your learning has been sporadic. Regular sessions build better habits.';
      trend = 'declining';
    } else {
      insight = `You're maintaining consistent learning (${sessionsLastWeek} sessions last week).`;
      trend = 'stable';
    }

    return {
      type: 'optimization',
      insight,
      supporting_data: [
        `Current streak: ${streak} days`,
        `Sessions last week: ${sessionsLastWeek}`
      ],
      trend,
      recommendation:
        'Consistency matters more than intensity. Even 20 minutes daily beats cramming.',
      canMute: true
    };
  }

  // Plan today's optimal session
  planTodaySession(context, availableMinutes) {
    const { mastery, userDNA, recentActivity, forecast } = context;

    // Get focus topics (topics needing reinforcement or new topics ready)
    const focusTopics = this.selectFocusTopics(context);

    // Allocate time based on learning style
    const allocation = this.allocateSessionTime(
      availableMinutes,
      focusTopics,
      userDNA
    );

    return {
      recommendedDuration: availableMinutes,
      structure: allocation,
      topics: focusTopics,
      reasoning: `Tailored for ${userDNA?.focusStyle || 'your'} learning style with ${focusTopics.length} topics.`
    };
  }

  // Select which topics to focus on today
  selectFocusTopics(context) {
    const { forecast, mastery, recentActivity } = context;

    const topics = [];

    // 1. Topics at risk (highest priority)
    if (forecast?.riskingTopics?.length > 0) {
      topics.push({
        name: forecast.riskingTopics[0],
        type: 'reinforcement',
        priority: 'urgent',
        estimatedTime: 20
      });
    }

    // 2. Topics ready to practice
    if (recentActivity?.focusTopics?.length > 0) {
      topics.push({
        name: recentActivity.focusTopics[0],
        type: 'practice',
        priority: 'high',
        estimatedTime: 30
      });
    }

    // 3. Trending topics (new learning)
    if (forecast?.trendingTopics?.length > 0) {
      topics.push({
        name: forecast.trendingTopics[0],
        type: 'exploration',
        priority: 'medium',
        estimatedTime: 25
      });
    }

    return topics.slice(0, 3); // Max 3 topics
  }

  // Allocate session time
  allocateSessionTime(totalMinutes, topics, userDNA) {
    const focusStyle = userDNA?.focusStyle || 'balanced';

    if (focusStyle === 'concentrated' && topics.length > 0) {
      // Deep diver: focus all time on one topic
      return [
        {
          topic: topics[0].name,
          duration: totalMinutes - 5,
          type: 'focused_practice'
        },
        {
          topic: 'Reflection',
          duration: 5,
          type: 'reflection'
        }
      ];
    } else {
      // Balanced or explorer: mix topics
      const timePerTopic = Math.floor(totalMinutes / (topics.length + 1));

      return [
        ...topics.map((t) => ({
          topic: t.name,
          duration: timePerTopic,
          type: t.type
        })),
        {
          topic: 'Reflection',
          duration: totalMinutes - timePerTopic * topics.length,
          type: 'reflection'
        }
      ];
    }
  }

  // Get coaching insights
  getCoachingHistory() {
    return this.coachingHistory;
  }

  // Clear cache
  clearCache() {
    this.coachingCache.clear();
  }
}

export default CoachingEngine;
