function computeChurnMetrics(previousIds = [], currentIds = []) {
  const prev = new Set(previousIds.map(String));
  const curr = new Set(currentIds.map(String));

  let retained = 0;
  for (const id of curr) {
    if (prev.has(id)) retained += 1;
  }

  const removed = [...prev].filter((id) => !curr.has(id)).length;
  const added = [...curr].filter((id) => !prev.has(id)).length;
  const denominator = Math.max(prev.size, curr.size, 1);
  const churnRate = Number((((added + removed) / denominator) * 100).toFixed(2));

  return {
    retained,
    removed,
    added,
    churnRate
  };
}

module.exports = {
  computeChurnMetrics
};
