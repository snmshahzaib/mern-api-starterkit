import httpStatus from "http-status";

import { login, register, getProfile } from "./service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const registerHandler = asyncHandler(async (req, res) => {
  const result = await register(req.body);
  return sendResponse(res, httpStatus.CREATED, result, "User registered successfully");
});

export const loginHandler = asyncHandler(async (req, res) => {
  const result = await login(req.body);
  return sendResponse(res, httpStatus.OK, result, "Logged in successfully");
});

export const meHandler = asyncHandler(async (req, res) => {
  const user = await getProfile(req.user._id);
  return sendResponse(res, httpStatus.OK, user, "Profile fetched successfully");
});
