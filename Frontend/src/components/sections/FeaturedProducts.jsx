import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import { Link }                from "react-router-dom";
import {
  Sparkles, ArrowRight, Star, ShoppingBag,
  RefreshCw, PackageSearch,
} from "lucide-react";
import { getProducts } from "../../services/api";
import ProductCard     from "../ui/ProductCard";
import { useAuth }     from "../../context/AuthContext"; // ✅ added

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:      "#13213c",
  navyLight: "#264670",
  gold:      "#d4b26a",
  goldLight: "rgba(212,178,106,0.12)",
  goldBorder:"rgba(212,178,106,0.2)",
  text:      "#13213c",
  textSub:   "#4f6080",
  textMuted: "rgba(19,33,60,0.4)",
  border:    "rgba(19,33,60,0.07)",
  surface:   "#ffffff",
  bg:        "#f4f5f8",
};

// ── Animation variants ─────────────────────────────────────────────────────
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.07 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   {
    opacity: 1, y: 0,
    transition: { duration: 0.38, ease: [0.22, 1, 0.36, 1] },
  },
};

// ── Skeleton ───────────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="rounded-3xl overflow-hidden animate-pulse"
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 12px rgba(19,33,60,0.04)",
    }}
  >
    <div
      className="h-52"
      style={{ background: "linear-gradient(135deg,#e8eaee,#f0f2f5)" }}
    />
    <div className="p-4 space-y-3">
      <div className="h-4 rounded-full w-3/4"
        style={{ background: "rgba(19,33,60,0.07)" }} />
      <div className="h-3 rounded-full w-1/2"
        style={{ background: "rgba(19,33,60,0.05)" }} />
      <div className="flex justify-between items-center pt-1">
        <div className="h-5 rounded-full w-1/3"
          style={{ background: "rgba(19,33,60,0.07)" }} />
        <div className="h-8 w-8 rounded-xl"
          style={{ background: "rgba(19,33,60,0.07)" }} />
      </div>
    </div>
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────
const EmptyState = () => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0  }}
    className="col-span-full flex flex-col items-center
      justify-center py-16 gap-4 text-center"
  >
    <div
      className="w-16 h-16 rounded-2xl flex items-center justify-center"
      style={{
        background: C.goldLight,
        border:     `1px solid ${C.goldBorder}`,
      }}
    >
      <PackageSearch size={26} style={{ color: C.gold }} />
    </div>
    <p className="text-sm font-semibold" style={{ color: C.textSub }}>
      No featured products yet
    </p>
    <p className="text-xs" style={{ color: C.textMuted }}>
      Check back soon for curated picks!
    </p>
    <Link
      to="/shop"
      className="flex items-center gap-2 px-5 py-2.5 rounded-2xl
        text-sm font-bold text-white mt-2 transition-all duration-150"
      style={{
        background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
        boxShadow:  "0 4px 16px rgba(19,33,60,0.2)",
      }}
    >
      <ShoppingBag size={14} />
      Browse All Products
    </Link>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
const FeaturedProducts = () => {
  const { user } = useAuth(); // ✅ get logged-in user

  // ✅ Destination for all "View All / Browse" links in this component
  const shopDest = user ? "/user/products" : "/shop";

  const [products, setProducts] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [error,    setError   ] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(false);

    try {
      const { data: featData } = await getProducts({
        featured: true,
        limit:    8,
        sort:     "-createdAt",
      });

      const featList = Array.isArray(featData)
        ? featData
        : Array.isArray(featData?.products)
        ? featData.products
        : [];

      const confirmed = featList.filter(
        (p) => p.featured === true || p.isFeatured === true
      );

      if (confirmed.length > 0) {
        setProducts(confirmed);
        return;
      }

      const { data: allData } = await getProducts({ limit: 50 });

      const allList = Array.isArray(allData)
        ? allData
        : Array.isArray(allData?.products)
        ? allData.products
        : [];

      const fallbackFeatured = allList.filter(
        (p) => p.featured === true || p.isFeatured === true
      );

      if (fallbackFeatured.length > 0) {
        setProducts(fallbackFeatured.slice(0, 8));
        return;
      }

      const topRated = [...allList]
        .sort(
          (a, b) =>
            (b.ratings ?? b.rating ?? 0) -
            (a.ratings ?? a.rating ?? 0)
        )
        .slice(0, 8);

      setProducts(topRated);
    } catch (err) {
      console.error("FeaturedProducts load error:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <section
      className="relative py-14 sm:py-20 overflow-hidden"
      style={{ background: C.surface }}
    >
      {/* Ambient blobs */}
      <div
        className="absolute -top-32 -right-32 w-[380px] h-[380px]
          rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(212,178,106,0.07)" }}
      />
      <div
        className="absolute -bottom-32 -left-32 w-[380px] h-[380px]
          rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(38,70,112,0.05)" }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Header ───────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-end
            justify-between gap-4 mb-8 sm:mb-12"
        >
          <div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1.5
                rounded-full text-[10px] font-bold tracking-widest
                uppercase mb-3"
              style={{
                background: C.goldLight,
                color:      C.text,
                border:     `1px solid ${C.goldBorder}`,
              }}
            >
              <Star
                size={9}
                fill={C.gold}
                strokeWidth={0}
                style={{ color: C.gold }}
              />
              Featured Creations
            </span>

            <h2
              className="text-2xl sm:text-3xl lg:text-4xl font-black
                tracking-tight leading-tight"
              style={{ color: C.text }}
            >
              Handpicked{" "}
              <span className="relative inline-block">
                <span
                  style={{
                    background:           "linear-gradient(135deg,#d4b26a,#264670)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor:  "transparent",
                  }}
                >
                  Just for You
                </span>
                <svg
                  viewBox="0 0 160 6"
                  className="absolute -bottom-0.5 left-0 w-full"
                  style={{ overflow: "visible" }}
                >
                  <motion.path
                    d="M 0 3 Q 40 0 80 3 Q 120 6 160 3"
                    fill="none"
                    stroke="url(#featGrad)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3, duration: 0.9 }}
                  />
                  <defs>
                    <linearGradient
                      id="featGrad" x1="0%" y1="0%" x2="100%" y2="0%"
                    >
                      <stop offset="0%"   stopColor="#d4b26a" />
                      <stop offset="100%" stopColor="#264670" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
            </h2>

            <p className="text-sm mt-2.5" style={{ color: C.textSub }}>
              Our most-loved handcrafted items — curated with care
            </p>
          </div>

          {/* ✅ View All — /user/products if logged in, /shop otherwise */}
          <Link
            to={shopDest}
            className="flex-shrink-0 self-start sm:self-auto
              flex items-center gap-2 px-5 py-2.5 rounded-2xl
              text-sm font-bold transition-all duration-200"
            style={{
              background: "rgba(19,33,60,0.04)",
              border:     `1px solid ${C.border}`,
              color:      C.text,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background  = C.goldLight;
              e.currentTarget.style.borderColor = C.goldBorder;
              e.currentTarget.style.color       = C.gold;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background  = "rgba(19,33,60,0.04)";
              e.currentTarget.style.borderColor = C.border;
              e.currentTarget.style.color       = C.text;
            }}
          >
            View All
            <ArrowRight size={14} strokeWidth={2.5} />
          </Link>
        </motion.div>

        {/* ── Loading skeletons ─────────────────────────────────────── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2
            lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* ── Error state ───────────────────────────────────────────── */}
        {!loading && error && (
          <div
            className="flex flex-col items-center justify-center
              py-16 gap-4 rounded-2xl"
            style={{
              background: "rgba(239,68,68,0.04)",
              border:     "1px solid rgba(239,68,68,0.12)",
            }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "rgba(239,68,68,0.1)" }}
            >
              <RefreshCw size={20} style={{ color: "#ef4444" }} />
            </div>
            <p className="text-sm font-semibold" style={{ color: C.textSub }}>
              Failed to load featured products
            </p>
            <button
              onClick={load}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl
                text-xs font-bold text-white transition-all duration-150"
              style={{
                background:
                  `linear-gradient(135deg,${C.navy},${C.navyLight})`,
              }}
            >
              <RefreshCw size={12} />
              Try Again
            </button>
          </div>
        )}

        {/* ── Products ─────────────────────────────────────────────── */}
        {!loading && !error && (
          <>
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="grid grid-cols-1 sm:grid-cols-2
                lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {products.length === 0
                ? <EmptyState />
                : products.map((product) => (
                    <motion.div key={product._id} variants={fadeUp}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))
              }
            </motion.div>

            {/* ✅ Bottom CTA — same conditional destination */}
            {products.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15 }}
                className="flex flex-col sm:flex-row items-center
                  justify-between gap-4 mt-10 sm:mt-14 pt-8"
                style={{ borderTop: `1px solid ${C.border}` }}
              >
                <p className="text-sm" style={{ color: C.textSub }}>
                  Showing{" "}
                  <span className="font-bold" style={{ color: C.text }}>
                    {products.length}
                  </span>{" "}
                  featured items
                </p>
                <Link to={shopDest}>
                  <motion.button
                    whileHover={{ y: -2, scale: 1.02 }}
                    whileTap={{  scale: 0.97        }}
                    className="flex items-center gap-2 px-6 py-3
                      rounded-2xl text-sm font-bold text-white
                      transition-all duration-200"
                    style={{
                      background:
                        `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                      boxShadow: "0 4px 18px rgba(19,33,60,0.22)",
                    }}
                  >
                    <ShoppingBag size={15} />
                    Browse All Products
                    <ArrowRight size={14} strokeWidth={2.5} />
                  </motion.button>
                </Link>
              </motion.div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;