import { useState, useEffect }           from "react";
import { useParams, useNavigate, Link }  from "react-router-dom";
import { motion, AnimatePresence }       from "framer-motion";
import {
  ArrowLeft, Package, MapPin, CreditCard,
  CheckCircle, Clock, Truck, XCircle,
  ShoppingBag, ChevronRight, Home,
  Hash, Calendar, Phone,
} from "lucide-react";
import { getOrderById } from "../../services/api";
import LoadingSpinner   from "../../components/common/LoadingSpinner";
import toast            from "react-hot-toast";

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
    step:   1,
    desc:   "We're preparing your handmade items!",
  },
  Confirmed: {
    color:  "#92670a",
    bg:     "rgba(212,178,106,0.12)",
    border: "rgba(212,178,106,0.28)",
    icon:   CheckCircle,
    step:   2,
    desc:   "Your order has been confirmed.",
  },
  Shipped: {
    color:  "#6d28d9",
    bg:     "rgba(139,92,246,0.08)",
    border: "rgba(139,92,246,0.2)",
    icon:   Truck,
    step:   3,
    desc:   "Your order is on the way! 🚚",
  },
  Delivered: {
    color:  "#15803d",
    bg:     "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    icon:   CheckCircle,
    step:   4,
    desc:   "Delivered! Enjoy your order 💝",
  },
  Cancelled: {
    color:  "#b91c1c",
    bg:     "rgba(239,68,68,0.08)",
    border: "rgba(239,68,68,0.2)",
    icon:   XCircle,
    step:   0,
    desc:   "This order has been cancelled.",
  },
};

const STEPS = [
  { label: "Placed",    icon: CheckCircle, step: 1 },
  { label: "Confirmed", icon: Package,     step: 2 },
  { label: "Shipped",   icon: Truck,       step: 3 },
  { label: "Delivered", icon: CheckCircle, step: 4 },
];

// ── Reusable card shell ────────────────────────────────────────────────────
const Card = ({ children, className = "", accent = false }) => (
  <div
    className={`relative rounded-3xl overflow-hidden ${className}`}
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 16px rgba(19,33,60,0.05)",
    }}
  >
    {accent && (
      <div
        className="h-[3px]"
        style={{
          background: "linear-gradient(to right,#d4b26a,#264670)",
        }}
      />
    )}
    <div className="p-5 sm:p-6">{children}</div>
  </div>
);

const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2.5 mb-5">
    <div
      className="w-8 h-8 rounded-xl flex items-center justify-center
        flex-shrink-0"
      style={{
        background: C.goldLight,
        border:     `1px solid ${C.goldBorder}`,
      }}
    >
      <Icon size={14} style={{ color: C.gold }} />
    </div>
    <h3 className="font-black text-sm" style={{ color: C.text }}>
      {title}
    </h3>
  </div>
);

const InfoRow = ({ label, value, mono = false, valueColor }) => (
  <div
    className="flex items-center justify-between py-2.5"
    style={{ borderBottom: `1px solid ${C.border}` }}
  >
    <span className="text-xs" style={{ color: C.textSub }}>
      {label}
    </span>
    <span
      className={`text-xs font-bold ${mono ? "font-mono" : ""}`}
      style={{ color: valueColor ?? C.text }}
    >
      {value}
    </span>
  </div>
);

// ── Progress tracker ───────────────────────────────────────────────────────
const ProgressTracker = ({ currentStep }) => (
  <Card accent>
    <p
      className="text-[10px] font-black uppercase tracking-widest mb-6"
      style={{ color: C.textMuted }}
    >
      Order Progress
    </p>
    <div className="flex items-start justify-between">
      {STEPS.map((s, idx) => {
        const Icon        = s.icon;
        const isCompleted = currentStep > s.step;
        const isActive    = currentStep === s.step;
        return (
          <div key={s.label} className="flex items-center flex-1">
            <div className="flex flex-col items-center flex-shrink-0">
              <motion.div
                animate={{ scale: isActive ? [1, 1.12, 1] : 1 }}
                transition={{
                  duration: 1.6, repeat: isActive ? Infinity : 0,
                  ease: "easeInOut",
                }}
                className="w-10 h-10 rounded-full flex items-center
                  justify-center shadow-md"
                style={
                  isCompleted
                    ? { background: C.green,   color: "#fff" }
                    : isActive
                    ? {
                        background:
                          `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                        color:     "#fff",
                        boxShadow: "0 4px 14px rgba(19,33,60,0.3)",
                      }
                    : {
                        background: "rgba(19,33,60,0.06)",
                        color:      C.textMuted,
                      }
                }
              >
                <Icon size={16} strokeWidth={2} />
              </motion.div>
              <span
                className="text-[10px] mt-2 font-semibold text-center
                  max-w-[56px] leading-tight"
                style={{
                  color: isCompleted ? C.green
                    : isActive       ? C.navy
                    : C.textMuted,
                }}
              >
                {s.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div className="flex-1 mx-2 mb-5">
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(19,33,60,0.06)" }}
                >
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{
                      width: currentStep > s.step ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.7, delay: idx * 0.12 }}
                    className="h-full rounded-full"
                    style={{
                      background:
                        `linear-gradient(to right,${C.gold},${C.navyLight})`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </Card>
);

// ══════════════════════════════════════════════════════════════════════════
const OrderDetail = () => {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const [order,   setOrder  ] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderById(id)
      .then(({ data }) => setOrder(data))
      .catch(() => {
        toast.error("Order not found");
        navigate("/user/orders");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <LoadingSpinner text="Loading order details…" />;
  if (!order)  return null;

  const cfg         = STATUS_CONFIG[order.orderStatus] ?? STATUS_CONFIG.Processing;
  const StatusIcon  = cfg.icon;
  const isCancelled = order.orderStatus === "Cancelled";
  const items       = order.items ?? [];
  const totalQty    = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8
        py-8 sm:py-12">

        {/* ── Top nav ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0   }}
          className="flex items-center justify-between mb-8 flex-wrap gap-3"
        >
          {/* Back */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{   scale: 0.95 }}
            onClick={() => navigate("/user/orders")}
            className="flex items-center gap-2 text-sm font-semibold
              transition-colors"
            style={{ color: C.textSub }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = C.gold)
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.color = C.textSub)
            }
          >
            <ArrowLeft size={16} />
            All Orders
          </motion.button>

          {/* Breadcrumb */}
          <nav
            className="hidden sm:flex items-center gap-1.5 text-xs
              font-semibold"
            style={{ color: C.textMuted }}
          >
            <Link
              to="/user/home"
              className="flex items-center gap-1 transition-colors
                hover:underline"
              style={{ color: C.textSub }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = C.gold)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = C.textSub)
              }
            >
              <Home size={11} />
              Home
            </Link>
            <ChevronRight size={11} style={{ color: C.textMuted }} />
            <Link
              to="/user/orders"
              className="transition-colors hover:underline"
              style={{ color: C.textSub }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = C.gold)
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = C.textSub)
              }
            >
              Orders
            </Link>
            <ChevronRight size={11} style={{ color: C.textMuted }} />
            <span
              className="font-bold truncate max-w-[120px]"
              style={{ color: C.text }}
            >
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </nav>
        </motion.div>

        {/* ── Page title ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          className="mb-6"
        >
          <h1
            className="text-2xl sm:text-3xl font-black"
            style={{ color: C.text }}
          >
            Order Details
          </h1>
          <div
            className="flex items-center gap-2 mt-1"
            style={{ color: C.textMuted }}
          >
            <Hash size={12} />
            <span className="text-xs font-mono font-semibold">
              {order._id.slice(-12).toUpperCase()}
            </span>
            <span className="text-xs">·</span>
            <Calendar size={11} />
            <span className="text-xs">
              {new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "long", year: "numeric",
              })}
            </span>
          </div>
        </motion.div>

        {/* ── Status banner ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.08 }}
          className="flex items-center gap-4 p-4 sm:p-5 rounded-3xl mb-6"
          style={{
            background: cfg.bg,
            border:     `1px solid ${cfg.border}`,
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center
              justify-center flex-shrink-0"
            style={{
              background: cfg.bg,
              border:     `1px solid ${cfg.border}`,
            }}
          >
            <StatusIcon size={22} style={{ color: cfg.color }} />
          </div>
          <div className="flex-1">
            <p
              className="font-black text-base leading-none"
              style={{ color: cfg.color }}
            >
              {order.orderStatus}
            </p>
            <p className="text-xs mt-1" style={{ color: C.textSub }}>
              {cfg.desc}
            </p>
          </div>
          <div
            className="hidden sm:flex flex-col items-end flex-shrink-0"
          >
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
            <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
              {totalQty} item{totalQty !== 1 ? "s" : ""}
            </p>
          </div>
        </motion.div>

        {/* ── Progress tracker ──────────────────────────────────── */}
        <AnimatePresence>
          {!isCancelled && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0         }}
              transition={{ delay: 0.12 }}
              className="mb-6"
            >
              <ProgressTracker currentStep={cfg.step} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="grid md:grid-cols-5 gap-5">

          {/* Left col — items (wider) */}
          <div className="md:col-span-3 space-y-5">

            <Card>
              <SectionTitle
                icon={ShoppingBag}
                title={`Order Items (${items.length})`}
              />
              <div className="space-y-2.5">
                {items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0   }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: C.bg }}
                  >
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-14 h-14 rounded-2xl object-cover
                        flex-shrink-0"
                      style={{ border: `1px solid ${C.border}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p
                        className="font-semibold text-sm truncate"
                        style={{ color: C.text }}
                      >
                        {item.name}
                      </p>
                      <p
                        className="text-xs mt-0.5"
                        style={{ color: C.textSub }}
                      >
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
                  </motion.div>
                ))}
              </div>

              {/* Price summary */}
              <div
                className="mt-5 pt-4 space-y-1"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <div className="flex justify-between py-1.5">
                  <span className="text-xs" style={{ color: C.textSub }}>
                    Subtotal
                  </span>
                  <span className="text-xs font-semibold"
                    style={{ color: C.text }}>
                    ₹{order.itemsPrice?.toLocaleString("en-IN", {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-xs" style={{ color: C.textSub }}>
                    Shipping
                  </span>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: order.shippingPrice === 0
                        ? "#15803d"
                        : C.text,
                    }}
                  >
                    {order.shippingPrice === 0
                      ? "FREE"
                      : `₹${order.shippingPrice?.toLocaleString("en-IN", {
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                        })}`}
                  </span>
                </div>
                <div
                  className="flex justify-between pt-3"
                  style={{ borderTop: `1px solid ${C.border}` }}
                >
                  <span
                    className="text-sm font-black"
                    style={{ color: C.text }}
                  >
                    Total
                  </span>
                  <span
                    className="text-base font-black"
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
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* Right col — details */}
          <div className="md:col-span-2 space-y-5">

            {/* Shipping */}
            <Card>
              <SectionTitle icon={MapPin} title="Shipping Address" />
              <div
                className="text-sm space-y-2"
                style={{ color: C.textSub }}
              >
                <p
                  className="font-black text-base"
                  style={{ color: C.text }}
                >
                  {order.shippingAddress?.fullName}
                </p>
                <p className="leading-relaxed text-xs">
                  {order.shippingAddress?.street}
                  {order.shippingAddress?.city &&
                    `, ${order.shippingAddress.city}`}
                  {order.shippingAddress?.state &&
                    `, ${order.shippingAddress.state}`}
                  {order.shippingAddress?.pincode &&
                    ` — ${order.shippingAddress.pincode}`}
                  {order.shippingAddress?.country &&
                    `, ${order.shippingAddress.country}`}
                </p>
                {order.shippingAddress?.phone && (
                  <div className="flex items-center gap-1.5 pt-1">
                    <Phone size={11} style={{ color: C.textMuted }} />
                    <span
                      className="text-xs font-semibold"
                      style={{ color: C.text }}
                    >
                      {order.shippingAddress.phone}
                    </span>
                  </div>
                )}
              </div>
            </Card>

            {/* Payment */}
            <Card>
              <SectionTitle icon={CreditCard} title="Payment" />
              <div className="divide-y"
                style={{ "--tw-divide-opacity": 1 }}>
                <InfoRow
                  label="Method"
                  value={order.paymentMethod}
                />
                <InfoRow
                  label="Status"
                  value={
                    order.paymentStatus === "Paid"    ? "✅ Paid"
                    : order.paymentStatus === "Failed"  ? "❌ Failed"
                    : order.paymentStatus === "Pending" ? "⏳ Pending"
                    : order.isPaid                      ? "✅ Paid"
                    : "⏳ Pending"
                  }
                  valueColor={
                    (order.paymentStatus === "Paid" || order.isPaid)
                      ? "#15803d"
                      : order.paymentStatus === "Failed"
                      ? C.red
                      : "#b45309"
                  }
                />
                {order.isPaid && order.paidAt && (
                  <InfoRow
                    label="Paid At"
                    value={new Date(order.paidAt).toLocaleDateString("en-IN")}
                  />
                )}
                <InfoRow
                  label="Delivery"
                  value={order.isDelivered ? "✅ Delivered" : "⏳ Pending"}
                  valueColor={order.isDelivered ? "#15803d" : "#b45309"}
                />
              </div>
            </Card>

            {/* Order info */}
            <Card>
              <p
                className="text-[10px] font-black uppercase tracking-widest
                  mb-4"
                style={{ color: C.textMuted }}
              >
                Order Info
              </p>
              <div>
                <InfoRow
                  label="Order ID"
                  value={`#${order._id.slice(-10).toUpperCase()}`}
                  mono
                />
                <InfoRow
                  label="Placed On"
                  value={new Date(order.createdAt).toLocaleDateString(
                    "en-IN",
                    { day: "numeric", month: "short", year: "numeric" }
                  )}
                />
                <InfoRow
                  label="Total Items"
                  value={`${totalQty} item${totalQty !== 1 ? "s" : ""}`}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* ── Footer actions ────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-3 mt-8 pt-6"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <Link
            to="/user/orders"
            className="flex-1 flex items-center justify-center gap-2
              py-3.5 rounded-2xl text-sm font-bold transition-all duration-150"
            style={{
              background: C.surface,
              border:     `1px solid ${C.border}`,
              color:      C.textSub,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = C.goldBorder;
              e.currentTarget.style.color       = C.gold;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color       = C.textSub;
            }}
          >
            <ArrowLeft size={15} />
            All Orders
          </Link>
          <Link
            to="/user/products"
            className="flex-1 flex items-center justify-center gap-2
              py-3.5 rounded-2xl text-sm font-bold text-white
              transition-all duration-200"
            style={{
              background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
              boxShadow:  "0 6px 20px rgba(19,33,60,0.25)",
            }}
          >
            <ShoppingBag size={15} />
            Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetail;