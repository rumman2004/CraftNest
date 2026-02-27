import { useState, useEffect }           from "react";
import { useParams, useNavigate, Link }  from "react-router-dom";
import { motion, AnimatePresence }       from "framer-motion";
import {
  ArrowLeft, Package, MapPin, CreditCard,
  CheckCircle, Clock, Truck, XCircle,
  ShoppingBag, ChevronRight, Home,
  Hash, Calendar, Phone, Mail,
  Banknote, BadgeCheck, Hourglass,
  AlertCircle, Tag, ReceiptText,
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
  greenLight: "rgba(34,197,94,0.09)",
  red:        "#ef4444",
  redLight:   "rgba(239,68,68,0.08)",
};

// ── Status config ──────────────────────────────────────────────────────────
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
    desc:   "Your order is on the way!",
  },
  Delivered: {
    color:  "#15803d",
    bg:     "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
    icon:   CheckCircle,
    step:   4,
    desc:   "Delivered! Enjoy your order.",
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

// ── Helpers ────────────────────────────────────────────────────────────────
const fmt = (n) =>
  (n ?? 0).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

// ── Card shell ─────────────────────────────────────────────────────────────
const Card = ({ children, className = "", accent = false }) => (
  <div
    className={`relative rounded-2xl sm:rounded-3xl overflow-hidden
      ${className}`}
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 14px rgba(19,33,60,0.05)",
    }}
  >
    {accent && (
      <div className="h-[3px]"
        style={{
          background: "linear-gradient(to right,#d4b26a,#264670)",
        }} />
    )}
    <div className="p-4 sm:p-5 lg:p-6">{children}</div>
  </div>
);

// ── Section title ──────────────────────────────────────────────────────────
const SectionTitle = ({ icon: Icon, title, accent = C.gold }) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className="w-8 h-8 rounded-xl flex items-center justify-center
      flex-shrink-0"
      style={{
        background: `${accent}18`,
        border:     `1px solid ${accent}30`,
      }}>
      <Icon size={14} style={{ color: accent }} />
    </div>
    <h3 className="font-black text-sm" style={{ color: C.text }}>
      {title}
    </h3>
  </div>
);

// ── Info row ───────────────────────────────────────────────────────────────
const InfoRow = ({ label, value, mono = false, valueColor, last = false }) => (
  <div
    className="flex items-center justify-between py-2.5 gap-3"
    style={{ borderBottom: last ? "none" : `1px solid ${C.border}` }}
  >
    <span className="text-xs flex-shrink-0" style={{ color: C.textSub }}>
      {label}
    </span>
    <span
      className={`text-xs font-bold text-right ${mono ? "font-mono" : ""}`}
      style={{ color: valueColor ?? C.text }}
    >
      {value}
    </span>
  </div>
);

// ── Progress tracker ───────────────────────────────────────────────────────
const ProgressTracker = ({ currentStep }) => (
  <Card accent>
    <p className="text-[10px] font-black uppercase tracking-widest mb-5"
      style={{ color: C.textMuted }}>
      Order Progress
    </p>

    {/* Desktop/tablet — horizontal */}
    <div className="hidden sm:flex items-start justify-between">
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
                  duration: 1.6,
                  repeat:   isActive ? Infinity : 0,
                  ease:     "easeInOut",
                }}
                className="w-10 h-10 rounded-full flex items-center
                  justify-center"
                style={
                  isCompleted ? {
                    background: C.green,
                    color:      "#fff",
                    boxShadow:  "0 2px 10px rgba(34,197,94,0.3)",
                  } : isActive ? {
                    background:
                      `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                    color:     "#fff",
                    boxShadow: "0 4px 14px rgba(19,33,60,0.28)",
                  } : {
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
                <div className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "rgba(19,33,60,0.06)" }}>
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

    {/* Mobile — vertical timeline */}
    <div className="sm:hidden space-y-0">
      {STEPS.map((s, idx) => {
        const Icon        = s.icon;
        const isCompleted = currentStep > s.step;
        const isActive    = currentStep === s.step;
        const isLast      = idx === STEPS.length - 1;
        return (
          <div key={s.label} className="flex items-start gap-3">
            {/* Icon + line */}
            <div className="flex flex-col items-center flex-shrink-0">
              <motion.div
                animate={{ scale: isActive ? [1, 1.1, 1] : 1 }}
                transition={{
                  duration: 1.6,
                  repeat:   isActive ? Infinity : 0,
                }}
                className="w-8 h-8 rounded-full flex items-center
                  justify-center"
                style={
                  isCompleted ? {
                    background: C.green,
                    color:      "#fff",
                  } : isActive ? {
                    background:
                      `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                    color: "#fff",
                  } : {
                    background: "rgba(19,33,60,0.06)",
                    color:      C.textMuted,
                  }
                }
              >
                <Icon size={14} strokeWidth={2} />
              </motion.div>
              {!isLast && (
                <div className="w-0.5 flex-1 mt-1 mb-1 rounded-full
                  overflow-hidden" style={{ height: 28,
                    background: "rgba(19,33,60,0.06)" }}>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{
                      height: currentStep > s.step ? "100%" : "0%",
                    }}
                    transition={{ duration: 0.5, delay: idx * 0.1 }}
                    className="w-full rounded-full"
                    style={{ background: C.gold }}
                  />
                </div>
              )}
            </div>
            {/* Label */}
            <p className="text-xs font-semibold pt-1.5 pb-4"
              style={{
                color: isCompleted ? C.green
                  : isActive       ? C.navy
                  : C.textMuted,
              }}>
              {s.label}
              {isActive && (
                <span className="ml-2 text-[10px] font-black px-1.5 py-0.5
                  rounded-full"
                  style={{
                    background: `${C.navy}15`,
                    color:      C.navy,
                  }}>
                  Current
                </span>
              )}
            </p>
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

  // Payment icon + colour helper
  const isPaid    = order.paymentStatus === "Paid"   || order.isPaid;
  const isFailed  = order.paymentStatus === "Failed";
  const payIcon   = isPaid ? BadgeCheck : isFailed ? AlertCircle : Hourglass;
  const payColor  = isPaid ? "#15803d"  : isFailed ? C.red       : "#b45309";
  const PayIcon   = payIcon;

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8
        py-5 sm:py-8 lg:py-12">

        {/* ── Top nav ───────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0   }}
          className="flex items-center justify-between mb-5 sm:mb-8
            gap-3 flex-wrap"
        >
          <motion.button
            whileHover={{ scale: 1.04 }}
            whileTap={{   scale: 0.96 }}
            onClick={() => navigate("/user/orders")}
            className="flex items-center gap-2 text-sm font-semibold
              transition-colors"
            style={{ color: C.textSub }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
          >
            <ArrowLeft size={16} />
            <span>All Orders</span>
          </motion.button>

          {/* Breadcrumb — hidden on small phones */}
          <nav className="hidden sm:flex items-center gap-1.5 text-xs
            font-semibold" style={{ color: C.textMuted }}>
            <Link to="/user/home"
              className="flex items-center gap-1 transition-colors"
              style={{ color: C.textSub }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
            >
              <Home size={11} /> Home
            </Link>
            <ChevronRight size={11} style={{ color: C.textMuted }} />
            <Link to="/user/orders"
              className="transition-colors"
              style={{ color: C.textSub }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
            >
              Orders
            </Link>
            <ChevronRight size={11} style={{ color: C.textMuted }} />
            <span className="font-bold truncate max-w-[100px]"
              style={{ color: C.text }}>
              #{order._id.slice(-8).toUpperCase()}
            </span>
          </nav>
        </motion.div>

        {/* ── Page title ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          className="mb-5"
        >
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-black"
            style={{ color: C.text }}>
            Order Details
          </h1>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1.5">
            <div className="flex items-center gap-1"
              style={{ color: C.textMuted }}>
              <Hash size={11} />
              <span className="text-[11px] font-mono font-semibold">
                {order._id.slice(-12).toUpperCase()}
              </span>
            </div>
            <span style={{ color: C.textMuted }} className="text-xs">·</span>
            <div className="flex items-center gap-1"
              style={{ color: C.textMuted }}>
              <Calendar size={11} />
              <span className="text-[11px]">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric",
                })}
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Status banner ─────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.07 }}
          className="flex items-center gap-3 sm:gap-4 p-3.5 sm:p-5
            rounded-2xl sm:rounded-3xl mb-5"
          style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
        >
          {/* Status icon */}
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl
            flex items-center justify-center flex-shrink-0"
            style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
            <StatusIcon size={20} style={{ color: cfg.color }} />
          </div>

          {/* Label + desc */}
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm sm:text-base leading-none"
              style={{ color: cfg.color }}>
              {order.orderStatus}
            </p>
            <p className="text-xs mt-0.5 truncate"
              style={{ color: C.textSub }}>
              {cfg.desc}
            </p>
          </div>

          {/* Total — always visible, smaller on mobile */}
          <div className="flex flex-col items-end flex-shrink-0">
            <p className="text-base sm:text-xl font-black"
              style={{
                background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
              }}>
              ₹{fmt(order.totalPrice)}
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
              exit={{    opacity: 0        }}
              transition={{ delay: 0.1 }}
              className="mb-5"
            >
              <ProgressTracker currentStep={cfg.step} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Main grid ─────────────────────────────────────────── */}
        <div className="grid md:grid-cols-5 gap-4 sm:gap-5">

          {/* ── Left / wider — items ────────────────────────────── */}
          <div className="md:col-span-3 space-y-4 sm:space-y-5">
            <Card>
              <SectionTitle
                icon={ShoppingBag}
                title={`Order Items (${items.length})`}
              />

              <div className="space-y-2">
                {items.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0   }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 p-2.5 sm:p-3
                      rounded-xl sm:rounded-2xl"
                    style={{ background: C.bg }}
                  >
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl
                        sm:rounded-2xl object-cover flex-shrink-0"
                      style={{ border: `1px solid ${C.border}` }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-xs sm:text-sm truncate"
                        style={{ color: C.text }}>
                        {item.name}
                      </p>
                      <p className="text-[11px] mt-0.5"
                        style={{ color: C.textSub }}>
                        ₹{fmt(item.price)} × {item.quantity}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm font-black flex-shrink-0"
                      style={{ color: C.gold }}>
                      ₹{fmt(item.price * item.quantity)}
                    </p>
                  </motion.div>
                ))}
              </div>

              {/* Price breakdown */}
              <div className="mt-4 pt-3 space-y-0"
                style={{ borderTop: `1px solid ${C.border}` }}>
                <InfoRow
                  label="Subtotal"
                  value={`₹${fmt(order.itemsPrice)}`}
                />
                <InfoRow
                  label="Shipping"
                  value={
                    order.shippingPrice === 0
                      ? "FREE"
                      : `₹${fmt(order.shippingPrice)}`
                  }
                  valueColor={
                    order.shippingPrice === 0 ? "#15803d" : C.text
                  }
                />
                <div className="flex items-center justify-between pt-3"
                  style={{ borderTop: `1px solid ${C.border}` }}>
                  <span className="text-sm font-black"
                    style={{ color: C.text }}>
                    Total
                  </span>
                  <span className="text-base font-black"
                    style={{
                      background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor:  "transparent",
                      backgroundClip:       "text",
                    }}>
                    ₹{fmt(order.totalPrice)}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ── Right / narrower — details ───────────────────────── */}
          <div className="md:col-span-2 space-y-4 sm:space-y-5">

            {/* Shipping address */}
            <Card>
              <SectionTitle icon={MapPin} title="Shipping Address" />
              <div className="rounded-xl p-3"
                style={{ background: C.bg }}>
                <p className="font-black text-sm mb-2"
                  style={{ color: C.text }}>
                  {order.shippingAddress?.fullName}
                </p>

                <div className="space-y-1.5 text-xs"
                  style={{ color: C.textSub }}>
                  <div className="flex items-start gap-1.5">
                    <MapPin size={11} className="mt-0.5 flex-shrink-0"
                      style={{ color: C.textMuted }} />
                    <span className="leading-snug">
                      {[
                        order.shippingAddress?.street,
                        order.shippingAddress?.city,
                        order.shippingAddress?.state,
                        order.shippingAddress?.pincode
                          ? `– ${order.shippingAddress.pincode}` : null,
                        order.shippingAddress?.country,
                      ].filter(Boolean).join(", ")}
                    </span>
                  </div>

                  {order.shippingAddress?.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone size={11} style={{ color: C.textMuted }} />
                      <span className="font-semibold"
                        style={{ color: C.text }}>
                        {order.shippingAddress.phone}
                      </span>
                    </div>
                  )}

                  {order.shippingAddress?.email && (
                    <div className="flex items-center gap-1.5">
                      <Mail size={11} style={{ color: C.textMuted }} />
                      <span className="truncate"
                        style={{ color: C.text }}>
                        {order.shippingAddress.email}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Card>

            {/* Payment */}
            <Card>
              <SectionTitle icon={CreditCard} title="Payment" />

              {/* Method chip */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl mb-3"
                style={{ background: C.bg }}>
                <div className="w-8 h-8 rounded-lg flex items-center
                  justify-center flex-shrink-0"
                  style={{
                    background: C.goldLight,
                    border:     `1px solid ${C.goldBorder}`,
                  }}>
                  <Banknote size={14} style={{ color: C.gold }} />
                </div>
                <div>
                  <p className="text-xs font-black"
                    style={{ color: C.text }}>
                    {order.paymentMethod}
                  </p>
                  <p className="text-[10px]" style={{ color: C.textSub }}>
                    Payment method
                  </p>
                </div>
              </div>

              {/* Status chip */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl"
                style={{
                  background: isPaid
                    ? "rgba(34,197,94,0.08)"
                    : isFailed
                    ? C.redLight
                    : "rgba(180,83,9,0.07)",
                  border: `1px solid ${
                    isPaid   ? "rgba(34,197,94,0.2)"
                    : isFailed ? "rgba(239,68,68,0.2)"
                    : "rgba(180,83,9,0.18)"
                  }`,
                }}>
                <PayIcon size={15} style={{ color: payColor }}
                  className="flex-shrink-0" />
                <div>
                  <p className="text-xs font-black"
                    style={{ color: payColor }}>
                    {isPaid   ? "Payment Received"
                     : isFailed ? "Payment Failed"
                     : "Payment Pending"}
                  </p>
                  {order.isPaid && order.paidAt && (
                    <p className="text-[10px]" style={{ color: C.textSub }}>
                      {new Date(order.paidAt).toLocaleDateString("en-IN")}
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery status */}
              <div className="mt-3 flex items-center gap-2.5 p-3 rounded-xl"
                style={{
                  background: order.isDelivered
                    ? "rgba(34,197,94,0.08)"
                    : "rgba(19,33,60,0.03)",
                  border: `1px solid ${
                    order.isDelivered
                      ? "rgba(34,197,94,0.2)"
                      : C.border
                  }`,
                }}>
                <Truck size={14}
                  style={{
                    color: order.isDelivered ? C.green : C.textMuted,
                    flexShrink: 0,
                  }} />
                <p className="text-xs font-bold"
                  style={{
                    color: order.isDelivered ? "#15803d" : C.textSub,
                  }}>
                  {order.isDelivered ? "Delivered" : "Not yet delivered"}
                </p>
              </div>
            </Card>

            {/* Order info */}
            <Card>
              <SectionTitle icon={ReceiptText} title="Order Info" />
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
                    { day: "numeric", month: "short", year: "numeric" },
                  )}
                />
                <InfoRow
                  label="Total Items"
                  value={`${totalQty} item${totalQty !== 1 ? "s" : ""}`}
                />
                <InfoRow
                  label="Order Value"
                  value={`₹${fmt(order.totalPrice)}`}
                  valueColor={C.gold}
                  last
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
          className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 pt-5 sm:pt-6"
          style={{ borderTop: `1px solid ${C.border}` }}
        >
          <Link
            to="/user/orders"
            className="flex-1 flex items-center justify-center gap-2
              py-3 sm:py-3.5 rounded-2xl text-sm font-bold
              transition-all duration-150"
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
            <ArrowLeft size={15} /> All Orders
          </Link>

          <Link
            to="/shop"
            className="flex-1 flex items-center justify-center gap-2
              py-3 sm:py-3.5 rounded-2xl text-sm font-bold text-white
              transition-all duration-200"
            style={{
              background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
              boxShadow:  "0 6px 20px rgba(19,33,60,0.22)",
            }}
          >
            <ShoppingBag size={15} /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default OrderDetail;