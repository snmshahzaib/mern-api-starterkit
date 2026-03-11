import express from "express";

import { loginHandler, meHandler, registerHandler } from "./controller.js";
import { loginSchema, registerSchema } from "./validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authRequired } from "../../middlewares/auth.middleware.js";
import { createRateLimiter } from "../../middlewares/rateLimit.middleware.js";
import { env } from "../../config/env.js";
import { getRedisClient } from "../../config/redis.js";
import { logger } from "../../config/logger.js";

export function createAuthRouter(options = {}) {
  const router = express.Router();

  const handlers = options.handlers || { registerHandler, loginHandler, meHandler };
  const authMiddleware = options.authRequired || authRequired;
  const authLimiter =
    options.authLimiter ||
    createRateLimiter({
      prefix: "auth",
      store: env.RATE_LIMIT_STORE,
      getRedisClient,
      windowMs: env.AUTH_RATE_LIMIT_WINDOW_MS,
      max: env.AUTH_RATE_LIMIT_MAX,
      message: "Too many auth attempts, please try again later",
      onStoreError(error) {
        logger.error("Auth rate limit store error", { error: error.message });
      },
    });

  // Public: register & login (rate-limited)
  router.post("/register", authLimiter, validate(registerSchema), handlers.registerHandler);
  router.post("/login", authLimiter, validate(loginSchema), handlers.loginHandler);

  // Authenticated: get current user profile
  router.get("/me", authMiddleware, handlers.meHandler);

  return router;
}

export default createAuthRouter();
