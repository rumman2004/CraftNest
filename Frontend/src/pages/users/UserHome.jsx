import { Link }          from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect }     from "react";
import { useAuth }       from "../../context/AuthContext";
import { useCart }       from "../../context/CartContext";
import FeaturedProducts  from "../../components/sections/FeaturedProducts";
import {
  Package, ShoppingCart, User, ShoppingBag,
  ArrowRight, Sparkles,
} from "lucide-react";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.12)",
  goldBorder: "rgba(212,178,106,0.2)",
  text:       "#13213c",
  textSub:    "#4f6080",
  border:     "rgba(19,33,60,0.07)",
  surface:    "#ffffff",
  bg:         "#f4f5f8",
};

// ── "Welcome" in 12 languages ──────────────────────────────────────────────
const GREETINGS = [
  { word: "Welcome",      lang: "English"    },
  { word: "स्वागत",        lang: "Hindi"      },
  { word: "Bienvenido",   lang: "Spanish"    },
  { word: "Bienvenue",    lang: "French"     },
  { word: "Willkommen",   lang: "German"     },
  { word: "Benvenuto",    lang: "Italian"    },
  { word: "欢迎",          lang: "Chinese"    },
  { word: "ようこそ",       lang: "Japanese"   },
  { word: "환영합니다",     lang: "Korean"     },
  { word: "أهلاً وسهلاً",  lang: "Arabic"     },
  { word: "Добро пожаловать", lang: "Russian" },
  { word: "Bem-vindo",    lang: "Portuguese" },
];

// ── Framer variants ────────────────────────────────────────────────────────
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
        e.currentTarget.style.boxShadow   = `0 6px 20px ${accent}18`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.border;
        e.currentTarget.style.boxShadow   = "0 2px 12px rgba(19,33,60,0.05)";
      }}
    >
      <div
        className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}
      >
        <Icon size={20} style={{ color: accent }} strokeWidth={2} />
      </div>
      <p className="text-sm font-bold" style={{ color: C.text }}>{label}</p>
      {sub && (
        <p className="text-[11px] mt-0.5" style={{ color: C.textSub }}>{sub}</p>
      )}
    </Link>
  </motion.div>
);

// ── Splash screen ──────────────────────────────────────────────────────────
const WelcomeSplash = ({ firstName, onDone }) => {
  const [index,   setIndex  ] = useState(0);
  const [phase,   setPhase  ] = useState("in");   // "in" | "hold" | "out"
  const [leaving, setLeaving] = useState(false);  // triggers whole-splash exit

  // Cycle through greetings
  useEffect(() => {
    // Each greeting: 400ms in → 600ms hold → 300ms out
    const timings = { in: 400, hold: 700, out: 300 };

    if (phase === "in") {
      const t = setTimeout(() => setPhase("hold"), timings.in);
      return () => clearTimeout(t);
    }

    if (phase === "hold") {
      const t = setTimeout(() => setPhase("out"), timings.hold);
      return () => clearTimeout(t);
    }

    if (phase === "out") {
      const t = setTimeout(() => {
        const next = index + 1;
        if (next >= GREETINGS.length) {
          // All greetings done — animate the whole splash away
          setLeaving(true);
          setTimeout(onDone, 700);
        } else {
          setIndex(next);
          setPhase("in");
        }
      }, timings.out);
      return () => clearTimeout(t);
    }
  }, [phase, index, onDone]);

  const { word, lang } = GREETINGS[index];

  // Letter-by-letter animation for the greeting word
  const letters = [...word];

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity:    0,
            scale:      1.04,
            filter:     "blur(12px)",
            transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center
            justify-center select-none overflow-hidden"
          style={{
            background:
              `linear-gradient(135deg, ${C.navy} 0%, ${C.navyLight} 100%)`,
          }}
        >
          {/* Dot-grid texture */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle,#d4b26a 1px,transparent 1px)",
              backgroundSize: "28px 28px",
            }}
          />

          {/* Gold shimmer lines */}
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{
              background:
                "linear-gradient(to right,transparent,#d4b26a,transparent)",
            }} />
          <div className="absolute bottom-0 left-0 right-0 h-[2px]"
            style={{
              background:
                "linear-gradient(to right,transparent,#d4b26a,transparent)",
            }} />

          {/* Corner blobs */}
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full
            blur-3xl pointer-events-none"
            style={{ background: "rgba(212,178,106,0.08)" }} />
          <div className="absolute -bottom-20 -right-20 w-64 h-64 rounded-full
            blur-3xl pointer-events-none"
            style={{ background: "rgba(38,70,112,0.4)" }} />

          {/* Brand chip */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0   }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="flex items-center gap-2 mb-10"
          >
            <Sparkles size={14} style={{ color: C.gold }} />
            <span className="text-[11px] font-black tracking-[0.25em] uppercase"
              style={{ color: "rgba(212,178,106,0.75)" }}>
              CraftNest
            </span>
            <Sparkles size={14} style={{ color: C.gold }} />
          </motion.div>

          {/* Animated greeting word */}
          <div className="flex items-end justify-center gap-0 mb-3
            min-h-[56px] sm:min-h-[72px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={word}
                className="flex"
                initial="hidden"
                animate={phase === "out" ? "exit" : "visible"}
                variants={{
                  hidden:  {},
                  visible: { transition: { staggerChildren: 0.045 } },
                  exit:    { transition: { staggerChildren: 0.025,
                               staggerDirection: -1 } },
                }}
              >
                {letters.map((ch, i) => (
                  <motion.span
                    key={i}
                    className="text-5xl sm:text-6xl font-black"
                    style={{
                      color:      "#ffffff",
                      lineHeight: 1,
                      display:    "inline-block",
                      // Add slight spacing for non-latin scripts
                      letterSpacing: /[\u0900-\u097F\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\uAC00-\uD7AF]/.test(ch)
                        ? "0.05em" : "0",
                    }}
                    variants={{
                      hidden:  { opacity: 0, y: 30,  filter: "blur(8px)"  },
                      visible: { opacity: 1, y: 0,   filter: "blur(0px)",
                        transition: { duration: 0.35,
                          ease: [0.22, 1, 0.36, 1] } },
                      exit:    { opacity: 0, y: -20, filter: "blur(6px)",
                        transition: { duration: 0.2  } },
                    }}
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Language label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={lang}
              initial={{ opacity: 0, y: 6  }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-8"
              style={{ color: "rgba(212,178,106,0.55)" }}
            >
              {lang}
            </motion.p>
          </AnimatePresence>

          {/* "firstName to CraftNest" — always visible */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base sm:text-lg font-semibold text-center px-6"
            style={{ color: "rgba(255,255,255,0.55)" }}
          >
            <span style={{ color: C.gold }} className="font-black">
              {firstName}
            </span>
            {" "}to CraftNest
          </motion.p>

          {/* Progress bar */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2
            w-28 h-[3px] rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.1)" }}>
            <motion.div
              className="h-full rounded-full"
              style={{ background: C.gold }}
              initial={{ width: "0%" }}
              animate={{
                width: `${((index + 1) / GREETINGS.length) * 100}%`,
              }}
              transition={{ duration: 0.35, ease: "easeOut" }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════════
const UserHome = () => {
  const { user }                   = useAuth();
  const { totalItems, totalPrice } = useCart();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  // Show splash only once per session
  const [showSplash, setShowSplash] = useState(() => {
    if (sessionStorage.getItem("craftnest_welcomed")) return false;
    return true;
  });

  const handleSplashDone = () => {
    sessionStorage.setItem("craftnest_welcomed", "1");
    setShowSplash(false);
  };

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
        ? `${totalItems} item${totalItems > 1 ? "s" : ""} · ₹${totalPrice.toFixed(0)}`
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
    <>
      {/* ── Welcome splash ──────────────────────────────────────────── */}
      {showSplash && (
        <WelcomeSplash firstName={firstName} onDone={handleSplashDone} />
      )}

      {/* ── Main content ────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.4 }}
        className="min-h-screen"
        style={{ background: C.bg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          py-8 space-y-8">

          {/* ── Welcome Banner ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0   }}
            transition={{ duration: 0.45, delay: 0.1 }}
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
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(to right,transparent,#d4b26a,transparent)",
              }} />
            {/* Corner glow */}
            <div className="absolute -top-12 -right-12 w-48 h-48
              rounded-full blur-2xl pointer-events-none"
              style={{ background: "rgba(212,178,106,0.12)" }} />

            <div className="relative flex flex-col sm:flex-row
              items-start sm:items-center justify-between gap-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={14} style={{ color: C.gold }} />
                  <span className="text-[10px] font-bold tracking-widest uppercase"
                    style={{ color: "rgba(212,178,106,0.8)" }}>
                    Welcome Back
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white
                  leading-tight">
                  Hello, {firstName}! 👋
                </h1>
                <p className="text-sm mt-1.5"
                  style={{ color: "rgba(255,255,255,0.65)" }}>
                  Discover new handmade crafts and continue your journey.
                </p>
              </div>

              <Link to="/shop" className="flex-shrink-0">
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{   scale: 0.97          }}
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

          {/* ── Quick links ──────────────────────────────────────────── */}
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-3"
              style={{ color: C.textSub }}>
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

          {/* ── Cart summary banner ──────────────────────────────────── */}
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
                    Total: ₹{totalPrice.toFixed(0)}
                  </p>
                </div>
              </div>
              <Link to="/user/cart">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{   scale: 0.97  }}
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

          {/* ── Featured Products ────────────────────────────────────── */}
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
    </>
  );
};

export default UserHome;