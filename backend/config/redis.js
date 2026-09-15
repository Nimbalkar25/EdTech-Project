// config/redis.js
const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: 1,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Immediate status check
if (redis.status === "ready" || redis.status === "connect") {
  console.log("Redis connected and already for Rate Limiting");
}

redis.on("ready", () => {
  console.log("Redis connected and ready for Rate Limiting");
});

redis.on("connect", () => {
  console.log("Redis connected successfully for Rate Limiting");
});

redis.on("error", (err) => {
  console.error("Redis connection error:", err.message);
});

module.exports = redis;