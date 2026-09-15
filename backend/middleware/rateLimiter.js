// middleware/rateLimiter.js
const Redis = require("ioredis");

// Fallback to localhost if process.env.REDIS_URL is not set
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

const slidingWindowLimiter = ({
  windowMs = 60 * 1000,
  max = 5,
  keyPrefix = "rl",
} = {}) => {
  return async (req, res, next) => {
    try {
      // 1. Identify user: Use user ID if authenticated, else IP address
      const identifier =
        req.user?._id?.toString() ||
        req.ip ||
        req.headers["x-forwarded-for"] ||
        "anonymous";

      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;
      const ttlSeconds = Math.ceil(windowMs / 1000);

      // 2. Atomic pipeline execution in Redis
      const results = await redis
        .multi()
        .zremrangebyscore(key, 0, windowStart) // Prune expired timestamps
        .zcard(key)                            // Count remaining requests
        .expire(key, ttlSeconds)               // Reset TTL
        .exec();

      const currentRequestCount = results[1][1];

      // 3. Response rate-limit headers
      res.setHeader("X-RateLimit-Limit", max);
      res.setHeader("X-RateLimit-Remaining", Math.max(0, max - currentRequestCount));

      // 4. Threshold check
      if (currentRequestCount >= max) {
        return res.status(429).json({
          success: false,
          message: `Too many attempts. Allowed: ${max} requests per ${windowMs / 1000}s. Please wait.`,
        });
      }

      // 5. Record this request with a unique member value
      const uniqueMember = `${now}:${Math.random().toString(36).substring(2, 8)}`;
      await redis.zadd(key, now, uniqueMember);

      next();
    } catch (error) {
      console.error("Rate limiter middleware error:", error);
      // Fail-open: don't crash the request flow if Redis drops
      next();
    }
  };
};

module.exports = { slidingWindowLimiter };