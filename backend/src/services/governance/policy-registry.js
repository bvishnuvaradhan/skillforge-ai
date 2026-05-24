const { sortPoliciesByPrecedence } = require("./governance-hierarchy");

const DEFAULT_POLICIES = [
  {
    rule: "critical_decay_bypass",
    category: "integrity",
    priority: 100,
    action: "allow",
    description: "Critical decay candidates bypass cooldown and diversity constraints"
  },
  {
    rule: "topic_cooldown",
    category: "stability",
    priority: 80,
    cooldownHours: 24,
    action: "defer",
    description: "Defer repeated topics in cooldown window"
  },
  {
    rule: "daily_cap",
    category: "capacity",
    priority: 70,
    action: "defer",
    description: "Enforce per-run recommendation cap"
  },
  {
    rule: "diversity_balance",
    category: "diversity",
    priority: 50,
    action: "defer",
    description: "Preserve category diversity before filling remaining slots"
  }
];

function getActivePolicies(overrides = []) {
  const merged = [...DEFAULT_POLICIES, ...(overrides || [])];
  return sortPoliciesByPrecedence(merged);
}

function getPolicyByRule(ruleName, overrides = []) {
  return getActivePolicies(overrides).find((policy) => policy.rule === ruleName) || null;
}

module.exports = {
  DEFAULT_POLICIES,
  getActivePolicies,
  getPolicyByRule
};
