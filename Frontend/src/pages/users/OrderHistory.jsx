import { useState, useEffect }  from "react";
import { Link, useNavigate }    from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, ShoppingBag, ArrowRight,
  Clock, CheckCircle, Truck, XCircle,
  ChevronDown, ChevronUp, RefreshCw,
  Calendar, CreditCard, Hash,
} from "lucide-react";
import { getMyOrders }    from "../../services/api";
import LoadingSpinner     from "../../components/common/LoadingSpinner";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.10)",
  goldBorder: "rgba(212,178,106,0.22)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.38)",
  border:     "rgba(19,33,60,0.07)",
  surface:    "#ffffff",
  bg:         "#f4f5f8",
  green:      "#22c55e",
  red:        "#ef4444",
};

const STATUS_CONFIG = {
  Processing: {
    color:  "#1d4ed8",
    bg:     "rgba(59,130,246,0.08)",
    border: "rgba(59,130,246,0.2)",
    icon:   Clock,
  },
  Confirmed: {
    color:  "#92670a",
    bg:     "rgba(212,178,106,0.12)",
    border: "rgba(212,178,106,0.28)",
    icon:   CheckCircle,
  },
  Shipped: {
    color:  "#6d28d9",
    bg:     "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
    icon:   Truck,
  },
  Delivered: {
    color:  "#15803d",
    bg:     "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    icon:   CheckCircle,
  },
  Cancelled: {
    color:  "#b91c1c",
    bg:     "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    icon:   XCircle,
  },
};

const DEFAULT_STATUS = {
  color:  "#4f6080",
  bg:     "rgba(19,33,60,0.06)",
  border: "rgba(19,33,60,0.12)",
  icon:   Clock,
};

// ── Status Badge ───────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const cfg   = STATUS_CONFIG[status] ?? DEFAULT_STATUS;
  const Icon  = cfg.icon;
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px]
        font-bold px-2.5 py-1 rounded-full"
      style={{
        background: cfg.bg,
        color:      cfg.color,
        border:     `1px solid ${cfg.border}`,
      }}
    >
      <Icon size={10} strokeWidth={2.5} />
      {status}
    </span>
  );
};

// ── Order Card ─────────────────────────────────────────────────────────────
const OrderCard = ({ order, index }) => {
  const navigate   = useNavigate();
  const [open, setOpen] = useState(false);
  const items      = order.items ?? [];
  const totalQty   = items.reduce((s, i) => s + i.quantity, 0);
  const preview    = items.slice(0, 4);
  const extra      = items.length - 4;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="rounded-3xl overflow-hidden"
      style={{
        background: C.surface,
        border:     `1px solid ${C.border}`,
        boxShadow:  "0 2px 16px rgba(19,33,60,0.05)",
      }}
    >
      {/* Gold accent line */}
      <div
        className="h-[3px]"
        style={{
          background: "linear-gradient(to right,#d4b26a,transparent)",
        }}
      />

      {/* ── Header ────────────────────────────────────────────── */}
      <div className="p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-start
          justify-between gap-4">

          {/* Left: ID + date */}
          <div className="flex items-start gap-4">
            <div
              className="w-10 h-10 rounded-2xl flex items-center
                justify-center flex-shrink-0 mt-0.5"
              style={{
                background: C.goldLight,
                border:     `1px solid ${C.goldBorder}`,
              }}
            >
              <Package size={18} style={{ color: C.gold }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <span
                  className="font-mono text-xs font-bold"
                  style={{ color: C.textMuted }}
                >
                  #{order._id.slice(-10).toUpperCase()}
                </span>
                <StatusBadge status={order.orderStatus} />
              </div>
              <div className="flex items-center gap-1.5"
                style={{ color: C.textMuted }}>
                <Calendar size={11} />
                <span className="text-[11px]">
                  {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "long", year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Right: price + actions */}
          <div className="flex items-center gap-4 sm:flex-col
            sm:items-end flex-wrap">
            <p
              className="text-xl font-black"
              style={{
                background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
              }}
            >
              ₹{order.totalPrice?.toLocaleString("en-IN", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{   scale: 0.96 }}
                onClick={() => navigate(`/user/orders/${order._id}`)}
                className="flex items-center gap-1.5 px-3 py-1.5
                  rounded-xl text-xs font-bold text-white"
                style={{
                  background:
                    `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                }}
              >
                Details
                <ArrowRight size={12} strokeWidth={2.5} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{   scale: 0.96 }}
                onClick={() => setOpen((o) => !o)}
                className="w-7 h-7 rounded-xl flex items-center
                  justify-center transition-colors"
                style={{
                  background: C.bg,
                  border:     `1px solid ${C.border}`,
                  color:      C.textSub,
                }}
              >
                {open
                  ? <ChevronUp   size={13} />
                  : <ChevronDown size={13} />}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Product image strip */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-0.5">
          {preview.map((item, i) => (
            <div
              key={i}
              className="flex-shrink-0 relative"
              title={item.name}
            >
              <img
                src={item.image || "/placeholder.jpg"}
                alt={item.name}
                className="w-12 h-12 rounded-xl object-cover"
                style={{ border: `1.5px solid ${C.border}` }}
              />
              {item.quantity > 1 && (
                <span
                  className="absolute -top-1.5 -right-1.5 w-4 h-4
                    rounded-full text-[9px] font-black text-white
                    flex items-center justify-center"
                  style={{
                    background: C.navy,
                    border:     "1.5px solid #fff",
                  }}
                >
                  {item.quantity}
                </span>
              )}
            </div>
          ))}
          {extra > 0 && (
            <div
              className="flex-shrink-0 w-12 h-12 rounded-xl flex
                items-center justify-center text-xs font-bold"
              style={{
                background: C.bg,
                border:     `1.5px solid ${C.border}`,
                color:      C.textSub,
              }}
            >
              +{extra}
            </div>
          )}
          <div
            className="ml-auto flex-shrink-0 text-right"
            style={{ color: C.textMuted }}
          >
            <p className="text-[10px]">
              {totalQty} item{totalQty !== 1 ? "s" : ""}
            </p>
            <p
              className="text-[10px] font-semibold"
              style={{
                color: order.isPaid ? "#15803d" : "#b45309",
              }}
            >
              {order.isPaid ? "✓ Paid" : "⏳ Unpaid"}
            </p>
          </div>
        </div>
      </div>

      {/* ── Expandable item list ───────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0  }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{    height: 0, opacity: 0  }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="px-5 sm:px-6 pb-5 space-y-2"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <p
                className="text-[10px] font-black uppercase tracking-widest
                  pt-4 mb-3"
                style={{ color: C.textMuted }}
              >
                Items in this order
              </p>
              {items.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-2xl"
                  style={{ background: C.bg }}
                >
                  <img
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                    style={{ border: `1px solid ${C.border}` }}
                  />
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-sm font-semibold truncate"
                      style={{ color: C.text }}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs" style={{ color: C.textSub }}>
                      ₹{item.price?.toLocaleString("en-IN", {
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      })} × {item.quantity}
                    </p>
                  </div>
                  <p
                    className="text-sm font-black flex-shrink-0"
                    style={{ color: C.gold }}
                  >
                    ₹{(item.price * item.quantity).toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </p>
                </div>
              ))}

              {/* Mini summary */}
              <div
                className="flex items-center justify-between pt-3 mt-1"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <div className="flex items-center gap-2">
                  <CreditCard size={13} style={{ color: C.textMuted }} />
                  <span className="text-xs" style={{ color: C.textSub }}>
                    {order.paymentMethod}
                  </span>
                </div>
                <p
                  className="text-sm font-black"
                  style={{
                    background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor:  "transparent",
                    backgroundClip:       "text",
                  }}
                >
                  ₹{order.totalPrice?.toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 0,
                  })}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── OrderHistory ───────────────────────────────────────────────────────────
const OrderHistory = () => {
  const [orders,  setOrders ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getMyOrders()
      .then(({ data }) =>
        setOrders(Array.isArray(data) ? data : [])
      )
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner text="Loading your orders…" />;

  return (
    <div
      className="min-h-screen"
      style={{ background: C.bg }}
    >
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8
        py-8 sm:py-12">

        {/* ── Page header ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0   }}
          className="flex items-center justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center
                justify-center flex-shrink-0"
              style={{
                background: C.goldLight,
                border:     `1px solid ${C.goldBorder}`,
              }}
            >
              <Package size={20} style={{ color: C.gold }} />
            </div>
            <div>
              <h1
                className="text-2xl font-black"
                style={{ color: C.text }}
              >
                Order History
              </h1>
              <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
                {orders.length} order{orders.length !== 1 ? "s" : ""} placed
              </p>
            </div>
          </div>

          {/* Refresh */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{   scale: 0.94 }}
            onClick={load}
            className="w-9 h-9 rounded-xl flex items-center
              justify-center transition-colors"
            style={{
              background: C.surface,
              border:     `1px solid ${C.border}`,
              color:      C.textSub,
            }}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </motion.button>
        </motion.div>

        {/* ── Error ───────────────────────────────────────────── */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 rounded-3xl mb-6"
            style={{
              background: "rgba(239,68,68,0.05)",
              border:     "1px solid rgba(239,68,68,0.12)",
            }}
          >
            <XCircle
              size={32}
              className="mx-auto mb-3"
              style={{ color: C.red }}
            />
            <p
              className="text-sm font-semibold mb-4"
              style={{ color: "#b91c1c" }}
            >
              Failed to load orders
            </p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{   scale: 0.97 }}
              onClick={load}
              className="inline-flex items-center gap-2 px-4 py-2
                rounded-xl text-sm font-bold text-white"
              style={{
                background:
                  `linear-gradient(135deg,${C.navy},${C.navyLight})`,
              }}
            >
              <RefreshCw size={13} />
              Try Again
            </motion.button>
          </motion.div>
        )}

        {/* ── Empty ───────────────────────────────────────────── */}
        {!error && orders.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            className="text-center py-20"
          >
            <div
              className="w-20 h-20 rounded-3xl flex items-center
                justify-center mx-auto mb-5"
              style={{
                background: C.goldLight,
                border:     `1px solid ${C.goldBorder}`,
              }}
            >
              <Package size={34} style={{ color: C.gold }} />
            </div>
            <h3
              className="text-xl font-black mb-2"
              style={{ color: C.text }}
            >
              No orders yet
            </h3>
            <p
              className="text-sm mb-8 max-w-xs mx-auto"
              style={{ color: C.textSub }}
            >
              Your order history will appear here once you place an order.
            </p>
            <Link
              to="/user/products"
              className="inline-flex items-center gap-2 px-6 py-3
                rounded-2xl text-sm font-bold text-white"
              style={{
                background:
                  `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                boxShadow: "0 6px 20px rgba(19,33,60,0.25)",
              }}
            >
              <ShoppingBag size={15} />
              Start Shopping
            </Link>
          </motion.div>
        )}

        {/* ── Order list ──────────────────────────────────────── */}
        {!error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, i) => (
              <OrderCard key={order._id} order={order} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;