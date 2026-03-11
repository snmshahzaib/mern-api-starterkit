import httpStatus from "http-status";

import { ApiError } from "../../utils/ApiError.js";
import { User } from "./model.js";

export function normalizeEmail(email) {
  if (!email) {
    return "";
  }

  return String(email).trim().toLowerCase();
}

export async function assertEmailUnique(email, excludeId = null) {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    return;
  }

  const existing = await User.findOne({
    email: normalizedEmail,
    ...(excludeId && { _id: { $ne: excludeId } }),
  })
    .select("_id")
    .lean();

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Email already in use");
  }
}

