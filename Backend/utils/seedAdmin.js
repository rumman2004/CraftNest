import mongoose from "mongoose";
import dotenv   from "dotenv";
import User     from "../models/User.js";

dotenv.config();

export const seedAdmin = async () => {
  // ── Validate required env vars ───────────────────────────────────────────
  if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD) {
    console.warn(
      "⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set in .env — skipping admin seed"
    );
    return;
  }

  try {
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });

    if (adminExists) {
      console.log("ℹ️  Admin user already exists — skipping seed");
      return;
    }

    await User.create({
      name:     process.env.ADMIN_NAME ,
      email:    process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      role:     "admin",
    });

    console.log(`✅ Admin seeded → ${process.env.ADMIN_EMAIL}`);
  } catch (error) {
    console.error("❌ Admin seed error:", error.message);
  }
};

// ── Allow running directly: node utils/seedAdmin.js ─────────────────────
// Detects if this file is the entry point
if (process.argv[1].includes("seedAdmin")) {
  (async () => {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected");

      await seedAdmin();

      await mongoose.disconnect();
      console.log("🔌 MongoDB disconnected");
      process.exit(0);
    } catch (err) {
      console.error("❌ Seed failed:", err.message);
      process.exit(1);
    }
  })();
}