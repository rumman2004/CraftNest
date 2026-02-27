// controllers/adminController.js

import User    from "../models/User.js";
import Order   from "../models/Order.js";
import Product from "../models/Product.js";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// ── GET /api/admin/stats ───────────────────────────────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // ── Basic counts ─────────────────────────────────────────────────────
    const [totalUsers, totalOrders, totalProducts] = await Promise.all([
      User.countDocuments({ role: { $ne: "admin" } }),  // exclude admins
      Order.countDocuments(),
      Product.countDocuments(),
    ]);

    // ── Total revenue ─────────────────────────────────────────────────────
    // Sum totalPrice of every order that is NOT cancelled.
    // Previously this only counted paymentStatus:"Paid" which excluded
    // all COD orders (they stay "Pending" until manually marked Paid),
    // making revenue show 0 for most stores.
    const revenueAgg = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ["Cancelled"] },
        },
      },
      {
        $group: {
          _id:   null,
          total: { $sum: "$totalPrice" },
        },
      },
    ]);
    const totalRevenue = revenueAgg[0]?.total ?? 0;

    // ── Orders by status ──────────────────────────────────────────────────
    // FIXED: was aggregating on "$status" — schema field is "orderStatus"
    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id:   "$orderStatus",   // ← was "$status" — wrong field
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // ── Monthly revenue — current year, all 12 months ─────────────────────
    // Returns { _id: 1..12, revenue, orders } so the frontend chart can
    // pad missing months correctly.
    // FIXED: was filtering paymentStatus:"Paid" which hid most orders.
    const monthlyRaw = await Order.aggregate([
      {
        $match: {
          orderStatus: { $nin: ["Cancelled"] },
          createdAt: {
            $gte: new Date(`${currentYear}-01-01T00:00:00.000Z`),
            $lte: new Date(`${currentYear}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: {
            year:  { $year:  "$createdAt" },
            month: { $month: "$createdAt" },
          },
          revenue: { $sum: "$totalPrice" },
          orders:  { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Normalise to { _id: monthNumber, month: "Jan", revenue, orders }
    // _id is kept as a number so the frontend RevenueChart can use it
    // for padding (it builds a 12-slot array indexed by month number).
    const monthlyRevenue = monthlyRaw.map((m) => ({
      _id:     m._id.month,                          // 1–12  ← used by chart
      month:   MONTHS[(m._id.month ?? 1) - 1],       // "Jan" ← used by tooltip
      year:    m._id.year,
      revenue: m.revenue ?? 0,
      orders:  m.orders  ?? 0,
    }));

    // ── Recent orders (last 8) ────────────────────────────────────────────
    const recentOrders = await Order
      .find()
      .sort({ createdAt: -1 })
      .limit(8)
      .populate("user", "name email phone")
      .select(
        "_id user totalPrice orderStatus paymentStatus " +
        "paymentMethod createdAt items shippingAddress"
      )
      .lean();

    // ── Low stock products (stock ≤ 5) ────────────────────────────────────
    const lowStockProducts = await Product
      .find({
        stock:       { $lte: 5 },
        isAvailable: { $ne: false },  // skip explicitly disabled products
      })
      .select("name category stock images isAvailable")
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    // ── Paid vs unpaid revenue breakdown (bonus — useful for admin) ───────
    const paidRevenueAgg = await Order.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, total: { $sum: "$totalPrice" } } },
    ]);
    const paidRevenue = paidRevenueAgg[0]?.total ?? 0;

    // ── Respond ───────────────────────────────────────────────────────────
    return res.status(200).json({
      totalUsers,
      totalOrders,
      totalProducts,
      totalRevenue,       // all non-cancelled orders
      paidRevenue,        // only paymentStatus:"Paid" orders
      recentOrders,
      lowStockProducts,
      ordersByStatus,     // [{ _id: "Pending", count: 3 }, …]
      monthlyRevenue,     // [{ _id: 1, month: "Jan", revenue: 4500, orders: 3 }, …]
    });

  } catch (err) {
    console.error("[getDashboardStats]", err);
    return res.status(500).json({ message: err.message });
  }
};

// ── GET /api/admin/users ───────────────────────────────────────────────────
export const getAllUsers = async (req, res) => {
  try {
    const {
      page   = 1,
      limit  = 50,
      search = "",
      role,
    } = req.query;

    const filter = {};

    // Search by name or email
    if (search.trim()) {
      filter.$or = [
        { name:  { $regex: search.trim(), $options: "i" } },
        { email: { $regex: search.trim(), $options: "i" } },
      ];
    }

    // Filter by role
    if (role) filter.role = role;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await User.countDocuments(filter);

    const users = await User
      .find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    return res.status(200).json({
      users,
      total,
      page:       Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });

  } catch (err) {
    console.error("[getAllUsers]", err);
    return res.status(500).json({ message: err.message });
  }
};

// ── GET /api/admin/users/:id ───────────────────────────────────────────────
export const getUserById = async (req, res) => {
  try {
    const user = await User
      .findById(req.params.id)
      .select("-password")
      .lean();

    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Also fetch their order count + total spend
    const [orderCount, spendAgg] = await Promise.all([
      Order.countDocuments({ user: user._id }),
      Order.aggregate([
        { $match: { user: user._id, orderStatus: { $nin: ["Cancelled"] } } },
        { $group: { _id: null, total: { $sum: "$totalPrice" } } },
      ]),
    ]);

    return res.status(200).json({
      ...user,
      orderCount,
      totalSpend: spendAgg[0]?.total ?? 0,
    });

  } catch (err) {
    console.error("[getUserById]", err);
    return res.status(500).json({ message: err.message });
  }
};

// ── PUT /api/admin/users/:id ───────────────────────────────────────────────
export const updateUserByAdmin = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Only allow safe fields — never let the admin endpoint change a password
    const ALLOWED = ["name", "role", "isActive", "phone"];
    ALLOWED.forEach((field) => {
      if (req.body[field] !== undefined) user[field] = req.body[field];
    });

    // Prevent demoting the last admin accidentally
    if (req.body.role && req.body.role !== "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1 && user.role === "admin") {
        return res.status(400).json({
          message: "Cannot demote the last admin account",
        });
      }
    }

    const updated = await user.save();
    return res.status(200).json(updated);

  } catch (err) {
    console.error("[updateUserByAdmin]", err);
    return res.status(500).json({ message: err.message });
  }
};

// ── DELETE /api/admin/users/:id ───────────────────────────────────────────
export const deleteUser = async (req, res) => {
  try {
    // Prevent deleting yourself
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findById(req.params.id);
    if (!user)
      return res.status(404).json({ message: "User not found" });

    // Prevent deleting the last admin
    if (user.role === "admin") {
      const adminCount = await User.countDocuments({ role: "admin" });
      if (adminCount <= 1) {
        return res.status(400).json({
          message: "Cannot delete the last admin account",
        });
      }
    }

    await User.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "User deleted successfully" });

  } catch (err) {
    console.error("[deleteUser]", err);
    return res.status(500).json({ message: err.message });
  }
};