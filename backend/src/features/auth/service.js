import httpStatus from "http-status";
import jwt from "jsonwebtoken";

import { User } from "../users/model.js";
import { ApiError } from "../../utils/ApiError.js";
import { env } from "../../config/env.js";

function signToken(userId) {
  return jwt.sign({ id: userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

export async function register(data) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Email already in use");
  }

  const user = await User.create(data);
  const token = signToken(user.id);

  const plain = user.toObject();
  delete plain.password;

  return { user: plain, token };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const token = signToken(user.id);
  const plain = user.toObject();
  delete plain.password;

  return { user: plain, token };
}

export async function getProfile(userId) {
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
}

