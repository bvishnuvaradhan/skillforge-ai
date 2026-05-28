// MentorIntegration - Orchestrates all mentor subsystems
// Single point of integration for the complete mentor system

import { MentorContext } from './MentorContext';
import { MentorEngine } from './MentorEngine';
import { MentorPreferences } from './MentorPreferences';
import { MentorTrustMetrics } from './MentorTrustMetrics';
import { ExplainabilityEngine } from './ExplainabilityEngine';
import { CoachingEngine } from './CoachingEngine';
import { ReflectionEngine } from './ReflectionEngine';
import { SessionMonitor } from './SessionMonitor';
import { ReinforcementPlanner } from './ReinforcementPlanner';
import defaultProviders from './providers';
import defaultAI from './aiProviders';

export class MentorIntegration {
  constructor(userId, dataProviders, aiModelProvider = null) {
    this.userId = userId;
    this.dataProviders = dataProviders || defaultProviders;
    this.aiModelProvider = aiModelProvider || defaultAI.aiModelProvider;

    // Initialize all subsystems
    this.mentorContext = new MentorContext();
    this.mentorEngine = new MentorEngine(aiModelProvider);
    this.mentorPreferences = new MentorPreferences(userId);
    this.trustMetrics = new MentorTrustMetrics();
    this.explainabilityEngine = new ExplainabilityEngine();
    this.coachingEngine = new CoachingEngine();
    this.reflectionEngine = new ReflectionEngine();
    this.sessionMonitor = null; // Initialized when session starts
    this.reinforcementPlanner = new ReinforcementPlanner();

    this.currentSession = null;
    this.isInitialized = false;
  }

  // Initialize mentor (load user context)
  async initialize() {
    try {
      // Load user context
      const context = await this.mentorContext.loadContext(
        this.userId,
        {
          roadmapProvider: (uid) => this.dataProviders.fetch('roadmap', uid),
          retentionProvider: (uid) => this.dataProviders.fetch('retention', uid),
          masteryProvider: (uid) => this.dataProviders.fetch('mastery', uid),
          dnaProvider: (uid) => this.dataProviders.fetch('dna', uid),
          forecastProvider: (uid) => this.dataProviders.fetch('forecast', uid),
          governanceProvider: (uid) => this.dataProviders.fetch('governance', uid),
          activityProvider: (uid) => this.dataProviders.fetch('activity', uid),
          recommendationHistoryProvider: (uid) =>
            this.dataProviders.fetch('recommendationHistory', uid)
        }
      );

      this.isInitialized = true;
      return { success: true, context };
    } catch (error) {
      console.error('Failed to initialize mentor:', error);
      return { success: false, error: error.message };
    }
  }

  // Ask mentor a question
  async askMentor(question) {
    if (!this.isInitialized) {
      return {
        error: 'Mentor not initialized. Call initialize() first.'
      };
    }

    // Check if feature is enabled
    if (!this.mentorPreferences.isFeatureEnabled('mentor')) {
      return {
        error: 'Mentor is disabled in your preferences'
      };
    }

    try {
      // Load fresh context
      const context = await this.mentorContext.loadContext(this.userId, {
        roadmapProvider: (uid) => this.dataProviders.fetch('roadmap', uid),
        retentionProvider: (uid) => this.dataProviders.fetch('retention', uid),
        masteryProvider: (uid) => this.dataProviders.fetch('mastery', uid),
        dnaProvider: (uid) => this.dataProviders.fetch('dna', uid),
        forecastProvider: (uid) => this.dataProviders.fetch('forecast', uid),
        governanceProvider: (uid) => this.dataProviders.fetch('governance', uid),
        activityProvider: (uid) => this.dataProviders.fetch('activity', uid),
        recommendationHistoryProvider: (uid) =>
          this.dataProviders.fetch('recommendationHistory', uid)
      });

      // Generate mentor response
      const response = await this.mentorEngine.generateResponse(
        question,
        context,
        context.governance
      );

      // Record in trust metrics
      this.trustMetrics.recordResponse(response);

      // Filter by preferences
      if (this.mentorPreferences.shouldShowExplanation(response)) {
        return response;
      }

      return {
        message: 'This type of explanation is muted in your preferences',
        canUnmute: true
      };
    } catch (error) {
      console.error('Error generating mentor response:', error);
      return { error: error.message };
    }
  }

  // Get explanation for a specific question
  async getExplanation(questionType, context) {
    if (!this.mentorPreferences.isFeatureEnabled('explainability')) {
      return { error: 'Explanations are disabled in your preferences' };
    }

    return await this.explainabilityEngine.generateExplanation(
      questionType,
      context
    );
  }

  // Get coaching insights
  async getCoachingInsights(availableTimeMinutes = 60) {
    if (!this.mentorPreferences.isFeatureEnabled('coaching')) {
      return { error: 'Coaching is disabled in your preferences' };
    }

    const context = await this.mentorContext.loadContext(this.userId, {
      retentionProvider: (uid) => this.dataProviders.fetch('retention', uid),
      masteryProvider: (uid) => this.dataProviders.fetch('mastery', uid),
      dnaProvider: (uid) => this.dataProviders.fetch('dna', uid),
      activityProvider: (uid) => this.dataProviders.fetch('activity', uid),
      forecastProvider: (uid) => this.dataProviders.fetch('forecast', uid)
    });

    const insights = await this.coachingEngine.generateCoachingInsights(
      context,
      availableTimeMinutes
    );

    // Filter by user preferences
    return {
      insights: insights.insights.filter((i) =>
        this.mentorPreferences.shouldShowCoachingInsight(i)
      ),
      sessionPlan: insights.sessionPlan
    };
  }

  // Get weekly reflection
  async getWeeklyReflection() {
    if (!this.mentorPreferences.isFeatureEnabled('reflection')) {
      return { error: 'Reflections are disabled in your preferences' };
    }

    const context = await this.mentorContext.loadContext(this.userId, {
      masteryProvider: (uid) => this.dataProviders.fetch('mastery', uid),
      activityProvider: (uid) => this.dataProviders.fetch('activity', uid),
      dnaProvider: (uid) => this.dataProviders.fetch('dna', uid),
      forecastProvider: (uid) => this.dataProviders.fetch('forecast', uid)
    });

    return await this.reflectionEngine.generateWeeklyReflection(context);
  }

  // Start learning session
  startSession() {
    this.sessionMonitor = new SessionMonitor(this.userId, this.mentorPreferences);
    this.currentSession = {
      startTime: Date.now(),
      monitor: this.sessionMonitor,
      guidance: []
    };

    return this.sessionMonitor;
  }

  // Update session with problem completion
  updateSessionProgress(accuracy, topicName) {
    if (!this.sessionMonitor) {
      console.warn('No active session. Call startSession() first.');
      return;
    }

    this.sessionMonitor.updateProblemSolved(accuracy, topicName);
  }

  // Get session guidance
  getSessionGuidance() {
    if (!this.sessionMonitor) {
      return null;
    }

    const guidanceList = this.sessionMonitor.generateGuidance();

    // Filter by preferences
    return guidanceList.filter((g, index) =>
      this.sessionMonitor.shouldShowGuidance(g, index)
    );
  }

  // End session and get summary
  endSession() {
    if (!this.sessionMonitor) {
      return null;
    }

    const summary = this.sessionMonitor.endSession();
    this.currentSession = null;
    return summary;
  }

  // Get autonomous reinforcement bundles
  async getReinforcementBundles() {
    const context = await this.mentorContext.loadContext(this.userId, {
      retentionProvider: (uid) => this.dataProviders.fetch('retention', uid),
      masteryProvider: (uid) => this.dataProviders.fetch('mastery', uid),
      forecastProvider: (uid) => this.dataProviders.fetch('forecast', uid),
      roadmapProvider: (uid) => this.dataProviders.fetch('roadmap', uid)
    });

    return await this.reinforcementPlanner.generateReinforcementBundles(context);
  }

  // Get trust metrics for admin
  getTrustMetrics() {
    return this.trustMetrics.getMetrics();
  }

  // Get gate status
  getGateStatus() {
    return this.trustMetrics.getGateStatus();
  }

  // Record user feedback on mentor response
  recordFeedback(responseId, rating, comment = null) {
    this.trustMetrics.recordResponse(
      { id: responseId },
      { rating, comment }
    );
  }

  // Get user preferences
  getPreferences() {
    return this.mentorPreferences.getAll();
  }

  // Update preferences
  updatePreferences(updates) {
    this.mentorPreferences.update(updates);
  }

  // Invalidate context cache (when user data changes)
  invalidateCache(pattern = null) {
    this.mentorContext.invalidateCache(pattern);
    this.dataProviders.invalidateCache();
  }

  // Get full status
  getStatus() {
    return {
      isInitialized: this.isInitialized,
      userId: this.userId,
      preferences: this.mentorPreferences.getSummary(),
      trustMetrics: this.trustMetrics.getMetrics(),
      gateStatus: this.trustMetrics.getGateStatus(),
      activeSession: this.currentSession ? 'yes' : 'no',
      dataProviders: this.dataProviders.getAll()
    };
  }
}

export default MentorIntegration;
