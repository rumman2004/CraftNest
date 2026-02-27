import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import {
  TrendingUp, Users, Package,
  ShoppingBag, IndianRupee, RefreshCw,
  PieChart, Activity,
} from "lucide-react";
import { getDashboardStats, getAllOrders } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";

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

const STATUS_COLORS = {
  Processing: "#3b82f6",
  Confirmed:  "#d4b26a",
  Shipped:    "#8b5cf6",
  Delivered:  "#22c55e",
  Cancelled:  "#ef4444",
};

const CAT_COLORS = {
  Crochet:        "#d4b26a",
  Embroidery:     "#8b5cf6",
  "Pipe Cleaner": "#22c55e",
  Woolen:         "#f97316",
  Other:          "#3b82f6",
};

const fmtRupee = (n = 0) =>
  `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

// ── KPI Card ───────────────────────────────────────────────────────────────
const KpiCard = ({ icon: Icon, label, value, accent, delay }) => (
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
          className="text-xl sm:text-2xl font-black truncate"
          style={{ color: C.text }}
        >
          {value}
        </p>
      </div>
      <div
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl
          flex items-center justify-center flex-shrink-0"
        style={{
          background: `${accent}18`,
          border:     `1px solid ${accent}30`,
        }}
      >
        <Icon size={16} style={{ color: accent }} strokeWidth={2} />
      </div>
    </div>
  </motion.div>
);

// ── Bar Row ────────────────────────────────────────────────────────────────
const BarRow = ({ label, value, max, color, sub }) => {
  const pct = max > 0 ? (value / max) * 100 : 0;
  return (
    <div>
      <div className="flex justify-between text-xs font-semibold mb-1.5">
        <span style={{ color: C.textSub }}>{label}</span>
        <span style={{ color: C.text }}>
          {sub}
          <span style={{ color: C.textMuted }}>
            {" "}({pct.toFixed(0)}%)
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
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
};

// ── Analysis Card shell ────────────────────────────────────────────────────
const AnalysisCard = ({
  title, icon: Icon, accent = C.navyLight, children,
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
        style={{
          background: `${accent}18`,
          border:     `1px solid ${accent}30`,
        }}
      >
        <Icon size={14} style={{ color: accent }} />
      </div>
      <h3
        className="text-xs sm:text-sm font-black"
        style={{ color: C.text }}
      >
        {title}
      </h3>
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
const Analysis = () => {
  const [stats,   setStats  ] = useState(null);
  const [orders,  setOrders ] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(false);

  const load = () => {
    setLoading(true);
    setError(false);
    Promise.all([getDashboardStats(), getAllOrders()])
      .then(([s, o]) => {
        setStats(s.data);
        const raw = o.data;
        setOrders(
          Array.isArray(raw)         ? raw          :
          Array.isArray(raw?.orders) ? raw.orders   :
          []
        );
      })
      .catch((err) => {
        console.error("Analysis load error:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner text="Loading analysis…" />;

  if (error) return (
    <div className="text-center py-20">
      <p
        className="text-sm font-semibold mb-4"
        style={{ color: C.red }}
      >
        Failed to load analysis data.
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

  // ── Derived metrics ──────────────────────────────────────────────────────

  const statusCount = orders.reduce((acc, o) => {
    const key = o.orderStatus ?? "Unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const catRevenue = {};
  orders.forEach((o) => {
    const items = o.items ?? [];
    items.forEach((item) => {
      const cat =
        item.product?.category ??
        item.category           ??
        "Other";
      catRevenue[cat] =
        (catRevenue[cat] || 0) + (item.price ?? 0) * (item.quantity ?? 1);
    });
  });

  const catTotal  = Object.values(catRevenue).reduce((s, v) => s + v, 0);
  const catSorted = Object.entries(catRevenue).sort((a, b) => b[1] - a[1]);
  const maxStatus = Math.max(...Object.values(statusCount), 1);

  // ✅ CALCULATE REVENUE FROM ORDERS IF STATS API ISN'T RETURNING IT
  const localRevenueCalc = orders
    .filter((o) => o.isPaid || o.paymentStatus === "Paid" || o.orderStatus === "Delivered")
    .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

  // Safely grab totalRevenue or totalSales from the API, otherwise fallback to local localRevenueCalc
  const safeRevenue = 
    stats?.totalRevenue || 
    stats?.totalSales || 
    localRevenueCalc;

  const avgItems =
    orders.length > 0
      ? (
          orders.reduce((s, o) => s + (o.items?.length ?? 0), 0) /
          orders.length
        ).toFixed(1)
      : "—";

  const deliveryRate =
    orders.length > 0
      ? `${Math.round(
          ((statusCount.Delivered ?? 0) / orders.length) * 100
        )}%`
      : "—";

  const cancelRate =
    orders.length > 0
      ? `${Math.round(
          ((statusCount.Cancelled ?? 0) / orders.length) * 100
        )}%`
      : "—";

  const processingRate =
    orders.length > 0
      ? `${Math.round(
          ((statusCount.Processing ?? 0) / orders.length) * 100
        )}%`
      : "—";

  const kpis = [
    {
      icon:   Users,
      label:  "Total Users",
      value:  stats?.totalUsers    ?? 0,
      accent: C.navyLight,
      delay:  0,
    },
    {
      icon:   Package,
      label:  "Products",
      value:  stats?.totalProducts ?? 0,
      accent: C.gold,
      delay:  0.07,
    },
    {
      icon:   ShoppingBag,
      label:  "Total Orders",
      value:  stats?.totalOrders   ?? orders.length,
      accent: "#8b5cf6",
      delay:  0.14,
    },
    {
      icon:   IndianRupee,
      label:  "Total Revenue",
      // ✅ Now uses the foolproof `safeRevenue` variable
      value:  fmtRupee(safeRevenue),
      accent: C.green,
      delay:  0.21,
    },
  ];

  const conversionMetrics = [
    { label: "Delivery Rate",    value: deliveryRate,    color: C.green      },
    { label: "Cancellation Rate",value: cancelRate,      color: C.red        },
    { label: "Avg Items / Order",value: avgItems,        color: C.navyLight  },
    { label: "Processing Rate",  value: processingRate,  color: "#f59e0b"    },
  ];

  return (
    <div
      className="space-y-5 sm:space-y-6 max-w-7xl mx-auto
        px-0 sm:px-0"
    >
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h2
            className="text-lg sm:text-xl font-black"
            style={{ color: C.text }}
          >
            Business Analysis
          </h2>
          <p
            className="text-xs mt-0.5"
            style={{ color: C.textSub }}
          >
            In-depth performance breakdown
            {orders.length > 0 && (
              <span style={{ color: C.textMuted }}>
                {" "}· {orders.length} orders
              </span>
            )}
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{  scale: 0.96  }}
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

      {/* ── KPI Grid ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {kpis.map((k) => (
          <KpiCard key={k.label} {...k} />
        ))}
      </div>

      {/* ── Status + Category ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5">

        {/* Order status breakdown */}
        <AnalysisCard
          title="Order Status Breakdown"
          icon={Activity}
          accent={C.navyLight}
        >
          <div className="space-y-3 sm:space-y-3.5">
            {Object.keys(statusCount).length === 0 ? (
              <p
                className="text-center py-6 text-sm"
                style={{ color: C.textMuted }}
              >
                No order data yet
              </p>
            ) : (
              Object.entries(statusCount)
                .sort((a, b) => b[1] - a[1])
                .map(([status, count]) => (
                  <BarRow
                    key={status}
                    label={status}
                    value={count}
                    max={maxStatus}
                    color={STATUS_COLORS[status] ?? C.textSub}
                    sub={count}
                  />
                ))
            )}
          </div>

          {/* Legend */}
          {Object.keys(statusCount).length > 0 && (
            <div
              className="flex flex-wrap gap-2 sm:gap-3 mt-4 pt-4"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              {Object.keys(statusCount).map((status) => (
                <div
                  key={status}
                  className="flex items-center gap-1.5
                    text-[10px] font-semibold"
                  style={{ color: C.textSub }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{
                      background: STATUS_COLORS[status] ?? C.textSub,
                    }}
                  />
                  {status}
                </div>
              ))}
            </div>
          )}
        </AnalysisCard>

        {/* Revenue by category */}
        <AnalysisCard
          title="Revenue by Category"
          icon={PieChart}
          accent={C.gold}
        >
          <div className="space-y-3 sm:space-y-3.5">
            {catSorted.length === 0 ? (
              <p
                className="text-center py-6 text-sm"
                style={{ color: C.textMuted }}
              >
                No revenue data yet
              </p>
            ) : (
              catSorted.map(([cat, rev]) => (
                <BarRow
                  key={cat}
                  label={cat}
                  value={rev}
                  max={catTotal}
                  color={CAT_COLORS[cat] ?? C.navyLight}
                  sub={fmtRupee(rev)}
                />
              ))
            )}
          </div>

          {catSorted.length > 0 && (
            <div
              className="flex flex-wrap gap-2 sm:gap-3 mt-4 pt-4"
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
        </AnalysisCard>
      </div>

      {/* ── Conversion Metrics ─────────────────────────────────────── */}
      <AnalysisCard
        title="Conversion Metrics"
        icon={TrendingUp}
        accent={C.green}
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {conversionMetrics.map((m) => (
            <div
              key={m.label}
              className="p-3 sm:p-4 rounded-xl text-center"
              style={{ background: C.surfaceAlt }}
            >
              <p
                className="text-xl sm:text-2xl font-black"
                style={{ color: m.color }}
              >
                {m.value}
              </p>
              <p
                className="text-[10px] font-semibold mt-1 leading-tight"
                style={{ color: C.textMuted }}
              >
                {m.label}
              </p>
            </div>
          ))}
        </div>
      </AnalysisCard>

      {/* ── Empty state if zero orders ──────────────────────────────── */}
      {orders.length === 0 && !loading && (
        <div
          className="text-center py-10 rounded-2xl"
          style={{
            background: C.surfaceAlt,
            border:     `1px solid ${C.border}`,
          }}
        >
          <ShoppingBag
            size={32}
            className="mx-auto mb-3"
            style={{ color: C.textMuted }}
          />
          <p
            className="text-sm font-semibold"
            style={{ color: C.textSub }}
          >
            No orders yet — stats will appear once orders are placed.
          </p>
        </div>
      )}
    </div>
  );
};

export default Analysis;