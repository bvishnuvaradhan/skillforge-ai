const GOVERNANCE_PRIORITY = {
  critical_decay_bypass: 100,
  topic_cooldown: 80,
  daily_cap: 70,
  diversity_balance: 50
};

const GOVERNANCE_CATEGORIES = {
  critical_decay_bypass: "integrity",
  topic_cooldown: "stability",
  daily_cap: "capacity",
  diversity_balance: "diversity"
};

function resolvePrecedence(ruleName) {
  return GOVERNANCE_PRIORITY[ruleName] || 0;
}

function sortPoliciesByPrecedence(policies = []) {
  return [...policies].sort((a, b) => {
    const pA = resolvePrecedence(a.rule);
    const pB = resolvePrecedence(b.rule);
    if (pA !== pB) return pB - pA;
    const aCategory = GOVERNANCE_CATEGORIES[a.rule] || a.category || "general";
    const bCategory = GOVERNANCE_CATEGORIES[b.rule] || b.category || "general";
    if (aCategory !== bCategory) return String(aCategory).localeCompare(String(bCategory));
    return String(a.rule).localeCompare(String(b.rule));
  });
}

function resolvePolicyCategory(ruleName) {
  return GOVERNANCE_CATEGORIES[ruleName] || "general";
}

module.exports = {
  GOVERNANCE_PRIORITY,
  GOVERNANCE_CATEGORIES,
  resolvePrecedence,
  resolvePolicyCategory,
  sortPoliciesByPrecedence
};
