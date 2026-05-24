const { getActivePolicies } = require("./policy-registry");
const { evaluatePolicyDecision } = require("./policy-evaluator");
const { resolvePolicyCategory, resolvePrecedence } = require("./governance-hierarchy");

function evaluateCandidateWithPolicies(candidate, context = {}) {
  const policies = getActivePolicies(context.policyOverrides);
  const decision = evaluatePolicyDecision(candidate, context);
  const activePolicy = policies.find((policy) => policy.rule === decision.rule) || null;

  return {
    ...decision,
    policyCategory: resolvePolicyCategory(decision.rule),
    policyPrecedence: resolvePrecedence(decision.rule),
    policyOrder: policies.map((policy) => policy.rule),
    policySummary: policies.map((policy) => ({
      rule: policy.rule,
      category: policy.category || resolvePolicyCategory(policy.rule),
      priority: Number(policy.priority || resolvePrecedence(policy.rule)),
      cooldownHours: policy.cooldownHours || null
    })),
    activePolicy
  };
}

function dryRunGovernance(candidates = [], context = {}) {
  return (candidates || []).map((candidate) => ({
    recommendationId: String(candidate._id || ""),
    topic: candidate.topic,
    type: candidate.type,
    decision: evaluateCandidateWithPolicies(candidate, context)
  }));
}

module.exports = {
  evaluateCandidateWithPolicies,
  dryRunGovernance
};
