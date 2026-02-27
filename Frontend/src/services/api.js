// services/api.js

import axios from "axios";

const STORAGE_KEY = "craftnest_user";

// ══════════════════════════════════════════════════════════════════════════
// Base instance
// ══════════════════════════════════════════════════════════════════════════
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15_000,
  // ⚠️  Do NOT set a global Content-Type here.
  //     FormData uploads need the browser to set it automatically
  //     (with the correct multipart boundary string).
});

// ══════════════════════════════════════════════════════════════════════════
// Token helper
// ══════════════════════════════════════════════════════════════════════════
const getToken = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored)?.token ?? null;
  } catch {
    return null;
  }
};

// ══════════════════════════════════════════════════════════════════════════
// Request interceptor
// ══════════════════════════════════════════════════════════════════════════
api.interceptors.request.use(
  (config) => {
    // 1. Attach Bearer token when available
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // 2. Content-Type strategy
    //    • FormData  → let the browser write the multipart boundary itself
    //    • Everything else → JSON
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ══════════════════════════════════════════════════════════════════════════
// Response interceptor
// ══════════════════════════════════════════════════════════════════════════
api.interceptors.response.use(
  (response) => response,

  (error) => {
    const status  = error.response?.status;
    const message = error.response?.data?.message || error.message;

    // ── 401 → wipe local storage + redirect to login ──────────────────
    if (status === 401) {
      localStorage.removeItem(STORAGE_KEY);
      if (!window.location.pathname.includes("/login")) {
        window.location.href = "/login";
      }
    }

    // ── 403 → account deactivated or forbidden ────────────────────────
    if (status === 403) {
      console.warn("[api] 403 Forbidden:", message);
    }

    // ── 500 → server crash ────────────────────────────────────────────
    if (status >= 500) {
      console.error("[api] Server error:", message);
    }

    // Normalise error.message so callers can always read it
    error.message = message;
    return Promise.reject(error);
  }
);

// ══════════════════════════════════════════════════════════════════════════
// ── AUTH ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// POST /auth/register  { name, email, password, phone }
export const registerUser = (data) => api.post("/auth/register", data);

// POST /auth/login     { email, password }
export const loginUser    = (data) => api.post("/auth/login",    data);

// GET  /auth/me
export const getMe        = ()     => api.get ("/auth/me");

// ══════════════════════════════════════════════════════════════════════════
// ── PROFILE ───────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// PUT  /auth/profile   { name, email, phone, address, avatar }
// address shape: { street, city, state, zip, country }
export const updateProfile = (data) => api.put("/auth/profile", data);

// PUT  /auth/profile/password  { currentPassword, newPassword }
export const updatePassword = (data) =>
  api.put("/auth/profile/password", data);

// POST /auth/profile/image  { avatar: "<https-url>" }
// The Cloudinary upload happens on the frontend BEFORE calling this.
// This endpoint only stores the returned URL.
export const uploadProfileImage = (data) =>
  api.post("/auth/profile/image", data);

// DELETE /auth/profile/image
export const deleteProfileImage = () =>
  api.delete("/auth/profile/image");

// ══════════════════════════════════════════════════════════════════════════
// ── PRODUCTS ──────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// GET  /products  ?page=1&limit=12&category=Crochet&search=bag&sort=price
export const getProducts = (params) =>
  api.get("/products", { params });

// GET  /products/:id
export const getProductById = (id) =>
  api.get(`/products/${id}`);

// POST /products  (FormData — image + fields)
export const createProduct = (formData) =>
  api.post("/products", formData);

// PUT  /products/:id  (FormData)
export const updateProduct = (id, formData) =>
  api.put(`/products/${id}`, formData);

// DELETE /products/:id
export const deleteProduct = (id) =>
  api.delete(`/products/${id}`);

// POST /products/:id/review  { rating, comment }
export const addReview = (id, data) =>
  api.post(`/products/${id}/review`, data);

// ══════════════════════════════════════════════════════════════════════════
// ── CART ──────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// GET  /cart
export const getCart = () => api.get("/cart");

// POST /cart  { productId, quantity }
export const addToCart = (data) => api.post("/cart", data);

// PUT  /cart/:productId  { quantity }
export const updateCartItem = (productId, data) =>
  api.put(`/cart/${productId}`, data);

// DELETE /cart/:productId
export const removeCartItem = (productId) =>
  api.delete(`/cart/${productId}`);

// DELETE /cart  (wipe entire cart)
export const clearCart = () => api.delete("/cart");

// ══════════════════════════════════════════════════════════════════════════
// ── ORDERS ────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// POST /orders  { items, shippingAddress, paymentMethod, … }
export const createOrder = (data) => api.post("/orders", data);

// GET  /orders/my          ← must come BEFORE /orders/:id
export const getMyOrders = () => api.get("/orders/my");

// GET  /orders/:id
export const getOrderById = (id) => api.get(`/orders/${id}`);

// GET  /orders  ?page=1&status=pending   (admin)
export const getAllOrders = (params) =>
  api.get("/orders", { params });

// PUT  /orders/:id/status  { status }
export const updateOrderStatus = (id, data) =>
  api.put(`/orders/${id}/status`, data);

// DELETE /orders/:id  (admin)
export const deleteOrder = (id) => api.delete(`/orders/${id}`);

// ══════════════════════════════════════════════════════════════════════════
// ── ADMIN ─────────────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// GET  /admin/stats
export const getDashboardStats = () => api.get("/admin/stats");

// GET  /admin/users
export const getAllUsers = () => api.get("/admin/users");

// PUT  /admin/users/:id  { name, email, role, isActive, … }
export const updateUserByAdmin = (id, data) =>
  api.put(`/admin/users/${id}`, data);

// DELETE /admin/users/:id
export const deleteUser = (id) => api.delete(`/admin/users/${id}`);

// ══════════════════════════════════════════════════════════════════════════
// ── CLOUDINARY / UPLOAD ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════
// These hit your own backend upload proxy (e.g. multer → cloudinary).
// For direct-to-Cloudinary unsigned uploads, use uploadToCloudinary()
// in AvatarUploader.jsx instead.

// POST /upload  (FormData with "image" field)
export const uploadImage = (formData) =>
  api.post("/upload", formData);

// DELETE /upload  { publicId: "craftnest/avatars/abc123" }
export const deleteImage = (data) =>
  api.delete("/upload", { data });

// ══════════════════════════════════════════════════════════════════════════
// ── WISHLIST  (future-proofed) ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════

// GET  /wishlist
export const getWishlist = () => api.get("/wishlist");

// POST /wishlist  { productId }
export const addToWishlist = (data) => api.post("/wishlist", data);

// DELETE /wishlist/:productId
export const removeFromWishlist = (productId) =>
  api.delete(`/wishlist/${productId}`);

// ══════════════════════════════════════════════════════════════════════════
export default api;