// pages/admin/Orders.jsx

import { useState, useEffect }   from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag, RefreshCw, Clock, CheckCircle,
  XCircle, TrendingUp, Package, ChevronDown,
  MapPin, Phone, Mail, User, CreditCard,
  Calendar, Hash, Truck,
} from "lucide-react";
import { getAllOrders, updateOrderStatus } from "../../services/api";
import LoadingSpinner                      from "../../components/common/LoadingSpinner";
import toast                               from "react-hot-toast";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.12)",
  goldBorder: "rgba(212,178,106,0.2)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.4)",
  border:     "rgba(19,33,60,0.07)",
  surface:    "#ffffff",
  surfaceAlt: "rgba(19,33,60,0.025)",
  green:      "#22c55e",
  red:        "#ef4444",
};

const STATUS_CFG = {
  Pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",  icon: Clock        },
  Processing: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",  icon: Clock        },
  Confirmed:  { color: "#d4b26a", bg: "rgba(212,178,106,0.12)",icon: CheckCircle  },
  Shipped:    { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  icon: TrendingUp   },
  Delivered:  { color: "#22c55e", bg: "rgba(34,197,94,0.1)",   icon: CheckCircle  },
  Cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",   icon: XCircle      },
};

const STATUS_OPTIONS = [
  "Pending", "Processing", "Shipped", "Delivered", "Cancelled",
];

// ── Tiny helpers ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg = STATUS_CFG[status] ?? { color: C.textSub, bg: C.surfaceAlt };
  const Icon = cfg.icon ?? Clock;
  return (
    <span
      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
        text-[10px] font-black whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      <Icon size={9} />
      {status ?? "—"}
    </span>
  );
};

const InfoRow = ({ icon: Icon, label, value }) =>
  value ? (
    <div className="flex items-start gap-2 min-w-0">
      <Icon size={12} className="flex-shrink-0 mt-0.5"
        style={{ color: C.gold }} />
      <div className="min-w-0">
        <p className="text-[9px] font-black uppercase tracking-widest"
          style={{ color: C.textMuted }}>{label}</p>
        <p className="text-xs font-semibold break-all"
          style={{ color: C.text }}>{value}</p>
      </div>
    </div>
  ) : null;

// ══════════════════════════════════════════════════════════════════════════
// Expanded order detail panel
// ══════════════════════════════════════════════════════════════════════════
const OrderDetail = ({ order }) => {
  const addr = order.shippingAddress ?? {};
  const addressLine = [
    addr.street,
    addr.city,
    addr.state,
    addr.pincode,
    addr.country,
  ].filter(Boolean).join(", ");

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0  }}
      exit={{    opacity: 0, y: -6  }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className="px-4 sm:px-6 pb-6 pt-2"
      style={{ background: "rgba(19,33,60,0.018)" }}
    >
      {/* ── Top accent line ─────────────────────────────────────── */}
      <div className="h-px w-full mb-5"
        style={{
          background:
            "linear-gradient(to right,transparent,rgba(212,178,106,0.4),transparent)",
        }} />

      <div className="grid sm:grid-cols-3 gap-5">

        {/* ── Column 1: Customer & Contact ──────────────────────── */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: C.gold }}>
            Customer Details
          </p>

          <div className="space-y-3">
            <InfoRow icon={User}   label="Full Name"
              value={addr.fullName ?? order.user?.name} />
            <InfoRow icon={Mail}   label="Email"
              value={addr.email ?? order.user?.email} />
            <InfoRow icon={Phone}  label="Phone"
              value={addr.phone ?? order.user?.phone} />
            <InfoRow icon={MapPin} label="Shipping Address"
              value={addressLine || "—"} />
          </div>
        </div>

        {/* ── Column 2: Order Meta ───────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: C.gold }}>
            Order Info
          </p>

          <div className="space-y-3">
            <InfoRow icon={Hash}       label="Order ID"
              value={`#${order._id.slice(-10).toUpperCase()}`} />
            <InfoRow icon={CreditCard} label="Payment Method"
              value={order.paymentMethod} />
            <InfoRow icon={CreditCard} label="Payment Status"
              value={order.paymentStatus} />
            <InfoRow icon={Calendar}   label="Placed On"
              value={new Date(order.createdAt).toLocaleString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })} />
            {order.isDelivered && (
              <InfoRow icon={Truck} label="Delivered On"
                value={new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
                })} />
            )}
            {order.notes && (
              <InfoRow icon={Hash} label="Notes" value={order.notes} />
            )}
          </div>
        </div>

        {/* ── Column 3: Items ──────────────────────────────────────── */}
        <div className="space-y-4">
          <p className="text-[10px] font-black uppercase tracking-widest"
            style={{ color: C.gold }}>
            Items ({order.items?.length ?? 0})
          </p>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {(order.items ?? []).map((item, idx) => (
              <div key={item._id ?? idx}
                className="flex items-center gap-3 p-2.5 rounded-xl"
                style={{
                  background: C.surface,
                  border:     `1px solid ${C.border}`,
                }}
              >
                {/* Product image */}
                <img
                  src={item.image || "/placeholder.jpg"}
                  alt={item.name}
                  className="w-11 h-11 rounded-lg object-cover flex-shrink-0"
                  style={{ border: `1px solid ${C.border}` }}
                  onError={(e) => { e.target.src = "/placeholder.jpg"; }}
                />

                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate"
                    style={{ color: C.text }}>
                    {item.name}
                  </p>
                  <p className="text-[10px] mt-0.5"
                    style={{ color: C.textMuted }}>
                    ₹{item.price?.toFixed(0)} × {item.quantity}
                  </p>
                </div>

                <p className="text-xs font-black flex-shrink-0"
                  style={{ color: C.gold }}>
                  ₹{(item.price * item.quantity).toFixed(0)}
                </p>
              </div>
            ))}
          </div>

          {/* Price breakdown */}
          <div className="rounded-xl p-3 space-y-1.5 text-xs"
            style={{
              background: C.surface,
              border:     `1px solid ${C.border}`,
            }}
          >
            <div className="flex justify-between" style={{ color: C.textSub }}>
              <span>Subtotal</span>
              <span>₹{order.itemsPrice?.toFixed(0)}</span>
            </div>
            <div className="flex justify-between" style={{ color: C.textSub }}>
              <span>Shipping</span>
              <span style={{
                color:      order.shippingPrice === 0 ? C.green : C.textSub,
                fontWeight: order.shippingPrice === 0 ? 700 : 400,
              }}>
                {order.shippingPrice === 0 ? "FREE" : `₹${order.shippingPrice?.toFixed(0)}`}
              </span>
            </div>
            <div className="flex justify-between font-black text-sm pt-1.5"
              style={{ borderTop: `1px solid ${C.border}`, color: C.text }}>
              <span>Total</span>
              <span style={{
                background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
              }}>
                ₹{order.totalPrice?.toFixed(0)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Single order row  (manages its own expanded state)
// ══════════════════════════════════════════════════════════════════════════
const OrderRow = ({ order, index, onStatusChange, updating }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      {/* ── Main row ──────────────────────────────────────────────── */}
      <motion.tr
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.025 }}
        onClick={() => setExpanded((v) => !v)}
        className="cursor-pointer select-none"
        style={{ borderBottom: expanded ? "none" : `1px solid ${C.border}` }}
        onMouseEnter={(e) => {
          if (!expanded) e.currentTarget.style.background = C.surfaceAlt;
        }}
        onMouseLeave={(e) => {
          if (!expanded) e.currentTarget.style.background = "transparent";
        }}
      >
        {/* Expand chevron */}
        <td className="pl-4 pr-2 py-3.5 w-8">
          <motion.div
            animate={{ rotate: expanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={14} style={{ color: C.textMuted }} />
          </motion.div>
        </td>

        {/* Order ID */}
        <td className="px-3 sm:px-4 py-3.5">
          <span className="text-[11px] font-black font-mono"
            style={{ color: C.navyLight }}>
            #{order._id.slice(-8).toUpperCase()}
          </span>
        </td>

        {/* Customer */}
        <td className="px-3 sm:px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center
              text-white text-[10px] font-black flex-shrink-0"
              style={{
                background: `linear-gradient(135deg,${C.navyLight},${C.navy})`,
              }}>
              {(order.user?.name?.[0] ?? "?").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate max-w-[100px]"
                style={{ color: C.text }}>
                {order.user?.name || "—"}
              </p>
              <p className="text-[10px] truncate max-w-[100px]"
                style={{ color: C.textMuted }}>
                {order.shippingAddress?.email || order.user?.email || "—"}
              </p>
            </div>
          </div>
        </td>

        {/* Phone */}
        <td className="px-3 sm:px-4 py-3.5">
          <span className="text-[11px]" style={{ color: C.textSub }}>
            {order.shippingAddress?.phone || order.user?.phone || "—"}
          </span>
        </td>

        {/* Items count */}
        <td className="px-3 sm:px-4 py-3.5">
          <div className="flex items-center gap-1">
            <Package size={12} style={{ color: C.textMuted }} />
            <span className="text-xs font-semibold" style={{ color: C.textSub }}>
              {order.items?.length ?? 0}
            </span>
          </div>
        </td>

        {/* Total */}
        <td className="px-3 sm:px-4 py-3.5">
          <span className="text-sm font-black" style={{ color: C.text }}>
            ₹{(order.totalPrice ?? 0).toFixed(0)}
          </span>
        </td>

        {/* Payment status */}
        <td className="px-3 sm:px-4 py-3.5">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold
            whitespace-nowrap"
            style={{
              background: order.paymentStatus === "Paid"
                ? "rgba(34,197,94,0.1)" : "rgba(245,158,11,0.1)",
              color: order.paymentStatus === "Paid" ? C.green : "#f59e0b",
            }}>
            {order.paymentStatus ?? order.paymentMethod ?? "—"}
          </span>
        </td>

        {/* Order status */}
        <td className="px-3 sm:px-4 py-3.5">
          <StatusBadge status={order.orderStatus} />
        </td>

        {/* Date */}
        <td className="px-3 sm:px-4 py-3.5">
          <span className="text-[11px] whitespace-nowrap"
            style={{ color: C.textMuted }}>
            {new Date(order.createdAt).toLocaleDateString("en-IN", {
              month: "short", day: "numeric", year: "2-digit",
            })}
          </span>
        </td>

        {/* Status updater — stop propagation so the row click doesn't fire */}
        <td className="px-3 sm:px-4 py-3.5"
          onClick={(e) => e.stopPropagation()}>
          {updating === order._id ? (
            <RefreshCw size={14} className="animate-spin"
              style={{ color: C.gold }} />
          ) : (
            <select
              value={order.orderStatus ?? "Pending"}
              onChange={(e) => onStatusChange(order._id, e.target.value)}
              className="rounded-xl px-2.5 py-1.5 text-[11px] font-bold
                focus:outline-none cursor-pointer transition-all duration-150
                max-w-[120px]"
              style={{
                background: C.surfaceAlt,
                border:     `1px solid ${C.border}`,
                color:      C.text,
              }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e)  => (e.target.style.borderColor = C.border)}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </td>
      </motion.tr>

      {/* ── Expanded detail row ───────────────────────────────────── */}
      <AnimatePresence>
        {expanded && (
          <tr style={{ borderBottom: `1px solid ${C.border}` }}>
            {/* colSpan = all 10 columns (chevron + 9 data cols) */}
            <td colSpan={10} className="p-0">
              <OrderDetail order={order} />
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Main Orders page
// ══════════════════════════════════════════════════════════════════════════
const Orders = () => {
  const [orders,   setOrders  ] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [filter,   setFilter  ] = useState("All");
  const [updating, setUpdating] = useState(null);

  // ── Load ───────────────────────────────────────────────────────────────
  const load = () => {
    setLoading(true);
    getAllOrders()
      .then(({ data }) => {
        const raw = data;
        setOrders(
          Array.isArray(raw)         ? raw        :
          Array.isArray(raw?.orders) ? raw.orders :
          []
        );
      })
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // ── Update status ──────────────────────────────────────────────────────
  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id);
    try {
      await updateOrderStatus(id, { orderStatus: newStatus });
      setOrders((prev) =>
        prev.map((o) => o._id === id ? { ...o, orderStatus: newStatus } : o)
      );
      toast.success(`Order updated to "${newStatus}"`);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────
  const filtered = filter === "All"
    ? orders
    : orders.filter((o) => o.orderStatus === filter);

  const stats = STATUS_OPTIONS.map((s) => ({
    label: s,
    count: orders.filter((o) => o.orderStatus === s).length,
    cfg:   STATUS_CFG[s],
  }));

  // ── Revenue (delivered orders only) ───────────────────────────────────
  const totalRevenue = orders
    .filter((o) => o.orderStatus === "Delivered")
    .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

  if (loading) return <LoadingSpinner text="Loading orders…" />;

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black" style={{ color: C.text }}>
            Orders
            <span className="ml-2 text-sm font-semibold"
              style={{ color: C.textMuted }}>
              ({filtered.length})
            </span>
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
            Click any row to expand full order details
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Revenue chip */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
            rounded-xl text-xs font-bold"
            style={{
              background: "rgba(34,197,94,0.08)",
              border:     "1px solid rgba(34,197,94,0.2)",
              color:      C.green,
            }}>
            <span className="text-[10px]">₹</span>
            {totalRevenue.toFixed(0)} revenue
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            onClick={load}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              text-xs font-bold transition-all duration-150 flex-shrink-0"
            style={{
              background: C.surfaceAlt,
              border:     `1px solid ${C.border}`,
              color:      C.textSub,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = C.goldLight;
              e.currentTarget.style.color      = C.gold;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = C.surfaceAlt;
              e.currentTarget.style.color      = C.textSub;
            }}
          >
            <RefreshCw size={12} /> Refresh
          </motion.button>
        </div>
      </div>

      {/* ── Status summary chips ───────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {stats.map(({ label, count, cfg }) => (
          <button
            key={label}
            onClick={() => setFilter((f) => f === label ? "All" : label)}
            className="p-3 rounded-xl text-left transition-all duration-150"
            style={{
              background: filter === label ? cfg.bg    : C.surfaceAlt,
              border:     `1px solid ${filter === label ? `${cfg.color}40` : C.border}`,
            }}
          >
            <p className="text-lg sm:text-xl font-black"
              style={{ color: cfg.color }}>{count}</p>
            <p className="text-[9px] sm:text-[10px] font-semibold mt-0.5"
              style={{ color: C.textMuted }}>{label}</p>
          </button>
        ))}
      </div>

      {/* ── Filter tabs ────────────────────────────────────────────── */}
      <div className="flex gap-1.5 flex-wrap">
        {["All", ...STATUS_OPTIONS].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className="px-3 py-1.5 rounded-xl text-xs font-bold
              transition-all duration-150"
            style={
              filter === s
                ? { background: C.navy, color: "#fff" }
                : {
                    background: C.surfaceAlt,
                    border:     `1px solid ${C.border}`,
                    color:      C.textSub,
                  }
            }
          >
            {s}
          </button>
        ))}
      </div>

      {/* ── Expand hint banner ─────────────────────────────────────── */}
      {filtered.length > 0 && (
        <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: C.goldLight,
            border:     `1px solid ${C.goldBorder}`,
          }}>
          <ChevronDown size={12} style={{ color: C.gold }} />
          <p className="text-[11px] font-semibold" style={{ color: C.textSub }}>
            Click any row to expand customer details, address, items & pricing
          </p>
        </div>
      )}

      {/* ── Orders table ───────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border:     `1px solid ${C.border}`,
          boxShadow:  "0 2px 16px rgba(19,33,60,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {/* empty col for chevron */}
                <th className="pl-4 pr-2 py-3.5 w-8" />
                {[
                  "Order", "Customer", "Phone", "Items",
                  "Total", "Payment", "Status", "Date", "Update",
                ].map((h) => (
                  <th key={h}
                    className="px-3 sm:px-4 py-3.5 text-left text-[10px]
                      font-black uppercase tracking-widest whitespace-nowrap"
                    style={{ color: C.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-14">
                    <ShoppingBag size={28}
                      style={{ color: C.textMuted, margin: "0 auto 8px" }} />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      No orders found
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((order, i) => (
                  <OrderRow
                    key={order._id}
                    order={order}
                    index={i}
                    onStatusChange={handleStatusChange}
                    updating={updating}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div className="px-4 sm:px-5 py-3"
            style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-[11px]" style={{ color: C.textMuted }}>
              Showing {filtered.length} order{filtered.length !== 1 ? "s" : ""}
              {filter !== "All" && (
                <span> · filtered by <strong>{filter}</strong></span>
              )}
              {" "}· {orders.length} total
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders;