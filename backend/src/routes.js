import express from "express";

import userRoutes from "./features/users/routes.js";
import authRoutes from "./features/auth/routes.js";

const router = express.Router();

// Grouped feature routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;

