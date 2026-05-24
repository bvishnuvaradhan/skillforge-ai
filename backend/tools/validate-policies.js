#!/usr/bin/env node
const { DEFAULT_POLICIES, getActivePolicies } = require("../src/services/governance/policy-registry");
const { validatePolicyInvariants } = require("../src/services/governance/invariant-validator");

function main() {
  const active = getActivePolicies();
  const res = validatePolicyInvariants(active);
  if (!res.valid) {
    console.error("Policy invariant validation failed:");
    res.issues.forEach((i) => console.error(" - ", i));
    process.exitCode = 2;
    return;
  }
  console.log("Policy invariants OK");
}

if (require.main === module) main();
