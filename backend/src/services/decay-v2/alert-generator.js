// Decay Alert Generator
// Creates proactive notifications based on forecasts and timing

const { DecayAlertModel } = require("../../models/DecayAlert");

async function generateDecayAlerts(userId, topic, forecast, optimalTiming) {
  try {
    console.log(`[Decay] Generating alerts for ${userId} / ${topic}`);

    const alerts = [];

    // ALERT 1: Review Window Opening (48 hours before)
    if (optimalTiming && optimalTiming.daysUntilWindow > 0) {
      const windowOpensInDays = Math.round(
        (optimalTiming.windowOpensAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (windowOpensInDays === 2 || windowOpensInDays === 1) {
        // Trigger 48-72 hours before window
        const alert = {
          type: "review_window_open",
          severity: 2,
          triggersAt: new Date(),
          message: `Your ${topic} review window is opening. You have ${optimalTiming.windowDurationDays} days for optimal benefit.`,
          reason: `Retention at 70% threshold approaching (optimal time to review)`,
          action: {
            type: "practice",
            topic: topic,
            recommendedCount: 2,
            difficulty: 5
          }
        };
        alerts.push(alert);
      }
    }

    // ALERT 2: Reaching Critical
    if (forecast && forecast.forecasts.day7.retention < 0.6) {
      const criticalDay = calculateDayToRetention(0.5, forecast.estimatedHalfLife);
      const alert = {
        type: "reaching_critical",
        severity: 4,
        triggersAt: new Date(),
        message: `Your ${topic} mastery will drop to 50% in ~${Math.round(criticalDay)} days without practice.`,
        reason: `7-day forecast shows ${(forecast.forecasts.day7.retention * 100).toFixed(0)}% retention`,
        action: {
          type: "revision",
          topic: topic,
          recommendedCount: 3,
          difficulty: 5
        }
      };
      alerts.push(alert);
    }

    // ALERT 3: Delay Penalty Warning
    if (optimalTiming && optimalTiming.delayPenalty > 20) {
      const timeSinceOptimal = Math.round(
        (Date.now() - optimalTiming.optimalDay.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (timeSinceOptimal > 0) {
        // User is past optimal window
        const alert = {
          type: "delay_penalty",
          severity: 3,
          triggersAt: new Date(),
          message: `Reviewing ${topic} now has ${Math.max(
            0,
            100 - timeSinceOptimal * optimalTiming.delayPenalty
          )}% effectiveness vs optimal.`,
          reason: `${timeSinceOptimal}d past optimal review window`,
          action: {
            type: "practice",
            topic: topic,
            recommendedCount: 2,
            difficulty: 5
          }
        };
        alerts.push(alert);
      }
    }

    // ALERT 4: Reactivation Needed
    if (forecast && forecast.riskLevel === "critical" && forecast.currentRetention < 0.3) {
      const alert = {
        type: "reactivation_needed",
        severity: 5,
        triggersAt: new Date(),
        message: `Your ${topic} mastery has nearly disappeared (${(forecast.currentRetention * 100).toFixed(
          0
        )}%). Immediate reactivation needed.`,
        reason: `Critical retention threshold breached`,
        action: {
          type: "revision",
          topic: topic,
          recommendedCount: 5,
          difficulty: 3
        }
      };
      alerts.push(alert);
    }

    console.log(`[Decay] Generated ${alerts.length} alerts`);

    return alerts;
  } catch (error) {
    console.error(`[Decay] Error generating alerts:`, error);
    throw error;
  }
}

// Helper: Calculate what day retention will reach a threshold
function calculateDayToRetention(targetRetention, halfLife, currentRetention = 1.0) {
  if (targetRetention <= 0 || targetRetention >= currentRetention) {
    return 0;
  }

  // R = e^(-t/S) → t = -S * ln(R/R0)
  const dayToThreshold = -halfLife * Math.log(targetRetention / currentRetention);
  return Math.max(0, dayToThreshold);
}

// Deduplicate alerts: prevent spam of same type
async function deduplicateAlerts(userId, topic, newAlerts) {
  try {
    // Get recent alerts (last 24 hours)
    const recentCutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentAlerts = await DecayAlertModel.find({
      user: userId,
      topic: topic,
      dismissed: false,
      createdAt: { $gte: recentCutoff }
    });

    // Index recent alerts by type
    const recentByType = {};
    for (const alert of recentAlerts) {
      recentByType[alert.type] = alert;
    }

    // Filter new alerts: skip if same type already exists
    const deduplicated = newAlerts.filter((newAlert) => {
      if (recentByType[newAlert.type]) {
        console.log(`[Decay] Skipping duplicate alert type: ${newAlert.type}`);
        return false; // Skip this alert (already shown recently)
      }
      return true;
    });

    console.log(
      `[Decay] Deduplication: ${newAlerts.length} → ${deduplicated.length} alerts`
    );

    return deduplicated;
  } catch (error) {
    console.error(`[Decay] Error deduplicating alerts:`, error);
    return newAlerts; // Return all if dedup fails
  }
}

// Save alerts to database
async function saveAlerts(userId, topic, alerts) {
  try {
    if (!alerts || alerts.length === 0) {
      return [];
    }

    const alertDocs = alerts.map((alert) => ({
      user: userId,
      topic: topic,
      ...alert
    }));

    const saved = await DecayAlertModel.insertMany(alertDocs);
    console.log(`[Decay] Saved ${saved.length} alerts to database`);
    return saved;
  } catch (error) {
    console.error(`[Decay] Error saving alerts:`, error);
    throw error;
  }
}

module.exports = {
  generateDecayAlerts,
  calculateDayToRetention,
  deduplicateAlerts,
  saveAlerts
};
