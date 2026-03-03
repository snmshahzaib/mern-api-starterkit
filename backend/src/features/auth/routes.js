import express from "express";

import { loginHandler, meHandler, registerHandler } from "./controller.js";
import { loginSchema, registerSchema } from "./validation.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { authRequired } from "../../middlewares/auth.middleware.js";

const router = express.Router();

// Public: register & login
router.post("/register", validate(registerSchema), registerHandler);
router.post("/login", validate(loginSchema), loginHandler);

// Authenticated: get current user profile
router.get("/me", authRequired, meHandler);

export default router;

