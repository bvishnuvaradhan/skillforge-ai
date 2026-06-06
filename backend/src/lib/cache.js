const IORedis = require("ioredis");
const { env } = require("../config/env");

const redisUrl = env.REDIS_URL || "redis://127.0.0.1:6379";
let redisClient = null;
let isRedisConnected = false;

const memoryCache = new Map();

try {
  // Configured with short timeouts and no immediate offline queue to fail fast and fallback
  redisClient = new IORedis(redisUrl, {
    maxRetriesPerRequest: 1,
    enableOfflineQueue: false,
    connectTimeout: 2000,
    lazyConnect: true,
    retryStrategy(times) {
      // Retry connection every 5 seconds, up to 10s backoff
      return Math.min(times * 1000, 5000);
    }
  });

  redisClient.on("connect", () => {
    console.log("[Cache] Connected to Redis successfully.");
    isRedisConnected = true;
  });

  redisClient.on("error", (err) => {
    // Graceful warning rather than unhandled crash
    console.warn("[Cache] Redis client offline, using memory fallback. Error:", err.message);
    isRedisConnected = false;
  });

  redisClient.on("close", () => {
    isRedisConnected = false;
  });

  // Connect asynchronously
  redisClient.connect().catch((err) => {
    console.warn("[Cache] Redis initial connection failed, using memory fallback.");
    isRedisConnected = false;
  });
} catch (err) {
  console.warn("[Cache] Failed to initialize Redis client, using memory fallback:", err.message);
}

/**
 * Get item from cache
 */
async function get(key) {
  if (isRedisConnected && redisClient) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.warn("[Cache] Redis get failed, using memory fallback:", err.message);
    }
  }

  // Memory fallback
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
}

/**
 * Set item in cache with TTL (seconds)
 */
async function set(key, value, ttlSeconds = 300) {
  const jsonString = JSON.stringify(value);
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.set(key, jsonString, "EX", ttlSeconds);
      return true;
    } catch (err) {
      console.warn("[Cache] Redis set failed, using memory fallback:", err.message);
    }
  }

  // Memory fallback
  const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
  memoryCache.set(key, { value, expiresAt });
  return true;
}

/**
 * Delete item from cache
 */
async function del(key) {
  if (isRedisConnected && redisClient) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.warn("[Cache] Redis del failed:", err.message);
    }
  }
  memoryCache.delete(key);
  return true;
}

/**
 * Delete keys matching a prefix using non-blocking SCAN command
 */
async function delPrefix(prefix) {
  if (isRedisConnected && redisClient) {
    try {
      let cursor = "0";
      const keysToDelete = [];
      do {
        const reply = await redisClient.scan(cursor, "MATCH", `${prefix}*`, "COUNT", 100);
        cursor = reply[0];
        const keys = reply[1];
        if (keys && keys.length > 0) {
          keysToDelete.push(...keys);
        }
      } while (cursor !== "0");

      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
      }
    } catch (err) {
      console.warn("[Cache] Redis scan/delPrefix failed:", err.message);
    }
  }

  // Clear memory cache keys matching the prefix
  for (const key of memoryCache.keys()) {
    if (key.startsWith(prefix)) {
      memoryCache.delete(key);
    }
  }
  return true;
}

/**
 * Invalidates all cached items for a specific user ID
 */
async function invalidateUserCache(userId) {
  return delPrefix(`user:${userId}:`);
}

module.exports = {
  get,
  set,
  del,
  delPrefix,
  invalidateUserCache,
  isRedisConnected: () => isRedisConnected
};
