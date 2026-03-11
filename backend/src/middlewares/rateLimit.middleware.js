import httpStatus from "http-status";

import { ApiError } from "../utils/ApiError.js";

const redisIncrScript = `
local current = redis.call("INCR", KEYS[1])
if current == 1 then
  redis.call("PEXPIRE", KEYS[1], ARGV[1])
end
local ttl = redis.call("PTTL", KEYS[1])
return { current, ttl }
`;

function createMemoryStore() {
  const hits = new Map();

  function cleanup(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) {
        hits.delete(key);
      }
    }
  }

  return {
    async hit(key, windowMs, now) {
      cleanup(now);

      const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

      if (entry.resetAt <= now) {
        entry.count = 0;
        entry.resetAt = now + windowMs;
      }

      entry.count += 1;
      hits.set(key, entry);

      return { count: entry.count, resetAt: entry.resetAt };
    },
  };
}

function createRedisStore({ getClient, prefix }) {
  return {
    async hit(key, windowMs, now) {
      const client = getClient();
      if (!client) {
        throw new Error("Redis client is not initialized");
      }

      const redisKey = `${prefix}:${key}`;
      const [count, ttl] = await client.eval(redisIncrScript, {
        keys: [redisKey],
        arguments: [String(windowMs)],
      });

      const ttlMs = typeof ttl === "number" && ttl > 0 ? ttl : windowMs;
      return { count, resetAt: now + ttlMs };
    },
  };
}

export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs ?? 15 * 60 * 1000;
  const max = options.max ?? 100;
  const message = options.message ?? "Too many requests, please try again later";
  const prefix = options.prefix ?? "rl";
  const onError = options.onError ?? "allow";
  const keyGenerator =
    options.keyGenerator ??
    ((req) => {
      const ip = req.ip || req.socket?.remoteAddress || "unknown";
      return ip;
    });

  const store =
    options.store?.hit
      ? options.store
      : options.store === "redis"
        ? createRedisStore({ getClient: options.getRedisClient, prefix })
        : createMemoryStore();

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    const key = keyGenerator(req);

    Promise.resolve()
      .then(() => store.hit(key, windowMs, now))
      .then(({ count, resetAt }) => {
        const remaining = Math.max(0, max - count);
        const retryAfterSeconds = Math.ceil(Math.max(0, resetAt - now) / 1000);

        res.setHeader("X-RateLimit-Limit", String(max));
        res.setHeader("X-RateLimit-Remaining", String(remaining));
        res.setHeader("X-RateLimit-Reset", String(Math.floor(resetAt / 1000)));

        if (count > max) {
          res.setHeader("Retry-After", String(retryAfterSeconds));
          return next(new ApiError(httpStatus.TOO_MANY_REQUESTS, message));
        }

        return next();
      })
      .catch((error) => {
        if (typeof options.onStoreError === "function") {
          options.onStoreError(error);
        }

        if (onError === "block") {
          return next(new ApiError(httpStatus.SERVICE_UNAVAILABLE, "Rate limit store unavailable"));
        }

        return next();
      });
  };
}
