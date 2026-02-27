import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import {
  IndianRupee, ShoppingBag, TrendingUp,
  BarChart3, Award, RefreshCw, CreditCard,
  Clock,
} from "lucide-react";
import { getAllOrders }  from "../../services/api";
import LoadingSpinner   from "../../components/common/LoadingSpinner";

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
  orange:     "#f97316",
  purple:     "#8b5cf6",
};

const CAT_COLORS = {
  Crochet:        "#d4b26a",
  Embroidery:     "#8b5cf6",
  "Pipe Cleaner": "#22c55e",
  Woolen:         "#f97316",
  Other:          "#3b82f6",
};

// ✅ Indian Rupee formatter — no decimals
const fmtRupee = (n = 0) =>
  `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmt = (n = 0) => Number(n).toLocaleString("en-IN");

// ── Stat Card ──────────────────────────────────────────────────────────────
const StatCard = ({ icon: Icon, label, value, accent, delay, sub }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ delay }}
    className="rounded-2xl p-4 sm:p-5 relative overflow-hidden"
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 16px rgba(19,33,60,0.06)",
    }}
  >
    <div
      className="absolute top-0 left-0 right-0 h-[3px]"
      style={{ background: accent }}
    />
    <div className="flex items-start justify-between mt-1">
      <div className="min-w-0 flex-1 pr-2">
        <p
          className="text-[9px] sm:text-[10px] font-bold uppercase
            tracking-widest mb-1.5 sm:mb-2"
          style={{ color: C.textMuted }}
        >
          {label}
        </p>
        <p
          className="text-lg sm:text-2xl font-black truncate"
          style={{ color: C.text }}
        >
          {value}
        </p>
        {/* ✅ Optional sub-label e.g. "3 collected · 2 pending" */}
        {sub && (
          <p
            className="text-[10px] mt-1 truncate"
            style={{ color: C.textMuted }}
          >
            {sub}
          </p>
        )}
      </div>
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl
          flex items-center justify-center flex-shrink-0"
        style={{
          background: `${accent}18`,
          border:     `1px solid ${accent}30`,
        }}
      >
        <Icon size={17} style={{ color: accent }} strokeWidth={2} />
      </div>
    </div>
  </motion.div>
);

// ── Section card shell ─────────────────────────────────────────────────────
const SectionCard = ({
  icon: Icon, iconBg, iconBorder, iconColor, title, children,
}) => (
  <div
    className="rounded-2xl overflow-hidden"
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 12px rgba(19,33,60,0.05)",
    }}
  >
    <div
      className="flex items-center gap-3 px-4 sm:px-5 py-3 sm:py-4"
      style={{ borderBottom: `1px solid ${C.border}` }}
    >
      <div
        className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl
          flex items-center justify-center flex-shrink-0"
        style={{ background: iconBg, border: `1px solid ${iconBorder}` }}
      >
        <Icon size={14} style={{ color: iconColor }} />
      </div>
      <h3
        className="text-xs sm:text-sm font-black"
        style={{ color: C.text }}
      >
        {title}
      </h3>
    </div>
    <div className="p-3 sm:p-4">{children}</div>
  </div>
);

// ── Order row ──────────────────────────────────────────────────────────────
const OrderRow = ({ order, i }) => {
  // ✅ Determine payment state from all possible fields
  const isCollected =
    order.isPaid                    ||
    order.paymentStatus === "Paid"  ||
    order.orderStatus   === "Delivered";

  const isCOD = order.paymentMethod === "COD";

  return (
    <motion.div
      key={order._id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: i * 0.04 }}
      className="flex items-center justify-between
        p-2.5 sm:p-3 rounded-xl"
      style={{ background: C.surfaceAlt }}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Avatar */}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl
            flex items-center justify-center text-white
            text-xs font-black flex-shrink-0"
          style={{
            background:
              `linear-gradient(135deg,${C.navyLight},${C.navy})`,
          }}
        >
          {(order.user?.name?.[0] ?? "?").toUpperCase()}
        </div>

        <div className="min-w-0">
          <p
            className="text-xs font-bold truncate max-w-[110px]"
            style={{ color: C.text }}
          >
            {order.user?.name || "Guest"}
          </p>
          <p className="text-[10px]" style={{ color: C.textMuted }}>
            {new Date(order.paidAt || order.createdAt)
              .toLocaleDateString("en-IN", {
                month: "short", day: "numeric", year: "numeric",
              })}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Payment method */}
        <span
          className="hidden sm:inline-block text-[10px]
            font-semibold px-2 py-0.5 rounded-full"
          style={{
            background: C.goldLight,
            color:      C.gold,
            border:     `1px solid ${C.goldBorder}`,
          }}
        >
          {order.paymentMethod ?? "—"}
        </span>

        {/* ✅ Collected / Pending badge */}
        <span
          className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{
            background: isCollected
              ? "rgba(34,197,94,0.1)"
              : "rgba(245,158,11,0.1)",
            color: isCollected ? C.green : "#f59e0b",
          }}
        >
          {isCollected ? "Collected" : isCOD ? "COD Pending" : "Unpaid"}
        </span>

        <span
          className="text-xs sm:text-sm font-black"
          style={{ color: C.green }}
        >
          +{fmtRupee(order.totalPrice ?? 0)}
        </span>
      </div>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
const Sales = () => {
  const [orders,  setOrders ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    getAllOrders()
      .then(({ data }) => {
        const raw = data;
        setOrders(
          Array.isArray(raw)         ? raw        :
          Array.isArray(raw?.orders) ? raw.orders :
          []
        );
      })
      .catch((err) => {
        console.error("Sales load error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner text="Loading sales data…" />;

  if (error) return (
    <div className="text-center py-20">
      <p className="text-sm font-semibold mb-4" style={{ color: C.red }}>
        Failed to load sales data.
      </p>
      <button
        onClick={load}
        className="px-4 py-2 rounded-xl text-sm font-bold text-white"
        style={{
          background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
        }}
      >
        Try Again
      </button>
    </div>
  );

  // ── Derived data ─────────────────────────────────────────────────────────

  // ✅ EXCLUDE cancelled orders from all revenue calculations
  const activeOrders = orders.filter(
    (o) => o.orderStatus !== "Cancelled"
  );

  // ✅ "Collected" = actually paid (Online paid OR COD Delivered)
  const collected = activeOrders.filter(
    (o) =>
      o.isPaid                     ||
      o.paymentStatus === "Paid"   ||
      o.orderStatus   === "Delivered"
  );

  // ✅ "Pending" = COD orders not yet delivered
  const pending = activeOrders.filter(
    (o) =>
      !o.isPaid                    &&
      o.paymentStatus !== "Paid"   &&
      o.orderStatus   !== "Delivered"
  );

  // ✅ Revenue = ALL active orders (confirmed + processing + shipped + delivered)
  //    This is "expected revenue" — what the business will earn
  const totalRevenue    = activeOrders.reduce(
    (s, o) => s + (o.totalPrice ?? 0), 0
  );
  const collectedAmount = collected.reduce(
    (s, o) => s + (o.totalPrice ?? 0), 0
  );
  const pendingAmount   = pending.reduce(
    (s, o) => s + (o.totalPrice ?? 0), 0
  );

  // ✅ Avg order value across ALL active orders
  const avgOrder = activeOrders.length > 0
    ? totalRevenue / activeOrders.length
    : 0;

  // ✅ Category revenue from order.items (schema field)
  const catRevenue = {};
  activeOrders.forEach((o) => {
    const items = o.items ?? [];
    items.forEach((item) => {
      const cat =
        item.product?.category ??
        item.category           ??
        "Other";
      catRevenue[cat] =
        (catRevenue[cat] || 0) +
        (item.price ?? 0) * (item.quantity ?? 1);
    });
  });
  const catTotal  = Object.values(catRevenue).reduce((s, v) => s + v, 0);
  const catSorted = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]);

  // ✅ Top products from order.items
  const topMap = {};
  activeOrders.forEach((o) => {
    const items = o.items ?? [];
    items.forEach((item) => {
      const name = item.name ?? "Unknown";
      if (!topMap[name]) topMap[name] = { qty: 0, revenue: 0 };
      topMap[name].qty     += item.quantity ?? 1;
      topMap[name].revenue +=
        (item.price ?? 0) * (item.quantity ?? 1);
    });
  });
  const topList = Object.entries(topMap)
    .map(([name, v]) => ({ name, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // ✅ Recent orders to show — ALL active, sorted newest first
  const recentOrders = [...activeOrders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 6);

  return (
    <div className="space-y-5 sm:space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center
        justify-between gap-3">
        <div>
          <h2
            className="text-lg sm:text-xl font-black"
            style={{ color: C.text }}
          >
            Sales Overview
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
            Revenue and performance metrics
            {orders.length > 0 && (
              <span style={{ color: C.textMuted }}>
                {" "}· {orders.length} orders total
              </span>
            )}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{   scale: 0.96 }}
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
          <RefreshCw size={12} />
          Refresh
        </motion.button>
      </div>

      {/* ── Stat Cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">

        {/* ✅ Total Revenue = all active orders */}
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={fmtRupee(totalRevenue)}
          accent={C.green}
          delay={0}
          sub={`${fmtRupee(collectedAmount)} collected`}
        />

        {/* ✅ Active Orders (non-cancelled) */}
        <StatCard
          icon={ShoppingBag}
          label="Active Orders"
          value={fmt(activeOrders.length)}
          accent={C.navyLight}
          delay={0.07}
          sub={`${collected.length} collected · ${pending.length} pending`}
        />

        {/* Total Orders including cancelled */}
        <StatCard
          icon={BarChart3}
          label="Total Orders"
          value={fmt(orders.length)}
          accent={C.gold}
          delay={0.14}
          sub={`${orders.filter(o => o.orderStatus === "Cancelled").length} cancelled`}
        />

        {/* ✅ Avg order value */}
        <StatCard
          icon={TrendingUp}
          label="Avg Order Value"
          value={fmtRupee(avgOrder)}
          accent={C.purple}
          delay={0.21}
          sub={`across ${activeOrders.length} orders`}
        />
      </div>

      {/* ── Pending COD alert ───────────────────────────────────────── */}
      {pendingAmount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0  }}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl"
          style={{
            background: "rgba(245,158,11,0.08)",
            border:     "1px solid rgba(245,158,11,0.2)",
          }}
        >
          <Clock size={15} style={{ color: "#f59e0b", flexShrink: 0 }} />
          <p className="text-xs font-semibold" style={{ color: "#92400e" }}>
            <span className="font-black">{fmtRupee(pendingAmount)}</span>
            {" "}pending collection from{" "}
            <span className="font-black">{pending.length}</span>
            {" "}COD order{pending.length !== 1 ? "s" : ""} awaiting delivery
          </p>
        </motion.div>
      )}

      {/* ── Top Products + Category Revenue ────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Top Products */}
        <SectionCard
          icon={Award}
          iconBg={C.goldLight}
          iconBorder={C.goldBorder}
          iconColor={C.gold}
          title="Top Products by Revenue"
        >
          <div className="space-y-2">
            {topList.length === 0 ? (
              <p
                className="text-center py-8 text-sm"
                style={{ color: C.textMuted }}
              >
                No sales data yet
              </p>
            ) : (
              topList.map((p, i) => (
                <motion.div
                  key={p.name}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ delay: i * 0.06 }}
                  className="flex items-center justify-between
                    p-2.5 sm:p-3 rounded-xl"
                  style={{ background: C.surfaceAlt }}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg
                        sm:rounded-xl flex items-center justify-center
                        text-[10px] sm:text-xs font-black flex-shrink-0"
                      style={{
                        background: i === 0 ? C.goldLight  : C.surfaceAlt,
                        color:      i === 0 ? C.gold       : C.textMuted,
                        border:     `1px solid ${
                          i === 0 ? C.goldBorder : C.border
                        }`,
                      }}
                    >
                      {i + 1}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-xs font-bold truncate
                          max-w-[120px] sm:max-w-[150px]"
                        style={{ color: C.text }}
                      >
                        {p.name}
                      </p>
                      <p
                        className="text-[10px]"
                        style={{ color: C.textMuted }}
                      >
                        {p.qty} unit{p.qty !== 1 ? "s" : ""} sold
                      </p>
                    </div>
                  </div>
                  <p
                    className="text-xs sm:text-sm font-black
                      flex-shrink-0 ml-2"
                    style={{ color: C.text }}
                  >
                    {fmtRupee(p.revenue)}
                  </p>
                </motion.div>
              ))
            )}
          </div>
        </SectionCard>

        {/* Category Revenue */}
        <SectionCard
          icon={BarChart3}
          iconBg="rgba(38,70,112,0.08)"
          iconBorder="rgba(38,70,112,0.15)"
          iconColor={C.navyLight}
          title="Revenue by Category"
        >
          <div className="space-y-3 sm:space-y-3.5">
            {catSorted.length === 0 ? (
              <p
                className="text-center py-8 text-sm"
                style={{ color: C.textMuted }}
              >
                No data yet
              </p>
            ) : (
              catSorted.map(([cat, rev], i) => {
                const pct   = catTotal > 0
                  ? Math.round((rev / catTotal) * 100)
                  : 0;
                const color = CAT_COLORS[cat] ?? C.navyLight;
                return (
                  <motion.div
                    key={cat}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.06 }}
                  >
                    <div className="flex justify-between text-xs
                      font-semibold mb-1.5">
                      <span style={{ color: C.textSub }}>{cat}</span>
                      <span style={{ color: C.text }}>
                        {fmtRupee(rev)}
                        <span style={{ color: C.textMuted }}>
                          {" "}({pct}%)
                        </span>
                      </span>
                    </div>
                    <div
                      className="h-2 rounded-full overflow-hidden"
                      style={{ background: "rgba(19,33,60,0.06)" }}
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{
                          duration: 0.7,
                          ease:     "easeOut",
                          delay:    i * 0.06,
                        }}
                        className="h-full rounded-full"
                        style={{ background: color }}
                      />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>

          {catSorted.length > 0 && (
            <div
              className="flex flex-wrap gap-2 mt-4 pt-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              {catSorted.map(([cat]) => (
                <div
                  key={cat}
                  className="flex items-center gap-1.5
                    text-[10px] font-semibold"
                  style={{ color: C.textSub }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: CAT_COLORS[cat] ?? C.navyLight,
                    }}
                  />
                  {cat}
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>

      {/* ── Recent Orders ───────────────────────────────────────────── */}
      <SectionCard
        icon={CreditCard}
        iconBg="rgba(34,197,94,0.1)"
        iconBorder="rgba(34,197,94,0.2)"
        iconColor={C.green}
        title="Recent Orders"
      >
        <div className="space-y-2">
          {recentOrders.length === 0 ? (
            <p
              className="text-center py-8 text-sm"
              style={{ color: C.textMuted }}
            >
              No orders yet
            </p>
          ) : (
            recentOrders.map((order, i) => (
              <OrderRow key={order._id} order={order} i={i} />
            ))
          )}

          {activeOrders.length > 6 && (
            <p
              className="text-center text-[11px] pt-1"
              style={{ color: C.textMuted }}
            >
              Showing 6 of {activeOrders.length} orders
            </p>
          )}
        </div>
      </SectionCard>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      {orders.length === 0 && (
        <div
          className="text-center py-12 rounded-2xl"
          style={{
            background: C.surfaceAlt,
            border:     `1px solid ${C.border}`,
          }}
        >
          <ShoppingBag
            size={30}
            className="mx-auto mb-3"
            style={{ color: C.textMuted }}
          />
          <p className="text-sm font-semibold" style={{ color: C.textSub }}>
            No orders yet — sales data will appear here once orders come in.
          </p>
        </div>
      )}
    </div>
  );
};

export default Sales;