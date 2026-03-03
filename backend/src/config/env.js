import dotenv from "dotenv";

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/mern_starter",
  JWT_SECRET: process.env.JWT_SECRET || "change_me_in_production",
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5001",
};

