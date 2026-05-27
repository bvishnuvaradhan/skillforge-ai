// SessionMonitor - Track learning session metrics in real-time
// CRITICAL: Respects user override controls + flow state

export class SessionMonitor {
  constructor(userId, mentorPreferences) {
    this.userId = userId;
    this.mentorPreferences = mentorPreferences;
    this.sessionData = this.initializeSession();
    this.guidanceCount = 0;
    this.lastGuidanceTime = null;
  }

  // Initialize session tracking
  initializeSession() {
    return {
      startTime: Date.now(),
      endTime: null,
      duration: 0,
      problemsSolved: 0,
      accuracy: 1.0, // 0-1
      performance: [], // Array of individual problem scores
      focusTopic: null,
      contextSwitches: 0,
      lastActivityTime: Date.now(),
      idleTime: 0,
      fatigueIndicators: {
        performanceDropped: false,
        accuracyDeclined: false,
        contextSwitching: false,
        prolongedActivity: false
      },
      guidance: []
    };
  }

  // Update session with problem completion
  updateProblemSolved(accuracy, topicName) {
    this.sessionData.problemsSolved++;
    this.sessionData.accuracy =
      (this.sessionData.accuracy * (this.sessionData.problemsSolved - 1) +
        accuracy) /
      this.sessionData.problemsSolved;
    this.sessionData.performance.push(accuracy);
    this.sessionData.lastActivityTime = Date.now();

    if (!this.sessionData.focusTopic) {
      this.sessionData.focusTopic = topicName;
    } else if (this.sessionData.focusTopic !== topicName) {
      this.sessionData.contextSwitches++;
    }

    this.detectFatiguePatterns();
  }

  // Detect fatigue and burnout patterns
  detectFatiguePatterns() {
    const performance = this.sessionData.performance;

    if (performance.length < 3) return; // Need baseline

    // Check for performance drop
    const recentPerformance = performance.slice(-3);
    const olderPerformance = performance.slice(-6, -3);

    if (olderPerformance.length > 0) {
      const recentAvg =
        recentPerformance.reduce((a, b) => a + b, 0) / recentPerformance.length;
      const olderAvg =
        olderPerformance.reduce((a, b) => a + b, 0) / olderPerformance.length;

      if (recentAvg < olderAvg - 0.15) {
        this.sessionData.fatigueIndicators.performanceDropped = true;
      }
    }

    // Check for accuracy decline
    if (this.sessionData.accuracy < 0.6) {
      this.sessionData.fatigueIndicators.accuracyDeclined = true;
    }

    // Check for excessive context switching
    if (this.sessionData.contextSwitches > 3) {
      this.sessionData.fatigueIndicators.contextSwitching = true;
    }

    // Check for prolonged activity (45+ minutes)
    const elapsedMinutes = (Date.now() - this.sessionData.startTime) / 60000;
    if (elapsedMinutes > 45) {
      this.sessionData.fatigueIndicators.prolongedActivity = true;
    }
  }

  // Check if session guidance should be shown
  shouldShowGuidance(confidence = 0.8) {
    // Check if feature is enabled
    if (!this.mentorPreferences.isFeatureEnabled('sessionGuidance')) {
      return false;
    }

    // Check confidence threshold
    if (confidence < this.mentorPreferences.preferences.sessionInterruptionThreshold) {
      return false;
    }

    // Check max messages per session
    if (
      this.guidanceCount >=
      this.mentorPreferences.preferences.sessionGuidanceMaxPerSession
    ) {
      return false;
    }

    // Respect flow state: don't interrupt too frequently
    if (this.lastGuidanceTime) {
      const timeSinceLastGuidance = Date.now() - this.lastGuidanceTime;
      if (timeSinceLastGuidance < 300000) {
        // 5 minutes minimum between guidance
        return false;
      }
    }

    return true;
  }

  // Generate session guidance based on metrics
  generateGuidance() {
    const guidance = [];

    // Only generate if feature enabled and user allows
    if (!this.mentorPreferences.isFeatureEnabled('sessionGuidance')) {
      return guidance;
    }

    // Performance drop warning
    if (this.sessionData.fatigueIndicators.performanceDropped) {
      guidance.push({
        type: 'performance_drop',
        confidence: 0.85,
        message:
          'Your performance dropped in the last few problems. Want to take a break or switch topics?',
        action: 'suggestion',
        canDismiss: true
      });
    }

    // Accuracy decline warning
    if (
      this.sessionData.fatigueIndicators.accuracyDeclined &&
      this.sessionData.problemsSolved > 5
    ) {
      guidance.push({
        type: 'accuracy_decline',
        confidence: 0.8,
        message:
          'Your accuracy is below 60%. Consider reviewing concepts or taking a break.',
        action: 'suggestion',
        canDismiss: true
      });
    }

    // Context switching suggestion
    if (this.sessionData.fatigueIndicators.contextSwitching) {
      guidance.push({
        type: 'context_switching',
        confidence: 0.75,
        message: `You've switched topics ${this.sessionData.contextSwitches} times. Focusing on one topic helps deeper learning.`,
        action: 'suggestion',
        canDismiss: true
      });
    }

    // Prolonged activity suggestion
    if (this.sessionData.fatigueIndicators.prolongedActivity) {
      const minutesElapsed = Math.round(
        (Date.now() - this.sessionData.startTime) / 60000
      );
      guidance.push({
        type: 'prolonged_activity',
        confidence: 0.9,
        message: `You've been learning for ${minutesElapsed} minutes. A short break can help consolidation.`,
        action: 'suggestion',
        canDismiss: true
      });
    }

    // Positive reinforcement (low frequency)
    if (
      this.sessionData.accuracy > 0.85 &&
      this.sessionData.problemsSolved > 5 &&
      Math.random() > 0.7
    ) {
      guidance.push({
        type: 'positive_reinforcement',
        confidence: 0.95,
        message: `Great consistency! Your accuracy is ${Math.round(
          this.sessionData.accuracy * 100
        )}%. Keep the momentum.`,
        action: 'encouragement',
        canDismiss: true
      });
    }

    return guidance;
  }

  // Record guidance shown to user
  recordGuidanceShown(guidanceItem) {
    this.guidanceCount++;
    this.lastGuidanceTime = Date.now();
    this.sessionData.guidance.push({
      ...guidanceItem,
      timestamp: Date.now(),
      userDismissed: false
    });
  }

  // Record user response to guidance
  recordGuidanceResponse(guidanceId, accepted) {
    const guidance = this.sessionData.guidance.find((g) => g.timestamp === guidanceId);
    if (guidance) {
      guidance.userDismissed = !accepted;
      guidance.acceptedAt = Date.now();
    }
  }

  // End session and calculate summary
  endSession() {
    this.sessionData.endTime = Date.now();
    this.sessionData.duration = Math.round(
      (this.sessionData.endTime - this.sessionData.startTime) / 60000
    ); // Minutes

    return {
      sessionSummary: {
        durationMinutes: this.sessionData.duration,
        problemsSolved: this.sessionData.problemsSolved,
        averageAccuracy: Math.round(this.sessionData.accuracy * 100),
        contextSwitches: this.sessionData.contextSwitches,
        focusTopic: this.sessionData.focusTopic,
        guidanceCount: this.guidanceCount
      },
      fatigueSummary: this.sessionData.fatigueIndicators,
      recommendations: this.generateSessionRecommendations()
    };
  }

  // Generate end-of-session recommendations
  generateSessionRecommendations() {
    const recommendations = [];

    if (this.sessionData.accuracy < 0.6) {
      recommendations.push(
        'Review fundamentals for this topic before continuing'
      );
    }

    if (this.sessionData.contextSwitches > 3) {
      recommendations.push('Focus on one topic at a time for deeper learning');
    }

    if (this.sessionData.duration > 60) {
      recommendations.push('Take breaks every 45-60 minutes to maintain focus');
    }

    if (
      this.sessionData.accuracy > 0.8 &&
      this.sessionData.problemsSolved > 10
    ) {
      recommendations.push(
        'Excellent session! Consider moving to the next topic'
      );
    }

    return recommendations;
  }

  // Get current session metrics
  getMetrics() {
    const elapsedMinutes = Math.round(
      (Date.now() - this.sessionData.startTime) / 60000
    );

    return {
      elapsedMinutes,
      problemsSolved: this.sessionData.problemsSolved,
      averageAccuracy: Math.round(this.sessionData.accuracy * 100),
      focusTopic: this.sessionData.focusTopic,
      contextSwitches: this.sessionData.contextSwitches,
      guidanceCount: this.guidanceCount,
      fatigueLevel: this.calculateFatigueLevel(),
      isFatigued:
        this.sessionData.fatigueIndicators.performanceDropped ||
        this.sessionData.fatigueIndicators.accuracyDeclined ||
        this.sessionData.fatigueIndicators.prolongedActivity
    };
  }

  // Calculate fatigue level (0-1)
  calculateFatigueLevel() {
    let fatigueScore = 0;

    if (this.sessionData.fatigueIndicators.performanceDropped) fatigueScore += 0.3;
    if (this.sessionData.fatigueIndicators.accuracyDeclined) fatigueScore += 0.2;
    if (this.sessionData.fatigueIndicators.contextSwitching) fatigueScore += 0.15;
    if (this.sessionData.fatigueIndicators.prolongedActivity) fatigueScore += 0.35;

    return Math.min(fatigueScore, 1);
  }

  // Get full session data
  getSessionData() {
    return this.sessionData;
  }
}

export default SessionMonitor;
