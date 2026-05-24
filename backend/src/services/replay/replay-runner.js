function summarizeArbitrationResult(result = {}) {
  return {
    winnerIds: (result.winners || []).map((item) => String(item._id || item)).sort(),
    deferredIds: (result.deferred || []).map((item) => String(item._id || item)).sort(),
    failureCount: (result.failures || []).length
  };
}

function compareReplay(original = {}, replayed = {}) {
  const left = summarizeArbitrationResult(original);
  const right = summarizeArbitrationResult(replayed);

  const sameWinners = JSON.stringify(left.winnerIds) === JSON.stringify(right.winnerIds);
  const sameDeferred = JSON.stringify(left.deferredIds) === JSON.stringify(right.deferredIds);
  const sameFailures = left.failureCount === right.failureCount;

  return {
    deterministic: sameWinners && sameDeferred && sameFailures,
    left,
    right
  };
}

module.exports = {
  summarizeArbitrationResult,
  compareReplay
};
