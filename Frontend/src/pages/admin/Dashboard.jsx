// pages/admin/Dashboard.jsx

import { useState, useEffect }  from "react";
import { motion }               from "framer-motion";
import { Link }                 from "react-router-dom";
import {
  Users, Package, ShoppingBag, IndianRupee,
  TrendingUp, AlertTriangle, Clock, ArrowRight,
  CheckCircle, RefreshCw, BarChart3,
} from "lucide-react";
import { getDashboardStats }    from "../../services/api";
import LoadingSpinner           from "../../components/common/LoadingSpinner";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyMid:    "#1a2d4a",
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
  blue:       "#3b82f6",
  purple:     "#8b5cf6",
};

// ── Status config ──────────────────────────────────────────────────────────
const STATUS = {
  Pending:    { color: "#f59e0b", bg: "rgba(245,158,11,0.1)",   icon: Clock        },
  Processing: { color: "#3b82f6", bg: "rgba(59,130,246,0.1)",   icon: RefreshCw    },
  Confirmed:  { color: "#d4b26a", bg: "rgba(212,178,106,0.12)", icon: CheckCircle  },
  Shipped:    { color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",   icon: TrendingUp   },
  Delivered:  { color: "#22c55e", bg: "rgba(34,197,94,0.1)",    icon: CheckCircle  },
  Cancelled:  { color: "#ef4444", bg: "rgba(239,68,68,0.1)",    icon: AlertTriangle},
};

// ── Formatters ─────────────────────────────────────────────────────────────
const fmt    = (n = 0) => Number(n).toLocaleString("en-IN");

// Always show ₹ — never dollars
const fmtINR = (n = 0) =>
  `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const fmtDate = (d) =>
  new Date(d).toLocaleDateString("en-IN", {
    month: "short",
    day:   "numeric",
  });

// ── Month abbreviations for the chart ─────────────────────────────────────
const MONTH_ABBR = [
  "Jan","Feb","Mar","Apr","May","Jun",
  "Jul","Aug","Sep","Oct","Nov","Dec",
];

// ═══════════════════════════════════════════════════════════════════════════
// Stat Card
// ═══════════════════════════════════════════════════════════════════════════
const StatCard = ({ icon: Icon, label, value, sub, accent, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ delay, duration: 0.35, ease: "easeOut" }}
    className="relative rounded-2xl p-5 overflow-hidden"
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 16px rgba(19,33,60,0.06)",
    }}
  >
    <div className="absolute top-0 left-0 right-0 h-[3px]"
      style={{ background: accent }} />

    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: C.textMuted }}>
          {label}
        </p>
        <p className="text-2xl font-black tracking-tight"
          style={{ color: C.text }}>
          {value}
        </p>
        {sub && (
          <p className="text-[11px] font-medium mt-1" style={{ color: C.textSub }}>
            {sub}
          </p>
        )}
      </div>
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <Icon size={20} style={{ color: accent }} strokeWidth={2} />
      </div>
    </div>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Status Badge — reads orderStatus
// ═══════════════════════════════════════════════════════════════════════════
const StatusBadge = ({ status }) => {
  const cfg = STATUS[status] ?? { color: C.textSub, bg: C.surfaceAlt, icon: Clock };
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
        text-[10px] font-bold whitespace-nowrap"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {status ?? "—"}
    </span>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Card wrappers
// ═══════════════════════════════════════════════════════════════════════════
const Card = ({ children, className = "" }) => (
  <div
    className={`rounded-2xl overflow-hidden ${className}`}
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 16px rgba(19,33,60,0.05)",
    }}
  >
    {children}
  </div>
);

const CardHeader = ({ title, linkTo, linkLabel = "View All" }) => (
  <div className="flex items-center justify-between px-5 py-4"
    style={{ borderBottom: `1px solid ${C.border}` }}>
    <h3 className="text-sm font-black tracking-tight" style={{ color: C.text }}>
      {title}
    </h3>
    {linkTo && (
      <Link
        to={linkTo}
        className="flex items-center gap-1 text-[11px] font-bold
          transition-colors duration-150"
        style={{ color: C.gold }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
      >
        {linkLabel} <ArrowRight size={11} strokeWidth={2.5} />
      </Link>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Orders-by-status progress bars
// ═══════════════════════════════════════════════════════════════════════════
const StatusBar = ({ ordersByStatus = [], totalOrders = 0 }) => (
  <div className="space-y-2.5">
    {ordersByStatus.map(({ _id: status, count }) => {
      const cfg = STATUS[status] ?? { color: C.textSub };
      const pct = totalOrders > 0 ? (count / totalOrders) * 100 : 0;
      return (
        <div key={status}>
          <div className="flex justify-between text-[11px] font-semibold mb-1">
            <span style={{ color: C.textSub }}>{status}</span>
            <span style={{ color: C.text }}>
              {count}
              <span style={{ color: C.textMuted }}> · {pct.toFixed(0)}%</span>
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden"
            style={{ background: "rgba(19,33,60,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="h-full rounded-full"
              style={{ background: cfg.color }}
            />
          </div>
        </div>
      );
    })}
    {ordersByStatus.length === 0 && (
      <p className="text-xs text-center py-4" style={{ color: C.textMuted }}>
        No order data yet
      </p>
    )}
  </div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Monthly revenue bar chart
// ═══════════════════════════════════════════════════════════════════════════
const RevenueChart = ({ monthlyRevenue = [] }) => {
  const max = Math.max(...monthlyRevenue.map((m) => m.revenue ?? 0), 1);

  // Pad to 12 months so empty months show as ghost bars
  const data = Array.from({ length: 12 }, (_, i) => {
    const found = monthlyRevenue.find((m) => (m._id ?? m.month) === i + 1);
    return {
      month:   MONTH_ABBR[i],
      revenue: found?.revenue ?? 0,
    };
  });

  return (
    <div className="flex items-end gap-1 h-28">
      {data.map((m, i) => {
        const pct     = (m.revenue / max) * 100;
        const isEmpty = m.revenue === 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            {/* Hover tooltip */}
            <div
              className="hidden group-hover:block absolute bottom-full mb-1
                text-[10px] font-bold rounded-lg px-2 py-1 z-10 whitespace-nowrap
                pointer-events-none"
              style={{ background: C.navy, color: "#fff" }}
            >
              {m.month}: {fmtINR(m.revenue)}
            </div>

            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${isEmpty ? 3 : Math.max(pct, 5)}%` }}
              transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
              className="w-full rounded-t-md"
              style={{
                background: isEmpty
                  ? "rgba(19,33,60,0.06)"
                  : `linear-gradient(to top,${C.navyLight},${C.gold})`,
                minHeight: "3px",
              }}
            />
            <span className="text-[8px] font-semibold" style={{ color: C.textMuted }}>
              {m.month.slice(0, 3)}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Dashboard
// ═══════════════════════════════════════════════════════════════════════════
const Dashboard = () => {
  const [stats,   setStats  ] = useState({
    totalUsers:       0,
    totalProducts:    0,
    totalOrders:      0,
    totalRevenue:     0,
    recentOrders:     [],
    lowStockProducts: [],
    ordersByStatus:   [],
    monthlyRevenue:   [],
  });
  const [loading, setLoading] = useState(true);
  const [error,   setError  ] = useState(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getDashboardStats()
      .then(({ data }) => setStats(data))
      .catch((err) => setError(err.message ?? "Failed to load dashboard"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  if (loading) return <LoadingSpinner text="Loading dashboard…" />;

  if (error) return (
    <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
      <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
        style={{ background: "rgba(239,68,68,0.1)" }}>
        <AlertTriangle size={26} style={{ color: C.red }} />
      </div>
      <p className="text-sm font-semibold" style={{ color: C.textSub }}>{error}</p>
      <button onClick={load}
        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm
          font-bold"
        style={{ background: C.navy, color: "#fff" }}>
        <RefreshCw size={14} /> Retry
      </button>
    </div>
  );

  const statCards = [
    {
      icon:   Users,
      label:  "Total Users",
      value:  fmt(stats.totalUsers),
      sub:    "Registered accounts",
      accent: C.navyLight,
      delay:  0,
    },
    {
      icon:   Package,
      label:  "Products",
      value:  fmt(stats.totalProducts),
      sub:    "Active listings",
      accent: C.gold,
      delay:  0.08,
    },
    {
      icon:   ShoppingBag,
      label:  "Total Orders",
      value:  fmt(stats.totalOrders),
      sub:    "All time",
      accent: C.purple,
      delay:  0.16,
    },
    {
      icon:   IndianRupee,       // ← was DollarSign
      label:  "Revenue",
      value:  fmtINR(stats.totalRevenue),   // ← ₹ not $
      sub:    "From delivered orders",
      accent: C.green,
      delay:  0.24,
    },
  ];

  // Year-to-date revenue from monthlyRevenue array
  const ytdRevenue = (stats.monthlyRevenue ?? []).reduce(
    (s, m) => s + (m.revenue ?? 0), 0
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{ color: C.text }}>
            Dashboard
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
            Overview of your store performance
          </p>
        </div>

        <button onClick={load}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl
            text-xs font-bold transition-all duration-150"
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
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <StatCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Recent orders + low stock ──────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Recent Orders */}
        <Card>
          <CardHeader title="Recent Orders" linkTo="/admin/orders" />
          <div className="p-4 space-y-2">
            {stats.recentOrders.length === 0 ? (
              <div className="text-center py-10">
                <ShoppingBag size={32}
                  style={{ color: C.textMuted, margin: "0 auto 8px" }} />
                <p className="text-xs" style={{ color: C.textMuted }}>
                  No orders yet
                </p>
              </div>
            ) : (
              stats.recentOrders.map((order, i) => (
                <motion.div
                  key={order._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0  }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center justify-between p-3
                    rounded-xl transition-all duration-150"
                  style={{ background: C.surfaceAlt }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(19,33,60,0.05)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = C.surfaceAlt)
                  }
                >
                  {/* Left — avatar + name + id */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-xl flex items-center
                        justify-center text-white text-xs font-black flex-shrink-0"
                      style={{
                        background: "linear-gradient(135deg,#264670,#13213c)",
                      }}
                    >
                      {(order.user?.name?.[0] ?? "?").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold truncate"
                        style={{ color: C.text }}>
                        {order.user?.name || "Guest"}
                      </p>
                      <p className="text-[10px] font-medium"
                        style={{ color: C.textMuted }}>
                        #{order._id.slice(-6).toUpperCase()}
                        {order.createdAt && <> · {fmtDate(order.createdAt)}</>}
                      </p>
                    </div>
                  </div>

                  {/* Right — price + status */}
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="text-xs font-black mb-0.5"
                      style={{ color: C.text }}>
                      {fmtINR(order.totalPrice)}   {/* ← ₹ */}
                    </p>
                    {/* ✅ orderStatus — not status */}
                    <StatusBadge status={order.orderStatus} />
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </Card>

        {/* Low Stock */}
        <Card>
          <CardHeader title="Low Stock Alert" linkTo="/admin/products"
            linkLabel="Manage" />
          <div className="p-4">
            {stats.lowStockProducts.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-2xl flex items-center
                  justify-center mx-auto mb-3"
                  style={{ background: "rgba(34,197,94,0.1)" }}>
                  <CheckCircle size={22} style={{ color: C.green }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: C.textSub }}>
                  All products are well stocked!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {stats.lowStockProducts.map((p, i) => (
                  <motion.div
                    key={p._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl"
                    style={{ background: C.surfaceAlt }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl flex items-center
                        justify-center flex-shrink-0"
                        style={{
                          background: p.stock === 0
                            ? "rgba(239,68,68,0.1)" : "rgba(249,115,22,0.1)",
                        }}>
                        <Package size={14}
                          style={{ color: p.stock === 0 ? C.red : C.orange }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold truncate"
                          style={{ color: C.text }}>
                          {p.name}
                        </p>
                        <p className="text-[10px]" style={{ color: C.textMuted }}>
                          {p.category}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-black px-2.5 py-1
                      rounded-full flex-shrink-0 ml-2"
                      style={{
                        background: p.stock === 0
                          ? "rgba(239,68,68,0.1)" : "rgba(249,115,22,0.1)",
                        color: p.stock === 0 ? C.red : C.orange,
                      }}>
                      {p.stock === 0 ? "Out of stock" : `${p.stock} left`}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* ── Revenue chart + orders by status ──────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-5">

        {/* Monthly Revenue */}
        <Card>
          <CardHeader title="Monthly Revenue" />
          <div className="p-5">
            <div className="flex items-end justify-between mb-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: C.textMuted }}>
                  Year to date
                </p>
                <p className="text-xl font-black mt-0.5" style={{ color: C.text }}>
                  {fmtINR(ytdRevenue)}   {/* ← ₹ */}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl
                text-[10px] font-bold"
                style={{ background: "rgba(34,197,94,0.1)", color: C.green }}>
                <TrendingUp size={11} strokeWidth={2.5} /> Live
              </div>
            </div>
            <RevenueChart monthlyRevenue={stats.monthlyRevenue} />
          </div>
        </Card>

        {/* Orders by status */}
        <Card>
          <CardHeader title="Orders by Status" linkTo="/admin/orders" />
          <div className="p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: C.textMuted }}>
                  Total orders
                </p>
                <p className="text-xl font-black mt-0.5" style={{ color: C.text }}>
                  {fmt(stats.totalOrders)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                style={{ background: C.goldLight, border: `1px solid ${C.goldBorder}` }}>
                <BarChart3 size={18} style={{ color: C.gold }} />
              </div>
            </div>

            <StatusBar
              ordersByStatus={stats.ordersByStatus}
              totalOrders={stats.totalOrders}
            />

            {stats.ordersByStatus.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4 pt-4"
                style={{ borderTop: `1px solid ${C.border}` }}>
                {stats.ordersByStatus.map(({ _id: status, count }) => {
                  const cfg = STATUS[status] ?? { color: C.textSub };
                  return (
                    <div key={status} className="flex items-center gap-1.5
                      text-[10px] font-semibold" style={{ color: C.textSub }}>
                      <span className="w-2 h-2 rounded-full flex-shrink-0"
                        style={{ background: cfg.color }} />
                      {status}
                      <span className="font-black" style={{ color: C.text }}>
                        {count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;