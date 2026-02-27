// middlewares/uploadMiddleware.js

import multer      from "multer";
import streamifier from "streamifier";
import cloudinary  from "../config/cloudinary.js";

// ══════════════════════════════════════════════════════════════════════════
// Constants
// ══════════════════════════════════════════════════════════════════════════
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
];

export const FOLDERS = {
  avatar:  "craftnest/avatars",
  product: "craftnest/products",
  general: "craftnest/general",
};

// ══════════════════════════════════════════════════════════════════════════
// Shared file filter
// ══════════════════════════════════════════════════════════════════════════
const fileFilter = (_req, file, cb) => {
  ALLOWED_TYPES.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid file type. Allowed: JPG, PNG, WEBP, GIF"), false);
};

// ══════════════════════════════════════════════════════════════════════════
// Multer instances
// ══════════════════════════════════════════════════════════════════════════

// Generic single-image upload  (field name = "image")
// Used by the admin /api/upload route
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_FILE_SIZE },
  fileFilter,
});

// Avatar-specific upload  (field name = "avatar")
// Used by POST /api/auth/profile/image
export const uploadAvatar = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: MAX_FILE_SIZE },
  fileFilter,
}).single("avatar");

// ══════════════════════════════════════════════════════════════════════════
// Stream buffer → Cloudinary
// ══════════════════════════════════════════════════════════════════════════

/**
 * Upload a buffer to Cloudinary.
 *
 * @param {Buffer} buffer
 * @param {string} folder   - Use FOLDERS.avatar / FOLDERS.product / etc.
 * @param {object} options  - Any extra Cloudinary upload options
 * @returns {Promise<{ secure_url: string, public_id: string, …rest }>}
 */
export const uploadToCloudinary = (
  buffer,
  folder  = FOLDERS.general,
  options = {}
) =>
  new Promise((resolve, reject) => {
    if (!Buffer.isBuffer(buffer))
      return reject(new Error("uploadToCloudinary: expected a Buffer"));

    // Avatar → square face-crop at 400 × 400
    // Everything else → cap longest side at 1 200 px
    const transformation =
      folder === FOLDERS.avatar
        ? [
            { width: 400, height: 400, crop: "fill", gravity: "face" },
            { quality: "auto:good", fetch_format: "auto"              },
          ]
        : [
            { width: 1200, height: 1200, crop: "limit" },
            { quality: "auto:good", fetch_format: "auto" },
          ];

    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation,
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result?.secure_url)
          return reject(new Error("Cloudinary returned no secure_url"));
        resolve(result);
      }
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });

// ══════════════════════════════════════════════════════════════════════════
// Delete from Cloudinary
// ══════════════════════════════════════════════════════════════════════════

/**
 * Delete a Cloudinary asset by public_id.
 * Never throws — resolves false on failure so callers can continue.
 *
 * @param  {string}  publicId
 * @returns {Promise<boolean>}
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!publicId?.trim()) {
    console.warn("[deleteFromCloudinary] empty publicId — skipped");
    return false;
  }
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
      invalidate:    true, // purge CDN cache
    });
    if (result.result === "ok") return true;
    console.warn(`[deleteFromCloudinary] "${publicId}" → ${result.result}`);
    return false;
  } catch (err) {
    console.error("[deleteFromCloudinary]", err.message);
    return false;
  }
};

// ══════════════════════════════════════════════════════════════════════════
// Extract Cloudinary public_id from a secure_url
// ══════════════════════════════════════════════════════════════════════════

/**
 * Given "https://res.cloudinary.com/<cloud>/image/upload/v123/craftnest/avatars/abc.jpg"
 * returns "craftnest/avatars/abc"
 *
 * Returns null if the URL is not a recognised Cloudinary URL.
 */
export const extractPublicId = (url) => {
  if (!url || !url.includes("cloudinary.com")) return null;
  try {
    const { pathname } = new URL(url);
    // pathname: /demo/image/upload/v1234567890/craftnest/avatars/abc.jpg
    const uploadIndex = pathname.indexOf("/upload/");
    if (uploadIndex === -1) return null;
    const afterUpload = pathname.slice(uploadIndex + "/upload/".length);
    // Strip optional version segment  (v1234567890/)
    const withoutVersion = afterUpload.replace(/^v\d+\//, "");
    // Strip file extension
    return withoutVersion.replace(/\.[^/.]+$/, "");
  } catch {
    return null;
  }
};

// ══════════════════════════════════════════════════════════════════════════
// Multer error handler  (mount after upload routes)
// ══════════════════════════════════════════════════════════════════════════
export const handleUploadError = (err, _req, res, next) => {
  if (err instanceof multer.MulterError) {
    const MAP = {
      LIMIT_FILE_SIZE:       `File too large — max ${MAX_FILE_SIZE / 1024 / 1024} MB`,
      LIMIT_UNEXPECTED_FILE: "Unexpected file field",
      LIMIT_FILE_COUNT:      "Too many files",
    };
    return res
      .status(400)
      .json({ message: MAP[err.code] ?? `Upload error: ${err.message}` });
  }
  if (err?.message?.startsWith("Invalid file type")) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
};

export default upload;