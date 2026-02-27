// models/Product.js — isAvailable defaults fixed + isActive alias added

import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name:    { type: String, required: true },
    rating:  { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type:     String,
      required: [true, "Product name is required"],
      trim:     true,
    },
    description: {
      type:     String,
      required: [true, "Description is required"],
    },
    price: {
      type:     Number,
      required: [true, "Price is required"],
      min:      0,
    },
    category: {
      type:     String,
      required: [true, "Category is required"],
      enum:     ["Crochet", "Embroidery", "Pipe Cleaner", "Woolen", "Other"],
    },
    images: [
      {
        url:       { type: String, required: true },
        public_id: { type: String, required: true },
      },
    ],
    stock: {
      type:    Number,
      default: 0,
      min:     0,
    },
    reviews:    [reviewSchema],
    numReviews: { type: Number, default: 0 },
    ratings:    { type: Number, default: 0 },

    isFeatured: { type: Boolean, default: false, index: true },
    featured:   { type: Boolean, default: false, index: true },

    // ── isAvailable is the canonical availability flag ─────────────────────
    // default: true  so existing docs without this field are treated as available
    isAvailable: { type: Boolean, default: true },

    // ── isActive is a read-only virtual alias for isAvailable ──────────────
    // Any code that reads product.isActive will get the same value.
    // The orderController was checking isActive — this makes it work
    // without changing the controller field name.

    tags: [{ type: String }],
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },   // include virtuals in res.json()
    toObject:   { virtuals: true },
  }
);

// ── isActive virtual → mirrors isAvailable ────────────────────────────────
productSchema.virtual("isActive").get(function () {
  return this.isAvailable;
});

// ── Auto-update ratings and numReviews ─────────────────────────────────────
productSchema.methods.updateRating = function () {
  if (this.reviews.length === 0) {
    this.ratings    = 0;
    this.numReviews = 0;
  } else {
    this.numReviews = this.reviews.length;
    this.ratings    =
      this.reviews.reduce((acc, r) => acc + r.rating, 0) / this.reviews.length;
  }
};

// ── Pre-save: keep featured + isFeatured in sync ──────────────────────────
productSchema.pre("save", function (next) {
  if (this.isModified("featured"))   this.isFeatured = this.featured;
  if (this.isModified("isFeatured")) this.featured   = this.isFeatured;
  next();
});

// ── Text index for search ─────────────────────────────────────────────────
productSchema.index({ name: "text", description: "text", category: "text" });

const Product = mongoose.model("Product", productSchema);
export default Product;