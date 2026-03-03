import httpStatus from "http-status";

import { login, register, getProfile } from "./service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export async function registerHandler(req, res, next) {
  try {
    const result = await register(req.body);
    const response = new ApiResponse(httpStatus.CREATED, result, "User registered successfully");
    res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
}

export async function loginHandler(req, res, next) {
  try {
    const result = await login(req.body);
    const response = new ApiResponse(httpStatus.OK, result, "Logged in successfully");
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    next(error);
  }
}

export async function meHandler(req, res, next) {
  try {
    const user = await getProfile(req.user.id);
    const response = new ApiResponse(httpStatus.OK, user, "Profile fetched successfully");
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    next(error);
  }
}

