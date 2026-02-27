// utils/fixProducts.js  — run once: node utils/fixProducts.js

import mongoose from "mongoose";
import Product  from "../models/Product.js";
import dotenv   from "dotenv";
dotenv.config();

const fix = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected");

  // 1. Products with isAvailable explicitly false → make available
  const r1 = await Product.updateMany(
    { isAvailable: false },
    { $set: { isAvailable: true } }
  );
  console.log(`isAvailable false→true: ${r1.modifiedCount}`);

  // 2. Products missing the field entirely → add it as true
  const r2 = await Product.updateMany(
    { isAvailable: { $exists: false } },
    { $set: { isAvailable: true } }
  );
  console.log(`isAvailable added: ${r2.modifiedCount}`);

  // 3. Same for isFeatured / featured alignment
  const r3 = await Product.updateMany(
    { isFeatured: { $exists: false } },
    { $set: { isFeatured: false, featured: false } }
  );
  console.log(`isFeatured/featured added: ${r3.modifiedCount}`);

  // 4. Summary
  const total     = await Product.countDocuments();
  const available = await Product.countDocuments({ isAvailable: true  });
  const unavail   = await Product.countDocuments({ isAvailable: false });
  console.log(`\nTotal: ${total} | Available: ${available} | Unavailable: ${unavail}`);

  await mongoose.disconnect();
  console.log("Done ✅  — delete this file now");
};

fix().catch((err) => { console.error(err); process.exit(1); });