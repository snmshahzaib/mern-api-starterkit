import httpStatus from "http-status";

import { User } from "../users/model.js";
import { ApiError } from "../../utils/ApiError.js";
import { toPublicUser } from "../users/user.mapper.js";
import { signAccessToken } from "../../utils/token.js";
import { assertEmailUnique, normalizeEmail } from "../users/user.email.js";

export async function register(data) {
  await assertEmailUnique(data.email);

  const user = await User.create(data);
  const token = signAccessToken(user.id);

  return { user: toPublicUser(user), token };
}

export async function login({ email, password }) {
  const user = await User.findOne({ email: normalizeEmail(email) }).select("+password");

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const token = signAccessToken(user.id);

  return { user: toPublicUser(user), token };
}

export async function getProfile(userId) {
  const user = await User.findById(userId).select("-password").lean();

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  return user;
}
