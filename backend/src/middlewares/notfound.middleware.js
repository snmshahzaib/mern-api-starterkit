import httpStatus from "http-status";

import { ApiError } from "../utils/ApiError.js";

export function notFoundHandler(req, res, next) {
  next(new ApiError(httpStatus.NOT_FOUND, `Not found - ${req.originalUrl}`));
}

