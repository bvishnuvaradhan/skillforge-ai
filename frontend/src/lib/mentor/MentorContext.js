// MentorContext - Load and cache comprehensive user context for mentoring
// Handles efficient context retrieval with TTL and invalidation

export class MentorContext {
  constructor() {
    this.contextCache = null;
    this.cacheTimestamp = null;
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
    this.maxCacheSize = 10 * 1024 * 1024; // 10MB
    this.invalidationPatterns = [];
  }

  // Load complete user context
  async loadContext(userId, dataProviders) {
    // Check cache first
    if (this.isContextValid()) {
      return this.contextCache;
    }

    try {
      const context = {
        userId,
        timestamp: Date.now(),
        roadmap: await this.loadRoadmap(userId, dataProviders),
        retention: await this.loadRetention(userId, dataProviders),
        mastery: await this.loadMastery(userId, dataProviders),
        userDNA: await this.loadUserDNA(userId, dataProviders),
        forecast: await this.loadForecast(userId, dataProviders),
        governance: await this.loadGovernance(userId, dataProviders),
        recentActivity: await this.loadRecentActivity(userId, dataProviders),
        recommendationHistory: await this.loadRecommendationHistory(userId, dataProviders)
      };

      // Validate cache size
      const contextSize = JSON.stringify(context).length;
      if (contextSize > this.maxCacheSize) {
        console.warn(`Context exceeds max cache size: ${contextSize} bytes`);
        // Still cache, but log warning
      }

      // Cache the context
      this.contextCache = context;
      this.cacheTimestamp = Date.now();

      return context;
    } catch (error) {
      console.error('Failed to load user context:', error);
      throw error;
    }
  }

  // Load roadmap structure and progression
  async loadRoadmap(userId, dataProviders) {
    try {
      const response = await dataProviders.roadmapProvider?.(userId);
      return {
        nodes: response?.nodes || [],
        edges: response?.edges || [],
        userProgress: response?.userProgress || {},
        currentMilestone: response?.currentMilestone,
        completedMilestones: response?.completedMilestones || []
      };
    } catch (error) {
      console.error('Failed to load roadmap:', error);
      return { nodes: [], edges: [], userProgress: {}, completedMilestones: [] };
    }
  }

  // Load retention heatmap and decay data
  async loadRetention(userId, dataProviders) {
    try {
      const response = await dataProviders.retentionProvider?.(userId);
      return {
        heatmap: response?.heatmap || {},
        decayRates: response?.decayRates || {},
        lastPracticed: response?.lastPracticed || {},
        predictedDecay: response?.predictedDecay || {}
      };
    } catch (error) {
      console.error('Failed to load retention:', error);
      return { heatmap: {}, decayRates: {}, lastPracticed: {}, predictedDecay: {} };
    }
  }

  // Load mastery levels per topic
  async loadMastery(userId, dataProviders) {
    try {
      const response = await dataProviders.masteryProvider?.(userId);
      return response || {};
    } catch (error) {
      console.error('Failed to load mastery:', error);
      return {};
    }
  }

  // Load user learning DNA/profile
  async loadUserDNA(userId, dataProviders) {
    try {
      const response = await dataProviders.dnaProvider?.(userId);
      return {
        type: response?.type || 'Generalist',
        confidence: response?.confidence || 0,
        description: response?.description || '',
        retryBehavior: response?.retryBehavior || 0.5,
        explorationBehavior: response?.explorationBehavior || 0.5,
        difficultyPreference: response?.difficultyPreference || 0.5,
        focusStyle: response?.focusStyle || 'balanced',
        learningRhythm: response?.learningRhythm || 'consistent'
      };
    } catch (error) {
      console.error('Failed to load user DNA:', error);
      return {
        type: 'Generalist',
        confidence: 0,
        retryBehavior: 0.5,
        explorationBehavior: 0.5,
        difficultyPreference: 0.5,
        focusStyle: 'balanced',
        learningRhythm: 'consistent'
      };
    }
  }

  // Load mastery forecast/predictions
  async loadForecast(userId, dataProviders) {
    try {
      const response = await dataProviders.forecastProvider?.(userId);
      return {
        predictions: response?.predictions || {},
        timeHorizon: response?.timeHorizon || 7,
        confidence: response?.confidence || 0,
        trendingTopics: response?.trendingTopics || [],
        riskingTopics: response?.riskingTopics || []
      };
    } catch (error) {
      console.error('Failed to load forecast:', error);
      return {
        predictions: {},
        timeHorizon: 7,
        confidence: 0,
        trendingTopics: [],
        riskingTopics: []
      };
    }
  }

  // Load governance policies and constraints
  async loadGovernance(userId, dataProviders) {
    try {
      const response = await dataProviders.governanceProvider?.(userId);
      return {
        policies: response?.policies || [],
        activeCooldowns: response?.activeCooldowns || {},
        capacityRemaining: response?.capacityRemaining || 100,
        constraints: response?.constraints || []
      };
    } catch (error) {
      console.error('Failed to load governance:', error);
      return {
        policies: [],
        activeCooldowns: {},
        capacityRemaining: 100,
        constraints: []
      };
    }
  }

  // Load recent activity (sessions, problems solved, etc.)
  async loadRecentActivity(userId, dataProviders) {
    try {
      const response = await dataProviders.activityProvider?.(userId);
      return {
        sessionsLastWeek: response?.sessionsLastWeek || 0,
        problemsSolvedLastWeek: response?.problemsSolvedLastWeek || 0,
        averageSessionDuration: response?.averageSessionDuration || 0,
        currentStreak: response?.currentStreak || 0,
        lastActivityTime: response?.lastActivityTime,
        focusTopics: response?.focusTopics || []
      };
    } catch (error) {
      console.error('Failed to load recent activity:', error);
      return {
        sessionsLastWeek: 0,
        problemsSolvedLastWeek: 0,
        averageSessionDuration: 0,
        currentStreak: 0,
        focusTopics: []
      };
    }
  }

  // Load recommendation history and acceptance rates
  async loadRecommendationHistory(userId, dataProviders) {
    try {
      const response = await dataProviders.recommendationHistoryProvider?.(userId);
      return {
        recommendations: response?.recommendations || [],
        acceptanceRate: response?.acceptanceRate || 0,
        completionRate: response?.completionRate || 0,
        averageEffectiveness: response?.averageEffectiveness || 0,
        recentRecommendations: response?.recentRecommendations || []
      };
    } catch (error) {
      console.error('Failed to load recommendation history:', error);
      return {
        recommendations: [],
        acceptanceRate: 0,
        completionRate: 0,
        averageEffectiveness: 0,
        recentRecommendations: []
      };
    }
  }

  // Check if cached context is still valid
  isContextValid() {
    if (!this.contextCache || !this.cacheTimestamp) {
      return false;
    }

    const age = Date.now() - this.cacheTimestamp;
    return age < this.cacheTTL;
  }

  // Invalidate cache on specific events
  invalidateCache(pattern = null) {
    if (!pattern) {
      this.contextCache = null;
      this.cacheTimestamp = null;
      return;
    }

    // Pattern-based invalidation
    if (pattern === 'mastery' || pattern === 'all') {
      this.contextCache = null;
      this.cacheTimestamp = null;
    }

    if (pattern === 'recommendation' || pattern === 'all') {
      this.contextCache = null;
      this.cacheTimestamp = null;
    }

    if (pattern === 'activity' || pattern === 'all') {
      this.contextCache = null;
      this.cacheTimestamp = null;
    }
  }

  // Get specific context slice without full reload
  async getContextSlice(userId, dataProviders, slice) {
    const context = await this.loadContext(userId, dataProviders);

    if (slice === 'mastery') return context.mastery;
    if (slice === 'retention') return context.retention;
    if (slice === 'roadmap') return context.roadmap;
    if (slice === 'dna') return context.userDNA;
    if (slice === 'governance') return context.governance;
    if (slice === 'activity') return context.recentActivity;

    return null;
  }

  // Get cache statistics (for debugging)
  getCacheStats() {
    const cacheSize = this.contextCache ? JSON.stringify(this.contextCache).length : 0;
    const cacheAge = this.cacheTimestamp ? Date.now() - this.cacheTimestamp : null;

    return {
      cached: !!this.contextCache,
      cacheSize,
      cacheAge,
      cacheValid: this.isContextValid(),
      maxSize: this.maxCacheSize,
      ttl: this.cacheTTL
    };
  }

  // Clear all caches
  clearAllCaches() {
    this.contextCache = null;
    this.cacheTimestamp = null;
    this.invalidationPatterns = [];
  }
}

export default MentorContext;
