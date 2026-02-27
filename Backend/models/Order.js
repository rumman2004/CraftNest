// models/Order.js

import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
  {
    product:  { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    name:     { type: String, required: true },
    image:    { type: String, default: ""   },
    price:    { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

// ── shippingAddress includes email + phone for admin panel ─────────────────
const shippingAddressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email:    { type: String, default: ""    },  // ← new
    phone:    { type: String, default: ""    },  // ← new
    street:   { type: String, required: true },
    city:     { type: String, required: true },
    state:    { type: String, default: ""    },
    pincode:  { type: String, default: ""    },
    country:  { type: String, required: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user:            { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items:           { type: [orderItemSchema], required: true },
    shippingAddress: { type: shippingAddressSchema,          required: true },
    paymentMethod:   { type: String, enum: ["COD","Online"], default: "COD" },
    itemsPrice:      { type: Number, required: true },
    shippingPrice:   { type: Number, default: 0     },
    totalPrice:      { type: Number, required: true },
    notes:           { type: String, default: ""    },

    orderStatus: {
      type:    String,
      enum:    ["Pending","Processing","Shipped","Delivered","Cancelled"],
      default: "Pending",
    },
    paymentStatus: {
      type:    String,
      enum:    ["Pending","Paid","Failed","Refunded"],
      default: "Pending",
    },

    isPaid:      { type: Boolean, default: false },
    paidAt:      { type: Date                    },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date                    },
  },
  { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);
export default Order;