import httpStatus from "http-status";
import mongoose from "mongoose";

import { logger } from "../config/logger.js";
import { env } from "../config/env.js";
import { ApiError } from "../utils/ApiError.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let normalizedError = err;

  if (err instanceof mongoose.Error.ValidationError) {
    normalizedError = new ApiError(httpStatus.BAD_REQUEST, "Validation failed");
  } else if (err instanceof mongoose.Error.CastError) {
    normalizedError = new ApiError(httpStatus.BAD_REQUEST, "Invalid resource id");
  } else if (err?.code === 11000) {
    normalizedError = new ApiError(httpStatus.CONFLICT, "Duplicate field value");
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    normalizedError = new ApiError(httpStatus.UNAUTHORIZED, "Invalid or expired token");
  }

  let { statusCode, message, errors } = normalizedError;

  if (!(normalizedError instanceof ApiError)) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
    errors = [];
  }

  if (env.NODE_ENV !== "test") {
    logger.error(normalizedError.message, {
      statusCode,
      requestId: req.id,
      stack: normalizedError.stack,
    });
  }

  const response = {
    code: statusCode,
    message,
    requestId: req.id,
    data: null,
    ...(errors?.length ? { errors } : {}),
    ...(env.NODE_ENV === "development" && { stack: normalizedError.stack }),
  };

  res.status(statusCode).json(response);
}
