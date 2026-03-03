import http from "http";

import app from "./app.js";
import { connectDB } from "./config/database.js";
import { env } from "./config/env.js";
import { logger } from "./config/logger.js";

const PORT = env.PORT;

async function startServer() {
  try {
    await connectDB();

    const server = http.createServer(app);

    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
    });
  } catch (error) {
    logger.error("Failed to start server", { error: error.message });
    process.exit(1);
  }
}

startServer();

