function classifyTraceSeverity(tracePayload) {
  if ((tracePayload.counts?.normalizationFailures || 0) > 0) return "critical";
  if ((tracePayload.counts?.deferred || 0) > (tracePayload.counts?.winners || 0)) return "normal";
  return "debug";
}

function shouldSampleTrace(tracePayload, options = {}) {
  const severity = classifyTraceSeverity(tracePayload);
  if (severity === "critical") return true;

  const debugSampleRate = Number(options.debugSampleRate ?? 0.2);
  const normalSampleRate = Number(options.normalSampleRate ?? 0.7);
  const threshold = severity === "normal" ? normalSampleRate : debugSampleRate;
  return Math.random() <= threshold;
}

function buildRetentionMetadata(tracePayload) {
  const severity = classifyTraceSeverity(tracePayload);
  const retentionDays = severity === "critical" ? 90 : severity === "normal" ? 30 : 7;
  const expiresAt = new Date(Date.now() + retentionDays * 24 * 60 * 60 * 1000);

  return {
    severity,
    retentionDays,
    expiresAt
  };
}

module.exports = {
  classifyTraceSeverity,
  shouldSampleTrace,
  buildRetentionMetadata
};
