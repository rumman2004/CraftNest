import { motion, useScroll, useTransform } from "framer-motion";
import { useRef }       from "react";
import {
  HandMetal, Leaf, Rocket, Heart, Sparkles, ArrowRight,
  Star, Users, ShoppingBag, Award, ShieldCheck, BadgeCheck,
  Scissors, Flower2, Gem,
} from "lucide-react";
import { Link }         from "react-router-dom";
import HeroSection      from "../../components/sections/HeroSection";
import CategorySection  from "../../components/sections/CategorySection";
import FeaturedProducts from "../../components/sections/FeaturedProducts";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:      "#13213c",
  navyLight: "#264670",
  gold:      "#d4b26a",
  text:      "#13213c",
  textSub:   "#4f6080",
  textMuted: "rgba(19,33,60,0.4)",
  border:    "rgba(19,33,60,0.07)",
  surface:   "#ffffff",
  bg:        "#f4f5f8",
};

// ── Data ───────────────────────────────────────────────────────────────────
const features = [
  {
    icon:      HandMetal,
    cornerIcon:Scissors,
    title:     "100% Handmade",
    desc:      "Every product is lovingly crafted by hand — no mass production, ever.",
    accent:    C.navyLight,
    bg:        "linear-gradient(135deg,#f3f4f7,#e8eaf0)",
    border:    "rgba(19,33,60,0.1)",
    glow:      "rgba(19,33,60,0.15)",
  },
  {
    icon:      Leaf,
    cornerIcon:Flower2,
    title:     "Eco-Friendly",
    desc:      "Sustainable, earth-conscious materials woven into every stitch.",
    accent:    C.navyLight,
    bg:        "linear-gradient(135deg,#f3f4f7,#eaecf2)",
    border:    "rgba(38,70,112,0.1)",
    glow:      "rgba(38,70,112,0.15)",
  },
  {
    icon:      Rocket,
    cornerIcon:Sparkles,
    title:     "Fast Shipping",
    desc:      "Orders are carefully packed and dispatched within 24–48 hours.",
    accent:    C.gold,
    bg:        "linear-gradient(135deg,#fdf8ee,#f7f0dc)",
    border:    "rgba(212,178,106,0.2)",
    glow:      "rgba(212,178,106,0.25)",
  },
  {
    icon:      Heart,
    cornerIcon:Gem,
    title:     "Made with Heart",
    desc:      "Each piece carries a story, a feeling, and a personal touch.",
    accent:    C.navyLight,
    bg:        "linear-gradient(135deg,#f3f4f7,#e8eaf0)",
    border:    "rgba(19,33,60,0.1)",
    glow:      "rgba(19,33,60,0.15)",
  },
];

const stats = [
  { icon: ShoppingBag, value: "500+", label: "Products Sold"   },
  { icon: Users,       value: "200+", label: "Happy Customers" },
  { icon: Star,        value: "4.9",  label: "Average Rating"  },
  { icon: Award,       value: "100%", label: "Handcrafted"     },
];

const trust = [
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: Star,        label: "4.9 Rated"       },
  { icon: Rocket,      label: "Fast Shipping"   },
  { icon: BadgeCheck,  label: "100% Handmade"   },
];

// ── Animation variants ─────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show:   {
    opacity: 1, y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Inline sub-components ──────────────────────────────────────────────────

// Stat card used in the dark strip
const StatCard = ({ icon: Icon, value, label }) => (
  <motion.div
    variants={fadeUp}
    className="flex flex-col items-center gap-2 text-center"
  >
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-1"
      style={{
        background: "rgba(255,255,255,0.08)",
        border:     "1px solid rgba(212,178,106,0.2)",
      }}
    >
      <Icon size={20} style={{ color: C.gold }} />
    </div>
    <p
      className="text-2xl sm:text-3xl font-black"
      style={{ color: "#ffffff" }}
    >
      {value}
    </p>
    <p className="text-xs font-semibold" style={{ color: "rgba(255,255,255,0.6)" }}>
      {label}
    </p>
  </motion.div>
);

// Feature card for "Why CraftNest"
const FeatureCard = ({ icon: Icon, cornerIcon: CornerIcon, title, desc,
  accent, bg, border, glow }) => (
  <motion.div
    variants={fadeUp}
    whileHover={{ y: -6, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 280, damping: 22 }}
    className="relative rounded-3xl p-6 overflow-hidden cursor-default"
    style={{
      background:  bg,
      border:      `1px solid ${border}`,
      boxShadow:   `0 8px 24px ${glow}`,
    }}
  >
    {/* Corner icon watermark */}
    <div className="absolute -top-3 -right-3 pointer-events-none">
      <CornerIcon
        size={52}
        strokeWidth={0.8}
        style={{ color: `${accent}18` }}
      />
    </div>

    {/* Icon bubble */}
    <div
      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
      style={{
        background: `linear-gradient(135deg, ${accent}, ${
          accent === C.gold ? "#b8922e" : C.navy
        })`,
        boxShadow: `0 4px 14px ${glow}`,
      }}
    >
      <Icon size={22} className="text-white" strokeWidth={1.8} />
    </div>

    <h3
      className="text-base font-black mb-2"
      style={{ color: C.text }}
    >
      {title}
    </h3>
    <p className="text-xs leading-relaxed" style={{ color: C.textSub }}>
      {desc}
    </p>

    {/* Bottom accent line */}
    <div
      className="absolute bottom-0 left-0 right-0 h-[2px]"
      style={{
        background: `linear-gradient(to right, transparent, ${accent}, transparent)`,
      }}
    />
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
// Main page
// ══════════════════════════════════════════════════════════════════════════
const PublicHome = () => {
  const featRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target:  featRef,
    offset:  ["start end", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pb-16 sm:pb-24"
    >
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <HeroSection />

      {/* ── Categories ────────────────────────────────────────────────── */}
      <CategorySection />

      {/* ── Featured Products ─────────────────────────────────────────── */}
      <FeaturedProducts />

      {/* ── Stats strip ───────────────────────────────────────────────── */}
      <section
        className="relative py-10 sm:py-14 overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, #13213c 0%, #264670 50%, #13213c 100%)",
        }}
      >
        {/* Gold dot texture */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d4b26a 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* Top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(to right, transparent, #d4b26a, transparent)",
          }}
        />
        {/* Bottom accent */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(to right, transparent, #d4b26a, transparent)",
          }}
        />
        {/* Corner blobs */}
        <div
          className="absolute -top-12 -left-12 w-48 h-48
            rounded-full blur-2xl pointer-events-none"
          style={{ background: "rgba(212,178,106,0.08)" }}
        />
        <div
          className="absolute -bottom-12 -right-12 w-48 h-48
            rounded-full blur-2xl pointer-events-none"
          style={{ background: "rgba(212,178,106,0.08)" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10"
          >
            {stats.map((s) => <StatCard key={s.label} {...s} />)}
          </motion.div>
        </div>
      </section>

      {/* ── Why CraftNest ─────────────────────────────────────────────── */}
      <section
        ref={featRef}
        className="relative py-14 sm:py-20 overflow-hidden"
        style={{ background: C.bg }}
      >
        {/* Parallax radial */}
        <motion.div
          style={{ y: bgY }}
          className="absolute inset-0 pointer-events-none"
        >
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse at top," +
                "rgba(212,178,106,0.08) 0%, transparent 65%)",
            }}
          />
        </motion.div>

        {/* Ambient blobs */}
        <motion.div
          animate={{ x: [0, 18, 0], y: [0, -18, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-16 w-72 h-72 rounded-full
            blur-3xl pointer-events-none"
          style={{ background: "rgba(212,178,106,0.1)" }}
        />
        <motion.div
          animate={{ x: [0, -14, 0], y: [0, 14, 0] }}
          transition={{
            duration: 10, repeat: Infinity,
            ease: "easeInOut", delay: 2,
          }}
          className="absolute bottom-20 left-16 w-64 h-64 rounded-full
            blur-3xl pointer-events-none"
          style={{ background: "rgba(38,70,112,0.07)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section heading */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-14"
          >
            <motion.span
              variants={fadeUp}
              className="inline-flex items-center gap-2 px-3 py-1.5
                rounded-full text-[10px] font-bold tracking-widest
                uppercase mb-4"
              style={{
                background: "rgba(212,178,106,0.15)",
                color:      C.text,
                border:     "1px solid rgba(212,178,106,0.35)",
              }}
            >
              <Sparkles size={11} style={{ color: C.gold }} />
              Our Promise
            </motion.span>

            <motion.h2
              variants={fadeUp}
              className="text-2xl sm:text-3xl lg:text-4xl font-black
                tracking-tight mb-3"
              style={{ color: C.text }}
            >
              Why Choose{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #d4b26a, #264670)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:  "transparent",
                }}
              >
                CraftNest?
              </span>
            </motion.h2>

            <motion.p
              variants={fadeUp}
              className="text-sm sm:text-base max-w-xl mx-auto
                leading-relaxed"
              style={{ color: C.textSub }}
            >
              Every purchase supports independent artisans and brings a
              one-of-a-kind handmade piece into your life.
            </motion.p>
          </motion.div>

          {/* Feature cards */}
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4
              gap-4 sm:gap-5 lg:gap-6"
          >
            {features.map((f) => <FeatureCard key={f.title} {...f} />)}
          </motion.div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-20 px-4"
        style={{ background: C.surface }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* CTA card */}
            <div
              className="relative rounded-[2.5rem] px-6 sm:px-12 py-12
                sm:py-16 text-center overflow-hidden"
              style={{
                background:
                  "linear-gradient(135deg, #13213c 0%, #264670 60%," +
                  "#13213c 100%)",
                boxShadow:
                  "0 32px 80px rgba(19,33,60,0.3)," +
                  "0 8px 32px rgba(19,33,60,0.2)",
              }}
            >
              {/* Gold dot texture */}
              <div
                className="absolute inset-0 opacity-[0.05]
                  pointer-events-none"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #d4b26a 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              {/* Top accent */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px]"
                style={{
                  background:
                    "linear-gradient(to right, transparent," +
                    "#d4b26a 40%, #d4b26a 60%, transparent)",
                }}
              />
              {/* Corner glow */}
              <div
                className="absolute -top-20 -right-20 w-64 h-64
                  rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(212,178,106,0.12)" }}
              />
              <div
                className="absolute -bottom-20 -left-20 w-64 h-64
                  rounded-full blur-3xl pointer-events-none"
                style={{ background: "rgba(212,178,106,0.08)" }}
              />

              {/* Animated icon */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 6, -6, 0] }}
                transition={{
                  duration: 3.5, repeat: Infinity, ease: "easeInOut",
                }}
                className="relative inline-block mb-5 sm:mb-7"
              >
                <motion.div
                  animate={{ scale: [1, 1.25, 1], opacity: [0.2, 0.45, 0.2] }}
                  transition={{
                    duration: 3.5, repeat: Infinity, ease: "easeInOut",
                  }}
                  className="absolute inset-0 rounded-3xl blur-2xl
                    scale-125 pointer-events-none"
                  style={{ background: "rgba(212,178,106,0.3)" }}
                />
                <div
                  className="relative w-16 h-16 sm:w-20 sm:h-20
                    rounded-2xl sm:rounded-3xl flex items-center
                    justify-center"
                  style={{
                    background:     "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    border:         "2px solid rgba(255,255,255,0.25)",
                    boxShadow:      "0 8px 32px rgba(0,0,0,0.15)",
                  }}
                >
                  <Heart
                    size={30}
                    className="text-white relative z-10"
                    strokeWidth={1.6}
                    fill="rgba(255,255,255,0.25)"
                  />
                  {/* Spinning gold badge */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 5, repeat: Infinity, ease: "linear",
                    }}
                    className="absolute -top-2.5 -right-2.5 w-6 h-6
                      sm:w-7 sm:h-7 rounded-full flex items-center
                      justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, #d4b26a, #c69e4f)",
                      border: "2px solid rgba(255,255,255,0.6)",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}
                  >
                    <Sparkles
                      size={11}
                      className="text-white"
                      strokeWidth={2}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Heading */}
              <h2
                className="text-2xl sm:text-4xl lg:text-5xl font-black
                  text-white leading-tight mb-3 sm:mb-5"
              >
                Ready to Find Your
                <br className="hidden sm:block" />
                {" "}Perfect Handmade Piece?
              </h2>

              {/* Sub */}
              <p
                className="text-sm sm:text-base mb-8 sm:mb-10
                  max-w-lg mx-auto leading-relaxed"
                style={{ color: "rgba(255,255,255,0.78)" }}
              >
                Browse hundreds of unique handcrafted items made with love —
                crochet, embroidery, woolen & more.
              </p>

              {/* Buttons */}
              <div
                className="flex flex-col sm:flex-row items-center
                  justify-center gap-3 sm:gap-4"
              >
                <Link to="/shop" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{  scale: 0.97        }}
                    className="w-full sm:w-auto inline-flex items-center
                      justify-center gap-2 px-7 py-3.5 rounded-2xl
                      font-extrabold text-sm transition-all duration-200"
                    style={{
                      background: "#ffffff",
                      color:      C.navy,
                      boxShadow:  "0 8px 24px rgba(0,0,0,0.15)",
                    }}
                  >
                    <ShoppingBag size={16} />
                    Browse the Shop
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </motion.button>
                </Link>

                <Link to="/signup" className="w-full sm:w-auto">
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{  scale: 0.97        }}
                    className="w-full sm:w-auto inline-flex items-center
                      justify-center gap-2 px-7 py-3.5 rounded-2xl
                      font-extrabold text-sm transition-all duration-200"
                    style={{
                      border:     "2px solid rgba(255,255,255,0.45)",
                      color:      "#ffffff",
                      background: "transparent",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.1)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <Sparkles size={15} />
                    Join for Free
                  </motion.button>
                </Link>
              </div>

              {/* Trust row */}
              <div
                className="flex flex-wrap items-center justify-center
                  gap-4 sm:gap-8 mt-8 sm:mt-10 pt-6 sm:pt-7"
                style={{
                  borderTop: "1px solid rgba(255,255,255,0.14)",
                }}
              >
                {trust.map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1.5 text-xs
                      font-semibold"
                    style={{ color: "rgba(255,255,255,0.68)" }}
                  >
                    <Icon size={13} style={{ color: "rgba(212,178,106,0.9)" }} />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default PublicHome;