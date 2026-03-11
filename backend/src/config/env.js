import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

function parseTrustProxy(input) {
  if (typeof input === "boolean") {
    return input;
  }

  const raw = String(input ?? "").trim();
  const lowered = raw.toLowerCase();

  if (lowered === "true") {
    return true;
  }
  if (lowered === "false") {
    return false;
  }

  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && raw !== "") {
    return asNumber;
  }

  return raw || 1;
}

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(5001),
  TRUST_PROXY: Joi.alternatives(Joi.boolean(), Joi.number().integer().min(0), Joi.string()).default(1),
  JSON_BODY_LIMIT: Joi.string().default("10kb"),
  LOG_LEVEL: Joi.string()
    .valid("error", "warn", "info", "http", "verbose", "debug", "silly")
    .default("info"),
  RATE_LIMIT_STORE: Joi.string().valid("auto", "memory", "redis").default("auto"),
  REDIS_URL: Joi.string().allow("").default(""),
  API_RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(15 * 60 * 1000),
  API_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(300),
  AUTH_RATE_LIMIT_WINDOW_MS: Joi.number().integer().min(1000).default(15 * 60 * 1000),
  AUTH_RATE_LIMIT_MAX: Joi.number().integer().min(1).default(20),
  MONGODB_URI: Joi.string()
    .uri()
    .default("mongodb://127.0.0.1:27017/mern_starter")
    .when("NODE_ENV", { is: "production", then: Joi.string().uri().required() }),
  JWT_SECRET: Joi.string()
    .min(16)
    .when("NODE_ENV", { is: "production", then: Joi.required() })
    .default("change_me_in_production_123"),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  CORS_ORIGIN: Joi.string()
    .default("http://localhost:5173")
    .when("NODE_ENV", { is: "production", then: Joi.string().required() }),
}).unknown(true);

const { value, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

if (value.NODE_ENV === "production" && value.JWT_SECRET === "change_me_in_production_123") {
  throw new Error("JWT_SECRET must be changed in production");
}

const resolvedRateLimitStore =
  value.RATE_LIMIT_STORE === "auto"
    ? value.NODE_ENV === "production"
      ? "redis"
      : "memory"
    : value.RATE_LIMIT_STORE;

if (resolvedRateLimitStore === "redis" && !value.REDIS_URL) {
  throw new Error("REDIS_URL is required when RATE_LIMIT_STORE=redis (or in production when RATE_LIMIT_STORE=auto)");
}

const corsOrigins = value.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,
  TRUST_PROXY: parseTrustProxy(value.TRUST_PROXY),
  JSON_BODY_LIMIT: value.JSON_BODY_LIMIT,
  LOG_LEVEL: value.LOG_LEVEL,
  RATE_LIMIT_STORE: resolvedRateLimitStore,
  REDIS_URL: value.REDIS_URL,
  API_RATE_LIMIT_WINDOW_MS: value.API_RATE_LIMIT_WINDOW_MS,
  API_RATE_LIMIT_MAX: value.API_RATE_LIMIT_MAX,
  AUTH_RATE_LIMIT_WINDOW_MS: value.AUTH_RATE_LIMIT_WINDOW_MS,
  AUTH_RATE_LIMIT_MAX: value.AUTH_RATE_LIMIT_MAX,
  MONGODB_URI: value.MONGODB_URI,
  JWT_SECRET: value.JWT_SECRET,
  JWT_EXPIRES_IN: value.JWT_EXPIRES_IN,
  CORS_ORIGINS: corsOrigins,
};
