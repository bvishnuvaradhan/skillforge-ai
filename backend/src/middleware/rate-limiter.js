const cache = require("../lib/cache");

/**
 * Rate Limiting middleware using fixed-window pattern
 * Leverages the caching manager for Redis-backed distributed limits and memory fallback.
 */
function rateLimiter(options = {}) {
  const windowSeconds = options.windowSeconds || 60;
  const limit = options.limit || 60;
  const keyPrefix = options.keyPrefix || "rate";

  return async (req, res, next) => {
    try {
      // Limit by authenticated user ID if logged in, fallback to client IP
      const identifier = req.user?.id || req.ip;
      // Unique rate limiting key containing request path
      const key = `${keyPrefix}:${identifier}:${req.baseUrl || req.path}`;

      const record = await cache.get(key);
      let count = 0;
      let ttl = windowSeconds;

      if (record) {
        count = record.count;
        const elapsed = Math.floor((Date.now() - record.createdAt) / 1000);
        // Calculate remaining time in the window
        ttl = Math.max(1, windowSeconds - elapsed);
      }

      // If limit exceeded, block request and set Retry-After header
      if (count >= limit) {
        res.setHeader("Retry-After", ttl);
        return res.status(429).json({
          error: "Too many requests. Please try again later.",
          retryAfterSeconds: ttl
        });
      }

      // Save updated request counter with remaining TTL
      await cache.set(
        key,
        {
          count: count + 1,
          createdAt: record ? record.createdAt : Date.now()
        },
        ttl
      );

      next();
    } catch (err) {
      // Fail open to avoid blocking users if cache system has issues, but log warning
      console.warn("[RateLimiter] Failed to evaluate rate limit, passing through. Error:", err.message);
      next();
    }
  };
}

module.exports = { rateLimiter };
