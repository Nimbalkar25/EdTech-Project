// middleware/rateLimiter.js
const Redis = require("ioredis");
const redis = new Redis(process.env.REDIS_URL || "redis://127.0.0.1:6379");

redis.on("error", (err) => console.error("Redis connection error:", err.message));

const slidingWindowLimiter = ({
  windowMs = 60 * 1000,
  max = 5,
  keyPrefix = "rl",
} = {}) => {
  return async (req, res, next) => {
    try {

      if (process.env.NODE_ENV === "development") {
        return next(); // Bypasses limiter completely during local frontend testing
      }
      const forwarded = req.headers["x-forwarded-for"];
      const clientIp = forwarded ? forwarded.split(",")[0].trim() : req.ip;
      const identifier = req.user?._id?.toString() || clientIp || "anonymous";

      const key = `${keyPrefix}:${identifier}`;
      const now = Date.now();
      const windowStart = now - windowMs;
      const ttlSeconds = Math.ceil(windowMs / 1000);

      // Clean old timestamps and count active requests
      const results = await redis
        .multi()
        .zremrangebyscore(key, 0, windowStart)
        .zcard(key)
        .expire(key, ttlSeconds)
        .exec();

      const currentCount = results[1][1];

      // Blocked: find exactly when the oldest request drops out of the window
      if (currentCount >= max) {
        const oldestEntry = await redis.zrange(key, 0, 0, "WITHSCORES");
        let retryAfter = ttlSeconds;

        if (oldestEntry?.length >= 2) {
          const oldestTimestamp = parseInt(oldestEntry[1], 10);
          retryAfter = Math.max(1, Math.ceil((oldestTimestamp + windowMs - now) / 1000));
        }

        return res.status(429).json({
          success: false,
          retryAfter, // Exact seconds calculated by backend
          message: `Too many attempts. Please wait ${retryAfter}s before retrying.`,
        });
      }

      // Record request
      const uniqueMember = `${now}:${Math.random().toString(36).slice(2, 8)}`;
      await redis.zadd(key, now, uniqueMember);

      next();
    } catch (error) {
      console.error("Rate limiter error:", error);
      next(); // Fail open so users aren't blocked if Redis stops
    }
  };
};

module.exports = { slidingWindowLimiter };