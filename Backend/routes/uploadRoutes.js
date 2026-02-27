// routes/uploadRoutes.js  (admin product images — unchanged logic, improved errors)

import express from "express";
import upload, {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  FOLDERS,
  handleUploadError,
} from "../middlewares/uploadMiddleware.js";
import { protect, adminOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ── POST /api/upload ───────────────────────────────────────────────────────
router.post(
  "/",
  protect,
  adminOnly,
  upload.single("image"),
  handleUploadError,
  async (req, res) => {
    try {
      if (!req.file)
        return res.status(400).json({ message: "No file uploaded" });

      const result = await uploadToCloudinary(
        req.file.buffer,
        FOLDERS.product
      );

      return res.status(200).json({
        url:       result.secure_url,
        public_id: result.public_id,
      });
    } catch (err) {
      console.error("[POST /upload]", err);
      return res.status(500).json({ message: "Upload failed" });
    }
  }
);

// ── DELETE /api/upload ─────────────────────────────────────────────────────
router.delete(
  "/",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      // Accept either { public_id } or { url } in the body
      const { public_id, url } = req.body;

      let publicId = public_id?.trim() ?? null;

      // If no explicit public_id, try extracting from URL
      if (!publicId && url) {
        publicId = extractPublicId(url);
      }

      if (!publicId)
        return res.status(400).json({
          message: "Provide public_id or a Cloudinary url in the request body",
        });

      const deleted = await deleteFromCloudinary(publicId);

      return res.status(200).json({
        message: deleted ? "Image deleted" : "Image not found in Cloudinary (already removed)",
        public_id: publicId,
      });
    } catch (err) {
      console.error("[DELETE /upload]", err);
      return res.status(500).json({ message: "Delete failed" });
    }
  }
);

export default router;