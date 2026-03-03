import express from "express";

import {
  createUserHandler,
  deleteUserHandler,
  getUserByIdHandler,
  getUsersHandler,
  updateUserHandler,
} from "./controller.js";
import {
  createUserSchema,
  deleteUserSchema,
  getUserByIdSchema,
  getUsersSchema,
  updateUserSchema,
} from "./validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authRequired } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// All user CRUD routes require authentication.

// POST /api/users
router.post("/", authRequired, validate(createUserSchema), createUserHandler);

// GET /api/users
router.get("/", authRequired, validate(getUsersSchema), getUsersHandler);

// GET /api/users/:id
router.get("/:id", authRequired, validate(getUserByIdSchema), getUserByIdHandler);

// PATCH /api/users/:id
router.patch("/:id", authRequired, validate(updateUserSchema), updateUserHandler);

// DELETE /api/users/:id
router.delete("/:id", authRequired, validate(deleteUserSchema), deleteUserHandler);

export default router;

