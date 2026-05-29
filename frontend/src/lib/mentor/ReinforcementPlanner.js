// ReinforcementPlanner - Autonomous reinforcement bundling
// GATED: Requires trust metrics + override controls

export class ReinforcementPlanner {
  constructor() {
    this.bundleCache = new Map();
    this.cacheTTL = 24 * 60 * 60 * 1000; // 24 hours (reinforcement is slower-changing)
    this.bundleHistory = [];
    this.effectivenessMetrics = new Map();
  }

  // Generate reinforcement bundles
  async generateReinforcementBundles(context) {
    const cacheKey = `reinforcement_${context.userId}`;
    const cached = this.bundleCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.bundles;
    }

    // Identify topics needing reinforcement
    const atRiskTopics = this.identifyAtRiskTopics(context);
    const relatedTopics = this.findRelatedTopics(atRiskTopics, context);

    // Create reinforcement bundles
    const bundles = [];

    for (const topic of atRiskTopics) {
      const related = relatedTopics[topic] || [];
      const bundle = this.createReinforcementBundle(
        topic,
        related,
        context
      );

      if (bundle) {
        bundles.push(bundle);
      }
    }

    // Sort by priority (urgency + impact)
    bundles.sort((a, b) => b.priority - a.priority);

    // Cache
    this.bundleCache.set(cacheKey, {
      bundles,
      timestamp: Date.now()
    });

    this.bundleHistory.push({
      timestamp: Date.now(),
      bundles
    });

    return bundles;
  }

  // Identify topics at risk of decay
  identifyAtRiskTopics(context) {
    const { retention, forecast, mastery } = context;

    // reference forecast when not currently used to silence lint warnings
    void forecast;

    if (!retention || !retention.heatmap) {
      return [];
    }

    const atRisk = [];

    Object.entries(retention.heatmap).forEach(([topic, data]) => {
      // Risk factors
      let riskScore = 0;

      // Days since practice (higher = more at risk)
      if (data.daysSincePractice) {
        riskScore += Math.min(data.daysSincePractice / 14, 1.0) * 0.4;
      }

      // Current retention rate (lower = more at risk)
      if (data.retentionRate) {
        riskScore += (1 - data.retentionRate) * 0.4;
      }

      // Mastery level (lower = more critical)
      if (mastery && mastery[topic]) {
        riskScore += (1 - mastery[topic]) * 0.2;
      }

      if (riskScore > 0.5) {
        atRisk.push({
          topic,
          riskScore,
          daysSincePractice: data.daysSincePractice,
          retentionRate: data.retentionRate
        });
      }
    });

    // Sort by risk score
    atRisk.sort((a, b) => b.riskScore - a.riskScore);

    // Return top 3 at-risk topics
    return atRisk.slice(0, 3).map((t) => t.topic);
  }

  // Find topics related to at-risk topics
  findRelatedTopics(atRiskTopics, context) {
    const { roadmap } = context;

    if (!roadmap || !roadmap.edges) {
      return {};
    }

    const related = {};

    atRiskTopics.forEach((topic) => {
      related[topic] = [];

      // Find predecessors (topics that lead to this)
      roadmap.edges.forEach((edge) => {
        if (edge.target === topic) {
          related[topic].push(edge.source);
        }
      });

      // Find successors (topics that depend on this)
      roadmap.edges.forEach((edge) => {
        if (edge.source === topic) {
          related[topic].push(edge.target);
        }
      });

      // Limit to 2 related topics
      related[topic] = related[topic].slice(0, 2);
    });

    return related;
  }

  // Create a reinforcement bundle
  createReinforcementBundle(primaryTopic, relatedTopics, context) {
    const { retention, mastery, userDNA } = context;

    if (!primaryTopic) return null;

    // Get primary topic data
    const primaryData = retention?.heatmap?.[primaryTopic] || {};
    const primaryMastery = mastery?.[primaryTopic] || 0;

    // Determine timing
    const timing = this.determineTiming(primaryData, primaryMastery);

    // Calculate expected effectiveness
    const expectedRetention = this.estimateRetention(primaryMastery, timing);

    // Build reasoning
    const reasoning = this.buildBundleReasoning(
      primaryTopic,
      relatedTopics,
      primaryData,
      primaryMastery
    );

    // Check effectiveness history
    const effectiveness = this.getEffectivenessScore(primaryTopic);

    // Build bundle
    const bundle = {
      id: `bundle_${Date.now()}_${Math.random()}`,
      topics: [primaryTopic, ...relatedTopics],
      timing,
      reasoning,
      expectedRetention: Math.round(expectedRetention * 100),
      userCanDismiss: true,
      effectiveness: effectiveness, // 0-1, based on past effectiveness
      priority: this.calculateBundlePriority(primaryData, primaryMastery),
      recommendedDuration: this.recommendDuration(
        relatedTopics.length,
        userDNA
      ),
      createdAt: Date.now()
    };

    return bundle;
  }

  // Determine optimal timing for reinforcement
  determineTiming(topicData, mastery) {
    if (!topicData.daysSincePractice) {
      return 'today';
    }

    const daysSince = topicData.daysSincePractice;
    const retentionRate = topicData.retentionRate || 0;
    void retentionRate;

    // If very recently practiced, defer
    if (daysSince < 1) {
      return 'this_week';
    }

    // If at decay threshold, recommend now
    if (daysSince > 7 || retentionRate < 0.5) {
      return 'now';
    }

    // If mastery is low, prioritize
    if (mastery < 0.6) {
      return 'today';
    }

    return 'this_week';
  }

  // Estimate retention improvement from reinforcement
  estimateRetention(currentMastery, timing) {
    // Base improvement: 20-40% depending on current level
    let improvement = currentMastery > 0.8 ? 0.2 : currentMastery > 0.6 ? 0.3 : 0.4;

    // Timing affects improvement
    if (timing === 'now') {
      improvement *= 1.2; // 20% boost for immediate reinforcement
    } else if (timing === 'today') {
      improvement *= 1.1;
    }

    const resultingMastery = Math.min(currentMastery + improvement, 0.98);
    return resultingMastery;
  }

  // Build human-readable reasoning
  buildBundleReasoning(primaryTopic, relatedTopics, topicData, mastery) {
    const parts = [];

    const daysSince = topicData.daysSincePractice || 0;
    const retentionRate = topicData.retentionRate || 0;
    void retentionRate;

    // Decay explanation
    if (daysSince > 7) {
      parts.push(
        `${primaryTopic} hasn't been practiced in ${daysSince} days—normal forgetting curve`
      );
    } else {
      parts.push(
        `${primaryTopic} is trending toward decay—reinforcement helps prevent loss`
      );
    }

    // Related topics explanation
    if (relatedTopics.length > 0) {
      parts.push(
        `Bundled with ${relatedTopics.join(', ')} to strengthen connections`
      );
    }

    // Mastery-based explanation
    if (mastery < 0.6) {
      parts.push('Low mastery suggests foundational reinforcement is valuable');
    } else if (mastery > 0.8) {
      parts.push("High mastery means you'll reinforce quickly and maintain better");
    }

    return parts.join('. ');
  }

  // Calculate bundle priority (0-100)
  calculateBundlePriority(topicData, mastery) {
    let priority = 50;

    // Days since practice increases priority
    if (topicData.daysSincePractice) {
      priority += Math.min(topicData.daysSincePractice * 5, 30);
    }

    // Low retention increases priority
    if (topicData.retentionRate) {
      priority += (1 - topicData.retentionRate) * 20;
    }

    // Low mastery increases priority
    priority += (1 - mastery) * 20;

    return Math.round(Math.min(priority, 100));
  }

  // Get effectiveness score from history
  getEffectivenessScore(topic) {
    if (!this.effectivenessMetrics.has(topic)) {
      return 0.5; // Default: neutral
    }

    const metrics = this.effectivenessMetrics.get(topic);
    return metrics.avgEffectiveness || 0.5;
  }

  // Record bundle result (did it help?)
  recordBundleResult(bundleId, effective) {
    // Track which bundles work well
    // In real implementation, this would update effectiveness metrics
    // For now, just store in history
    // avoid unused param warnings until this is implemented
    void bundleId;
    void effective;
  }

  // Recommend session duration
  recommendDuration(relatedTopicsCount, userDNA) {
    const baseTime = 20; // 20 minutes base
    const perTopic = 10; // 10 min per related topic

    let duration = baseTime + relatedTopicsCount * perTopic;

    // Adjust for learning style
    if (userDNA?.focusStyle === 'concentrated') {
      duration *= 1.2; // Extend for deep divers
    } else if (userDNA?.focusStyle === 'exploratory') {
      duration *= 0.9; // Shorten for explorers
    }

    return Math.round(duration);
  }

  // Get bundle history
  getBundleHistory() {
    return this.bundleHistory;
  }

  // Clear cache
  clearCache() {
    this.bundleCache.clear();
  }
}

export default ReinforcementPlanner;
