import httpStatus from "http-status";

import { ApiError } from "../utils/ApiError.js";

export function createRateLimiter(options = {}) {
  const windowMs = options.windowMs ?? 15 * 60 * 1000;
  const max = options.max ?? 100;
  const message = options.message ?? "Too many requests, please try again later";
  const keyGenerator =
    options.keyGenerator ??
    ((req) => {
      const ip = req.ip || req.socket?.remoteAddress || "unknown";
      return ip;
    });

  const hits = new Map();

  function cleanup(now) {
    for (const [key, entry] of hits) {
      if (entry.resetAt <= now) {
        hits.delete(key);
      }
    }
  }

  return function rateLimiter(req, res, next) {
    const now = Date.now();
    cleanup(now);

    const key = keyGenerator(req);
    const entry = hits.get(key) || { count: 0, resetAt: now + windowMs };

    if (entry.resetAt <= now) {
      entry.count = 0;
      entry.resetAt = now + windowMs;
    }

    entry.count += 1;
    hits.set(key, entry);

    const remaining = Math.max(0, max - entry.count);
    const retryAfterSeconds = Math.ceil(Math.max(0, entry.resetAt - now) / 1000);

    res.setHeader("X-RateLimit-Limit", String(max));
    res.setHeader("X-RateLimit-Remaining", String(remaining));
    res.setHeader("X-RateLimit-Reset", String(Math.floor(entry.resetAt / 1000)));

    if (entry.count > max) {
      res.setHeader("Retry-After", String(retryAfterSeconds));
      return next(new ApiError(httpStatus.TOO_MANY_REQUESTS, message));
    }

    return next();
  };
}

