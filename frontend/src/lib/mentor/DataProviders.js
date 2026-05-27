// DataProviders - Standard interface for mentor to access user learning data
// Abstracts data access so mentor works with any backend

export class DataProviders {
  constructor() {
    this.providers = {};
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  // Register a data provider
  registerProvider(name, provider) {
    if (typeof provider !== 'function' && typeof provider.fetch !== 'function') {
      throw new Error(`Provider ${name} must be a function or have fetch method`);
    }
    this.providers[name] = provider;
  }

  // Get provider
  getProvider(name) {
    if (!this.providers[name]) {
      console.warn(`Provider ${name} not registered`);
      return null;
    }
    return this.providers[name];
  }

  // Fetch data with caching
  async fetch(providerName, userId, params = {}) {
    const cacheKey = `${providerName}:${userId}:${JSON.stringify(params)}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    // Fetch from provider
    const provider = this.getProvider(providerName);
    if (!provider) {
      return null;
    }

    try {
      let data;
      if (typeof provider === 'function') {
        data = await provider(userId, params);
      } else {
        data = await provider.fetch(userId, params);
      }

      // Cache result
      this.cache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });

      return data;
    } catch (error) {
      console.error(`Error fetching from ${providerName}:`, error);
      return null;
    }
  }

  // Invalidate cache for a provider
  invalidateCache(providerName = null, userId = null) {
    if (!providerName) {
      this.cache.clear();
      return;
    }

    for (const [key] of this.cache) {
      if (key.startsWith(providerName)) {
        if (!userId || key.includes(userId)) {
          this.cache.delete(key);
        }
      }
    }
  }

  // Get all providers
  getAll() {
    return Object.keys(this.providers);
  }
}

// Mock providers for development/testing
export const MockDataProviders = {
  // Mock roadmap provider
  roadmap: async (userId, params) => ({
    nodes: [
      { id: 'arrays', name: 'Arrays', mastery: 0.85 },
      { id: 'sorting', name: 'Sorting', mastery: 0.72 },
      { id: 'searching', name: 'Searching', mastery: 0.65 },
      { id: 'graphs', name: 'Graphs', mastery: 0.4 },
      { id: 'trees', name: 'Trees', mastery: 0.3 }
    ],
    edges: [
      { source: 'arrays', target: 'sorting' },
      { source: 'arrays', target: 'searching' },
      { source: 'sorting', target: 'graphs' },
      { source: 'trees', target: 'graphs' }
    ],
    userProgress: {
      arrays: { completed: true, masteredAt: 1000 },
      sorting: { completed: true, masteredAt: 2000 }
    }
  }),

  // Mock retention/heatmap provider
  retention: async (userId, params) => ({
    heatmap: {
      arrays: { daysSincePractice: 2, retentionRate: 0.92 },
      sorting: { daysSincePractice: 5, retentionRate: 0.78 },
      searching: { daysSincePractice: 12, retentionRate: 0.65 },
      graphs: { daysSincePractice: 20, retentionRate: 0.4 },
      trees: { daysSincePractice: 30, retentionRate: 0.15 }
    },
    decayRates: {
      arrays: 0.08,
      sorting: 0.12,
      searching: 0.15,
      graphs: 0.18,
      trees: 0.2
    }
  }),

  // Mock mastery provider
  mastery: async (userId, params) => ({
    arrays: 0.85,
    sorting: 0.72,
    searching: 0.65,
    graphs: 0.4,
    trees: 0.3,
    'dynamic-programming': 0.2
  }),

  // Mock user DNA provider
  dna: async (userId, params) => ({
    type: 'Deep Diver',
    confidence: 0.82,
    description: 'You master topics through deep, focused exploration',
    retryBehavior: 0.75,
    explorationBehavior: 0.45,
    difficultyPreference: 0.85,
    focusStyle: 'concentrated',
    learningRhythm: 'consistent'
  }),

  // Mock forecast provider
  forecast: async (userId, params) => ({
    predictions: {
      arrays: 0.88,
      sorting: 0.75,
      searching: 0.68,
      graphs: 0.45,
      trees: 0.35
    },
    timeHorizon: 7,
    confidence: 0.75,
    trendingTopics: ['graphs', 'dynamic-programming'],
    riskingTopics: ['trees', 'searching']
  }),

  // Mock governance provider
  governance: async (userId, params) => ({
    policies: [
      { type: 'cooldown', active: false, durationDays: 1 },
      { type: 'readiness', active: true, masteryThreshold: 0.6 }
    ],
    activeCooldowns: {},
    capacityRemaining: 85,
    constraints: [
      { type: 'max_recommendations_per_day', value: 5 }
    ]
  }),

  // Mock activity provider
  activity: async (userId, params) => ({
    sessionsLastWeek: 4,
    problemsSolvedLastWeek: 28,
    averageSessionDuration: 45,
    currentStreak: 3,
    lastActivityTime: Date.now() - 3600000,
    focusTopics: ['sorting', 'searching']
  }),

  // Mock recommendation history provider
  recommendationHistory: async (userId, params) => ({
    recommendations: [
      { id: 'rec1', topic: 'sorting', accepted: true },
      { id: 'rec2', topic: 'graphs', accepted: false },
      { id: 'rec3', topic: 'searching', accepted: true }
    ],
    acceptanceRate: 0.67,
    completionRate: 0.5,
    averageEffectiveness: 0.72,
    recentRecommendations: ['sorting', 'searching']
  })
};

// Real provider implementations (to be replaced with actual API calls)
export class APIDataProviders {
  constructor(apiBaseUrl) {
    this.apiBaseUrl = apiBaseUrl;
    this.headers = {
      'Content-Type': 'application/json'
    };
  }

  async fetchFromAPI(endpoint, userId) {
    try {
      const response = await fetch(`${this.apiBaseUrl}${endpoint}`, {
        method: 'GET',
        headers: this.headers,
        credentials: 'include' // Include cookies for auth
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API fetch failed for ${endpoint}:`, error);
      return null;
    }
  }

  // Create API provider functions
  roadmap = async (userId) => this.fetchFromAPI(`/api/mentor/${userId}/roadmap`, userId);
  retention = async (userId) => this.fetchFromAPI(`/api/mentor/${userId}/retention`, userId);
  mastery = async (userId) => this.fetchFromAPI(`/api/mentor/${userId}/mastery`, userId);
  dna = async (userId) => this.fetchFromAPI(`/api/mentor/${userId}/dna`, userId);
  forecast = async (userId) => this.fetchFromAPI(`/api/mentor/${userId}/forecast`, userId);
  governance = async (userId) => this.fetchFromAPI(`/api/mentor/${userId}/governance`, userId);
  activity = async (userId) => this.fetchFromAPI(`/api/mentor/${userId}/activity`, userId);
  recommendationHistory = async (userId) =>
    this.fetchFromAPI(`/api/mentor/${userId}/recommendation-history`, userId);
}

// Factory function to create initialized DataProviders
export function createDataProviders(useMock = true, apiBaseUrl = null) {
  const providers = new DataProviders();

  if (useMock) {
    // Register mock providers
    Object.entries(MockDataProviders).forEach(([name, provider]) => {
      providers.registerProvider(name, provider);
    });
  } else if (apiBaseUrl) {
    // Register API providers
    const api = new APIDataProviders(apiBaseUrl);
    providers.registerProvider('roadmap', api.roadmap);
    providers.registerProvider('retention', api.retention);
    providers.registerProvider('mastery', api.mastery);
    providers.registerProvider('dna', api.dna);
    providers.registerProvider('forecast', api.forecast);
    providers.registerProvider('governance', api.governance);
    providers.registerProvider('activity', api.activity);
    providers.registerProvider('recommendationHistory', api.recommendationHistory);
  }

  return providers;
}

export default DataProviders;
