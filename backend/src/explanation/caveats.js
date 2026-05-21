// Caveats generator - limitations, contradictions, whenToIgnore
// RULE: Only include caveat sections that have content. Hide empty sections.

function generateCaveats(rec, metrics, submissionData) {
  const caveats = {};

  // LIMITATIONS: Data quality issues
  const limitations = [];

  if (submissionData.count < 10) {
    limitations.push(`Limited data (${submissionData.count} submissions - recommend 10+)`);
  }
  if (submissionData.count < 5) {
    limitations.push(`Very weak signal (less than 5 submissions)`);
  }

  if (submissionData.daysSinceLastSubmit > 30) {
    limitations.push("Data is stale (no activity in 30+ days)");
  }

  if (submissionData.daysSinceLastSubmit > 7 && submissionData.daysSinceLastSubmit <= 30) {
    limitations.push(`Moderate recency (last activity ${submissionData.daysSinceLastSubmit} days ago)`);
  }

  if (submissionData.consistency && submissionData.consistency < 50) {
    limitations.push("Inconsistent submission pattern - patterns may not be reliable");
  }

  if (limitations.length > 0) {
    caveats.limitations = limitations;
  }

  // CONTRADICTIONS: Conflicting signals
  const contradictions = [];

  if (rec.type === "revision") {
    // High retention but recommendation says revise
    if (metrics.retention > 0.75 && metrics.daysSinceSolve <= 7) {
      contradictions.push("Recent retention is actually strong - you may remember better than formula suggests");
    }

    // Recent success contradicts decay
    if (submissionData.recentPassRate > 0.8 && metrics.daysSinceSolve > 10) {
      contradictions.push("Recent success contradicts decay calculation - you might retain knowledge better than predicted");
    }

    // Few recent failures
    if (submissionData.recentFailCount < 1) {
      contradictions.push("No recent failures detected - your retention may be higher than indicated");
    }
  }

  if (rec.type === "weak-topic") {
    // Recent success contradicts weak topic claim
    if (submissionData.recentPassRate > 0.7) {
      contradictions.push("Recent success rate is high - you may be improving rapidly, contradicting weak designation");
    }

    // Only a few problems, not enough data
    if (submissionData.count < 8) {
      contradictions.push("Small sample size - weakness signal may not be reliable yet");
    }
  }

  if (rec.type === "difficulty-increase") {
    // Inconsistent recent performance
    if (submissionData.consistency && submissionData.consistency < 70) {
      contradictions.push("Recent performance is inconsistent - may not be ready for harder problems yet");
    }

    // Only few recent problems
    if (submissionData.count < 10) {
      contradictions.push("Limited recent attempts - mastery may not be as stable as indicated");
    }
  }

  if (rec.type === "difficulty-decrease") {
    // Recent improvement
    if (submissionData.recentTrendImproving) {
      contradictions.push("Your recent trend is improving - wait a few more attempts before reducing difficulty");
    }

    // Some recent successes
    if (submissionData.recentPassCount > 1) {
      contradictions.push("You have recent successes - you might be adapting rather than struggling");
    }
  }

  if (contradictions.length > 0) {
    caveats.contradictions = contradictions;
  }

  // WHEN TO IGNORE: Contextual exceptions
  const whenToIgnore = [];

  if (rec.type === "revision") {
    if (submissionData.count < 5) {
      whenToIgnore.push("If you just started learning this topic (less than 5 submissions)");
    }
    whenToIgnore.push("If you're experiencing temporary burnout - take a break instead");
    whenToIgnore.push("If you just practiced this in last 48 hours - fresh knowledge is still strong");
  }

  if (rec.type === "weak-topic") {
    if (submissionData.count < 8) {
      whenToIgnore.push("If you just started this topic - weak signal with few attempts");
    }
    whenToIgnore.push("If you're learning multiple topics simultaneously - focus may be distributed");
    whenToIgnore.push("If recent attempts show improvement trend - wait to confirm consistency");
  }

  if (rec.type === "difficulty-increase") {
    whenToIgnore.push("If you're feeling unsure despite high success rate - trust your instinct");
    whenToIgnore.push("If recent problems were mostly easy ones - challenge with mix first");
    whenToIgnore.push("If you're learning multiple topics - consolidate before increasing");
  }

  if (rec.type === "difficulty-decrease") {
    whenToIgnore.push("If you just started this difficulty level (less than 5 attempts)");
    whenToIgnore.push("If you're learning a new concept - ramp time is normal");
    whenToIgnore.push("If you see improvement trend - wait a few more attempts to confirm");
  }

  if (rec.type === "exploration") {
    if (submissionData.count < 3) {
      whenToIgnore.push("If you're still building foundation in current topics");
    }
    whenToIgnore.push("If you're overwhelmed by current workload - consolidate first");
    whenToIgnore.push("If prerequisites feel weak - return to strengthen them first");
  }

  if (whenToIgnore.length > 0) {
    caveats.whenToIgnore = whenToIgnore;
  }

  // WHAT WOULD CHANGE: Sensitivity analysis
  const whatWouldChange = [];

  if (rec.type === "revision") {
    whatWouldChange.push("Solving 3+ problems in next 48hrs would lower urgency");
    whatWouldChange.push("Not solving for 30+ days would increase to critical priority");
    whatWouldChange.push("If retention climbs above 70%, recommendation becomes obsolete");
  }

  if (rec.type === "weak-topic") {
    whatWouldChange.push("Solving 5+ more problems with 80%+ success would increase confidence");
    whatWouldChange.push("If mastery reaches 50%+, weak topic recommendation ends");
    whatWouldChange.push("Drop below 50 mastery with more data would strengthen this recommendation");
  }

  if (rec.type === "difficulty-increase") {
    whatWouldChange.push("One or two failures would suggest you're ready (reduce comfort)");
    whatWouldChange.push("If success rate drops below 85%, difficulty is already increasing");
  }

  if (rec.type === "difficulty-decrease") {
    whatWouldChange.push("Success rate improving to 70%+ would make this obsolete");
    whatWouldChange.push("Continuing to fail at current level strengthens this recommendation");
  }

  if (rec.type === "exploration") {
    whatWouldChange.push("If any current topic drops below 50% mastery, focus there first");
    whatWouldChange.push("Consistency dropping below 80% would suggest consolidation instead");
  }

  if (whatWouldChange.length > 0) {
    caveats.whatWouldChange = whatWouldChange;
  }

  // Return only non-empty sections
  return Object.keys(caveats).length > 0 ? caveats : {};
}

module.exports = {
  generateCaveats
};
