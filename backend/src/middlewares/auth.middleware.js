import httpStatus from "http-status";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../features/users/model.js";

function extractToken(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
  }

  return authHeader.split(" ")[1];
}

export async function authRequired(req, res, next) {
  try {
    const token = extractToken(req);
    const decoded = jwt.verify(token, env.JWT_SECRET);

    if (!mongoose.Types.ObjectId.isValid(decoded.id)) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Invalid token payload");
    }

    const user = await User.findById(decoded.id).select("-password").lean();

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
    }

    if (user.isActive === false) {
      throw new ApiError(httpStatus.FORBIDDEN, "Account is disabled");
    }

    req.user = user;
    next();
  } catch (error) {
    next(
      error instanceof ApiError
        ? error
        : new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token"),
    );
  }
}

export function authorizeRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Authentication required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Access denied"));
    }

    return next();
  };
}

export function authorizeSelfOrAdmin(paramKey = "id") {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(httpStatus.UNAUTHORIZED, "Authentication required"));
    }

    const targetId = req.params[paramKey];
    const isOwner = req.user.id === targetId || req.user._id?.toString() === targetId;
    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return next(new ApiError(httpStatus.FORBIDDEN, "Access denied"));
    }

    return next();
  };
}
