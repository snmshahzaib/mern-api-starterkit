import mongoose from "mongoose";

import { connectDB } from "../config/database.js";
import { logger } from "../config/logger.js";
import { User } from "../features/users/model.js";

function toBoolean(value) {
  return ["1", "true", "yes", "y"].includes(String(value).toLowerCase());
}

function getSeedConfig() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD?.trim();
  const name = process.env.ADMIN_NAME?.trim() || "Admin User";
  const forceResetPassword = toBoolean(process.env.ADMIN_FORCE_RESET_PASSWORD || "false");

  if (!email) {
    throw new Error("ADMIN_EMAIL is required for admin seeding");
  }

  if (!password || password.length < 6) {
    throw new Error("ADMIN_PASSWORD is required and must be at least 6 characters");
  }

  return {
    email,
    password,
    name,
    forceResetPassword,
  };
}

async function seedAdmin() {
  const config = getSeedConfig();

  await connectDB();

  const existingAdmin = await User.findOne({ email: config.email }).select("+password");

  if (!existingAdmin) {
    const createdAdmin = await User.create({
      name: config.name,
      email: config.email,
      password: config.password,
      role: "admin",
      isActive: true,
    });

    logger.info("Admin user created", {
      id: createdAdmin.id,
      email: createdAdmin.email,
    });
    return;
  }

  let isUpdated = false;

  if (existingAdmin.name !== config.name) {
    existingAdmin.name = config.name;
    isUpdated = true;
  }

  if (existingAdmin.role !== "admin") {
    existingAdmin.role = "admin";
    isUpdated = true;
  }

  if (!existingAdmin.isActive) {
    existingAdmin.isActive = true;
    isUpdated = true;
  }

  if (config.forceResetPassword) {
    const passwordMatches = await existingAdmin.comparePassword(config.password);

    if (!passwordMatches) {
      existingAdmin.password = config.password;
      isUpdated = true;
    }
  }

  if (isUpdated) {
    await existingAdmin.save();
    logger.info("Admin user updated", {
      id: existingAdmin.id,
      email: existingAdmin.email,
      forceResetPassword: config.forceResetPassword,
    });
    return;
  }

  logger.info("Admin user already up to date", {
    id: existingAdmin.id,
    email: existingAdmin.email,
  });
}

seedAdmin()
  .then(async () => {
    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(async (error) => {
    logger.error("Admin seeding failed", { error: error.message });
    await mongoose.connection.close();
    process.exit(1);
  });
