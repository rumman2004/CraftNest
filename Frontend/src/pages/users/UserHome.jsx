import { Link }                    from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useAuth }                 from "../../context/AuthContext";
import { useCart }                 from "../../context/CartContext";
import FeaturedProducts            from "../../components/sections/FeaturedProducts";
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

// ── Greetings — 18 languages, ordered for visual variety ──────────────────
const GREETINGS = [
  { word: "Welcome",             lang: "English",    dir: "ltr" },
  { word: "Bienvenido",          lang: "Spanish",    dir: "ltr" },
  { word: "Bienvenue",           lang: "French",     dir: "ltr" },
  { word: "Willkommen",          lang: "German",     dir: "ltr" },
  { word: "Benvenuto",           lang: "Italian",    dir: "ltr" },
  { word: "Bem-vindo",           lang: "Portuguese", dir: "ltr" },
  { word: "Добро пожаловать",    lang: "Russian",    dir: "ltr" },
  { word: "Hoş geldiniz",        lang: "Turkish",    dir: "ltr" },
  { word: "Welkom",              lang: "Dutch",      dir: "ltr" },
  { word: "स्वागत",              lang: "Hindi",      dir: "ltr" },
  { word: "স্বাগতম",             lang: "Bengali",    dir: "ltr" },
  { word: "ਸੁਆਗਤ",              lang: "Punjabi",    dir: "ltr" },
  { word: "أهلاً وسهلاً",        lang: "Arabic",     dir: "rtl" },
  { word: "خوش آمدید",           lang: "Persian",    dir: "rtl" },
  { word: "欢迎",                 lang: "Chinese",    dir: "ltr" },
  { word: "ようこそ",              lang: "Japanese",   dir: "ltr" },
  { word: "환영합니다",            lang: "Korean",     dir: "ltr" },
  { word: "Karibu",              lang: "Swahili",    dir: "ltr" },
];

// Timings — fast enough to feel snappy, slow enough to read each word
const T = { in: 380, hold: 520, out: 260 };

// ── Variants ───────────────────────────────────────────────────────────────
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

// ── Quick card ─────────────────────────────────────────────────────────────
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
      <div className="w-11 h-11 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: `${accent}15`, border: `1px solid ${accent}30` }}>
        <Icon size={20} style={{ color: accent }} strokeWidth={2} />
      </div>
      <p className="text-sm font-bold" style={{ color: C.text }}>{label}</p>
      {sub && (
        <p className="text-[11px] mt-0.5" style={{ color: C.textSub }}>{sub}</p>
      )}
    </Link>
  </motion.div>
);

// ═══════════════════════════════════════════════════════════════════════════
// Splash
// ═══════════════════════════════════════════════════════════════════════════
const WelcomeSplash = ({ firstName, onDone }) => {
  const [index,   setIndex  ] = useState(0);
  const [phase,   setPhase  ] = useState("in");
  const [leaving, setLeaving] = useState(false);

  const finish = useCallback(() => {
    setLeaving(true);
    setTimeout(onDone, 750);
  }, [onDone]);

  useEffect(() => {
    if (phase === "in") {
      const t = setTimeout(() => setPhase("hold"), T.in);
      return () => clearTimeout(t);
    }
    if (phase === "hold") {
      const t = setTimeout(() => setPhase("out"), T.hold);
      return () => clearTimeout(t);
    }
    if (phase === "out") {
      const t = setTimeout(() => {
        const next = index + 1;
        if (next >= GREETINGS.length) finish();
        else { setIndex(next); setPhase("in"); }
      }, T.out);
      return () => clearTimeout(t);
    }
  }, [phase, index, finish]);

  const { word, lang, dir } = GREETINGS[index];
  const progress = (index + 1) / GREETINGS.length;

  // Non-latin regex for font sizing
  const isNonLatin = /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0600-\u06FF\u4E00-\u9FFF\u3040-\u309F\u30A0-\u30FF\uAC00-\uD7AF]/.test(word);
  const fontSize   = isNonLatin ? "text-4xl sm:text-5xl" : "text-5xl sm:text-6xl";

  return (
    <AnimatePresence>
      {!leaving && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{
            opacity:    0,
            scale:      1.06,
            filter:     "blur(16px)",
            transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
          }}
          className="fixed inset-0 z-50 flex flex-col items-center
            justify-center select-none overflow-hidden"
          style={{
            background:
              `linear-gradient(145deg, #0d1a2e 0%, ${C.navy} 40%,
               ${C.navyLight} 100%)`,
          }}
        >

          {/* ── Animated background orbs ──────────────────────────── */}
          <motion.div
            animate={{
              x: [0, 30, -20, 0],
              y: [0, -40, 20, 0],
              scale: [1, 1.15, 0.95, 1],
            }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[-10%] left-[-5%] w-[50vw] h-[50vw]
              max-w-[500px] max-h-[500px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(212,178,106,0.12) 0%," +
                "transparent 70%)",
              filter: "blur(40px)",
            }}
          />
          <motion.div
            animate={{
              x: [0, -25, 35, 0],
              y: [0, 30, -25, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 15, repeat: Infinity,
              ease: "easeInOut", delay: 2,
            }}
            className="absolute bottom-[-10%] right-[-5%] w-[45vw] h-[45vw]
              max-w-[450px] max-h-[450px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(38,70,112,0.5) 0%," +
                "transparent 70%)",
              filter: "blur(50px)",
            }}
          />
          <motion.div
            animate={{ x: [0, 20, -15, 0], y: [0, -20, 30, 0] }}
            transition={{
              duration: 10, repeat: Infinity,
              ease: "easeInOut", delay: 4,
            }}
            className="absolute top-[30%] right-[10%] w-[20vw] h-[20vw]
              max-w-[200px] max-h-[200px] rounded-full pointer-events-none"
            style={{
              background:
                "radial-gradient(circle, rgba(212,178,106,0.07) 0%," +
                "transparent 70%)",
              filter: "blur(30px)",
            }}
          />

          {/* ── Dot grid ──────────────────────────────────────────── */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "radial-gradient(circle, #d4b26a 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />

          {/* ── Top + bottom shimmer lines ─────────────────────────── */}
          {["top-0", "bottom-0"].map((pos) => (
            <motion.div
              key={pos}
              className={`absolute ${pos} left-0 right-0 h-[1.5px]`}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              style={{
                background:
                  "linear-gradient(to right,transparent 0%,#d4b26a 35%," +
                  "#f5e6b8 50%,#d4b26a 65%,transparent 100%)",
              }}
            />
          ))}

          {/* ── Brand logo area ────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -28, scale: 0.85 }}
            animate={{ opacity: 1,  y: 0,  scale: 1    }}
            transition={{ delay: 0.15, duration: 0.6,
              ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center mb-12"
          >
            {/* Icon ring */}
            <div className="relative mb-4">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-full"
                style={{
                  background:
                    "conic-gradient(from 0deg, transparent 70%," +
                    "rgba(212,178,106,0.4) 100%)",
                  padding: "1px",
                }}
              />
              <div
                className="relative w-16 h-16 rounded-full flex items-center
                  justify-center"
                style={{
                  background:
                    "linear-gradient(135deg,rgba(212,178,106,0.15)," +
                    "rgba(38,70,112,0.3))",
                  border: "1px solid rgba(212,178,106,0.25)",
                  boxShadow:
                    "0 0 30px rgba(212,178,106,0.15)," +
                    "inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <Sparkles size={24} style={{ color: C.gold }} />
              </div>
            </div>

            {/* Brand name */}
            <div className="flex items-center gap-2">
              {["C","r","a","f","t","N","e","s","t"].map((ch, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: 0.2 + i * 0.04, duration: 0.4 }}
                  className="text-xs font-black tracking-[0.18em] uppercase"
                  style={{
                    color: i === 5           // "N" — highlight split
                      ? C.gold
                      : "rgba(255,255,255,0.7)",
                  }}
                >
                  {ch}
                </motion.span>
              ))}
            </div>
          </motion.div>

          {/* ── Greeting word ──────────────────────────────────────── */}
          <div
            className="relative flex items-center justify-center
              min-h-[64px] sm:min-h-[80px] mb-2 w-full px-6"
            dir={dir}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={word}
                className={`flex flex-wrap justify-center ${fontSize} font-black`}
                initial="hidden"
                animate={phase === "out" ? "exit" : "visible"}
                variants={{
                  hidden:  {},
                  visible: { transition: { staggerChildren: 0.04 } },
                  exit:    { transition: { staggerChildren: 0.02,
                               staggerDirection: -1 } },
                }}
              >
                {[...word].map((ch, i) => (
                  <motion.span
                    key={i}
                    style={{
                      display:       "inline-block",
                      color:         "#ffffff",
                      lineHeight:    1.1,
                      letterSpacing: isNonLatin ? "0.06em" : "-0.01em",
                      textShadow:    "0 2px 20px rgba(212,178,106,0.2)",
                    }}
                    variants={{
                      hidden:  {
                        opacity: 0,
                        y:       40,
                        rotateX: 90,
                        filter:  "blur(10px)",
                      },
                      visible: {
                        opacity: 1,
                        y:       0,
                        rotateX: 0,
                        filter:  "blur(0px)",
                        transition: {
                          duration: 0.45,
                          ease: [0.22, 1, 0.36, 1],
                        },
                      },
                      exit: {
                        opacity: 0,
                        y:       -30,
                        rotateX: -60,
                        filter:  "blur(8px)",
                        transition: { duration: 0.22 },
                      },
                    }}
                  >
                    {ch === " " ? "\u00A0" : ch}
                  </motion.span>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* ── Language pill ──────────────────────────────────────── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={lang}
              initial={{ opacity: 0, y: 8,  scale: 0.9 }}
              animate={{ opacity: 1, y: 0,  scale: 1   }}
              exit={{    opacity: 0, y: -8, scale: 0.9 }}
              transition={{ duration: 0.22 }}
              className="mb-10 px-4 py-1.5 rounded-full"
              style={{
                background: "rgba(212,178,106,0.08)",
                border:     "1px solid rgba(212,178,106,0.18)",
              }}
            >
              <p className="text-[10px] font-black uppercase tracking-[0.22em]"
                style={{ color: "rgba(212,178,106,0.65)" }}>
                {lang}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* ── Name + tagline ─────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex flex-col items-center gap-1 text-center px-8"
          >
            {/* Decorative divider */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-px"
                style={{ background: "rgba(212,178,106,0.3)" }} />
              <div className="w-1 h-1 rounded-full"
                style={{ background: "rgba(212,178,106,0.5)" }} />
              <div className="w-8 h-px"
                style={{ background: "rgba(212,178,106,0.3)" }} />
            </div>

            <p className="text-lg sm:text-xl font-semibold leading-snug"
              style={{ color: "rgba(255,255,255,0.5)" }}>
              <motion.span
                className="font-black"
                style={{ color: C.gold }}
                animate={{ opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 2.5, repeat: Infinity }}
              >
                {firstName}
              </motion.span>
              <span className="mx-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                ·
              </span>
              to CraftNest
            </p>

            <p className="text-[11px] mt-1"
              style={{ color: "rgba(255,255,255,0.28)" }}>
              Handcrafted with love, delivered with care
            </p>
          </motion.div>

          {/* ── Progress area ──────────────────────────────────────── */}
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2
            flex flex-col items-center gap-3 w-36">

            {/* Dot indicators */}
            <div className="flex items-center gap-1.5">
              {GREETINGS.map((_, i) => (
                <motion.div
                  key={i}
                  animate={{
                    width:      i === index ? 16 : 4,
                    opacity:    i === index ? 1  : i < index ? 0.35 : 0.15,
                    background: i === index ? C.gold : "#ffffff",
                  }}
                  transition={{ duration: 0.3 }}
                  className="h-[3px] rounded-full"
                />
              ))}
            </div>

            {/* Thin progress bar */}
            <div className="w-full h-[2px] rounded-full overflow-hidden"
              style={{ background: "rgba(255,255,255,0.07)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    `linear-gradient(to right, ${C.gold}, #f5e6b8)`,
                }}
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>

            {/* Counter */}
            <p className="text-[9px] font-bold tracking-widest"
              style={{ color: "rgba(255,255,255,0.2)" }}>
              {index + 1} / {GREETINGS.length}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// Main page
// ═══════════════════════════════════════════════════════════════════════════
const UserHome = () => {
  const { user }                   = useAuth();
  const { totalItems, totalPrice } = useCart();

  const firstName = user?.name?.split(" ")[0] ?? "there";

  const [showSplash, setShowSplash] = useState(() =>
    !sessionStorage.getItem("craftnest_welcomed")
  );

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
      {showSplash && (
        <WelcomeSplash firstName={firstName} onDone={handleSplashDone} />
      )}

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showSplash ? 0 : 1 }}
        transition={{ duration: 0.5 }}
        className="min-h-screen"
        style={{ background: C.bg }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

          {/* ── Welcome banner ──────────────────────────────────────── */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0   }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="relative rounded-3xl px-6 sm:px-10 py-8 sm:py-10
              overflow-hidden"
            style={{
              background:
                `linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`,
              boxShadow: "0 8px 32px rgba(19,33,60,0.2)",
            }}
          >
            <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
              style={{
                backgroundImage:
                  "radial-gradient(circle,#d4b26a 1px,transparent 1px)",
                backgroundSize: "24px 24px",
              }} />
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{
                background:
                  "linear-gradient(to right,transparent,#d4b26a,transparent)",
              }} />
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full
              blur-2xl pointer-events-none"
              style={{ background: "rgba(212,178,106,0.12)" }} />

            <div className="relative flex flex-col sm:flex-row items-start
              sm:items-center justify-between gap-5">
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
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl
                    text-sm font-bold transition-all duration-200"
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

          {/* ── Cart banner ──────────────────────────────────────────── */}
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
                <div className="w-9 h-9 rounded-xl flex items-center
                  justify-center flex-shrink-0"
                  style={{ background: "rgba(212,178,106,0.2)" }}>
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

          {/* ── Featured products ────────────────────────────────────── */}
          <div className="rounded-3xl overflow-hidden"
            style={{
              border:    `1px solid ${C.border}`,
              boxShadow: "0 2px 16px rgba(19,33,60,0.05)",
            }}>
            <FeaturedProducts />
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default UserHome;