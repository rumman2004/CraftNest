import { Link }   from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import FeaturedProducts from "../../components/sections/FeaturedProducts";
import {
  Package, ShoppingCart, User, ShoppingBag,
  ArrowRight, Sparkles,
} from "lucide-react";

const C = {
  navy:      "#13213c",
  navyLight: "#264670",
  gold:      "#d4b26a",
  goldLight: "rgba(212,178,106,0.12)",
  goldBorder:"rgba(212,178,106,0.2)",
  text:      "#13213c",
  textSub:   "#4f6080",
  border:    "rgba(19,33,60,0.07)",
  surface:   "#ffffff",
  bg:        "#f4f5f8",
};

const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 18 },
  show:   {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Quick link card ────────────────────────────────────────────────────────
const QuickCard = ({ to, icon: Icon, label, accent, sub }) => (
  <motion.div variants={fadeUp} whileHover={{ y: -4 }}>
    <Link
      to={to}
      className="block rounded-2xl p-5 transition-all duration-200"
      style={{
        background: C.surface,
        border:     `1px solid ${C.border}`,
        boxShadow:  "0 2px 12px rgba(19,33,60,0.05)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = `${accent}40`;
        e.currentTarget.style.boxShadow   =
          `0 6px 20px ${accent}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow   =
          "0 2px 12px rgba(19,33,60,0.05)";
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center
          justify-center mb-3"
        style={{
          background: `${accent}15`,
          border:     `1px solid ${accent}30`,
        }}
      >
        <Icon size={20} style={{ color: accent }} strokeWidth={2} />
      </div>
      <p className="text-sm font-bold" style={{ color: C.text }}>
        {label}
      </p>
      {sub && (
        <p className="text-[11px] mt-0.5" style={{ color: C.textSub }}>
          {sub}
        </p>
      )}
    </Link>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
const UserHome = () => {
  const { user }                  = useAuth();
  const { totalItems, totalPrice} = useCart();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const quickLinks = [
    {
      to:     "/shop",
      icon:   ShoppingBag,
      label:  "Browse Shop",
      sub:    "Discover new crafts",
      accent: C.navyLight,
    },
    {
      to:     "/user/cart",
      icon:   ShoppingCart,
      label:  "My Cart",
      sub:    totalItems > 0
        ? `${totalItems} item${totalItems > 1 ? "s" : ""} · $${totalPrice.toFixed(2)}`
        : "Your cart is empty",
      accent: C.gold,
    },
    {
      to:     "/user/orders",
      icon:   Package,
      label:  "My Orders",
      sub:    "Track your purchases",
      accent: "#8b5cf6",
    },
    {
      to:     "/user/profile",
      icon:   User,
      label:  "My Profile",
      sub:    "Manage your account",
      accent: "#22c55e",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ background: C.bg }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
        py-8 space-y-8">

        {/* ── Welcome Banner ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.45 }}
          className="relative rounded-3xl px-6 sm:px-10 py-8
            sm:py-10 overflow-hidden"
          style={{
            background:
              `linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`,
            boxShadow: "0 8px 32px rgba(19,33,60,0.2)",
          }}
        >
          {/* Dot texture */}
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle,#d4b26a 1px,transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
          {/* Gold top accent */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{
              background:
                "linear-gradient(to right,transparent,#d4b26a,transparent)",
            }}
          />
          {/* Corner glow */}
          <div
            className="absolute -top-12 -right-12 w-48 h-48
              rounded-full blur-2xl pointer-events-none"
            style={{ background: "rgba(212,178,106,0.12)" }}
          />

          <div className="relative flex flex-col sm:flex-row
            items-start sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: C.gold }} />
                <span
                  className="text-[10px] font-bold tracking-widest uppercase"
                  style={{ color: "rgba(212,178,106,0.8)" }}
                >
                  Welcome Back
                </span>
              </div>
              <h1
                className="text-2xl sm:text-3xl font-black text-white
                  leading-tight"
              >
                Hello, {firstName}! 👋
              </h1>
              <p
                className="text-sm mt-1.5"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                Discover new handmade crafts and continue your journey.
              </p>
            </div>

            <Link to="/user/products" className="flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{  scale: 0.97          }}
                className="flex items-center gap-2 px-5 py-2.5
                  rounded-2xl text-sm font-bold transition-all duration-200"
                style={{
                  background: "#ffffff",
                  color:      C.navy,
                  boxShadow:  "0 4px 16px rgba(0,0,0,0.15)",
                }}
              >
                <ShoppingBag size={15} />
                Shop Now
                <ArrowRight size={13} strokeWidth={2.5} />
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* ── Quick links ───────────────────────────────────────────── */}
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-widest mb-3"
            style={{ color: C.textSub }}
          >
            Quick Access
          </p>
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          >
            {quickLinks.map((lk) => (
              <QuickCard key={lk.to} {...lk} />
            ))}
          </motion.div>
        </div>

        {/* ── Cart summary banner ───────────────────────────────────── */}
        {totalItems > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="rounded-2xl px-5 py-4 flex items-center
              justify-between gap-4 flex-wrap"
            style={{
              background: C.goldLight,
              border:     `1px solid ${C.goldBorder}`,
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center
                  justify-center flex-shrink-0"
                style={{ background: "rgba(212,178,106,0.2)" }}
              >
                <ShoppingCart size={16} style={{ color: C.gold }} />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: C.text }}>
                  {totalItems} item{totalItems > 1 ? "s" : ""} in your cart
                </p>
                <p className="text-xs" style={{ color: C.textSub }}>
                  Total: ${totalPrice.toFixed(2)}
                </p>
              </div>
            </div>
            <Link to="/user/cart">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{  scale: 0.97  }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl
                  text-xs font-bold transition-all duration-150"
                style={{
                  background:
                    `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                  color:     "#fff",
                  boxShadow: "0 4px 12px rgba(19,33,60,0.2)",
                }}
              >
                View Cart
                <ArrowRight size={12} strokeWidth={2.5} />
              </motion.button>
            </Link>
          </motion.div>
        )}

        {/* ── Featured Products ─────────────────────────────────────── */}
        {/*
          ✅ FeaturedProducts is a self-contained section with its own
          white background. Wrap in a rounded container here so it
          fits inside the UserHome layout cleanly.
        */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{
            border:    `1px solid ${C.border}`,
            boxShadow: "0 2px 16px rgba(19,33,60,0.05)",
          }}
        >
          <FeaturedProducts />
        </div>
      </div>
    </motion.div>
  );
};

export default UserHome;