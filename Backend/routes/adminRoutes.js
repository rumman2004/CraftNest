// routes/adminRoutes.js

import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  getUserById,
  updateUserByAdmin,
  deleteUser,
} from "../controllers/adminController.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All admin routes are protected — must be logged in AND be an admin
router.use(protect, adminOnly);

router.get   ("/stats",          getDashboardStats);

router.get   ("/users",          getAllUsers);
router.get   ("/users/:id",      getUserById);       // ← was missing
router.put   ("/users/:id",      updateUserByAdmin);
router.delete("/users/:id",      deleteUser);

export default router;