import { Link }   from "react-router-dom";
import { motion } from "framer-motion";

const categories = [
  {
    name: "Crochet",
    emoji: "🧶",
    desc: "Cozy handmade crochet products",
    gradientStyle: { background: "linear-gradient(135deg, #13213c, #264670)" },
    bgStyle: { background: "linear-gradient(135deg, #f3f4f7, #e8eaf0)" },
    borderStyle: { border: "1px solid rgba(19,33,60,0.1)" },
  },
  {
    name: "Embroidery",
    emoji: "🎨",
    desc: "Artistic embroidery dream hoops",
    gradientStyle: { background: "linear-gradient(135deg, #264670, #13213c)" },
    bgStyle: { background: "linear-gradient(135deg, #f3f4f7, #eaecf2)" },
    borderStyle: { border: "1px solid rgba(38,70,112,0.1)" },
  },
  {
    name: "Pipe Cleaner",
    emoji: "🌸",
    desc: "Colorful pipe cleaner bouquets",
    gradientStyle: { background: "linear-gradient(135deg, #d4b26a, #c69e4f)" },
    bgStyle: { background: "linear-gradient(135deg, #fdf8ee, #f7f0dc)" },
    borderStyle: { border: "1px solid rgba(212,178,106,0.2)" },
  },
  {
    name: "Woolen",
    emoji: "🧣",
    desc: "Warm & stylish woolen scarves",
    gradientStyle: { background: "linear-gradient(135deg, #1a3254, #264670)" },
    bgStyle: { background: "linear-gradient(135deg, #f3f4f7, #e8edf5)" },
    borderStyle: { border: "1px solid rgba(19,33,60,0.1)" },
  },
];

const CategorySection = () => {
  return (
    <section
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <span
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full
            text-xs font-bold tracking-widest uppercase mb-4"
          style={{
            background: "rgba(212,178,106,0.15)",
            color: "#13213c",
            border: "1px solid rgba(212,178,106,0.35)",
          }}
        >
          🎨 Categories
        </span>

        <h2 className="section-title mb-3">Shop by Category</h2>

        <p
          className="text-base max-w-md mx-auto"
          style={{ color: "#4f545f" }}
        >
          Explore our handcrafted collections made with love
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        {categories.map((cat, i) => (
          <motion.div
            key={cat.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.04, y: -4 }}
          >
            <Link
              to={`/shop?category=${cat.name}`}
              className="block rounded-3xl p-6 text-center
                hover:shadow-xl transition-all duration-300"
              style={{
                ...cat.bgStyle,
                ...cat.borderStyle,
                boxShadow: "var(--clay-shadow)",
              }}
            >
              {/* Icon bubble */}
              <div
                className="w-16 h-16 mx-auto rounded-2xl flex items-center
                  justify-center text-3xl mb-4 shadow-lg"
                style={cat.gradientStyle}
              >
                {cat.emoji}
              </div>

              <h3
                className="font-bold mb-1 text-sm sm:text-base"
                style={{ color: "#13213c" }}
              >
                {cat.name}
              </h3>
              <p
                className="text-xs"
                style={{ color: "#4f545f" }}
              >
                {cat.desc}
              </p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default CategorySection;