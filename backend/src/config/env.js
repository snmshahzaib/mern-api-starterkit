import dotenv from "dotenv";
import Joi from "joi";

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid("development", "test", "production").default("development"),
  PORT: Joi.number().port().default(5001),
  MONGODB_URI: Joi.string().uri().default("mongodb://127.0.0.1:27017/mern_starter"),
  JWT_SECRET: Joi.string().min(16).default("change_me_in_production_123"),
  JWT_EXPIRES_IN: Joi.string().default("7d"),
  CORS_ORIGIN: Joi.string().default("http://localhost:5173"),
}).unknown(true);

const { value, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Environment validation failed: ${error.message}`);
}

if (value.NODE_ENV === "production" && value.JWT_SECRET === "change_me_in_production_123") {
  throw new Error("JWT_SECRET must be changed in production");
}

const corsOrigins = value.CORS_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  NODE_ENV: value.NODE_ENV,
  PORT: value.PORT,
  MONGODB_URI: value.MONGODB_URI,
  JWT_SECRET: value.JWT_SECRET,
  JWT_EXPIRES_IN: value.JWT_EXPIRES_IN,
  CORS_ORIGINS: corsOrigins,
};
