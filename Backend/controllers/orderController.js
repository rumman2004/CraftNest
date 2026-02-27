// controllers/orderController.js

import Order   from "../models/Order.js";
import Product from "../models/Product.js";

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE             = 49;

// ── POST /api/orders ───────────────────────────────────────────────────────
export const createOrder = async (req, res) => {
  try {
    const {
      orderItems,
      shippingAddress,
      paymentMethod = "COD",
      notes = "",
    } = req.body;

    // ── Guards ─────────────────────────────────────────────────────────────
    if (!orderItems || orderItems.length === 0)
      return res.status(400).json({ message: "No order items provided" });

    if (
      !shippingAddress?.fullName ||
      !shippingAddress?.street   ||
      !shippingAddress?.city     ||
      !shippingAddress?.country
    ) {
      return res.status(400).json({ message: "Incomplete shipping address" });
    }

    // ── Build + validate items ─────────────────────────────────────────────
    const builtItems = [];

    for (const item of orderItems) {
      if (!item.product)
        return res.status(400).json({
          message: "Each order item must include a product id",
        });

      const product = await Product.findById(item.product);

      if (!product)
        return res.status(404).json({
          message: `Product not found: ${item.name || item.product}`,
        });

      // ── Availability check uses `isAvailable` — the actual schema field ──
      // isAvailable === false  → blocked
      // isAvailable === true / undefined / null → allowed
      // (undefined happens on old docs that predate the field)
      if (product.isAvailable === false) {
        return res.status(400).json({
          message: `"${product.name}" is no longer available`,
        });
      }

      const qty = Number(item.quantity);

      if (!qty || qty < 1)
        return res.status(400).json({
          message: `Invalid quantity for "${product.name}"`,
        });

      if (product.stock < qty)
        return res.status(400).json({
          message: `Insufficient stock for "${product.name}". Only ${product.stock} left.`,
        });

      builtItems.push({
        product:  product._id,
        name:     product.name,
        image:    product.images?.[0]?.url || item.image || "",
        price:    product.price,   // always server price — never trust client
        quantity: qty,
      });

      product.stock -= qty;
      await product.save();
    }

    // ── Server-side totals ─────────────────────────────────────────────────
    const itemsPrice    = builtItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const shippingPrice = itemsPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const totalPrice    = itemsPrice + shippingPrice;

    // ── Payment method normalisation ───────────────────────────────────────
    const methodMap  = { COD: "COD", Online: "Online", Card: "Online", PayPal: "Online" };
    const normMethod = methodMap[paymentMethod] ?? "COD";

    // ── Sanitise address ───────────────────────────────────────────────────
    const sanitisedAddress = {
      fullName: String(shippingAddress.fullName ?? "").trim(),
      email:    String(shippingAddress.email    ?? "").trim(),
      phone:    String(shippingAddress.phone    ?? "").trim(),
      street:   String(shippingAddress.street   ?? "").trim(),
      city:     String(shippingAddress.city     ?? "").trim(),
      state:    String(shippingAddress.state    ?? "").trim(),
      pincode:  String(shippingAddress.pincode  ?? "").trim(),
      country:  String(shippingAddress.country  ?? "").trim(),
    };

    // ── Create ─────────────────────────────────────────────────────────────
    const order = await Order.create({
      user:            req.user._id,
      items:           builtItems,
      shippingAddress: sanitisedAddress,
      paymentMethod:   normMethod,
      itemsPrice,
      shippingPrice,
      totalPrice,
      notes,
    });

    const populated = await order.populate("user", "name email phone");
    return res.status(201).json(populated);

  } catch (err) {
    console.error("[createOrder]", err);
    if (err.name === "ValidationError")
      return res.status(400).json({ message: err.message });
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/orders/my ─────────────────────────────────────────────────────
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order
      .find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");
    return res.status(200).json(orders);
  } catch (err) {
    console.error("[getMyOrders]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/orders/:id ────────────────────────────────────────────────────
export const getOrderById = async (req, res) => {
  try {
    const order = await Order
      .findById(req.params.id)
      .populate("user", "name email phone")
      .select("-__v");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (
      order.user._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorised" });
    }

    return res.status(200).json(order);
  } catch (err) {
    console.error("[getOrderById]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── GET /api/orders (admin) ────────────────────────────────────────────────
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, payment, search } = req.query;

    const filter = {};
    if (status)  filter.orderStatus   = status;
    if (payment) filter.paymentStatus = payment;
    if (search)  filter._id           = { $regex: search, $options: "i" };

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Order.countDocuments(filter);

    const orders = await Order
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email phone")
      .select("-__v");

    return res.status(200).json({
      orders,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (err) {
    console.error("[getAllOrders]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── PUT /api/orders/:id/status (admin) ────────────────────────────────────
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderStatus, paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (orderStatus) {
      const valid = ["Pending", "Processing", "Shipped", "Delivered", "Cancelled"];
      if (!valid.includes(orderStatus))
        return res.status(400).json({
          message: `Invalid status. Must be one of: ${valid.join(", ")}`,
        });

      order.orderStatus = orderStatus;

      if (orderStatus === "Delivered") {
        order.isDelivered = true;
        order.deliveredAt = new Date();
      }

      if (orderStatus === "Cancelled") {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity },
          });
        }
      }
    }

    if (paymentStatus) {
      const valid = ["Pending", "Paid", "Failed", "Refunded"];
      if (!valid.includes(paymentStatus))
        return res.status(400).json({
          message: `Invalid paymentStatus. Must be one of: ${valid.join(", ")}`,
        });

      order.paymentStatus = paymentStatus;

      if (paymentStatus === "Paid") {
        order.isPaid = true;
        order.paidAt = new Date();
      }
    }

    await order.save();
    const updated = await order.populate("user", "name email phone");
    return res.status(200).json(updated);

  } catch (err) {
    console.error("[updateOrderStatus]", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ── DELETE /api/orders/:id (admin) ────────────────────────────────────────
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndDelete(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });
    return res.status(200).json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error("[deleteOrder]", err);
    return res.status(500).json({ message: "Server error" });
  }
};