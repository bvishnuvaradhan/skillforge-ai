// Mastery Propagation Service
// Propagates mastery gains to direct dependent topics only.
// CRITICAL SAFEGUARD: Hard 20% cap, single-pass, and daily cumulative cap.

const TopicDependencyModel = require("../../models/TopicDependency");
const { TopicStatModel } = require("../../models/TopicStat");
const MasteryPropagationModel = require("../../models/MasteryPropagation");
const PropagationHistoryModel = require("../../models/PropagationHistory");

const MAX_PROPAGATION_RATIO = 0.2;
const MAX_PROPAGATION_PER_TOPIC = 3;
const MAX_TOTAL_PROPAGATION_PER_DAY = 5;

async function getTodayPropagationUsed(userId) {
  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const events = await MasteryPropagationModel.find({
    user: userId,
    triggeredAt: { $gte: start }
  }).select("totalPropagation");

  return events.reduce((sum, event) => sum + (event.totalPropagation || 0), 0);
}

async function propagateMasteryGain(userId, topic, previousMastery, newMastery) {
  try {
    console.log(`[PROPAGATION] trigger topic=${topic} user=${userId}`);
    const directGain = newMastery - previousMastery;
    if (directGain <= 0.5) {
      return { affected: 0, totalPropagation: 0 };
    }

    const topicDeps = await TopicDependencyModel.findOne({ topic });
    if (!topicDeps || !Array.isArray(topicDeps.unlocksTopics) || topicDeps.unlocksTopics.length === 0) {
      return { affected: 0, totalPropagation: 0 };
    }

    const alreadyUsedToday = await getTodayPropagationUsed(userId);
    let dailyRemaining = Math.max(0, MAX_TOTAL_PROPAGATION_PER_DAY - alreadyUsedToday);
    if (dailyRemaining <= 0) {
      return {
        affected: 0,
        totalPropagation: 0,
        message: "Daily propagation limit reached"
      };
    }

    const visited = new Set([topic]);
    const propagationEvents = [];
    const lineage = [];
    let totalPropagation = 0;

    for (const dependent of topicDeps.unlocksTopics) {
      if (!dependent || !dependent.topic || visited.has(dependent.topic)) {
        continue;
      }

      visited.add(dependent.topic);

      const rawPropagation = directGain * (dependent.spilloverFactor || 0);
      const cappedMax = Math.min(
        directGain * MAX_PROPAGATION_RATIO,
        MAX_PROPAGATION_PER_TOPIC,
        dailyRemaining
      );
      const actualPropagation = Math.min(rawPropagation, cappedMax);
      const capEnforced = actualPropagation < rawPropagation;

      if (actualPropagation < 0.1) {
        continue;
      }

      const dependentStat = await TopicStatModel.findOne({ user: userId, topic: dependent.topic });
      const previousDependentMastery = dependentStat?.masteryScore || 0;
      const directMasteryScore = dependentStat?.directMasteryScore ?? previousDependentMastery;
      const propagatedMasteryScore = dependentStat?.propagatedMasteryScore || 0;
      const nextPropagatedMastery = Math.min(100, propagatedMasteryScore + actualPropagation);
      const newDependentMastery = Math.min(100, directMasteryScore + nextPropagatedMastery);

      await TopicStatModel.findOneAndUpdate(
        { user: userId, topic: dependent.topic },
        {
          masteryScore: newDependentMastery,
          directMasteryScore,
          propagatedMasteryScore: nextPropagatedMastery,
          propagationSources: Array.from(new Set([...(dependentStat?.propagationSources || []), topic])),
          lastUpdated: new Date()
        },
        { upsert: true, new: true }
      );

      propagationEvents.push({
        affectedTopic: dependent.topic,
        spilloverFactor: dependent.spilloverFactor || 0,
        directGainAmount: directGain,
        maxAllowedPropagation: cappedMax,
        actualPropagation,
        capEnforced,
        capReason: "CRITICAL: 20% hard cap rule enforced",
        previousMasteryAffected: previousDependentMastery,
        newMasteryAffected: newDependentMastery,
        calculatedAt: new Date()
      });

      lineage.push({
        fromTopic: topic,
        toTopic: dependent.topic,
        amount: actualPropagation,
        confidence: dependent.confidence || 0.7,
        reason: "Direct dependent spillover with hard cap"
      });

      totalPropagation += actualPropagation;
      dailyRemaining = Math.max(0, dailyRemaining - actualPropagation);

      if (dailyRemaining <= 0) {
        break;
      }
    }

    await MasteryPropagationModel.create({
      user: userId,
      triggerTopic: topic,
      previousMastery,
      currentMastery: newMastery,
      directGain,
      propagationEvents,
      topicsAffected: propagationEvents.length,
      totalPropagation,
      propagationPercentOfDirect: directGain > 0 ? totalPropagation / directGain : 0,
      visitedTopics: Array.from(visited),
      recursionDepth: 1,
      cycleDetected: false,
      triggeredAt: new Date()
    });

    await PropagationHistoryModel.create({
      user: userId,
      eventId: `${topic}-${Date.now()}`,
      triggerTopic: topic,
      sourceType: "system",
      directGain,
      totalPropagatedGain: totalPropagation,
      cappedByRule: true,
      lineage,
      dailyCapApplied: dailyRemaining <= 0,
      maxDepth: 1,
      visitedTopics: Array.from(visited),
      audit: {
        calculatedAt: new Date(),
        notes: "Single-pass propagation only"
      }
    });

    console.log(`[PROPAGATION] affected=${propagationEvents.length} total=${totalPropagation.toFixed(2)}`);

    return {
      affected: propagationEvents.length,
      totalPropagation,
      propagationEvents,
      message: `${propagationEvents.length} topics improved from ${topic}`
    };
  } catch (error) {
    console.error("[Dependency] Error propagating mastery:", error);
    return { affected: 0, totalPropagation: 0, error: true };
  }
}

module.exports = {
  propagateMasteryGain,
  MAX_PROPAGATION_RATIO,
  MAX_TOTAL_PROPAGATION_PER_DAY,
  MAX_PROPAGATION_PER_TOPIC
};
