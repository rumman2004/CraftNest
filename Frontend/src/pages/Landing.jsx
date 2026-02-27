import { Link, useNavigate }        from "react-router-dom";
import { motion, AnimatePresence }  from "framer-motion";
import { useAuth }                  from "../context/AuthContext";
import { useEffect, useState }      from "react";
import {
  ShoppingBag, LogIn, UserPlus, Sparkles, Heart,
  Star, Shield, Truck, ArrowRight, ChevronDown,
  Scissors, Palette, Flower2, Shirt, Gem, Leaf,
  BadgeCheck, Users, Award,
} from "lucide-react";
import { GradientCard } from "../components/ui/Cards";

// ── Welcome translations ───────────────────────────────────────────────────
const welcomeWords = [
  { word: "Welcome",             lang: "English"    },
  { word: "Bienvenido",          lang: "Spanish"    },
  { word: "Bienvenue",           lang: "French"     },
  { word: "Willkommen",          lang: "German"     },
  { word: "Benvenuto",           lang: "Italian"    },
  { word: "ようこそ",              lang: "Japanese"   },
  { word: "欢迎",                 lang: "Chinese"    },
  { word: "환영합니다",            lang: "Korean"     },
  { word: "أهلاً",                lang: "Arabic"     },
  { word: "Добро пожаловать",    lang: "Russian"    },
  { word: "Hoş Geldiniz",        lang: "Turkish"    },
  { word: "Selamat Datang",      lang: "Malay"      },
  { word: "Καλώς ήρθατε",        lang: "Greek"      },
  { word: "Welkom",              lang: "Dutch"      },
];

// ── Floating icons for splash ──────────────────────────────────────────────
const splashParticles = [
  { icon: Scissors, x: "6%",  y: "14%", size: 22, dur: 3.2, delay: 0.1  },
  { icon: Heart,    x: "87%", y: "10%", size: 20, dur: 3.8, delay: 0.4  },
  { icon: Flower2,  x: "91%", y: "58%", size: 18, dur: 2.9, delay: 0.2  },
  { icon: Gem,      x: "4%",  y: "66%", size: 18, dur: 3.5, delay: 0.7  },
  { icon: Sparkles, x: "78%", y: "83%", size: 16, dur: 4.0, delay: 0.3  },
  { icon: Leaf,     x: "11%", y: "86%", size: 16, dur: 3.3, delay: 0.6  },
  { icon: Palette,  x: "48%", y: "5%",  size: 15, dur: 3.6, delay: 0.9  },
  { icon: Shirt,    x: "44%", y: "91%", size: 14, dur: 3.1, delay: 0.5  },
  { icon: Star,     x: "22%", y: "8%",  size: 13, dur: 3.4, delay: 0.8  },
  { icon: Gem,      x: "70%", y: "18%", size: 13, dur: 2.8, delay: 1.0  },
];

// ── Landing floating icons ─────────────────────────────────────────────────
const floatingIcons = [
  { icon: Sparkles, x: "8%",  y: "15%", size: 18, dur: 3.2, delay: 0   },
  { icon: Heart,    x: "88%", y: "12%", size: 16, dur: 3.8, delay: 0.4 },
  { icon: Scissors, x: "5%",  y: "70%", size: 15, dur: 3.5, delay: 0.8 },
  { icon: Gem,      x: "92%", y: "65%", size: 14, dur: 2.9, delay: 1.2 },
  { icon: Leaf,     x: "15%", y: "85%", size: 15, dur: 4.0, delay: 0.6 },
  { icon: Flower2,  x: "80%", y: "80%", size: 14, dur: 3.3, delay: 1.0 },
  { icon: Star,     x: "50%", y: "8%",  size: 14, dur: 3.6, delay: 0.3 },
  { icon: Palette,  x: "72%", y: "30%", size: 15, dur: 3.1, delay: 0.9 },
];

// ── Category data ──────────────────────────────────────────────────────────
const categories = [
  {
    icon: Scissors, label: "Crochet",      desc: "Cozy handmade pieces",
    style:     { background: "linear-gradient(135deg,#13213c,#264670)" },
    barStyle:  { background: "linear-gradient(to right,#13213c,#264670)" },
    hoverColor: "#264670",
  },
  {
    icon: Palette,  label: "Embroidery",   desc: "Artistic dream hoops",
    style:     { background: "linear-gradient(135deg,#264670,#13213c)" },
    barStyle:  { background: "linear-gradient(to right,#264670,#13213c)" },
    hoverColor: "#264670",
  },
  {
    icon: Flower2,  label: "Pipe Cleaner", desc: "Colorful bouquets",
    style:     { background: "linear-gradient(135deg,#d4b26a,#c69e4f)" },
    barStyle:  { background: "linear-gradient(to right,#d4b26a,#c69e4f)" },
    hoverColor: "#c69e4f",
  },
  {
    icon: Shirt,    label: "Woolen",       desc: "Warm & stylish wraps",
    style:     { background: "linear-gradient(135deg,#1a3254,#264670)" },
    barStyle:  { background: "linear-gradient(to right,#1a3254,#264670)" },
    hoverColor: "#264670",
  },
];

const trustBadges = [
  { icon: Heart,  label: "100% Handmade",   value: "Every piece"  },
  { icon: Star,   label: "Top Rated",        value: "4.9 / 5"      },
  { icon: Truck,  label: "Fast Shipping",    value: "2–5 days"     },
  { icon: Shield, label: "Secure Checkout",  value: "SSL Protected" },
];

const testimonials = [
  {
    name: "Sarah M.",
    text: "The crochet bag I ordered is absolutely stunning! You can feel the love in every stitch.",
    stars: 5, avatar: "S",
    gradientStyle: { background: "linear-gradient(135deg,#13213c,#264670)" },
  },
  {
    name: "Emily R.",
    text: "CraftNest has the most beautiful embroidery hoops I've ever seen. A true work of art!",
    stars: 5, avatar: "E",
    gradientStyle: { background: "linear-gradient(135deg,#264670,#13213c)" },
  },
  {
    name: "Priya K.",
    text: "Ordered the woolen scarf as a gift — she cried happy tears. Worth every penny!",
    stars: 5, avatar: "P",
    gradientStyle: { background: "linear-gradient(135deg,#d4b26a,#c69e4f)" },
  },
];

const fadeUp  = { hidden: { opacity: 0, y: 40 }, show: { opacity: 1, y: 0 } };
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.12 } } };

// ══════════════════════════════════════════════════════════════════════════
// WelcomeSplash
// ══════════════════════════════════════════════════════════════════════════
const WelcomeSplash = ({ onDone }) => {
  const [wordIndex, setWordIndex] = useState(0);
  // phase: "intro" → "cycling" → "outro"
  const [phase, setPhase] = useState("intro");

  // Start cycling after initial mount animation settles
  useEffect(() => {
    const t = setTimeout(() => setPhase("cycling"), 950);
    return () => clearTimeout(t);
  }, []);

  // Cycle through languages
  useEffect(() => {
    if (phase !== "cycling") return;
    const iv = setInterval(() => {
      setWordIndex((prev) => {
        const next = prev + 1;
        if (next >= welcomeWords.length) {
          clearInterval(iv);
          setTimeout(() => setPhase("outro"), 450);
          return prev;
        }
        return next;
      });
    }, 700);
    return () => clearInterval(iv);
  }, [phase]);

  // Unmount after outro animation
  useEffect(() => {
    if (phase !== "outro") return;
    const t = setTimeout(onDone, 750);
    return () => clearTimeout(t);
  }, [phase, onDone]);

  // Total splash duration ≈ 0.95 + 14 * 0.43 + 0.65 + 0.75 ≈ 8.4 s
  const totalDuration = 0.95 + welcomeWords.length * 0.43 + 0.65 + 0.75;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center
        overflow-hidden select-none"
      style={{
        background:
          "linear-gradient(135deg,#080f1e 0%,#13213c 45%,#1a2d50 100%)",
      }}
      animate={
        phase === "outro"
          ? { opacity: 0, scale: 1.06, filter: "blur(8px)" }
          : { opacity: 1, scale: 1,    filter: "blur(0px)" }
      }
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
    >

      {/* ── Grid texture ────────────────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(212,178,106,0.04) 1px, transparent 1px),
            linear-gradient(90deg,rgba(212,178,106,0.04) 1px,transparent 1px)
          `,
          backgroundSize: "52px 52px",
        }}
      />

      {/* ── Ambient blobs ───────────────────────────────────────────────── */}
      <motion.div
        animate={{ scale: [1,1.35,1], opacity: [0.12,0.28,0.12] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[560px] h-[560px]
          rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(212,178,106,0.14)" }}
      />
      <motion.div
        animate={{ scale: [1,1.28,1], opacity: [0.08,0.2,0.08] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2.5 }}
        className="absolute -bottom-40 -right-40 w-[520px] h-[520px]
          rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(38,70,112,0.3)" }}
      />
      <motion.div
        animate={{ scale: [1,1.2,1], opacity: [0.05,0.14,0.05] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2
          -translate-y-1/2 w-[700px] h-[700px] rounded-full
          blur-3xl pointer-events-none"
        style={{ background: "rgba(212,178,106,0.06)" }}
      />

      {/* ── Floating craft icons ─────────────────────────────────────────── */}
      {splashParticles.map((p, i) => {
        const Icon = p.icon;
        return (
          <motion.div
            key={i}
            className="absolute pointer-events-none hidden sm:block"
            style={{ left: p.x, top: p.y, color: "rgba(212,178,106,0.22)" }}
            initial={{ opacity: 0, scale: 0.4, y: 10 }}
            animate={{
              opacity: [0, 0.55, 0.28, 0.55],
              scale:   [0.4, 1, 1, 1],
              y:       [10, 0, -12, 0],
              rotate:  [0, 0, 8, -8, 0],
            }}
            transition={{
              duration: p.dur,
              repeat:   Infinity,
              ease:     "easeInOut",
              delay:    p.delay,
            }}
          >
            <Icon size={p.size} strokeWidth={1.2} />
          </motion.div>
        );
      })}

      {/* ── Spinning orbit rings ─────────────────────────────────────────── */}
      <div className="absolute pointer-events-none"
        style={{
          width: 260, height: 260,
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
        }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full"
          style={{ border: "1px dashed rgba(212,178,106,0.15)" }}
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
          className="absolute inset-4 rounded-full"
          style={{ border: "1px solid rgba(212,178,106,0.08)" }}
        />
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute inset-8 rounded-full"
          style={{ border: "1px dashed rgba(255,255,255,0.04)" }}
        />
      </div>

      {/* ── Main content card ────────────────────────────────────────────── */}
      <div className="relative z-10 flex flex-col items-center px-6
        text-center max-w-sm sm:max-w-md w-full">

        {/* Logo icon */}
        <motion.div
          initial={{ scale: 0, rotate: -30, opacity: 0 }}
          animate={{ scale: 1, rotate: 0,   opacity: 1 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
          className="relative mb-8"
        >
          {/* Pulsing halo */}
          <motion.div
            animate={{ scale: [1,1.5,1], opacity: [0.2,0.45,0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-3xl blur-2xl
              scale-150 pointer-events-none"
            style={{ background: "rgba(212,178,106,0.3)" }}
          />
          <div
            className="relative w-[76px] h-[76px] sm:w-[90px] sm:h-[90px]
              rounded-3xl flex items-center justify-center"
            style={{
              background:
                "linear-gradient(135deg,rgba(255,255,255,0.13)," +
                "rgba(255,255,255,0.04))",
              border:         "1.5px solid rgba(212,178,106,0.4)",
              boxShadow:
                "0 20px 60px rgba(0,0,0,0.4)," +
                "0 0 0 1px rgba(212,178,106,0.08) inset",
              backdropFilter: "blur(16px)",
            }}
          >
            <Heart
              size={34} className="sm:hidden"
              style={{ color: "#d4b26a" }}
              strokeWidth={1.6}
              fill="rgba(212,178,106,0.25)"
            />
            <Heart
              size={40} className="hidden sm:block"
              style={{ color: "#d4b26a" }}
              strokeWidth={1.6}
              fill="rgba(212,178,106,0.25)"
            />
          </div>

          {/* Spinning gold badge */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
            className="absolute -top-2.5 -right-2.5 w-7 h-7 rounded-full
              flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#d4b26a,#c69e4f)",
              border:     "2px solid rgba(255,255,255,0.12)",
              boxShadow:  "0 4px 14px rgba(0,0,0,0.35)",
            }}
          >
            <Sparkles size={12} color="#fff" strokeWidth={2.2} />
          </motion.div>
        </motion.div>

        {/* ── Animated "Welcome" word ──────────────────────────────────── */}
        <div className="h-14 sm:h-16 flex flex-col items-center
          justify-center mb-1 overflow-hidden w-full">
          <AnimatePresence mode="wait">
            <motion.h1
              key={`word-${wordIndex}`}
              initial={{ opacity: 0, y: 28, filter: "blur(8px)", scale: 0.92 }}
              animate={{ opacity: 1, y: 0,  filter: "blur(0px)", scale: 1    }}
              exit={{    opacity: 0, y: -22, filter: "blur(6px)", scale: 1.04 }}
              transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl font-black text-center
                leading-none"
              style={{
                background:
                  "linear-gradient(to right,#f5e0a0,#d4b26a,#b8934a)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
                letterSpacing:        "-0.02em",
              }}
            >
              {welcomeWords[wordIndex].word}
            </motion.h1>
          </AnimatePresence>
        </div>

        {/* Language label */}
        <div className="h-5 flex items-center justify-center
          mb-5 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={`lang-${wordIndex}`}
              initial={{ opacity: 0, y:  6 }}
              animate={{ opacity: 1, y:  0 }}
              exit={{    opacity: 0, y: -6 }}
              transition={{ duration: 0.26 }}
              className="text-[10px] sm:text-xs font-bold
                tracking-[0.22em] uppercase"
              style={{ color: "rgba(212,178,106,0.45)" }}
            >
              {welcomeWords[wordIndex].lang}
            </motion.span>
          </AnimatePresence>
        </div>

        {/* ── "to CraftNest" letter reveal ────────────────────────────── */}
        <motion.div
          className="flex items-center justify-center gap-1 mb-3"
          initial="hidden"
          animate="show"
          variants={{
            hidden: {},
            show: {
              transition: { staggerChildren: 0.05, delayChildren: 0.4 },
            },
          }}
        >
          <motion.span
            variants={{
              hidden: { opacity: 0, y: 10 },
              show:   { opacity: 1, y: 0,
                transition: { duration: 0.4, ease: [0.22,1,0.36,1] } },
            }}
            className="text-lg sm:text-xl font-semibold mr-1"
            style={{ color: "rgba(255,255,255,0.45)" }}
          >
            to
          </motion.span>

          {"CraftNest".split("").map((char, i) => (
            <motion.span
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.6 },
                show: {
                  opacity: 1, y: 0, scale: 1,
                  transition: {
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  },
                },
              }}
              className="text-2xl sm:text-3xl font-black"
              style={{ color: "#ffffff", letterSpacing: "-0.015em" }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.0, duration: 0.55 }}
          className="text-xs sm:text-sm leading-relaxed mb-7
            max-w-[260px] sm:max-w-xs"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Handcrafted with love · Every piece is unique
        </motion.p>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.8, ease: [0.22,1,0.36,1] }}
          className="w-36 sm:w-52 h-[1.5px] rounded-full mb-5"
          style={{
            background:
              "linear-gradient(to right,transparent,#d4b26a,transparent)",
          }}
        />

        {/* Progress bar */}
        <motion.div
          className="w-36 sm:w-52 h-[3px] rounded-full overflow-hidden mb-6"
          style={{ background: "rgba(255,255,255,0.06)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(to right,#b8934a,#d4b26a,#f5e0a0,#d4b26a)",
            }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: totalDuration - 0.5,
              ease:     "linear",
              delay:    0.5,
            }}
          />
        </motion.div>

        {/* Craft icon strip */}
        <motion.div
          className="flex items-center gap-3 sm:gap-4"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.5 }}
        >
          {[Scissors, Flower2, Gem, Heart, Palette, Sparkles].map(
            (Icon, i) => (
              <motion.div
                key={i}
                animate={{
                  y:       [0, -6, 0],
                  opacity: [0.25, 0.65, 0.25],
                  scale:   [1, 1.15, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat:   Infinity,
                  delay:    i * 0.18,
                  ease:     "easeInOut",
                }}
                style={{ color: "rgba(212,178,106,0.5)" }}
              >
                <Icon size={13} className="sm:hidden"       strokeWidth={1.5} />
                <Icon size={15} className="hidden sm:block"  strokeWidth={1.5} />
              </motion.div>
            )
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Landing
// ══════════════════════════════════════════════════════════════════════════
const Landing = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [showSplash,        setShowSplash       ] = useState(true);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(
        user?.role === "admin" ? "/admin/dashboard" : "/user/home",
        { replace: true }
      );
    }
  }, [isAuthenticated, navigate, user]);

  useEffect(() => {
    const t = setInterval(
      () => setActiveTestimonial((p) => (p + 1) % testimonials.length),
      4000
    );
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {/* ── Splash ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showSplash && (
          <WelcomeSplash onDone={() => setShowSplash(false)} />
        )}
      </AnimatePresence>

      {/* ── Main page (fades in after splash) ─────────────────────────── */}
      <AnimatePresence>
        {!showSplash && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="min-h-screen overflow-x-hidden"
            style={{
              backgroundColor: "var(--color-oxford-gray-light)",
              color:           "var(--color-oxford-navy)",
            }}
          >

            {/* ── HERO ──────────────────────────────────────────────── */}
            <section
              className="relative min-h-screen flex flex-col items-center
                justify-center overflow-hidden px-4 py-16 sm:py-20"
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(135deg,#f3f4f7 0%,#eef0f6 50%,#f3f4f7 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none opacity-[0.025]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(19,33,60,0.4) 1px, transparent 1px),
                    linear-gradient(90deg,rgba(19,33,60,0.4) 1px,transparent 1px)
                  `,
                  backgroundSize: "56px 56px",
                }}
              />

              <motion.div
                animate={{ scale: [1,1.12,1], opacity: [0.5,0.7,0.5] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-0 left-0 w-[400px] sm:w-[600px]
                  h-[400px] sm:h-[600px] rounded-full blur-3xl
                  -translate-x-1/2 -translate-y-1/2 pointer-events-none"
                style={{ background: "rgba(212,178,106,0.15)" }}
              />
              <motion.div
                animate={{ scale: [1,1.15,1], opacity: [0.3,0.5,0.3] }}
                transition={{ duration: 10, repeat: Infinity,
                  ease: "easeInOut", delay: 2 }}
                className="absolute bottom-0 right-0 w-[350px] sm:w-[500px]
                  h-[350px] sm:h-[500px] rounded-full blur-3xl
                  translate-x-1/3 translate-y-1/3 pointer-events-none"
                style={{ background: "rgba(38,70,112,0.1)" }}
              />

              {floatingIcons.map((p, i) => {
                const FloatIcon = p.icon;
                return (
                  <motion.div
                    key={i}
                    className="absolute select-none pointer-events-none
                      hidden sm:block"
                    style={{
                      left:  p.x,
                      top:   p.y,
                      color: "rgba(212,178,106,0.45)",
                    }}
                    animate={{
                      y:      [0, -16, 0],
                      rotate: [0, 8, -8, 0],
                      scale:  [1, 1.1, 1],
                    }}
                    transition={{
                      duration: p.dur, repeat: Infinity,
                      ease: "easeInOut", delay: p.delay,
                    }}
                  >
                    <FloatIcon size={p.size} strokeWidth={1.3} />
                  </motion.div>
                );
              })}

              <div className="relative z-10 max-w-4xl mx-auto text-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-1.5 sm:gap-2
                    px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
                    text-xs sm:text-sm font-semibold mb-6 sm:mb-8
                    shadow-sm backdrop-blur-sm"
                  style={{
                    background: "rgba(255,255,255,0.9)",
                    border:     "1px solid rgba(212,178,106,0.35)",
                    color:      "#13213c",
                  }}
                >
                  <Sparkles size={12} style={{ color: "#d4b26a" }} />
                  100% Handcrafted with Love
                  <Sparkles size={12} style={{ color: "#264670" }} />
                </motion.div>

                <motion.div
                  variants={stagger} initial="hidden" animate="show">
                  <motion.h1
                    variants={fadeUp}
                    className="text-4xl sm:text-6xl lg:text-7xl font-black
                      leading-[1.08] tracking-tight mb-4 sm:mb-6"
                    style={{ color: "#13213c" }}
                  >
                    Beautiful{" "}
                    <span className="relative inline-block">
                      <span className="text-gradient">Handmade</span>
                      <motion.svg
                        viewBox="0 0 300 12"
                        className="absolute -bottom-2 left-0 w-full"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ delay: 0.8, duration: 0.8 }}
                      >
                        <motion.path
                          d="M 0 6 Q 75 0 150 6 Q 225 12 300 6"
                          fill="none"
                          stroke="url(#underlineGrad)"
                          strokeWidth="3"
                          strokeLinecap="round"
                          initial={{ pathLength: 0 }}
                          animate={{ pathLength: 1 }}
                          transition={{ delay: 0.8, duration: 0.8 }}
                        />
                        <defs>
                          <linearGradient id="underlineGrad"
                            x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%"   stopColor="#d4b26a" />
                            <stop offset="100%" stopColor="#264670" />
                          </linearGradient>
                        </defs>
                      </motion.svg>
                    </span>
                    <br />
                    <span style={{ color: "#264670" }}>Crafts & Gifts</span>
                  </motion.h1>

                  <motion.p
                    variants={fadeUp}
                    className="text-base sm:text-xl max-w-2xl mx-auto
                      leading-relaxed mb-8 sm:mb-10"
                    style={{ color: "#4f545f" }}
                  >
                    Discover one-of-a-kind crochet pieces, embroidery hoops,
                    pipe cleaner bouquets & woolen scarves — every item
                    lovingly handcrafted by skilled artisans.
                  </motion.p>

                  <motion.div
                    variants={fadeUp}
                    className="flex flex-col sm:flex-row gap-3 sm:gap-4
                      justify-center items-center mb-10 sm:mb-12"
                  >
                    <Link to="/shop" className="w-full sm:w-auto">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full sm:w-auto inline-flex items-center
                          justify-center gap-2 px-7 py-3.5 rounded-2xl
                          font-bold text-sm text-white transition-all
                          duration-200 shadow-lg"
                        style={{
                          background:
                            "linear-gradient(to right,#13213c,#264670)",
                          boxShadow: "0 4px 18px rgba(19,33,60,0.35)",
                        }}
                      >
                        <ShoppingBag size={17} />
                        Explore the Shop
                        <ArrowRight size={15} />
                      </motion.button>
                    </Link>

                    <Link to="/login" className="w-full sm:w-auto">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full sm:w-auto inline-flex items-center
                          justify-center gap-2 px-7 py-3.5 rounded-2xl
                          font-bold text-sm transition-all duration-200
                          backdrop-blur-sm"
                        style={{
                          background: "rgba(255,255,255,0.9)",
                          color:      "#13213c",
                          border:     "2px solid rgba(19,33,60,0.15)",
                          boxShadow:  "0 2px 12px rgba(19,33,60,0.1)",
                        }}
                      >
                        <LogIn size={17} />
                        Sign In
                      </motion.button>
                    </Link>

                    <Link to="/signup" className="w-full sm:w-auto">
                      <motion.button
                        whileHover={{ y: -2, scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        className="w-full sm:w-auto inline-flex items-center
                          justify-center gap-2 px-7 py-3.5 rounded-2xl
                          font-bold text-sm transition-all duration-200"
                        style={{
                          background: "rgba(212,178,106,0.12)",
                          color:      "#13213c",
                          border:     "1px solid rgba(212,178,106,0.35)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(212,178,106,0.22)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "rgba(212,178,106,0.12)";
                        }}
                      >
                        <UserPlus size={17} />
                        Create Account
                      </motion.button>
                    </Link>
                  </motion.div>

                  {/* Stats row */}
                  <motion.div
                    variants={stagger}
                    initial="hidden"
                    animate="show"
                    className="flex flex-wrap justify-center
                      gap-6 sm:gap-12"
                  >
                    {[
                      { value: "500+", label: "Products Sold",   icon: ShoppingBag },
                      { value: "4.9",  label: "Average Rating",  icon: Star        },
                      { value: "200+", label: "Happy Customers", icon: Users       },
                      { value: "100%", label: "Handmade Items",  icon: Award       },
                    ].map((stat) => {
                      const StatIcon = stat.icon;
                      return (
                        <motion.div
                          key={stat.label}
                          variants={fadeUp}
                          className="text-center"
                        >
                          <div className="flex items-center justify-center
                            gap-1 mb-0.5">
                            <StatIcon size={13}
                              className="hidden sm:block"
                              style={{ color: "#d4b26a" }} />
                            <p
                              className="text-2xl sm:text-3xl font-black
                                leading-tight"
                              style={{
                                background:
                                  "linear-gradient(to right,#d4b26a,#264670)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor:  "transparent",
                                backgroundClip:       "text",
                              }}
                            >
                              {stat.value}
                            </p>
                          </div>
                          <p className="text-[11px] sm:text-sm font-medium"
                            style={{ color: "#4f545f" }}>
                            {stat.label}
                          </p>
                        </motion.div>
                      );
                    })}
                  </motion.div>
                </motion.div>
              </div>

              {/* Scroll hint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2 }}
                className="absolute bottom-6 sm:bottom-8 left-1/2
                  -translate-x-1/2 flex flex-col items-center gap-1"
                style={{ color: "rgba(79,84,95,0.6)" }}
              >
                <span className="text-[10px] sm:text-xs font-medium
                  tracking-widest uppercase">
                  Scroll
                </span>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <ChevronDown size={16} />
                </motion.div>
              </motion.div>
            </section>

            {/* ── CATEGORIES ────────────────────────────────────────── */}
            <section className="py-14 sm:py-20 px-4"
              style={{ backgroundColor: "#ffffff" }}>
              <div className="max-w-6xl mx-auto">
                <motion.div
                  variants={fadeUp} initial="hidden"
                  whileInView="show" viewport={{ once: true }}
                  className="text-center mb-10 sm:mb-14"
                >
                  <span
                    className="inline-flex items-center gap-2 px-4 py-1.5
                      rounded-full text-[10px] sm:text-xs font-bold
                      tracking-widest uppercase mb-4"
                    style={{
                      background: "rgba(212,178,106,0.15)",
                      color:      "#13213c",
                      border:     "1px solid rgba(212,178,106,0.35)",
                    }}
                  >
                    Our Collections
                  </span>
                  <h2 className="section-title mb-3 sm:mb-4">
                    Shop by Category
                  </h2>
                  <p className="text-sm sm:text-base max-w-md mx-auto"
                    style={{ color: "#4f545f" }}>
                    Four handcrafted collections, each made with unique
                    materials and overflowing creativity.
                  </p>
                </motion.div>

                <motion.div
                  variants={stagger} initial="hidden"
                  whileInView="show" viewport={{ once: true }}
                  className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5"
                >
                  {categories.map((cat) => {
                    const CatIcon = cat.icon;
                    return (
                      <motion.div key={cat.label} variants={fadeUp}>
                        <Link
                          to={`/shop?category=${cat.label}`}
                          className="group block rounded-2xl sm:rounded-3xl
                            overflow-hidden transition-all duration-300
                            hover:-translate-y-1 sm:hover:-translate-y-2"
                          style={{
                            background:  "var(--glass-bg)",
                            border:      "1px solid var(--glass-border)",
                            boxShadow:   "var(--clay-shadow)",
                          }}
                        >
                          <div className="h-1.5 sm:h-2 w-full"
                            style={cat.barStyle} />
                          <div className="p-4 sm:p-6 text-center">
                            <motion.div
                              whileHover={{ scale: 1.1, rotate: 6 }}
                              transition={{
                                type: "spring",
                                stiffness: 400, damping: 15,
                              }}
                              className="w-12 h-12 sm:w-16 sm:h-16
                                mx-auto rounded-xl sm:rounded-2xl
                                flex items-center justify-center
                                mb-3 sm:mb-4 shadow-lg relative"
                              style={cat.style}
                            >
                              <CatIcon size={20}
                                className="text-white sm:hidden relative z-10"
                                strokeWidth={1.8} />
                              <CatIcon size={26}
                                className="text-white hidden sm:block relative z-10"
                                strokeWidth={1.8} />
                            </motion.div>
                            <h3 className="font-bold text-sm sm:text-base
                              mb-0.5 sm:mb-1" style={{ color: "#13213c" }}>
                              {cat.label}
                            </h3>
                            <p className="text-[10px] sm:text-xs leading-snug"
                              style={{ color: "#4f545f" }}>
                              {cat.desc}
                            </p>
                            <div
                              className="mt-3 sm:mt-4 flex items-center
                                justify-center gap-1 text-[10px] sm:text-xs
                                font-semibold opacity-0
                                group-hover:opacity-100
                                transition-opacity duration-200"
                              style={{ color: cat.hoverColor }}
                            >
                              Shop now
                              <ArrowRight size={10} className="sm:hidden" />
                              <ArrowRight size={12}
                                className="hidden sm:block" />
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </section>

            {/* ── TRUST BADGES ──────────────────────────────────────── */}
            <section
              className="relative py-12 sm:py-16 px-4 overflow-hidden"
              style={{
                background:
                  "linear-gradient(to right,#13213c,#264670,#13213c)",
              }}
            >
              <div className="absolute inset-0 opacity-[0.06]
                pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle,#d4b26a 1px,transparent 1px)",
                  backgroundSize: "28px 28px",
                }} />
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

              <div className="relative max-w-5xl mx-auto">
                <motion.div
                  variants={stagger} initial="hidden"
                  whileInView="show" viewport={{ once: true }}
                  className="grid grid-cols-2 lg:grid-cols-4
                    gap-3 sm:gap-6"
                >
                  {trustBadges.map((badge) => {
                    const Icon = badge.icon;
                    return (
                      <motion.div
                        key={badge.label}
                        variants={fadeUp}
                        className="flex flex-col items-center text-center
                          gap-2 sm:gap-3 p-4 sm:p-5
                          rounded-2xl sm:rounded-3xl backdrop-blur-sm"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          border:     "1px solid rgba(212,178,106,0.2)",
                        }}
                      >
                        <div className="w-10 h-10 sm:w-12 sm:h-12
                          rounded-xl sm:rounded-2xl flex items-center
                          justify-center shadow-md"
                          style={{
                            background: "rgba(212,178,106,0.2)",
                            border:     "1px solid rgba(212,178,106,0.3)",
                          }}>
                          <Icon size={18} className="sm:hidden"
                            style={{ color: "#d4b26a" }} />
                          <Icon size={22} className="hidden sm:block"
                            style={{ color: "#d4b26a" }} />
                        </div>
                        <div>
                          <p className="font-bold text-white
                            text-xs sm:text-sm">
                            {badge.label}
                          </p>
                          <p className="text-[10px] sm:text-xs mt-0.5"
                            style={{ color: "rgba(255,255,255,0.65)" }}>
                            {badge.value}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              </div>
            </section>

            {/* ── TESTIMONIALS ──────────────────────────────────────── */}
            <section className="py-14 sm:py-20 px-4"
              style={{ backgroundColor: "#ffffff" }}>
              <div className="max-w-3xl mx-auto">
                <motion.div
                  variants={fadeUp} initial="hidden"
                  whileInView="show" viewport={{ once: true }}
                  className="text-center mb-8 sm:mb-12"
                >
                  <span
                    className="inline-flex items-center gap-2 px-4 py-1.5
                      rounded-full text-[10px] sm:text-xs font-bold
                      tracking-widest uppercase mb-4"
                    style={{
                      background: "rgba(212,178,106,0.15)",
                      color:      "#13213c",
                      border:     "1px solid rgba(212,178,106,0.35)",
                    }}
                  >
                    Testimonials
                  </span>
                  <h2 className="section-title">
                    What Our Customers Say
                  </h2>
                </motion.div>

                <div className="relative min-h-[180px] sm:min-h-[200px]">
                  <AnimatePresence mode="wait">
                    {testimonials.map((t, i) =>
                      i === activeTestimonial && (
                        <motion.div
                          key={t.name}
                          initial={{ opacity: 0, y: 20  }}
                          animate={{ opacity: 1, y: 0   }}
                          exit={{    opacity: 0, y: -20 }}
                          transition={{ duration: 0.4 }}
                          className="rounded-2xl sm:rounded-3xl p-6 sm:p-8
                            shadow-lg text-center"
                          style={{
                            background:
                              "linear-gradient(135deg,#f3f4f7,#eef0f6)",
                            border:    "1px solid rgba(19,33,60,0.08)",
                            boxShadow: "var(--clay-shadow)",
                          }}
                        >
                          <div className="flex justify-center gap-1
                            mb-4 sm:mb-5">
                            {Array.from({ length: t.stars }).map((_, j) => (
                              <Star key={j} size={16}
                                style={{ color: "#d4b26a", fill: "#d4b26a" }} />
                            ))}
                          </div>
                          <p className="text-sm sm:text-lg leading-relaxed
                            italic mb-4 sm:mb-6"
                            style={{ color: "#13213c" }}>
                            "{t.text}"
                          </p>
                          <div className="flex items-center justify-center
                            gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-11 sm:h-11
                              rounded-full flex items-center justify-center
                              text-white font-bold text-sm shadow-md"
                              style={t.gradientStyle}>
                              {t.avatar}
                            </div>
                            <span className="font-semibold
                              text-sm sm:text-base"
                              style={{ color: "#13213c" }}>
                              {t.name}
                            </span>
                          </div>
                        </motion.div>
                      )
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex justify-center gap-2 mt-4 sm:mt-6">
                  {testimonials.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveTestimonial(i)}
                      className="transition-all duration-300 rounded-full"
                      style={{
                        width:  i === activeTestimonial ? "20px" : "8px",
                        height: "8px",
                        background:
                          i === activeTestimonial
                            ? "linear-gradient(to right,#d4b26a,#264670)"
                            : "rgba(19,33,60,0.15)",
                      }}
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* ── FINAL CTA ─────────────────────────────────────────── */}
            <section className="py-16 sm:py-24 px-4"
              style={{
                backgroundColor: "var(--color-oxford-gray-light)",
              }}>
              <div className="max-w-3xl mx-auto">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.6, ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <GradientCard padding="lg">
                    <motion.div
                      animate={{ y: [0, -8, 0], rotate: [0, 6, -6, 0] }}
                      transition={{ duration: 3.5, repeat: Infinity,
                        ease: "easeInOut" }}
                      className="relative inline-block mb-4 sm:mb-6"
                    >
                      <div className="relative w-16 h-16 sm:w-20 sm:h-20
                        rounded-2xl sm:rounded-3xl flex items-center
                        justify-center"
                        style={{
                          background:     "rgba(255,255,255,0.15)",
                          backdropFilter: "blur(8px)",
                          border:         "2px solid rgba(255,255,255,0.3)",
                        }}>
                        <Heart size={28}
                          className="text-white relative z-10 sm:hidden"
                          strokeWidth={1.6}
                          fill="rgba(255,255,255,0.3)" />
                        <Heart size={34}
                          className="text-white relative z-10 hidden sm:block"
                          strokeWidth={1.6}
                          fill="rgba(255,255,255,0.3)" />
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 5, repeat: Infinity,
                            ease: "linear" }}
                          className="absolute -top-2 -right-2 sm:-top-2.5
                            sm:-right-2.5 w-6 h-6 sm:w-7 sm:h-7 rounded-full
                            flex items-center justify-center shadow-md"
                          style={{
                            background:
                              "linear-gradient(135deg,#d4b26a,#c69e4f)",
                            border: "2px solid rgba(255,255,255,0.7)",
                          }}>
                          <Sparkles size={9}
                            className="text-white sm:hidden" />
                          <Sparkles size={11}
                            className="text-white hidden sm:block" />
                        </motion.div>
                      </div>
                    </motion.div>

                    <h2 className="text-2xl sm:text-4xl font-extrabold
                      text-white mb-3 sm:mb-4 leading-tight">
                      Ready to Find Your Perfect
                      <br className="hidden sm:block" />
                      {" "}Handmade Treasure?
                    </h2>
                    <p className="text-sm sm:text-lg mb-7 sm:mb-10
                      max-w-lg mx-auto"
                      style={{ color: "rgba(255,255,255,0.8)" }}>
                      Join hundreds of happy customers who've discovered the
                      warmth and beauty of CraftNest's handmade collection.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4
                      justify-center">
                      <Link to="/shop" className="w-full sm:w-auto">
                        <motion.button
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full sm:w-auto inline-flex items-center
                            justify-center gap-2 px-7 py-3.5 rounded-2xl
                            font-extrabold text-sm transition-all duration-200
                            shadow-xl"
                          style={{
                            background: "#ffffff",
                            color:      "#13213c",
                            boxShadow:  "0 8px 24px rgba(0,0,0,0.15)",
                          }}>
                          <ShoppingBag size={17} />
                          Browse the Shop
                          <ArrowRight size={14} />
                        </motion.button>
                      </Link>

                      <Link to="/signup" className="w-full sm:w-auto">
                        <motion.button
                          whileHover={{ y: -2, scale: 1.02 }}
                          whileTap={{ scale: 0.97 }}
                          className="w-full sm:w-auto inline-flex items-center
                            justify-center gap-2 px-7 py-3.5 rounded-2xl
                            font-extrabold text-sm transition-all duration-200"
                          style={{
                            border:     "2px solid rgba(255,255,255,0.55)",
                            color:      "#ffffff",
                            background: "transparent",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(255,255,255,0.1)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                          }}>
                          <UserPlus size={17} />
                          Join for Free
                        </motion.button>
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center
                      justify-center gap-3 sm:gap-6 mt-6 sm:mt-8
                      pt-5 sm:pt-6"
                      style={{
                        borderTop: "1px solid rgba(255,255,255,0.18)",
                      }}>
                      {[
                        { icon: BadgeCheck, label: "100% Handmade" },
                        { icon: Star,       label: "4.9 Rated"     },
                        { icon: Truck,      label: "Fast Shipping"  },
                        { icon: Shield,     label: "SSL Secured"    },
                      ].map(({ icon: Icon, label }) => (
                        <div key={label}
                          className="flex items-center gap-1 sm:gap-1.5
                            text-[10px] sm:text-xs font-semibold"
                          style={{ color: "rgba(255,255,255,0.72)" }}>
                          <Icon size={11}
                            style={{ color: "rgba(212,178,106,0.9)" }} />
                          {label}
                        </div>
                      ))}
                    </div>
                  </GradientCard>
                </motion.div>
              </div>
            </section>

            {/* ── Footer strip ──────────────────────────────────────── */}
            <div className="py-4 sm:py-6 px-4 text-center"
              style={{
                backgroundColor: "#ffffff",
                borderTop:       "1px solid rgba(19,33,60,0.08)",
              }}>
              <p className="text-xs sm:text-sm" style={{ color: "#4f545f" }}>
                © {new Date().getFullYear()}{" "}
                <span className="font-semibold" style={{ color: "#d4b26a" }}>
                  CraftNest
                </span>
                {" "}· Handcrafted with{" "}
                <Heart size={11} className="inline mx-0.5"
                  style={{ color: "#13213c", fill: "#13213c" }} />
                {" "}· All rights reserved.
              </p>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Landing;