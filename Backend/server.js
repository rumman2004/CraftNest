import express       from "express";
import dotenv        from "dotenv";
import cors          from "cors";
import mongoose      from "mongoose";
import connectDB     from "./config/db.js";
import { seedAdmin } from "./utils/seedAdmin.js";

// ── Routes ─────────────────────────────────────────────────────────────────
import authRoutes    from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes    from "./routes/cartRoutes.js";
import orderRoutes   from "./routes/orderRoutes.js";
import adminRoutes   from "./routes/adminRoutes.js";
import uploadRoutes  from "./routes/uploadRoutes.js";

// ── Error Middleware ───────────────────────────────────────────────────────
import {
  notFound,
  errorHandler,
} from "./middlewares/errorMiddleware.js";

// ── Load env ───────────────────────────────────────────────────────────────
dotenv.config();

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Core Middleware ────────────────────────────────────────────────────────
app.use(
  cors({
    origin:      process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
    methods:     ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Request Logger (dev only) ──────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
    next();
  });
}

// ── Health Check ───────────────────────────────────────────────────────────
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

// ── API Routes ─────────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart",     cartRoutes);
app.use("/api/orders",   orderRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/upload",   uploadRoutes);

// ── 404 & Global Error Handler ─────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start Server ───────────────────────────────────────────────────────────
const startServer = async () => {
  try {
    // 1. Connect to MongoDB
    await connectDB();

    // 2. Seed admin user (skips if already exists)
    await seedAdmin();

    // 3. Start listening
    app.listen(PORT, () => {
      console.log("─────────────────────────────────────────");
      console.log(`🚀 Server     : http://localhost:${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`📦 Database   : Connected`);
      console.log("─────────────────────────────────────────");
    });
  } catch (err) {
    console.error("❌ Server failed to start:", err.message);
    process.exit(1);
  }
};

// ── Graceful Shutdown ──────────────────────────────────────────────────────
process.on("SIGINT", async () => {
  console.log("\n🔌 Gracefully shutting down...");
  await mongoose.disconnect();
  console.log("✅ MongoDB disconnected");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n🔌 SIGTERM received, shutting down...");
  await mongoose.disconnect();
  process.exit(0);
});

// ── Unhandled Rejections ───────────────────────────────────────────────────
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

startServer();