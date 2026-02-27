import { useRef }                          from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link }                            from "react-router-dom";
import {
  Heart, Leaf, Star, Sparkles, ShoppingBag, Users,
  ArrowRight, Quote, BadgeCheck, Palette, Scissors,
  Flower2, Shirt, MapPin, Clock, Award, Gem,
} from "lucide-react";
import Button                               from "../../components/ui/Button";
import { GradientCard, StatCard, TeamCard } from "../../components/ui/Cards";

// ── Data ───────────────────────────────────────────────────────────────────
const values = [
  {
    icon: Heart, title: "Made with Love",
    desc: "Every stitch, knot, and brushstroke is placed with genuine care.",
    gradient: "bg-gradient-to-br from-[#13213c] to-[#264670]",
    glow:     "shadow-[rgba(19,33,60,0.2)]",
    bg:       "bg-gradient-to-br from-[#f3f4f7] to-[#e8eaf0]",
    border:   "border border-[#13213c]/10",
    text:     "text-[#264670]",
    badge:    "bg-[#264670]/10 text-[#13213c]",
  },
  {
    icon: Leaf, title: "Eco-Friendly",
    desc: "Sustainable, earth-conscious materials woven into every stitch we make.",
    gradient: "bg-gradient-to-br from-[#264670] to-[#13213c]",
    glow:     "shadow-[rgba(38,70,112,0.2)]",
    bg:       "bg-gradient-to-br from-[#f3f4f7] to-[#eaecf2]",
    border:   "border border-[#264670]/10",
    text:     "text-[#264670]",
    badge:    "bg-[#264670]/10 text-[#13213c]",
  },
  {
    icon: Star, title: "Uniquely Yours",
    desc: "No two handmade pieces are exactly alike. Each carries its own personality.",
    gradient: "bg-gradient-to-br from-[#d4b26a] to-[#c69e4f]",
    glow:     "shadow-[rgba(212,178,106,0.3)]",
    bg:       "bg-gradient-to-br from-[#fdf8ee] to-[#f7f0dc]",
    border:   "border border-[#d4b26a]/20",
    text:     "text-[#c69e4f]",
    badge:    "bg-[#d4b26a]/15 text-[#13213c]",
  },
  {
    icon: Sparkles, title: "Premium Quality",
    desc: "Only the finest yarns, threads, and materials make it into our products.",
    gradient: "bg-gradient-to-br from-[#13213c] to-[#264670]",
    glow:     "shadow-[rgba(19,33,60,0.2)]",
    bg:       "bg-gradient-to-br from-[#f3f4f7] to-[#e8eaf0]",
    border:   "border border-[#13213c]/10",
    text:     "text-[#264670]",
    badge:    "bg-[#264670]/10 text-[#13213c]",
  },
];

const team = [
  {
    name: "Aria Thompson", role: "Founder & Lead Crafter",
    avatarIcon: Scissors, specialtyIcon: Scissors,
    specialty: "Crochet & Knitting",
    gradient: "bg-gradient-to-br from-[#13213c] to-[#264670]",
    glow: "shadow-[rgba(19,33,60,0.25)]",
    quote: "Every loop is a little act of love.", years: "8 yrs exp",
  },
  {
    name: "Maya Patel", role: "Embroidery Artist",
    avatarIcon: Palette, specialtyIcon: Palette,
    specialty: "Dream Hoops & Wall Art",
    gradient: "bg-gradient-to-br from-[#264670] to-[#13213c]",
    glow: "shadow-[rgba(38,70,112,0.25)]",
    quote: "Thread and needle, my paintbrush.", years: "6 yrs exp",
  },
  {
    name: "Lily Chen", role: "Floral Designer",
    avatarIcon: Flower2, specialtyIcon: Flower2,
    specialty: "Pipe Cleaner Bouquets",
    gradient: "bg-gradient-to-br from-[#d4b26a] to-[#c69e4f]",
    glow: "shadow-[rgba(212,178,106,0.3)]",
    quote: "Blooms that never wilt.", years: "5 yrs exp",
  },
  {
    name: "Sophie Williams", role: "Textile Artist",
    avatarIcon: Shirt, specialtyIcon: Shirt,
    specialty: "Woolen Scarves & Wraps",
    gradient: "bg-gradient-to-br from-[#13213c] to-[#264670]",
    glow: "shadow-[rgba(19,33,60,0.25)]",
    quote: "Warmth you can feel and see.", years: "7 yrs exp",
  },
];

const stats = [
  { value: "500+", label: "Products Sold",   icon: ShoppingBag },
  { value: "4.9",  label: "Average Rating",  icon: Star        },
  { value: "200+", label: "Happy Customers", icon: Users       },
  { value: "100%", label: "Handmade",        icon: Heart       },
];

const craftTiles = [
  {
    icon: Scissors, label: "Crochet",
    style: { background: "linear-gradient(135deg, #13213c, #264670)" },
    delay: 0,
  },
  {
    icon: Palette, label: "Embroidery",
    style: { background: "linear-gradient(135deg, #264670, #13213c)" },
    delay: 0.1,
  },
  {
    icon: Flower2, label: "Florals",
    style: { background: "linear-gradient(135deg, #d4b26a, #c69e4f)" },
    delay: 0.2,
  },
  {
    icon: Shirt, label: "Woolen",
    style: { background: "linear-gradient(135deg, #1a3254, #264670)" },
    delay: 0.3,
  },
];

const floatingIcons = [
  { icon: Sparkles, x: "5%",  y: "14%", size: 16, dur: 3.2, delay: 0   },
  { icon: Heart,    x: "90%", y: "10%", size: 14, dur: 3.8, delay: 0.5 },
  { icon: Gem,      x: "3%",  y: "60%", size: 14, dur: 3.5, delay: 0.8 },
  { icon: Star,     x: "92%", y: "55%", size: 13, dur: 2.9, delay: 0.3 },
  { icon: Flower2,  x: "80%", y: "84%", size: 14, dur: 4.0, delay: 0.2 },
  { icon: Leaf,     x: "14%", y: "87%", size: 13, dur: 3.3, delay: 0.6 },
];

const fadeUp    = { hidden: { opacity: 0, y: 36  }, show: { opacity: 1, y: 0  } };
const fadeLeft  = { hidden: { opacity: 0, x: -36 }, show: { opacity: 1, x: 0  } };
const fadeRight = { hidden: { opacity: 0, x: 36  }, show: { opacity: 1, x: 0  } };
const stagger   = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

// ── Section heading ────────────────────────────────────────────────────────
const SectionHeading = ({ badge, badgeIcon: BadgeIcon, title, accent, sub }) => (
  <motion.div
    variants={stagger}
    initial="hidden"
    whileInView="show"
    viewport={{ once: true }}
    className="text-center mb-10 sm:mb-14"
  >
    <motion.div variants={fadeUp}>
      <span
        className="inline-flex items-center gap-1.5 sm:gap-2
          px-3 sm:px-4 py-1 sm:py-1.5 rounded-full
          text-[10px] sm:text-xs font-bold tracking-widest uppercase
          mb-4 sm:mb-5"
        style={{
          background: "rgba(212,178,106,0.15)",
          color: "#13213c",
          border: "1px solid rgba(212,178,106,0.35)",
        }}
      >
        <BadgeIcon size={11} />
        {badge}
      </span>
    </motion.div>

    <motion.h2 variants={fadeUp} className="section-title mb-3 sm:mb-4">
      {title}{" "}
      <span className="relative inline-block">
        {accent}
        <motion.svg
          viewBox="0 0 220 10"
          className="absolute -bottom-1 left-0 w-full"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <motion.path
            d="M 0 5 Q 55 0 110 5 Q 165 10 220 5"
            fill="none"
            stroke="url(#sectionGrad)"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.8 }}
          />
          <defs>
            <linearGradient id="sectionGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%"   stopColor="#d4b26a" />
              <stop offset="100%" stopColor="#264670" />
            </linearGradient>
          </defs>
        </motion.svg>
      </span>
    </motion.h2>

    {sub && (
      <motion.p
        variants={fadeUp}
        className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed"
        style={{ color: "#4f545f" }}
      >
        {sub}
      </motion.p>
    )}
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
const About = () => {
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: heroRef, offset: ["start start", "end start"],
  });
  const heroY       = useTransform(scrollYProgress, [0, 1],   ["0%", "25%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pb-16 sm:pb-24 overflow-x-hidden"
      style={{ backgroundColor: "#ffffff" }}
    >

      {/* ── HERO ──────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative min-h-[85vh] sm:min-h-[88vh]
          flex items-center justify-center overflow-hidden
          px-4 py-16 sm:py-24"
        style={{
          background:
            "linear-gradient(135deg, #f3f4f7 0%, #eef0f6 50%, #f3f4f7 100%)",
        }}
      >
        {/* Grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(19,33,60,0.5) 1px, transparent 1px),
              linear-gradient(90deg, rgba(19,33,60,0.5) 1px, transparent 1px)
            `,
            backgroundSize: "56px 56px",
          }}
        />

        {/* Parallax blobs */}
        <motion.div style={{ y: heroY }} className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-48 -left-48
              w-[400px] sm:w-[580px] h-[400px] sm:h-[580px]
              rounded-full blur-3xl"
            style={{ background: "rgba(212,178,106,0.2)" }}
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.28, 0.15] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
            className="absolute -bottom-48 -right-48
              w-[380px] sm:w-[520px] h-[380px] sm:h-[520px]
              rounded-full blur-3xl"
            style={{ background: "rgba(38,70,112,0.12)" }}
          />
        </motion.div>

        {/* Floating icons */}
        {floatingIcons.map((p, i) => {
          const FloatIcon = p.icon;
          return (
            <motion.div
              key={i}
              className="absolute select-none pointer-events-none hidden sm:block"
              style={{ left: p.x, top: p.y, color: "rgba(212,178,106,0.45)" }}
              animate={{ y: [0, -18, 0], rotate: [0, 12, -12, 0], scale: [1, 1.15, 1] }}
              transition={{
                duration: p.dur, repeat: Infinity,
                ease: "easeInOut", delay: p.delay,
              }}
            >
              <FloatIcon size={p.size} strokeWidth={1.4} />
            </motion.div>
          );
        })}

        {/* Hero content */}
        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center max-w-4xl mx-auto"
        >
          {/* Top badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2
              px-3 sm:px-4 py-1.5 sm:py-2 rounded-full
              text-[10px] sm:text-xs font-bold tracking-widest uppercase
              mb-6 sm:mb-8 shadow-sm"
            style={{
              background: "rgba(255,255,255,0.9)",
              backdropFilter: "blur(8px)",
              border: "1px solid rgba(212,178,106,0.3)",
              color: "#13213c",
            }}
          >
            <Sparkles size={11} style={{ color: "#d4b26a" }} />
            Our Story
            <Sparkles size={11} style={{ color: "#264670" }} />
          </motion.div>

          {/* Logo bubble */}
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
            className="relative inline-block mb-5 sm:mb-7"
          >
            <motion.div
              animate={{ scale: [1, 1.18, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 rounded-[1.5rem] sm:rounded-[1.8rem]
                blur-2xl scale-125 pointer-events-none"
              style={{
                background: "linear-gradient(135deg, #d4b26a, #264670, #13213c)",
              }}
            />
            <div
              className="relative w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28
                rounded-[1.5rem] sm:rounded-[1.8rem]
                flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #13213c, #264670)",
                boxShadow: "0 12px 40px rgba(19,33,60,0.4)",
              }}
            >
              <div className="absolute inset-0 rounded-[1.5rem] sm:rounded-[1.8rem] overflow-hidden pointer-events-none">
                <div
                  className="absolute -top-4 -left-3 w-16 sm:w-20 h-16 sm:h-20
                    rounded-full blur-xl"
                  style={{ background: "rgba(212,178,106,0.2)" }}
                />
              </div>
              <Scissors
                size={16}
                className="absolute sm:hidden"
                strokeWidth={1.2}
                style={{
                  color: "rgba(212,178,106,0.3)",
                  transform: "rotate(-25deg) translate(-10px, 6px)",
                }}
              />
              <Scissors
                size={20}
                className="absolute hidden sm:block"
                strokeWidth={1.2}
                style={{
                  color: "rgba(212,178,106,0.3)",
                  transform: "rotate(-25deg) translate(-13px, 8px)",
                }}
              />
              <Heart
                size={28}
                className="text-white relative z-10 sm:hidden"
                strokeWidth={1.6}
                fill="rgba(255,255,255,0.22)"
              />
              <Heart
                size={34}
                className="text-white relative z-10 hidden sm:block"
                strokeWidth={1.6}
                fill="rgba(255,255,255,0.22)"
              />
              <Sparkles
                size={14}
                className="absolute sm:hidden"
                strokeWidth={1.2}
                style={{
                  color: "rgba(212,178,106,0.35)",
                  transform: "rotate(20deg) translate(11px, -8px)",
                }}
              />
              <Sparkles
                size={18}
                className="absolute hidden sm:block"
                strokeWidth={1.2}
                style={{
                  color: "rgba(212,178,106,0.35)",
                  transform: "rotate(20deg) translate(14px, -10px)",
                }}
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                className="absolute -top-2.5 -right-2.5 sm:-top-3 sm:-right-3
                  w-7 h-7 sm:w-8 sm:h-8 rounded-full
                  flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #d4b26a, #c69e4f)",
                  border: "2px solid rgba(255,255,255,0.85)",
                }}
              >
                <Sparkles size={11} className="text-white sm:hidden" />
                <Sparkles size={13} className="text-white hidden sm:block" />
              </motion.div>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-black
              mb-4 sm:mb-5 leading-[1.08] tracking-tight"
            style={{ color: "#13213c" }}
          >
            Our{" "}
            <span className="relative inline-block">
              <span className="text-gradient">Story</span>
              <motion.svg
                viewBox="0 0 180 10"
                className="absolute -bottom-1 left-0 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <motion.path
                  d="M 0 5 Q 45 0 90 5 Q 135 10 180 5"
                  fill="none"
                  stroke="url(#heroGrad)"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.8, duration: 0.9 }}
                />
                <defs>
                  <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%"   stopColor="#d4b26a" />
                    <stop offset="100%" stopColor="#264670" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-base sm:text-xl max-w-2xl mx-auto
              leading-relaxed mb-8 sm:mb-10"
            style={{ color: "#4f545f" }}
          >
            CraftNest was born from a simple belief — handmade things carry a
            warmth and soul that mass-produced items simply{" "}
            <span className="font-semibold" style={{ color: "#d4b26a" }}>
              can't replicate.
            </span>
          </motion.p>

          {/* Info strip */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="flex flex-wrap justify-center gap-3 sm:gap-8"
          >
            {[
              { icon: MapPin, text: "Handcrafted in India" },
              { icon: Clock,  text: "Est. 2019"            },
              { icon: Award,  text: "200+ Customers"       },
            ].map(({ icon: Icon, text }) => (
              <div
                key={text}
                className="flex items-center gap-1.5 sm:gap-2
                  text-xs sm:text-sm font-semibold"
                style={{ color: "#4f545f" }}
              >
                <div
                  className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg sm:rounded-xl
                    flex items-center justify-center shadow-md"
                  style={{
                    background: "linear-gradient(135deg, #13213c, #264670)",
                    boxShadow: "0 4px 12px rgba(19,33,60,0.25)",
                  }}
                >
                  <Icon size={11} className="text-white sm:hidden" />
                  <Icon size={13} className="text-white hidden sm:block" />
                </div>
                {text}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* ── STORY ─────────────────────────────────────────────────── */}
      <section
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-24"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="grid md:grid-cols-2 gap-10 lg:gap-20 items-center">

          {/* Text */}
          <motion.div
            variants={fadeLeft}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1
                rounded-full text-[10px] sm:text-xs font-bold
                tracking-widest uppercase mb-4 sm:mb-5"
              style={{
                background: "rgba(212,178,106,0.15)",
                color: "#13213c",
                border: "1px solid rgba(212,178,106,0.3)",
              }}
            >
              <Heart size={10} />
              How It Began
            </span>

            <h2
              className="text-2xl sm:text-4xl font-black mb-5 sm:mb-7
                leading-tight tracking-tight"
            >
              <span style={{ color: "#13213c" }}>A Living Room,</span>
              <br />
              <span className="text-gradient">A Ball of Yarn</span>
            </h2>

            <div
              className="space-y-4 sm:space-y-5 leading-relaxed
                text-sm sm:text-[0.95rem]"
              style={{ color: "#4f545f" }}
            >
              <p>
                It started in a small living room with a ball of yarn, a crochet
                hook, and an endless love for creating. What began as a hobby
                quickly became a passion — and then a mission.
              </p>
              <p>
                We noticed that the world was full of things made quickly and
                cheaply, but lacking heart. We wanted to offer something
                different: crafts made slowly, carefully, and with genuine love.
              </p>

              {/* Blockquote */}
              <div
                className="relative pl-4 sm:pl-5 py-1 my-4 sm:my-6"
                style={{ borderLeft: "3px solid #d4b26a" }}
              >
                <Quote
                  size={14}
                  className="sm:hidden mb-2"
                  style={{ color: "#d4b26a", fill: "rgba(212,178,106,0.12)" }}
                />
                <Quote
                  size={16}
                  className="hidden sm:block mb-2"
                  style={{ color: "#d4b26a", fill: "rgba(212,178,106,0.12)" }}
                />
                <p
                  className="italic font-medium text-sm sm:text-base"
                  style={{ color: "#13213c" }}
                >
                  "Today, CraftNest is a growing community of artisans who
                  share that same belief — every product is 100% handmade,
                  every material thoughtfully chosen, every order packed with
                  a little extra love."
                </p>
                <p
                  className="text-[10px] sm:text-xs font-bold mt-2
                    flex items-center gap-1"
                  style={{ color: "#d4b26a" }}
                >
                  <BadgeCheck size={10} />
                  Aria Thompson, Founder
                </p>
              </div>

              <p>
                From crochet to embroidery, woolen wraps to pipe cleaner
                bouquets — each product tells a story of dedication,
                creativity, and craftsmanship.
              </p>
            </div>
          </motion.div>

          {/* Craft tiles */}
          <motion.div
            variants={fadeRight}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="grid grid-cols-2 gap-3 sm:gap-4"
          >
            {craftTiles.map((tile, i) => {
              const TileIcon = tile.icon;
              return (
                <motion.div
                  key={tile.label}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: tile.delay, duration: 0.5 }}
                  whileHover={{ scale: 1.04, rotate: 1.5, y: -4 }}
                  className={`relative h-36 sm:h-44
                    rounded-2xl sm:rounded-3xl
                    flex flex-col items-center justify-center gap-2 sm:gap-3
                    shadow-xl cursor-pointer overflow-hidden
                    ${i % 2 !== 0 ? "mt-4 sm:mt-5" : ""}`}
                  style={tile.style}
                >
                  <div
                    className="absolute inset-0 opacity-[0.08]"
                    style={{
                      backgroundImage:
                        "radial-gradient(circle, #d4b26a 1px, transparent 1px)",
                      backgroundSize: "20px 20px",
                    }}
                  />
                  <div
                    className="absolute -top-5 -right-5 w-16 sm:w-20
                      h-16 sm:h-20 rounded-full blur-xl pointer-events-none"
                    style={{ background: "rgba(212,178,106,0.15)" }}
                  />
                  <div
                    className="relative w-11 h-11 sm:w-14 sm:h-14
                      rounded-xl sm:rounded-2xl
                      flex items-center justify-center shadow-lg"
                    style={{
                      background: "rgba(255,255,255,0.15)",
                      backdropFilter: "blur(4px)",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <TileIcon size={22} className="text-white sm:hidden" strokeWidth={1.6} />
                    <TileIcon size={28} className="text-white hidden sm:block" strokeWidth={1.6} />
                  </div>
                  <span className="relative text-white font-extrabold
                    text-xs sm:text-sm tracking-wide drop-shadow">
                    {tile.label}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── STATS STRIP ───────────────────────────────────────────── */}
      <section
        className="relative py-12 sm:py-16 overflow-hidden"
        style={{
          background: "linear-gradient(to right, #13213c, #264670, #13213c)",
        }}
      >
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle, #d4b26a 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, transparent, #d4b26a, transparent)",
          }}
        />
        <div
          className="absolute -top-16 -left-16 w-56 h-56
            rounded-full blur-2xl pointer-events-none"
          style={{ background: "rgba(212,178,106,0.08)" }}
        />
        <div
          className="absolute -bottom-16 -right-16 w-56 h-56
            rounded-full blur-2xl pointer-events-none"
          style={{ background: "rgba(212,178,106,0.08)" }}
        />

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-10"
          >
            {stats.map((s) => (
              <StatCard key={s.label} {...s} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── VALUES ────────────────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-oxford-gray-light)" }}
      >
        <motion.div
          animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 w-72 h-72 rounded-full
            blur-3xl pointer-events-none"
          style={{ background: "rgba(212,178,106,0.12)" }}
        />
        <motion.div
          animate={{ x: [0, -16, 0], y: [0, 16, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
          className="absolute bottom-20 left-10 w-64 h-64 rounded-full
            blur-3xl pointer-events-none"
          style={{ background: "rgba(38,70,112,0.08)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="Our Values"
            badgeIcon={Heart}
            title="What We"
            accent="Stand For"
            sub="These principles guide every decision we make and every item we create."
          />

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
          >
            {values.map((val) => {
              const Icon = val.icon;
              return (
                <motion.div
                  key={val.title}
                  variants={fadeUp}
                  whileHover={{ y: -5, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className={`group relative rounded-2xl sm:rounded-3xl
                    p-4 sm:p-6 lg:p-7 shadow-md hover:shadow-2xl
                    transition-all duration-300 overflow-hidden
                    ${val.bg} ${val.border} ${val.glow}`}
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-[3px]
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: "linear-gradient(to right, #d4b26a, #264670)",
                    }}
                  />
                  <div
                    className="absolute -top-6 sm:-top-8 -right-6 sm:-right-8
                      w-20 sm:w-24 h-20 sm:h-24 rounded-full pointer-events-none"
                    style={{
                      background: "linear-gradient(135deg, #d4b26a, #264670)",
                      opacity: 0.07,
                    }}
                  />

                  <div
                    className={`relative w-11 h-11 sm:w-14 sm:h-14
                      rounded-xl sm:rounded-2xl flex items-center justify-center
                      mb-3 sm:mb-5 shadow-lg
                      group-hover:scale-110 transition-transform duration-300
                      ${val.gradient}`}
                  >
                    <Icon size={20} className="text-white sm:hidden" strokeWidth={1.8} />
                    <Icon size={24} className="text-white hidden sm:block" strokeWidth={1.8} />
                  </div>

                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5
                      rounded-full text-[9px] sm:text-[10px] font-bold uppercase
                      tracking-wider mb-2 sm:mb-3 ${val.badge}`}
                  >
                    <BadgeCheck size={8} className="sm:hidden" />
                    <BadgeCheck size={9} className="hidden sm:block" />
                    Verified
                  </span>

                  <h3
                    className="font-extrabold text-sm sm:text-base mb-1.5 sm:mb-2"
                    style={{ color: "#13213c" }}
                  >
                    {val.title}
                  </h3>
                  <p
                    className="text-xs sm:text-sm leading-relaxed"
                    style={{ color: "#4f545f" }}
                  >
                    {val.desc}
                  </p>
                  <div
                    className={`flex items-center gap-1 mt-3 sm:mt-4
                      text-[10px] sm:text-xs font-bold ${val.text}
                      opacity-0 group-hover:opacity-100
                      translate-y-1 group-hover:translate-y-0
                      transition-all duration-200`}
                  >
                    Learn more
                    <ArrowRight size={10} className="sm:hidden" />
                    <ArrowRight size={11} className="hidden sm:block" />
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── TEAM ──────────────────────────────────────────────────── */}
      <section
        className="py-16 sm:py-24"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            badge="The Artisans"
            badgeIcon={Users}
            title="Meet the"
            accent="Makers"
            sub="The talented hands behind every beautiful CraftNest creation."
          />
          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
          >
            {team.map((member) => (
              <TeamCard key={member.name} {...member} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────── */}
      <section
        className="py-14 sm:py-20 px-4"
        style={{ backgroundColor: "var(--color-oxford-gray-light)" }}
      >
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <GradientCard padding="lg">
              {/* Animated icon */}
              <motion.div
                animate={{ y: [0, -8, 0], rotate: [0, 6, -6, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                className="relative inline-block mb-4 sm:mb-6"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.55, 0.3] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute inset-0 rounded-2xl sm:rounded-3xl
                    blur-2xl scale-125 pointer-events-none"
                  style={{ background: "rgba(212,178,106,0.25)" }}
                />
                <div
                  className="relative w-16 h-16 sm:w-20 sm:h-20
                    rounded-2xl sm:rounded-3xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(8px)",
                    border: "2px solid rgba(255,255,255,0.25)",
                  }}
                >
                  <Heart
                    size={28}
                    className="text-white relative z-10 sm:hidden"
                    strokeWidth={1.6}
                    fill="rgba(255,255,255,0.3)"
                  />
                  <Heart
                    size={36}
                    className="text-white relative z-10 hidden sm:block"
                    strokeWidth={1.6}
                    fill="rgba(255,255,255,0.3)"
                  />
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5
                      w-6 h-6 sm:w-7 sm:h-7 rounded-full
                      flex items-center justify-center shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #d4b26a, #c69e4f)",
                      border: "2px solid rgba(255,255,255,0.7)",
                    }}
                  >
                    <Sparkles size={10} className="text-white sm:hidden" />
                    <Sparkles size={12} className="text-white hidden sm:block" />
                  </motion.div>
                </div>
              </motion.div>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black
                text-white leading-tight mb-3 sm:mb-4">
                Ready to Find Your
                <br className="hidden sm:block" />
                {" "}Perfect Handmade Piece?
              </h2>
              <p className="text-white/80 text-sm sm:text-lg mb-7 sm:mb-10
                max-w-xl mx-auto leading-relaxed">
                Browse hundreds of unique handcrafted items made with love —
                each piece is one-of-a-kind, just like you.
              </p>

              <div className="flex flex-col sm:flex-row items-center
                justify-center gap-3 sm:gap-4">
                <Link to="/shop" className="w-full sm:w-auto">
                  <Button
                    variant="ghost"
                    size="lg"
                    fullWidth
                    icon={<ShoppingBag size={16} />}
                    iconRight={<ArrowRight size={14} />}
                    style={{
                      background: "#ffffff",
                      color: "#13213c",
                      fontWeight: 800,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
                    }}
                    className="hover:-translate-y-0.5 sm:w-auto"
                  >
                    Shop the Collection
                  </Button>
                </Link>
                <Link to="/signup" className="w-full sm:w-auto">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    icon={<Sparkles size={15} />}
                    style={{
                      border: "2px solid rgba(255,255,255,0.5)",
                      color: "#ffffff",
                      background: "transparent",
                      fontWeight: 800,
                    }}
                    className="hover:bg-white/10 hover:-translate-y-0.5 sm:w-auto"
                  >
                    Join CraftNest Free
                  </Button>
                </Link>
              </div>

              {/* Trust strip */}
              <div
                className="flex flex-wrap items-center justify-center
                  gap-3 sm:gap-8 mt-7 sm:mt-9 pt-5 sm:pt-7"
                style={{ borderTop: "1px solid rgba(255,255,255,0.18)" }}
              >
                {[
                  { icon: BadgeCheck,  label: "100% Handmade" },
                  { icon: Star,        label: "4.9 Rated"     },
                  { icon: Leaf,        label: "Eco-Friendly"  },
                  { icon: ShoppingBag, label: "Fast Shipping" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-1 sm:gap-1.5
                      text-[10px] sm:text-xs font-semibold"
                    style={{ color: "rgba(255,255,255,0.75)" }}
                  >
                    <Icon
                      size={11}
                      className="sm:hidden"
                      style={{ color: "rgba(212,178,106,0.9)" }}
                    />
                    <Icon
                      size={13}
                      className="hidden sm:block"
                      style={{ color: "rgba(212,178,106,0.9)" }}
                    />
                    {label}
                  </div>
                ))}
              </div>
            </GradientCard>
          </motion.div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;