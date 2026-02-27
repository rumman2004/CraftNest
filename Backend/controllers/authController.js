// controllers/authController.js

import User          from "../models/User.js";
import generateToken from "../utils/generateToken.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicId,
  FOLDERS,
} from "../middlewares/uploadMiddleware.js";

// ── Shared response shape ──────────────────────────────────────────────────
const userResponse = (user, token) => ({
  _id:     user._id,
  name:    user.name,
  email:   user.email,
  role:    user.role,
  phone:   user.phone   ?? null,
  address: user.address ?? null,
  avatar:  user.avatar  ?? null,   // always a string URL or null
  token,
});

// ── Phone helpers ──────────────────────────────────────────────────────────
const E164_RE = /^\+\d{7,15}$/;

const normalisePhone = (raw) => {
  if (!raw) return null;
  return raw.trim().replace(/[\s\-().]/g, "");
};

const isValidPhone = (n) => !!n && E164_RE.test(n);

// ── Address sanitiser ──────────────────────────────────────────────────────
const sanitiseAddress = (raw) => {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  return {
    street:  String(raw.street  ?? "").trim(),
    city:    String(raw.city    ?? "").trim(),
    state:   String(raw.state   ?? "").trim(),
    zip:     String(raw.zip     ?? "").trim(),
    country: String(raw.country ?? "").trim(),
  };
};

// ── Avatar sanitiser ───────────────────────────────────────────────────────
// The frontend may send avatar as any of these shapes:
//   • string  → "https://res.cloudinary.com/…"  (correct)
//   • object  → { url: "https://…", public_id: "…" }  (old/wrong shape)
//   • object  → { url: "", public_id: "" }             (empty object)
//   • null / undefined / ""                            (clear avatar)
//
// Always returns a string URL or null — never an object.
const sanitiseAvatar = (raw) => {
  if (!raw) return null;

  // Already a plain string URL
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  // Object with a url field  { url, public_id }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    const url = raw.url ?? raw.secure_url ?? null;
    if (!url || typeof url !== "string" || !url.trim()) return null;
    return url.trim();
  }

  return null;
};

// ── POST /api/auth/register ────────────────────────────────────────────────
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password)
      return res.status(400).json({ message: "Name, email and password are required" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    if (!phone)
      return res.status(400).json({ message: "Phone number is required" });

    const normPhone = normalisePhone(phone);
    if (!isValidPhone(normPhone))
      return res.status(400).json({
        message: "Invalid phone number — include your country code (e.g. +91XXXXXXXXXX)",
      });

    if (await User.findOne({ email: email.toLowerCase().trim() }))
      return res.status(400).json({ message: "Email already registered" });

    if (await User.findOne({ phone: normPhone }))
      return res.status(400).json({ message: "Phone number already registered" });

    const user = await User.create({
      name:     name.trim(),
      email:    email.toLowerCase().trim(),
      password,
      phone:    normPhone,
    });

    return res.status(201).json(userResponse(user, generateToken(user._id)));

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
      return res.status(400).json({ message: `${field} is already registered` });
    }
    console.error("[register]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/login ───────────────────────────────────────────────────
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });

    if (!user.isActive)
      return res.status(403).json({ message: "Account has been deactivated" });

    return res.status(200).json(userResponse(user, generateToken(user._id)));

  } catch (err) {
    console.error("[login]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/auth/me ───────────────────────────────────────────────────────
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (err) {
    console.error("[getMe]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/auth/profile ──────────────────────────────────────────────────
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, phone, address, avatar } = req.body;

    // ── Name ──────────────────────────────────────────────────────────────
    if (name?.trim()) user.name = name.trim();

    // ── Email ─────────────────────────────────────────────────────────────
    if (email?.trim()) {
      const normalEmail = email.toLowerCase().trim();
      if (normalEmail !== user.email) {
        const taken = await User.findOne({
          email: normalEmail,
          _id:   { $ne: user._id },
        });
        if (taken)
          return res.status(400).json({ message: "Email already in use" });
        user.email = normalEmail;
      }
    }

    // ── Phone ─────────────────────────────────────────────────────────────
    if (phone !== undefined) {
      if (!phone) {
        user.phone = null;
      } else {
        const norm = normalisePhone(phone);
        if (!isValidPhone(norm))
          return res.status(400).json({
            message: "Invalid phone number — include your country code",
          });
        if (norm !== user.phone) {
          const taken = await User.findOne({
            phone: norm,
            _id:   { $ne: user._id },
          });
          if (taken)
            return res.status(400).json({ message: "Phone number already in use" });
          user.phone = norm;
        }
      }
    }

    // ── Address ───────────────────────────────────────────────────────────
    if (address !== undefined) {
      const clean = sanitiseAddress(address);
      if (clean) {
        user.set("address", clean);
        user.markModified("address");
      }
    }

    // ── Avatar ────────────────────────────────────────────────────────────
    // sanitiseAvatar handles string | { url, public_id } | null | ""
    // so Mongoose always receives a plain string or null — never an object.
    if (avatar !== undefined) {
      user.avatar = sanitiseAvatar(avatar);
    }

    const updated = await user.save();
    const token   = req.headers.authorization?.split(" ")[1] ?? null;

    return res.status(200).json(userResponse(updated, token));

  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern ?? {})[0] ?? "field";
      return res.status(400).json({ message: `${field} is already in use` });
    }
    console.error("[updateProfile]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/auth/profile/password ────────────────────────────────────────
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Both passwords are required" });

    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    if (currentPassword === newPassword)
      return res.status(400).json({ message: "New password must differ from the current one" });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!(await user.matchPassword(currentPassword)))
      return res.status(400).json({ message: "Current password is incorrect" });

    user.password = newPassword;
    await user.save();

    return res.status(200).json({ message: "Password updated successfully" });

  } catch (err) {
    console.error("[updatePassword]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── POST /api/auth/profile/image ───────────────────────────────────────────
// Flow A — multipart/form-data  field name = "avatar"  (raw file via multer)
// Flow B — application/json     { avatar: "https://…" } or { avatar: { url, public_id } }
export const uploadProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const oldAvatar = user.avatar ?? null;
    let   avatarUrl = null;

    // ── Flow A: raw file via multer ───────────────────────────────────────
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, FOLDERS.avatar);
      avatarUrl = result.secure_url;

      // Delete old Cloudinary image after successful upload
      if (oldAvatar) {
        const oldPublicId = extractPublicId(oldAvatar);
        if (oldPublicId) await deleteFromCloudinary(oldPublicId);
      }
    }

    // ── Flow B: URL or { url, public_id } object from frontend ───────────
    else if (req.body?.avatar !== undefined) {
      avatarUrl = sanitiseAvatar(req.body.avatar);

      if (!avatarUrl)
        return res.status(400).json({ message: "Invalid or empty avatar URL" });

      // Validate it is HTTPS
      try {
        const parsed = new URL(avatarUrl);
        if (parsed.protocol !== "https:")
          return res.status(400).json({ message: "Avatar URL must use HTTPS" });
      } catch {
        return res.status(400).json({ message: "Invalid avatar URL" });
      }
    }

    // ── Neither ───────────────────────────────────────────────────────────
    else {
      return res.status(400).json({
        message: "Send a file (multipart field 'avatar') or JSON { avatar: '<url>' }",
      });
    }

    user.avatar = avatarUrl;
    await user.save();

    const token = req.headers.authorization?.split(" ")[1] ?? null;
    return res.status(200).json(userResponse(user, token));

  } catch (err) {
    console.error("[uploadProfileImage]", err);
    return res.status(500).json({ message: "Image upload failed" });
  }
};

// ── DELETE /api/auth/profile/image ────────────────────────────────────────
export const deleteProfileImage = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    if (!user.avatar)
      return res.status(400).json({ message: "No profile picture to remove" });

    // Delete from Cloudinary (best-effort)
    const publicId = extractPublicId(user.avatar);
    if (publicId) await deleteFromCloudinary(publicId);

    user.avatar = null;
    await user.save();

    const token = req.headers.authorization?.split(" ")[1] ?? null;
    return res.status(200).json(userResponse(user, token));

  } catch (err) {
    console.error("[deleteProfileImage]", err);
    return res.status(500).json({ message: "Could not remove profile picture" });
  }
};