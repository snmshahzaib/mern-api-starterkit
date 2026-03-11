import http from "http";
import mongoose from "mongoose";

import app from "./app.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";
import { connectRedis, disconnectRedis, isRedisEnabled } from "./config/redis.js";

const PORT = env.PORT;
let server;

async function shutdown(signal) {
  logger.info(`${signal} received. Starting graceful shutdown...`);

  if (server) {
    server.close(async () => {
      try {
        await mongoose.connection.close();
        await disconnectRedis();
        logger.info("Server and MongoDB connection closed");
        process.exit(0);
      } catch (error) {
        logger.error("Error during graceful shutdown", { error: error.message });
        process.exit(1);
      }
    });
  } else {
    await disconnectRedis();
    process.exit(0);
  }
}

async function startServer() {
  try {
    if (isRedisEnabled()) {
      await connectRedis();
    }
    await connectDB();

    server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    await disconnectRedis();
    process.exit(1);
  }
}

startServer();

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("uncaughtException", (error) => {
  logger.error("Uncaught exception", { error: error.message, stack: error.stack });
  process.exit(1);
});
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled rejection", { reason });
  process.exit(1);
});
