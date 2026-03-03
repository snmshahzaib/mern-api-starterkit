import express from "express";
import helmet from "helmet";
import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import { notFoundHandler } from "./middlewares/notfound.middleware.js";
import routes from "./routes.js";

const app = express();

// Security headers
app.use(helmet());

// CORS
app.use(
  cors({
    origin: env.CORS_ORIGIN,
    credentials: true,
  }),
);

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
      );
    });

    next();
  });
}

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// API routes
app.use("/api", routes);

// 404 handler
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;

