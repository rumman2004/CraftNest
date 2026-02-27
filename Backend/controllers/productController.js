import Product from "../models/Product.js";
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from "../middlewares/uploadMiddleware.js";

// ── Helpers ────────────────────────────────────────────────────────────────
const parseTags = (raw) => {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw.map((t) => t.trim()).filter(Boolean);
  return String(raw).split(",").map((t) => t.trim()).filter(Boolean);
};

const parseBool = (val) => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string")  return val.toLowerCase() === "true";
  return Boolean(val);
};

// ── GET /api/products ──────────────────────────────────────────────────────
export const getProducts = async (req, res) => {
  try {
    const {
      category, search, minPrice, maxPrice,
      sort = "-createdAt", page = 1, limit = 12,
      featured,
    } = req.query;

    const filter = {};
    if (category) filter.category = category;

    // ✅ Fix: handle BOTH possible field names in the DB.
    // Check which one returns results — try `featured` first,
    // and also match documents where isFeatured is true (legacy).
    if (featured === "true") {
      filter.$or = [
        { featured:   true },
        { isFeatured: true },
      ];
    }

    if (search)
      filter.name = { $regex: search, $options: "i" };

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Product.countDocuments(filter);

    const products = await Product.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      products,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("getProducts:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/products/:id ──────────────────────────────────────────────────
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "reviews.user", "name"
    );
    if (!product)
      return res.status(404).json({ message: "Product not found" });
    res.status(200).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/products (admin) ─────────────────────────────────────────────
export const createProduct = async (req, res) => {
  try {
    const images = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer, "craftnest/products"
        );
        images.push({ url: result.secure_url, public_id: result.public_id });
      }
    }

    const {
      name, description, price, category, stock, featured, tags,
    } = req.body;

    const featuredBool = parseBool(featured);

    const product = await Product.create({
      name,
      description,
      price:      Number(price),
      category,
      stock:      Number(stock),
      // ✅ Write BOTH field names so old queries still work
      featured:   featuredBool,
      isFeatured: featuredBool,
      tags:       parseTags(tags),
      images,
    });

    res.status(201).json(product);
  } catch (err) {
    console.error("createProduct:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/products/:id (admin) ──────────────────────────────────────────
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    // Upload new images
    if (req.files?.length) {
      const newImages = [];
      for (const file of req.files) {
        const result = await uploadToCloudinary(
          file.buffer, "craftnest/products"
        );
        newImages.push({ url: result.secure_url, public_id: result.public_id });
      }
      product.images = [...product.images, ...newImages];
    }

    // Remove images
    const rawRemoved = req.body.removedImages ?? req.body.deleteImages;
    if (rawRemoved) {
      let toDelete = [];
      try {
        toDelete = typeof rawRemoved === "string"
          ? JSON.parse(rawRemoved)
          : rawRemoved;
      } catch { toDelete = []; }
      if (toDelete.length) {
        await Promise.all(toDelete.map(deleteFromCloudinary));
        product.images = product.images.filter(
          (img) => !toDelete.includes(img.public_id)
        );
      }
    }

    const { name, description, price, category, stock, featured, tags } =
      req.body;

    if (name        !== undefined) product.name        = name;
    if (description !== undefined) product.description = description;
    if (price       !== undefined) product.price       = Number(price);
    if (category    !== undefined) product.category    = category;
    if (stock       !== undefined) product.stock       = Number(stock);
    if (tags        !== undefined) product.tags        = parseTags(tags);

    // ✅ Keep both field names in sync on update too
    if (featured !== undefined) {
      const featuredBool  = parseBool(featured);
      product.featured    = featuredBool;
      product.isFeatured  = featuredBool;
    }

    await product.save();
    res.status(200).json(product);
  } catch (err) {
    console.error("updateProduct:", err);
    res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/products/:id (admin) ──────────────────────────────────────
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    await Promise.all(
      product.images.map((img) => deleteFromCloudinary(img.public_id))
    );
    await product.deleteOne();
    res.status(200).json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── POST /api/products/:id/review ──────────────────────────────────────────
export const addReview = async (req, res) => {
  const { rating, comment } = req.body;
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (alreadyReviewed)
      return res.status(400).json({ message: "Already reviewed" });

    product.reviews.push({
      user:    req.user._id,
      name:    req.user.name,
      rating:  Number(rating),
      comment,
    });

    if (typeof product.updateRating === "function") {
      product.updateRating();
    } else {
      const total       = product.reviews.reduce((s, r) => s + r.rating, 0);
      product.ratings   = total / product.reviews.length;
      product.numReviews = product.reviews.length;
    }

    await product.save();
    res.status(201).json({ message: "Review added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};