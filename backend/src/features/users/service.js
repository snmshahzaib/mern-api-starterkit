import httpStatus from "http-status";

import { User } from "./model.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPagination } from "../../utils/pagination.js";
import { toPublicUser } from "./user.mapper.js";

async function assertEmailUnique(email, excludeId = null) {
  if (!email) {
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const existing = await User.findOne({
    email: normalizedEmail,
    ...(excludeId && { _id: { $ne: excludeId } }),
  }).lean();

  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Email already in use");
  }
}

export async function createUser(data) {
  await assertEmailUnique(data.email);
  const user = await User.create(data);

  return toPublicUser(user);
}

export async function getUsers(query) {
  const { page, limit, skip } = getPagination(query);

  const filter = {};

  if (query.search) {
    const searchRegex = new RegExp(query.search, "i");
    filter.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  if (query.isActive !== undefined) {
    filter.isActive = query.isActive === "true";
  }

  const [items, total] = await Promise.all([
    User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .select("-password")
      .lean(),
    User.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit) || 1,
    },
  };
}

export async function getUserById(id) {
  const user = await User.findById(id).select("-password").lean();
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }
  return user;
}

export async function updateUser(id, data, currentUser) {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isAdmin = currentUser.role === "admin";
  if (!isAdmin) {
    delete data.role;
    delete data.isActive;
  }

  if (data.email && data.email.toLowerCase() !== user.email) {
    await assertEmailUnique(data.email, id);
  }

  Object.assign(user, data);
  await user.save();

  return toPublicUser(user);
}

export async function deleteUser(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await user.deleteOne();
}
