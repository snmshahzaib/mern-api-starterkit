import httpStatus from "http-status";

import { createUser, deleteUser, getUserById, getUsers, updateUser } from "./service.js";
import { asyncHandler } from "../../utils/asyncHandler.js";
import { sendResponse } from "../../utils/sendResponse.js";

export function createUserHandlers(userService) {
  return {
    createUserHandler: asyncHandler(async (req, res) => {
      const user = await userService.createUser(req.body);
      return sendResponse(res, httpStatus.CREATED, user, "User created successfully");
    }),
    getUsersHandler: asyncHandler(async (req, res) => {
      const { items, meta } = await userService.getUsers(req.query);
      return sendResponse(res, httpStatus.OK, items, "Users fetched successfully", meta);
    }),
    getUserByIdHandler: asyncHandler(async (req, res) => {
      const user = await userService.getUserById(req.params.id);
      return sendResponse(res, httpStatus.OK, user, "User fetched successfully");
    }),
    updateUserHandler: asyncHandler(async (req, res) => {
      const user = await userService.updateUser(req.params.id, req.body, req.user);
      return sendResponse(res, httpStatus.OK, user, "User updated successfully");
    }),
    deleteUserHandler: asyncHandler(async (req, res) => {
      await userService.deleteUser(req.params.id);
      return sendResponse(res, httpStatus.OK, null, "User deleted successfully");
    }),
  };
}

export const {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  updateUserHandler,
} = createUserHandlers({
  createUser,
  deleteUser,
  getUserById,
  getUsers,
  updateUser,
});
