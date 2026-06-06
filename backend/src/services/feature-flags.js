const { FeatureFlagModel } = require("../models/FeatureFlag");

// Default feature state configurations
const DEFAULTS = {
  enable_mentor: true,
  enable_reflection: true,
  enable_session_intelligence: true,
  enable_caching: true,
  enable_rate_limiting: true
};

const cache = new Map();
const CACHE_TTL_MS = 30000; // 30 seconds TTL

/**
 * Check if a feature flag is enabled
 */
async function isEnabled(key) {
  // 1. Environment variables take precedence (e.g. FEATURE_ENABLE_MENTOR=true)
  const envKey = `FEATURE_${key.toUpperCase()}`;
  if (process.env[envKey] !== undefined) {
    return process.env[envKey] === "true";
  }

  // 2. Read from local memory cache
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.value;
  }

  // 3. Query the database, falling back to DEFAULTS
  try {
    if (process.env.SKIP_DB === "true") {
      return DEFAULTS[key] !== undefined ? DEFAULTS[key] : false;
    }

    const flag = await FeatureFlagModel.findOne({ key });
    const value = flag ? flag.enabled : (DEFAULTS[key] !== undefined ? DEFAULTS[key] : false);

    // Save to local cache
    cache.set(key, { value, timestamp: Date.now() });
    return value;
  } catch (err) {
    console.warn(`[FeatureFlags] Database query failed for flag "${key}", using fallback default. Error:`, err.message);
    return DEFAULTS[key] !== undefined ? DEFAULTS[key] : false;
  }
}

module.exports = { isEnabled, DEFAULTS };
