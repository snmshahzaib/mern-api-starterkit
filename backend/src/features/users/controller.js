import httpStatus from "http-status";

import { createUser, deleteUser, getUserById, getUsers, updateUser } from "./service.js";
import { ApiResponse } from "../../utils/ApiResponse.js";

export async function createUserHandler(req, res, next) {
  try {
    const user = await createUser(req.body);
    const response = new ApiResponse(httpStatus.CREATED, user, "User created successfully");
    res.status(httpStatus.CREATED).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getUsersHandler(req, res, next) {
  try {
    const { items, meta } = await getUsers(req.query);
    const response = new ApiResponse(httpStatus.OK, items, "Users fetched successfully", meta);
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getUserByIdHandler(req, res, next) {
  try {
    const user = await getUserById(req.params.id);
    const response = new ApiResponse(httpStatus.OK, user, "User fetched successfully");
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    next(error);
  }
}

export async function updateUserHandler(req, res, next) {
  try {
    const user = await updateUser(req.params.id, req.body);
    const response = new ApiResponse(httpStatus.OK, user, "User updated successfully");
    res.status(httpStatus.OK).json(response);
  } catch (error) {
    next(error);
  }
}

export async function deleteUserHandler(req, res, next) {
  try {
    await deleteUser(req.params.id);
    const response = new ApiResponse(httpStatus.NO_CONTENT, null, "User deleted successfully");
    res.status(httpStatus.NO_CONTENT).json(response);
  } catch (error) {
    next(error);
  }
}

