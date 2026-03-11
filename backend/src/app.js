import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";
import compression from "compression";
import hpp from "hpp";
import mongoSanitize from "express-mongo-sanitize";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { getRedisClient } from "./config/redis.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/notfound.middleware.js";
import routes from "./routes.js";
import { ApiError } from "./utils/ApiError.js";
import { requestId } from "./middlewares/requestId.middleware.js";
import { createRateLimiter } from "./middlewares/rateLimit.middleware.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", env.TRUST_PROXY);

// Request correlation
app.use(requestId);

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new ApiError(403, "Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Basic hardening
app.use(
  mongoSanitize({
    replaceWith: "_",
  }),
);
app.use(hpp());
app.use(compression());

// Logging (using Winston)
if (env.NODE_ENV !== "test") {
  app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
      const { method, originalUrl } = req;
      const { statusCode } = res;
      const responseTime = Date.now() - start;

      logger.http(
        `${method} ${originalUrl} ${statusCode} ${responseTime}ms`,
        { requestId: req.id, ip: req.ip },
      );
    });

    next();
  });
}

// Body parsers
app.use(express.json({ limit: env.JSON_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Global API rate limit (separate from auth limiter)
app.use(
  "/api",
  createRateLimiter({
    prefix: "api",
    store: env.RATE_LIMIT_STORE,
    getRedisClient,
    windowMs: env.API_RATE_LIMIT_WINDOW_MS,
    max: env.API_RATE_LIMIT_MAX,
    message: "Too many requests, please try again later",
    onStoreError(error) {
      logger.error("Rate limit store error", { error: error.message });
    },
  }),
);

// Health check
app.get("/health", (req, res) => {
  res.json({
    code: 200,
    message: "Service is healthy",
    data: { status: "ok", uptime: process.uptime(), timestamp: new Date().toISOString() },
  });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
