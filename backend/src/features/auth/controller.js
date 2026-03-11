import httpStatus from "http-status";

import { login, register, getProfile } from "./service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

export function createAuthHandlers(authService) {
  return {
    registerHandler: asyncHandler(async (req, res) => {
      const result = await authService.register(req.body);
      return sendResponse(res, httpStatus.CREATED, result, "User registered successfully");
    }),
    loginHandler: asyncHandler(async (req, res) => {
      const result = await authService.login(req.body);
      return sendResponse(res, httpStatus.OK, result, "Logged in successfully");
    }),
    meHandler: asyncHandler(async (req, res) => {
      const user = await authService.getProfile(req.user._id);
      return sendResponse(res, httpStatus.OK, user, "Profile fetched successfully");
    }),
  };
}

export const { registerHandler, loginHandler, meHandler } = createAuthHandlers({
  login,
  register,
  getProfile,
});
