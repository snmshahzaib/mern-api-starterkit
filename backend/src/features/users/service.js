import httpStatus from "http-status";

import { User } from "./model.js";
import { ApiError } from "../../utils/ApiError.js";
import { getPagination } from "../../utils/pagination.js";

export async function createUser(data) {
  const existing = await User.findOne({ email: data.email.toLowerCase() });
  if (existing) {
    throw new ApiError(httpStatus.CONFLICT, "Email already in use");
  }

  const user = await User.create(data);
  return user.toObject({ versionKey: false });
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

export async function updateUser(id, data) {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (data.email && data.email.toLowerCase() !== user.email) {
    const existing = await User.findOne({ email: data.email.toLowerCase(), _id: { $ne: id } });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "Email already in use");
    }
  }

  Object.assign(user, data);
  await user.save();

  const plain = user.toObject();
  delete plain.password;
  return plain;
}

export async function deleteUser(id) {
  const user = await User.findById(id);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  await user.deleteOne();
}

