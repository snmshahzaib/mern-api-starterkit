import mongoose from "mongoose";

import { env } from "./env.js";
import { logger } from "./logger.js";

export async function connectDB() {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGODB_URI);

    logger.info("Connected to MongoDB");
  } catch (error) {
    logger.error("MongoDB connection error", { error: error.message });
    throw error;
  }
}

