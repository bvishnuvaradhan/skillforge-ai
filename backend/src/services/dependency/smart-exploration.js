const { TopicStatModel } = require("../../models/TopicStat");
const { UserModel } = require("../../models/User");
const TopicDependencyModel = require("../../models/TopicDependency");
const { validatePrerequisites } = require("./prerequisite-validator");

function parseTargetRole(user) {
  const targetRole = String(user?.profile?.targetRole || "").toLowerCase();
  if (targetRole.includes("front")) return "frontend";
  if (targetRole.includes("back")) return "backend";
  return "fullstack";
}

function getAdjacentRole(role) {
  if (role === "backend") return "frontend";
  if (role === "frontend") return "backend";
  return "fullstack";
}

function getTransferableSkillHint(topic) {
  const normalized = String(topic || "").toLowerCase();
  if (normalized.includes("async")) return "Concurrency and async control transfer across frontend/backend";
  if (normalized.includes("graphs") || normalized.includes("trees")) return "Data-structure reasoning transfers across roles";
  if (normalized.includes("react") || normalized.includes("dom")) return "UI state thinking improves fullstack architecture decisions";
  return "Cross-domain practice broadens problem solving";
}

function scoreSuggestion(validation, dep, userMasteryMap, roleMatch) {
  const bandScore = {
    MASTERED: 95,
    READY: 82,
    DEVELOPING: 65,
    NOT_READY: 35
  }[validation.readinessBand] || 40;

  const prerequisiteStrength = (dep.prerequisites || []).reduce((sum, p) => sum + (p.strength || 0), 0);
  const avgPrereqMastery = (dep.prerequisites || []).length
    ? (dep.prerequisites || []).reduce((sum, p) => sum + (userMasteryMap.get(p.topic) || 0), 0) / dep.prerequisites.length
    : 75;

  const roleBonus = roleMatch ? 10 : 0;
  const readinessInternal = validation.internalReadinessScore || 0;

  return Math.round(
    bandScore * 0.45 +
    readinessInternal * 0.25 +
    Math.min(100, prerequisiteStrength * 100) * 0.15 +
    avgPrereqMastery * 0.15 +
    roleBonus
  );
}

async function suggestNextTopics(userId, options = {}) {
  const limit = options.limit || 8;

  const [user, allDeps, stats] = await Promise.all([
    UserModel.findById(userId),
    TopicDependencyModel.find({}),
    TopicStatModel.find({ user: userId })
  ]);

  const targetRole = parseTargetRole(user);
  const adjacentRole = getAdjacentRole(targetRole);
  const masteryMap = new Map(stats.map((s) => [s.topic, s.masteryScore || 0]));

  const evaluated = [];
  for (const dep of allDeps) {
    const currentMastery = masteryMap.get(dep.topic) || 0;
    if (currentMastery >= 90) continue;

    const validation = await validatePrerequisites(userId, dep.topic);
    const roleMatch = dep.role === targetRole || dep.roles?.includes(targetRole) || targetRole === "fullstack";
    const adjacentRoleMatch = dep.role === adjacentRole || dep.roles?.includes(adjacentRole);
    const score = scoreSuggestion(validation, dep, masteryMap, roleMatch);

    evaluated.push({
      topic: dep.topic,
      role: dep.role,
      readinessBand: validation.readinessBand,
      readinessInternal: validation.internalReadinessScore,
      score,
      roleMatch,
      adjacentRoleMatch,
      currentMastery,
      prerequisites: validation.prerequisites,
      transferableSkillHint: getTransferableSkillHint(dep.topic),
      reason:
        validation.readinessBand === "READY" || validation.readinessBand === "MASTERED"
          ? "Common next step with strong prerequisite coverage"
          : "Optional preparation can improve expected retention",
      successMessage: "Many learners with similar foundations succeed here.",
      confidence: Math.min(95, Math.max(45, Math.round((validation.internalReadinessScore || 50) * 0.9)))
    });
  }

  const roleAligned = evaluated
    .filter((e) => e.roleMatch)
    .sort((a, b) => b.score - a.score);
  const crossDomain = evaluated
    .filter((e) => !e.roleMatch)
    .sort((a, b) => b.score - a.score);

  const roleCount = Math.max(1, Math.floor(limit * 0.8));
  const crossCount = Math.max(1, limit - roleCount);

  const selected = [
    ...roleAligned.slice(0, roleCount),
    ...crossDomain.slice(0, crossCount)
  ].slice(0, limit);

  return {
    targetRole,
    adjacentRole,
    suggestions: selected,
    coverage: {
      roleAligned: selected.filter((s) => s.roleMatch).length,
      crossDomain: selected.filter((s) => !s.roleMatch).length
    },
    stagnationSignal: selected.filter((s) => !s.roleMatch).length === 0,
    breadthPrompt: "Optional breadth exploration can improve long-term adaptability."
  };
}

module.exports = {
  suggestNextTopics,
  parseTargetRole
};
