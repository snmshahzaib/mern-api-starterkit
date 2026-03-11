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

export function createUsersRouter(options = {}) {
  const userRouter = express.Router();

  const handlers =
    options.handlers || {
      createUserHandler,
      deleteUserHandler,
      getUserByIdHandler,
      getUsersHandler,
      updateUserHandler,
    };

  const authMiddleware = options.authRequired || authRequired;
  const authorizeRolesMiddleware = options.authorizeRoles || authorizeRoles;
  const authorizeSelfOrAdminMiddleware = options.authorizeSelfOrAdmin || authorizeSelfOrAdmin;

  userRouter.use(authMiddleware);

  // POST /api/users
  userRouter.post(
    "/",
    authorizeRolesMiddleware("admin"),
    validate(createUserSchema),
    handlers.createUserHandler,
  );

  // GET /api/users
  userRouter.get("/", authorizeRolesMiddleware("admin"), validate(getUsersSchema), handlers.getUsersHandler);

  // GET /api/users/:id
  userRouter.get(
    "/:id",
    validate(getUserByIdSchema),
    authorizeSelfOrAdminMiddleware("id"),
    handlers.getUserByIdHandler,
  );

  // PATCH /api/users/:id
  userRouter.patch(
    "/:id",
    validate(updateUserSchema),
    authorizeSelfOrAdminMiddleware("id"),
    handlers.updateUserHandler,
  );

  // DELETE /api/users/:id
  userRouter.delete(
    "/:id",
    validate(deleteUserSchema),
    authorizeRolesMiddleware("admin"),
    handlers.deleteUserHandler,
  );

  return userRouter;
}

export default createUsersRouter();
