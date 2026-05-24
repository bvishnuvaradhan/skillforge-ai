function evaluatePolicyDecision(candidate, context) {
  const isCritical = candidate.hardFlags?.criticalDecay === true;
  if (isCritical) {
    return {
      decision: "allow",
      rule: "critical_decay_bypass",
      reason: "Critical decay risk bypassed cooldown and balancing policies"
    };
  }

  if (context.cooldownTopics?.has(candidate.topic)) {
    return {
      decision: "defer",
      rule: "topic_cooldown",
      reason: "Deferred by topic cooldown"
    };
  }

  if (context.selectedCount >= context.maxDaily) {
    return {
      decision: "defer",
      rule: "daily_cap",
      reason: "Deferred by daily recommendation cap"
    };
  }

  if (context.shouldPreserveDiversity) {
    return {
      decision: "defer",
      rule: "diversity_balance",
      reason: "Deferred to preserve diversity balance"
    };
  }

  return {
    decision: "allow",
    rule: "selection",
    reason: "Allowed by governance policy"
  };
}

module.exports = {
  evaluatePolicyDecision
};
