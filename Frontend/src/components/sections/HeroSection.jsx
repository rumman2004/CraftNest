import { Link }   from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag, Sparkles, ArrowRight } from "lucide-react";

const floats = ["🧶", "🌸", "🎀", "✨", "🪡", "🌼", "💝", "🎨"];

const craftGrid = [
  {
    emoji: "🧶", label: "Crochet",
    style: { background: "linear-gradient(135deg, #13213c, #264670)" },
  },
  {
    emoji: "🎨", label: "Embroidery",
    style: { background: "linear-gradient(135deg, #264670, #1a3254)" },
  },
  {
    emoji: "🌸", label: "Pipe Cleaner",
    style: { background: "linear-gradient(135deg, #d4b26a, #c69e4f)" },
  },
  {
    emoji: "🧣", label: "Woolen",
    style: { background: "linear-gradient(135deg, #1a3254, #264670)" },
  },
];

const HeroSection = () => {
  return (
    <section
      className="relative min-h-[88vh] flex items-center overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f3f4f7 0%, #eef0f6 50%, #f3f4f7 100%)",
      }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(19,33,60,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(19,33,60,0.5) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -left-40 w-[500px] h-[500px]
            rounded-full blur-3xl"
          style={{ background: "rgba(212,178,106,0.15)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-20 -right-20 w-96 h-96
            rounded-full blur-3xl"
          style={{ background: "rgba(38,70,112,0.12)" }}
        />
      </div>

      {/* Floating Emojis */}
      {floats.map((emoji, i) => (
        <motion.span
          key={i}
          className="absolute text-2xl sm:text-3xl pointer-events-none
            select-none opacity-40"
          style={{
            left: `${5 + i * 12}%`,
            top:  `${10 + ((i * 17) % 70)}%`,
          }}
          animate={{ y: [0, -18, 0], rotate: [0, 8, -8, 0] }}
          transition={{
            duration: 3 + i * 0.4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.35,
          }}
        >
          {emoji}
        </motion.span>
      ))}

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16
          relative z-10 grid md:grid-cols-2 gap-14 items-center w-full"
      >
        {/* ── Text side ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0  }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center md:text-left"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2
              rounded-full text-sm font-semibold mb-6"
            style={{
              background: "rgba(212,178,106,0.15)",
              color: "#13213c",
              border: "1px solid rgba(212,178,106,0.35)",
            }}
          >
            <Sparkles size={14} style={{ color: "#d4b26a" }} />
            Handcrafted with Love
          </motion.div>

          {/* Heading */}
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl font-black
              leading-[1.08] mb-6 tracking-tight"
            style={{ color: "#13213c" }}
          >
            Beautiful{" "}
            <span className="text-gradient">Handmade</span>
            <br />
            <span style={{ color: "#264670" }}>Crafts</span>
          </h1>

          <p
            className="text-lg max-w-md mx-auto md:mx-0 leading-relaxed mb-9"
            style={{ color: "#4f545f" }}
          >
            Discover unique crochet items, embroidery hoops, pipe cleaner
            bouquets, and woolen scarves — each piece made with heart.
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4
            justify-center md:justify-start">
            <Link to="/shop">
              <motion.span
                whileHover={{ y: -2, scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2.5
                  px-8 py-4 rounded-2xl font-bold text-white text-base
                  transition-all duration-200 shadow-xl cursor-pointer"
                style={{
                  background: "linear-gradient(to right, #13213c, #264670)",
                  boxShadow: "0 8px 28px rgba(19,33,60,0.35)",
                }}
              >
                <ShoppingBag size={20} />
                Shop Now
                <ArrowRight size={16} />
              </motion.span>
            </Link>

            <Link to="/about">
              <motion.span
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center justify-center gap-2.5
                  px-8 py-4 rounded-2xl font-bold text-base
                  transition-all duration-200 cursor-pointer"
                style={{
                  border: "2px solid #13213c",
                  color: "#13213c",
                  background: "transparent",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d4b26a";
                  e.currentTarget.style.background = "rgba(19,33,60,0.04)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "#13213c";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                Our Story
              </motion.span>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-8 mt-10
            justify-center md:justify-start">
            {[
              { v: "500+", l: "Products Sold" },
              { v: "4.9★", l: "Rating"        },
              { v: "100%", l: "Handmade"      },
            ].map((s) => (
              <div key={s.l} className="text-center">
                <p
                  className="text-xl sm:text-2xl font-extrabold"
                  style={{
                    background: "linear-gradient(to right, #d4b26a, #264670)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {s.v}
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: "#4f545f" }}
                >
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Visual grid ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1   }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="hidden md:grid grid-cols-2 gap-5"
        >
          {craftGrid.map((item, i) => (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.06, rotate: 1 }}
              className={`h-44 rounded-3xl flex flex-col items-center
                justify-center gap-3 shadow-xl cursor-pointer overflow-hidden
                relative ${i % 2 !== 0 ? "mt-5" : ""}`}
              style={item.style}
            >
              {/* Gold dot texture */}
              <div
                className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage:
                    "radial-gradient(circle, #d4b26a 1px, transparent 1px)",
                  backgroundSize: "18px 18px",
                }}
              />
              {/* Shimmer blob */}
              <div
                className="absolute -top-6 -right-6 w-20 h-20
                  rounded-full blur-xl pointer-events-none"
                style={{ background: "rgba(212,178,106,0.15)" }}
              />
              <span className="text-5xl relative z-10">{item.emoji}</span>
              <span
                className="font-bold text-sm relative z-10 tracking-wide"
                style={{ color: "#ffffff" }}
              >
                {item.label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;