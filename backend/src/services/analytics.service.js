const { SubmissionModel } = require("../models/Submission");
const { TopicStatModel } = require("../models/TopicStat");
const { AnalyticsSnapshotModel } = require("../models/AnalyticsSnapshot");
const { SkillDecayModel } = require("../models/SkillDecay");
const { CodingProfileModel } = require("../models/CodingProfile");

/**
 * Main analytics service to process user data and generate insights.
 */
async function processUserAnalytics(userId) {
  console.log(`Processing deep analytics for user: ${userId}`);
  
  try {
    const insights = [];

    // 1. Calculate Topic Mastery
    await calculateTopicMastery(userId, insights);
    
    // 2. Process Skill Decay & Revision Queue
    await processSkillDecay(userId, insights);
    
    // 3. Generate Snapshot with Insights
    await generateDailySnapshot(userId, insights);
    
    // 4. Detect DNA Patterns (v1) with Confidence
    await detectDNAPatterns(userId);
    
    return { success: true };
  } catch (error) {
    console.error(`Analytics processing failed for ${userId}:`, error.message);
    throw error;
  }
}

/**
 * Aggregates submissions to calculate mastery levels per topic.
 */
async function calculateTopicMastery(userId, insights) {
  const submissions = await SubmissionModel.find({ user: userId, status: 'accepted' });
  
  const topicAgg = {};
  submissions.forEach(sub => {
    sub.topics.forEach(topic => {
      if (!topicAgg[topic]) {
        topicAgg[topic] = { solved: 0, totalUDI: 0, count: 0 };
      }
      topicAgg[topic].solved += 1;
      topicAgg[topic].totalUDI += sub.udi;
      topicAgg[topic].count += 1;
    });
  });

  for (const [topic, stats] of Object.entries(topicAgg)) {
    const avgUDI = stats.totalUDI / stats.count;
    const masteryScore = Math.min(100, Math.round(avgUDI * 10));
    
    const existing = await TopicStatModel.findOne({ user: userId, topic });
    if (existing && masteryScore > existing.masteryScore + 5) {
      insights.push({
        type: 'growth_streak',
        topic,
        message: `Your ${topic} mastery jumped by ${masteryScore - existing.masteryScore}%!`,
        severity: 'success'
      });
    }

    await TopicStatModel.findOneAndUpdate(
      { user: userId, topic },
      {
        masteryScore,
        solvedCount: stats.solved,
        lastSolvedAt: new Date(),
        stability: Math.max(10, stats.solved * 2)
      },
      { upsert: true }
    );
  }
}

/**
 * Calculates retention scores and identifies critical revision topics.
 */
async function processSkillDecay(userId, insights) {
  const stats = await TopicStatModel.find({ user: userId });
  const now = new Date();

  for (const stat of stats) {
    const t = (now - new Date(stat.lastSolvedAt)) / (1000 * 60 * 60 * 24); // days
    const S = stat.stability || 10;
    const retentionScore = Math.exp(-t / S);

    let status = 'stable';
    if (retentionScore < 0.6) {
      status = 'critical';
      insights.push({
        type: 'mastery_drop',
        topic: stat.topic,
        message: `Your ${stat.topic} retention is low (${Math.round(retentionScore * 100)}%). Consider a revision solve.`,
        severity: 'warning'
      });
    } else if (retentionScore < 0.8) {
      status = 'decaying';
    }

    await SkillDecayModel.create({
      user: userId,
      topic: stat.topic,
      retentionScore,
      stability: S,
      daysSinceLastSolve: Math.floor(t),
      status
    });
  }
}

/**
 * Detects initial DNA patterns with confidence scoring.
 */
async function detectDNAPatterns(userId) {
  const submissions = await SubmissionModel.find({ user: userId }).sort({ solvedAt: -1 }).limit(100);
  
  if (submissions.length < 5) return;

  const retryCount = submissions.reduce((acc, s) => acc + (s.retries || 0), 0);
  const avgRetries = retryCount / submissions.length;
  const confidence = Math.min(0.95, submissions.length / 50);

  let dnaType = "Consistent Learner";
  if (avgRetries > 3) dnaType = "Persistent Explorer";
  if (submissions.length > 20 && avgRetries < 0.5) dnaType = "Speed Strategist";
  if (submissions.some(s => s.udi >= 8)) dnaType = "Deep Diver";

  await AnalyticsSnapshotModel.findOneAndUpdate(
    { user: userId, date: { $gte: new Date().setHours(0,0,0,0) } },
    { 'skillDNA.type': dnaType, 'skillDNA.confidence': confidence },
    { upsert: true }
  );
}

/**
 * Generates the daily snapshot by aggregating platform stats.
 */
async function generateDailySnapshot(userId, insights) {
  // CORRECTED: Sum total solved from all linked platforms instead of just submissions count
  const profiles = await CodingProfileModel.find({ user: userId });
  const totalSolved = profiles.reduce((acc, p) => acc + (p.stats?.totalSolved || 0), 0);
  
  const activeDays = (await SubmissionModel.distinct('solvedAt', { user: userId })).length;

  // Calculate consistency based on active days in the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentActiveDays = (await SubmissionModel.distinct('solvedAt', { 
    user: userId, 
    solvedAt: { $gte: thirtyDaysAgo } 
  })).length;
  const consistencyScore = Math.min(100, Math.round((recentActiveDays / 20) * 100)); // Target 20 days/month

  await AnalyticsSnapshotModel.findOneAndUpdate(
    { user: userId, date: { $gte: new Date().setHours(0,0,0,0) } },
    {
      totalSolved,
      consistencyScore,
      activeDays,
      insights: insights.slice(0, 5),
      date: new Date(),
    },
    { upsert: true }
  );
}

module.exports = {
  processUserAnalytics
};
