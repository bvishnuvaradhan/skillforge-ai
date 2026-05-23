// Role-Specific Decay Analysis
// Separate decay rates per role (backend, frontend, fullstack)

const { SkillDecayModel } = require("../../models/SkillDecay");
const { TopicStatModel } = require("../../models/TopicStat");

// Map of topics to roles
const TOPIC_ROLE_MAP = {
  backend: [
    "database",
    "system-design",
    "rest-api",
    "microservices",
    "sql",
    "mongodb",
    "cache",
    "authentication",
    "authorization"
  ],
  frontend: [
    "react",
    "javascript",
    "css",
    "html",
    "vue",
    "angular",
    "typescript",
    "dom",
    "responsive-design"
  ],
  fullstack: [
    "node",
    "express",
    "web-development",
    "devops",
    "deployment",
    "docker",
    "testing"
  ]
};

async function analyzeRoleSpecificDecay(userId, role) {
  try {
    console.log(`[Decay] Analyzing ${role}-specific decay for user ${userId}`);

    if (!TOPIC_ROLE_MAP[role]) {
      throw new Error(`Unknown role: ${role}`);
    }

    const roleTopics = TOPIC_ROLE_MAP[role];

    // Get decay data for this role's topics
    const decayData = await SkillDecayModel.find({
      user: userId,
      topic: { $in: roleTopics }
    });

    if (decayData.length === 0) {
      console.log(`[Decay] No decay data for role ${role}`);
      return null;
    }

    // Calculate average retention and halfLife
    let totalRetention = 0;
    let topicsAtRisk = {
      critical: [],
      warning: [],
      safe: []
    };

    for (const data of decayData) {
      totalRetention += data.retentionScore;

      if (data.retentionScore < 0.3) {
        topicsAtRisk.critical.push(data.topic);
      } else if (data.retentionScore < 0.5) {
        topicsAtRisk.warning.push(data.topic);
      } else {
        topicsAtRisk.safe.push(data.topic);
      }
    }

    const avgRetention = totalRetention / decayData.length;

    // Get topic stats to detect focus trends
    const topicStats = await TopicStatModel.find({
      user: userId,
      topic: { $in: roleTopics }
    });

    // Calculate role focus: what % of recent submissions in this role?
    let focusPercentage = 0;
    if (topicStats.length > 0) {
      const roleSubmissions = topicStats.reduce((sum, ts) => sum + (ts.solvedCount || 0), 0);
      const allTopics = await TopicStatModel.find({ user: userId });
      const totalSubmissions = allTopics.reduce((sum, ts) => sum + (ts.solvedCount || 0), 0);
      focusPercentage = totalSubmissions > 0 ? (roleSubmissions / totalSubmissions) * 100 : 0;
    }

    // Trend detection: compare old vs recent retention
    const recentCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days
    const recentData = decayData.filter((d) => d.checkedAt >= recentCutoff);
    const oldData = decayData.filter((d) => d.checkedAt < recentCutoff);

    let trend = "stable";
    if (recentData.length > 0 && oldData.length > 0) {
      const recentAvg = recentData.reduce((sum, d) => sum + d.retentionScore, 0) / recentData.length;
      const oldAvg = oldData.reduce((sum, d) => sum + d.retentionScore, 0) / oldData.length;
      const change = recentAvg - oldAvg;

      if (change > 0.1) {
        trend = "improving";
      } else if (change < -0.1) {
        trend = "declining";
      }
    }

    // Estimate role-specific halfLife (simplified: average of topic halfLives)
    const estimatedHalfLife =
      decayData.reduce((sum, d) => sum + (d.solveCount || 1) * 2, 0) / decayData.length;

    const result = {
      role: role,
      estimatedHalfLife: parseFloat(estimatedHalfLife.toFixed(2)),
      averageRetention: parseFloat(avgRetention.toFixed(2)),
      topicsCritical: topicsAtRisk.critical.length,
      topicsWarning: topicsAtRisk.warning.length,
      topicsSafe: topicsAtRisk.safe.length,
      focusPercentage: parseFloat(focusPercentage.toFixed(1)),
      trend: trend,
      topicsAtRisk: topicsAtRisk,
      description:
        `${role} learning: ${topicsAtRisk.critical.length} critical, ` +
        `${topicsAtRisk.warning.length} warning, ${topicsAtRisk.safe.length} safe. ` +
        `Focus: ${focusPercentage.toFixed(0)}%, Trend: ${trend}`
    };

    console.log(`[Decay] ${result.description}`);

    return result;
  } catch (error) {
    console.error(`[Decay] Error analyzing role-specific decay:`, error);
    throw error;
  }
}

// Analyze all roles for user
async function analyzeAllRoles(userId) {
  try {
    console.log(`[Decay] Analyzing all roles for user ${userId}`);

    const roles = ["backend", "frontend", "fullstack"];
    const results = {};

    for (const role of roles) {
      const analysis = await analyzeRoleSpecificDecay(userId, role);
      if (analysis) {
        results[role] = analysis;
      }
    }

    console.log(`[Decay] Analyzed ${Object.keys(results).length} roles`);

    return results;
  } catch (error) {
    console.error(`[Decay] Error analyzing all roles:`, error);
    throw error;
  }
}

// Get user's primary role based on focus
function getPrimaryRole(roleAnalyses) {
  let primaryRole = null;
  let maxFocus = 0;

  for (const [role, analysis] of Object.entries(roleAnalyses)) {
    if (analysis.focusPercentage > maxFocus) {
      maxFocus = analysis.focusPercentage;
      primaryRole = role;
    }
  }

  return primaryRole;
}

module.exports = {
  analyzeRoleSpecificDecay,
  analyzeAllRoles,
  getPrimaryRole,
  TOPIC_ROLE_MAP
};
