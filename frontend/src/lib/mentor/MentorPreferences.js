// MentorPreferences - User control over AI mentor intensity
// Implements critical "human override philosophy"

export class MentorPreferences {
  constructor(userId) {
    this.userId = userId;
    this.preferences = this.getDefaultPreferences();
    this.loadFromStorage();
  }

  // Default preferences (all features enabled)
  getDefaultPreferences() {
    return {
      userId: this.userId,
      mentorEnabled: true,
      explainabilityEnabled: true,
      coachingEnabled: true,
      reflectionEnabled: true,
      sessionGuidanceEnabled: true,

      // Intensity levels
      coachingIntensity: 'moderate', // 'low' | 'moderate' | 'high'
      sessionInterruptionThreshold: 0.8, // 0-1, higher = fewer interruptions
      reflectionFrequency: 'weekly', // 'daily' | 'weekly' | 'monthly'

      // Mute specific insight types
      mutedInsightTypes: [],
      mutedCoachingTypes: [], // 'pacing', 'strategy', 'prevention', 'optimization'

      // Session guidance rules
      sessionGuidanceMaxPerSession: 3, // Max guidance messages per session
      sessionGuidanceMinConfidence: 0.8, // Only show high-confidence suggestions

      // Memory and tracking
      allowMentorMemory: true, // Can mentor remember conversation history?
      allowCoachingHistory: true, // Can mentor track coaching patterns?
      allowReflectionTracking: true, // Can mentor track reflection requests?

      // Privacy
      mentorDataRetention: 30, // Days to retain conversation history
      allowAnalytics: true, // Can we track mentor effectiveness?

      // Timestamps
      createdAt: Date.now(),
      lastModified: Date.now()
    };
  }

  // Load preferences from localStorage
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(`mentor_prefs_${this.userId}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...this.preferences, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load mentor preferences:', error);
    }
  }

  // Save preferences to localStorage
  saveToStorage() {
    try {
      this.preferences.lastModified = Date.now();
      localStorage.setItem(
        `mentor_prefs_${this.userId}`,
        JSON.stringify(this.preferences)
      );
    } catch (error) {
      console.error('Failed to save mentor preferences:', error);
    }
  }

  // Check if feature is enabled
  isFeatureEnabled(feature) {
    const featureMap = {
      mentor: 'mentorEnabled',
      explainability: 'explainabilityEnabled',
      coaching: 'coachingEnabled',
      reflection: 'reflectionEnabled',
      sessionGuidance: 'sessionGuidanceEnabled'
    };

    return this.preferences[featureMap[feature]] !== false;
  }

  // Check if insight type is muted
  isInsightTypeMuted(type) {
    return this.preferences.mutedInsightTypes.includes(type);
  }

  // Check if coaching type is muted
  isCoachingTypeMuted(type) {
    return this.preferences.mutedCoachingTypes.includes(type);
  }

  // Mute an insight type
  muteInsightType(type) {
    if (!this.preferences.mutedInsightTypes.includes(type)) {
      this.preferences.mutedInsightTypes.push(type);
      this.saveToStorage();
    }
  }

  // Unmute an insight type
  unmuteInsightType(type) {
    this.preferences.mutedInsightTypes = this.preferences.mutedInsightTypes.filter(
      (t) => t !== type
    );
    this.saveToStorage();
  }

  // Set coaching intensity
  setCoachingIntensity(level) {
    if (['low', 'moderate', 'high'].includes(level)) {
      this.preferences.coachingIntensity = level;
      this.saveToStorage();
    }
  }

  // Get coaching intensity threshold
  getCoachingThreshold() {
    const thresholds = {
      low: 0.9, // Only very high confidence
      moderate: 0.7, // Medium-high confidence
      high: 0.5 // Any reasonable confidence
    };
    return thresholds[this.preferences.coachingIntensity] || 0.7;
  }

  // Set session guidance max messages
  setSessionGuidanceMax(count) {
    this.preferences.sessionGuidanceMaxPerSession = Math.max(0, count);
    this.saveToStorage();
  }

  // Set reflection frequency
  setReflectionFrequency(frequency) {
    if (['daily', 'weekly', 'monthly'].includes(frequency)) {
      this.preferences.reflectionFrequency = frequency;
      this.saveToStorage();
    }
  }

  // Disable all mentor features
  disableMentorCompletely() {
    this.preferences.mentorEnabled = false;
    this.preferences.explainabilityEnabled = false;
    this.preferences.coachingEnabled = false;
    this.preferences.reflectionEnabled = false;
    this.preferences.sessionGuidanceEnabled = false;
    this.saveToStorage();
  }

  // Enable all mentor features
  enableMentorCompletely() {
    this.preferences.mentorEnabled = true;
    this.preferences.explainabilityEnabled = true;
    this.preferences.coachingEnabled = true;
    this.preferences.reflectionEnabled = true;
    this.preferences.sessionGuidanceEnabled = true;
    this.saveToStorage();
  }

  // Reset to defaults
  resetToDefaults() {
    this.preferences = this.getDefaultPreferences();
    this.saveToStorage();
  }

  // Get all preferences
  getAll() {
    return { ...this.preferences };
  }

  // Update multiple preferences
  update(updates) {
    this.preferences = { ...this.preferences, ...updates };
    this.saveToStorage();
  }

  // Get summary of what's enabled
  getSummary() {
    return {
      mentor: this.preferences.mentorEnabled ? '✅ Enabled' : '❌ Disabled',
      explainability: this.preferences.explainabilityEnabled
        ? '✅ Enabled'
        : '❌ Disabled',
      coaching: `${this.preferences.coachingEnabled ? '✅' : '❌'} ${this.preferences.coachingIntensity}`,
      reflection: `${this.preferences.reflectionEnabled ? '✅' : '❌'} ${this.preferences.reflectionFrequency}`,
      sessionGuidance: this.preferences.sessionGuidanceEnabled
        ? `✅ Max ${this.preferences.sessionGuidanceMaxPerSession}/session`
        : '❌ Disabled'
    };
  }

  // Should show explanation?
  shouldShowExplanation(explanation) {
    if (!this.isFeatureEnabled('explainability')) return false;
    if (this.isInsightTypeMuted(explanation.type)) return false;
    return true;
  }

  // Should show coaching insight?
  shouldShowCoachingInsight(insight) {
    if (!this.isFeatureEnabled('coaching')) return false;
    if (this.isCoachingTypeMuted(insight.type)) return false;
    if (insight.confidence < this.getCoachingThreshold()) return false;
    return true;
  }

  // Should show session guidance?
  shouldShowSessionGuidance(guidance, currentCount) {
    if (!this.isFeatureEnabled('sessionGuidance')) return false;
    if (currentCount >= this.preferences.sessionGuidanceMaxPerSession)
      return false;
    if (guidance.confidence < this.preferences.sessionInterruptionThreshold)
      return false;
    return true;
  }

  // Should show reflection?
  shouldShowReflection() {
    if (!this.isFeatureEnabled('reflection')) return false;
    return true;
  }
}

export default MentorPreferences;
