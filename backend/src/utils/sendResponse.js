import { ApiResponse } from "./ApiResponse.js";

export function sendResponse(res, statusCode, data, message, meta = null) {
  const response = new ApiResponse(statusCode, data, message, meta);
  return res.status(statusCode).json(response);
}
