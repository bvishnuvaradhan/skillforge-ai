/**
 * Governance invariant validator
 * Simple static checks to catch obvious policy conflicts before deployment.
 */
function validatePolicyInvariants(policySet = []) {
  const issues = [];

  if (!Array.isArray(policySet)) {
    return { valid: false, issues: ["policySet must be an array"] };
  }

  const seen = new Set();
  for (const p of policySet) {
    if (!p || typeof p !== "object") {
      issues.push("invalid policy entry");
      continue;
    }
    if (!p.rule) issues.push("policy missing rule id");
    if (seen.has(p.rule)) issues.push(`duplicate rule id: ${p.rule}`);
    seen.add(p.rule);
    if (typeof p.priority !== "number") issues.push(`rule ${p.rule} missing numeric priority`);
  }

  // detect priority collisions (two rules with same priority)
  const byPriority = {};
  for (const p of policySet) {
    if (typeof p.priority === "number") {
      byPriority[p.priority] = byPriority[p.priority] || [];
      byPriority[p.priority].push(p.rule || "<unknown>");
    }
  }
  Object.entries(byPriority).forEach(([prio, rules]) => {
    if (rules.length > 1) issues.push(`priority collision ${prio} -> ${rules.join(",")}`);
  });

  return { valid: issues.length === 0, issues };
}

module.exports = { validatePolicyInvariants };
