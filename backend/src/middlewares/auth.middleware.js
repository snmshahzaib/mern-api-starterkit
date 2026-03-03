import httpStatus from "http-status";
import jwt from "jsonwebtoken";

import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../features/users/model.js";

export async function authRequired(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Authentication required");
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "User not found");
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

