// server.js

import express    from "express";
import dotenv     from "dotenv";
import cors       from "cors";
import mongoose   from "mongoose";
import connectDB  from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";

import authRoutes    from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes    from "./routes/cartRoutes.js";
import orderRoutes   from "./routes/orderRoutes.js";
import adminRoutes   from "./routes/adminRoutes.js";
import uploadRoutes  from "./routes/uploadRoutes.js";

import { notFound, errorHandler } from "./middlewares/errorMiddleware.js";

dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS — universal, allow every origin ──────────────────────────────────
//
//  WHY origin: true instead of origin: "*" ?
//  When credentials: true is set, browsers reject the wildcard "*".
//  Passing origin: true tells cors() to reflect whatever origin the
//  request came from — effectively allowing all origins while still
//  satisfying the browser's credential rules.
//
const corsOptions = {
  origin:      true,          // reflect request origin — allows everyone
  credentials: true,          // allow cookies / Authorization headers
  methods:        ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  preflightContinue:    false,
  optionsSuccessStatus: 204,
};

// Handle preflight requests for every route BEFORE anything else
app.options("*", cors(corsOptions));
app.use(cors(corsOptions));

// ── Body parsers ───────────────────────────────────────────────────────────
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Request logger (dev only) ──────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Health routes ──────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "🧶 CraftNest API is running",
    version: "1.0.0",
    env:     process.env.NODE_ENV || "development",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success:  true,
    message:  "API healthy",
    dbStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    uptime:   `${Math.floor(process.uptime())}s`,
  });
});

// ── API routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/upload",   uploadRoutes);

// ── Error handlers ─────────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ──────────────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    await connectDB();
    await seedAdmin();

    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`🚀 Server     : http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔓 CORS        : open to all origins`);
      console.log("─────────────────────────────────────────");
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
};

// ── Graceful shutdown ──────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n🔌 Gracefully shutting down...");
  await mongoose.disconnect();
  console.log("✅ MongoDB disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await mongoose.disconnect();
  process.exit(0);
});

process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();