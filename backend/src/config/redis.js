import { createClient } from "redis";

import { env } from "./env.js";
import { logger } from "./logger.js";

let client = null;
let connectPromise = null;

function initClient() {
  if (client) {
    return;
  }

  client = createClient({ url: env.REDIS_URL });

  client.on("error", (error) => {
    logger.error("Redis client error", { error: error.message });
  });
}

export function getRedisClient() {
  return client;
}

export function isRedisEnabled() {
  return env.RATE_LIMIT_STORE === "redis";
}

export async function connectRedis() {
  if (!isRedisEnabled()) {
    return null;
  }

  initClient();

  if (!connectPromise) {
    connectPromise = client.connect();
  }

  await connectPromise;
  logger.info("Connected to Redis");
  return client;
}

export async function disconnectRedis() {
  if (!client) {
    return;
  }

  try {
    await client.quit();
    logger.info("Redis connection closed");
  } finally {
    client = null;
    connectPromise = null;
  }
}

