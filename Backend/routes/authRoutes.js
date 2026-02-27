// routes/authRoutes.js

import express from "express";
import {
  register,
  login,
  getMe,
  updateProfile,
  updatePassword,
  uploadProfileImage,
  deleteProfileImage,
} from "../controllers/authController.js";
import { protect }                          from "../middlewares/authMiddleware.js";
import { uploadAvatar, handleUploadError }  from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// ── Public ─────────────────────────────────────────────────────────────────
router.post("/register", register);
router.post("/login",    login);

// ── Protected ──────────────────────────────────────────────────────────────
router.get ("/me",               protect, getMe);
router.put ("/profile",          protect, updateProfile);
router.put ("/profile/password", protect, updatePassword);

// Avatar upload pipeline:
//   1. protect          → verify JWT
//   2. uploadAvatar     → multer parses multipart "avatar" field → req.file
//   3. handleUploadError→ catches multer errors (size / type) before controller
//   4. uploadProfileImage → handles Flow A (req.file) and Flow B (req.body.avatar)
router.post  ("/profile/image", protect, uploadAvatar, handleUploadError, uploadProfileImage);
router.delete("/profile/image", protect, deleteProfileImage);

export default router;