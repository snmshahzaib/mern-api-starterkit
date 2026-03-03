import httpStatus from "http-status";

import { logger } from "../config/logger.js";
import { ApiError } from "../utils/ApiError.js";

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  let { statusCode, message } = err;

  if (!(err instanceof ApiError)) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  if (process.env.NODE_ENV !== "test") {
    logger.error(err.message, {
      statusCode,
      stack: err.stack,
    });
  }

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(statusCode).json(response);
}

