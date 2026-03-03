import httpStatus from "http-status";

import { createUser, deleteUser, getUserById, getUsers, updateUser } from "./service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

export const createUserHandler = asyncHandler(async (req, res) => {
  const user = await createUser(req.body);
  return sendResponse(res, httpStatus.CREATED, user, "User created successfully");
});

export const getUsersHandler = asyncHandler(async (req, res) => {
  const { items, meta } = await getUsers(req.query);
  return sendResponse(res, httpStatus.OK, items, "Users fetched successfully", meta);
});

export const getUserByIdHandler = asyncHandler(async (req, res) => {
  const user = await getUserById(req.params.id);
  return sendResponse(res, httpStatus.OK, user, "User fetched successfully");
});

export const updateUserHandler = asyncHandler(async (req, res) => {
  const user = await updateUser(req.params.id, req.body, req.user);
  return sendResponse(res, httpStatus.OK, user, "User updated successfully");
});

export const deleteUserHandler = asyncHandler(async (req, res) => {
  await deleteUser(req.params.id);
  return sendResponse(res, httpStatus.OK, null, "User deleted successfully");
});
