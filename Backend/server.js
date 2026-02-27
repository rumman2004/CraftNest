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

// ── Allowed origins ────────────────────────────────────────────────────────
// CLIENT_URL can be a comma-separated list:
// CLIENT_URL=https://craftnest-six.vercel.app,https://craftnest.vercel.app
const EXPLICIT_ORIGINS = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (incomingOrigin, callback) => {
    // Allow server-to-server / curl / Postman (no origin header)
    if (!incomingOrigin) return callback(null, true);

    // 1. Exact match against any URL in CLIENT_URL list
    if (EXPLICIT_ORIGINS.includes(incomingOrigin)) {
      return callback(null, true);
    }

    // 2. Allow ANY vercel.app preview URL for the same project
    //    e.g. craftnest-9t1y28rv8-rumman04s-projects.vercel.app
    if (/^https:\/\/craftnest[a-z0-9-]*\.vercel\.app$/.test(incomingOrigin)) {
      return callback(null, true);
    }

    // 3. Allow localhost on any port during development
    if (/^http:\/\/localhost(:\d+)?$/.test(incomingOrigin)) {
      return callback(null, true);
    }

    // 4. Block everything else
    console.warn(`[CORS] Blocked origin: ${incomingOrigin}`);
    callback(new Error(`CORS: origin ${incomingOrigin} is not allowed`));
  },

  credentials:    true,
  methods:        ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],

  // Explicitly handle OPTIONS preflight so Express doesn't 404 it
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

// ── Apply CORS before every other middleware ───────────────────────────────
// OPTIONS must be handled first — if it hits a route handler it returns 404
app.options("*", cors(corsOptions));   // handle preflight for all routes
app.use(cors(corsOptions));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ── Request logger (dev only) ──────────────────────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, _res, next) => {
    console.log(
      `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );
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
      console.log(`🔒 CORS origins:`);
      EXPLICIT_ORIGINS.forEach((o) => console.log(`   • ${o}`));
      console.log(`   • *.vercel.app (craftnest preview URLs)`);
      console.log(`   • http://localhost:*`);
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