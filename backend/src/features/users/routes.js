import express from "express";

import {
  authorizeRoles,
  authorizeSelfOrAdmin,
  authRequired,
} from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
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

const router = express.Router();

router.use(authRequired);

// POST /api/users
router.post("/", authorizeRoles("admin"), validate(createUserSchema), createUserHandler);

// GET /api/users
router.get("/", authorizeRoles("admin"), validate(getUsersSchema), getUsersHandler);

// GET /api/users/:id
router.get("/:id", validate(getUserByIdSchema), authorizeSelfOrAdmin("id"), getUserByIdHandler);

// PATCH /api/users/:id
router.patch("/:id", validate(updateUserSchema), authorizeSelfOrAdmin("id"), updateUserHandler);

// DELETE /api/users/:id
router.delete("/:id", validate(deleteUserSchema), authorizeRoles("admin"), deleteUserHandler);

export default router;
