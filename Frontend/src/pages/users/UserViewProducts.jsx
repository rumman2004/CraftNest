// pages/users/UserViewProducts.jsx

import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate }           from "react-router-dom";
import { motion, AnimatePresence }          from "framer-motion";
import {
  PackageSearch, AlertCircle, RefreshCw,
  ShoppingBag, Sparkles, Heart, Scissors,
  Flower2, Shirt, Palette, Leaf, Star, Gem,
} from "lucide-react";
import { getProductById }  from "../../services/api";
import ProductDetails      from "../../components/sections/ProductDetails";
import ProductSections     from "../../components/sections/ProductSections";
import Button              from "../../components/ui/Button";
import { GlassCard }       from "../../components/ui/Cards";
import toast               from "react-hot-toast";

const floatingIcons = [
  { icon: Sparkles, x: "5%",  y: "10%", size: 18, dur: 3.2, delay: 0   },
  { icon: Heart,    x: "88%", y: "8%",  size: 16, dur: 3.8, delay: 0.5 },
  { icon: Gem,      x: "92%", y: "55%", size: 15, dur: 2.9, delay: 0.3 },
  { icon: Scissors, x: "4%",  y: "65%", size: 15, dur: 3.5, delay: 0.8 },
  { icon: Flower2,  x: "82%", y: "82%", size: 14, dur: 4.0, delay: 0.2 },
  { icon: Leaf,     x: "14%", y: "88%", size: 14, dur: 3.3, delay: 0.6 },
];

// ── FullScreenWrapper ──────────────────────────────────────────────────────
// ✅ Uses absolute fill instead of fixed — stays inside UserLayout's
//    content area with no double scrollbar
const FullScreenWrapper = ({ children }) => (
  <div
    className="absolute inset-0 flex items-center justify-center
      overflow-hidden px-4"
    style={{
      background:
        "linear-gradient(135deg,#f3f4f7 0%,#eef0f5 50%,#f3f4f7 100%)",
    }}
  >
    {children}
  </div>
);

// ✅ Outer shell that gives FullScreenWrapper its positioning context
//    and prevents the page from being taller than the viewport content area
const FullScreenShell = ({ children }) => (
  <div
    className="relative w-full overflow-hidden"
    style={{ height: "calc(100vh - 64px)" }} // 64px = your UserLayout navbar height
  >
    {children}
  </div>
);

const ScreenBackground = () => (
  <>
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.04]"
      style={{
        backgroundImage: `
          linear-gradient(rgba(19,33,60,0.4) 1px, transparent 1px),
          linear-gradient(90deg, rgba(19,33,60,0.4) 1px, transparent 1px)
        `,
        backgroundSize: "56px 56px",
      }}
    />
    <motion.div
      animate={{ scale: [1, 1.15, 1], opacity: [0.25, 0.4, 0.25] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      className="absolute -top-48 -left-48 w-[480px] h-[480px]
        rounded-full blur-3xl pointer-events-none"
      style={{ background: "rgba(212,178,106,0.18)" }}
    />
    <motion.div
      animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.28, 0.15] }}
      transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      className="absolute -bottom-48 -right-48 w-[460px] h-[460px]
        rounded-full blur-3xl pointer-events-none"
      style={{ background: "rgba(38,70,112,0.12)" }}
    />
    {floatingIcons.map((p, i) => {
      const Icon = p.icon;
      return (
        <motion.div
          key={i}
          className="absolute select-none pointer-events-none hidden sm:block"
          style={{ left: p.x, top: p.y, color: "rgba(212,178,106,0.4)" }}
          animate={{
            y:      [0, -16, 0],
            rotate: [0, 10, -10, 0],
            scale:  [1, 1.12, 1],
          }}
          transition={{
            duration: p.dur, repeat: Infinity,
            ease: "easeInOut", delay: p.delay,
          }}
        >
          <Icon size={p.size} strokeWidth={1.3} />
        </motion.div>
      );
    })}
  </>
);

// ── Spinner ────────────────────────────────────────────────────────────────
const SpinnerRing = ({ size, duration, opacity, reverse = false }) => (
  <motion.div
    animate={{ rotate: reverse ? -360 : 360 }}
    transition={{ duration, repeat: Infinity, ease: "linear" }}
    className="absolute inset-0 rounded-full"
    style={{
      width:  size,
      height: size,
      margin: "auto",
      border: "2px solid transparent",
      borderTopColor:   `rgba(212,178,106,${opacity})`,
      borderRightColor: `rgba(38,70,112,${opacity * 0.6})`,
    }}
  />
);

// ── Loading Screen ─────────────────────────────────────────────────────────
const LoadingScreen = () => (
  <FullScreenShell>
    <FullScreenWrapper>
      <ScreenBackground />
      <GlassCard className="w-auto relative z-10">
        <div className="px-8 sm:px-12 py-10 sm:py-14 text-center">
          <div className="relative w-20 h-20 sm:w-24 sm:h-24
            mx-auto mb-6 sm:mb-8">
            <SpinnerRing size={80}  duration={2.2} opacity={0.9} />
            <div className="absolute inset-3">
              <SpinnerRing size={60} duration={1.7} opacity={0.6} reverse />
            </div>
            <div className="absolute inset-6">
              <SpinnerRing size={40} duration={1.3} opacity={0.35} />
            </div>
            <motion.div
              animate={{ scale: [1, 1.08, 1], rotate: [0, 6, -6, 0] }}
              transition={{
                duration: 2.5, repeat: Infinity, ease: "easeInOut",
              }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl
                  flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(135deg,#13213c,#264670)",
                  boxShadow:  "0 8px 24px rgba(19,33,60,0.35)",
                }}
              >
                <PackageSearch size={18} className="text-white sm:hidden"
                  strokeWidth={1.8} />
                <PackageSearch size={22} className="text-white hidden sm:block"
                  strokeWidth={1.8} />
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2 className="text-lg sm:text-xl font-black mb-2"
              style={{ color: "#13213c" }}>
              Loading Product
            </h2>
            <p className="text-xs sm:text-sm mb-5 max-w-[240px] mx-auto
              leading-relaxed" style={{ color: "#4f6080" }}>
              Fetching the details of this handcrafted piece for you…
            </p>

            <div className="flex items-center justify-center
              gap-2 sm:gap-3 mb-5">
              {[Scissors, Palette, Flower2, Shirt].map((Icon, i) => (
                <motion.div
                  key={i}
                  animate={{ y: [0, -5, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{
                    duration: 1.2, repeat: Infinity,
                    delay: i * 0.18, ease: "easeInOut",
                  }}
                  style={{ color: "#d4b26a" }}
                >
                  <Icon size={14} className="sm:hidden"      strokeWidth={1.6} />
                  <Icon size={16} className="hidden sm:block" strokeWidth={1.6} />
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-1.5">
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  animate={{ scale: [1, 1.6, 1], opacity: [0.35, 1, 0.35] }}
                  transition={{
                    duration: 0.8, repeat: Infinity,
                    delay: i * 0.15, ease: "easeInOut",
                  }}
                  className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full"
                  style={{
                    background: "linear-gradient(to right,#d4b26a,#13213c)",
                  }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </GlassCard>
    </FullScreenWrapper>
  </FullScreenShell>
);

// ── Error Screen ───────────────────────────────────────────────────────────
const ErrorScreen = ({ onRetry, onBack }) => {
  const navigate = useNavigate();

  return (
    <FullScreenShell>
      <FullScreenWrapper>
        <ScreenBackground />
        <GlassCard className="w-full max-w-sm sm:max-w-md relative z-10">
          <div className="px-6 sm:px-8 py-10 sm:py-12 text-center">

            <motion.div
              animate={{ y: [0, -8, 0], rotate: [0, 4, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className="relative inline-block mb-5 sm:mb-6"
            >
              <div
                className="relative w-16 h-16 sm:w-20 sm:h-20
                  rounded-2xl sm:rounded-3xl
                  flex items-center justify-center shadow-xl"
                style={{
                  background: "linear-gradient(135deg,#13213c,#264670)",
                  boxShadow:  "0 12px 32px rgba(19,33,60,0.35)",
                }}
              >
                <AlertCircle size={28} className="text-white sm:hidden"
                  strokeWidth={1.6} />
                <AlertCircle size={34} className="text-white hidden sm:block"
                  strokeWidth={1.6} />
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute -top-2 -right-2 sm:-top-2.5 sm:-right-2.5
                    w-6 h-6 sm:w-7 sm:h-7 rounded-full
                    flex items-center justify-center shadow-md"
                  style={{
                    background: "linear-gradient(135deg,#d4b26a,#c69e4f)",
                    border:     "2px solid rgba(255,255,255,0.8)",
                  }}
                >
                  <Sparkles size={10} className="text-white sm:hidden" />
                  <Sparkles size={12} className="text-white hidden sm:block" />
                </motion.div>
              </div>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl sm:text-2xl font-black mb-2"
              style={{ color: "#13213c" }}
            >
              Product{" "}
              <span style={{
                background:           "linear-gradient(to right,#d4b26a,#264670)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
              }}>
                Not Found
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs sm:text-sm mb-6 leading-relaxed
                max-w-xs mx-auto"
              style={{ color: "#4f6080" }}
            >
              We couldn't locate this handcrafted item. It may have been
              removed or the link might be incorrect.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-2.5"
            >
              <Button variant="primary" size="md" fullWidth
                onClick={onRetry} icon={<RefreshCw size={14} />}>
                Try Again
              </Button>
              <Button variant="ghost" size="md" fullWidth
                onClick={onBack} icon={<ShoppingBag size={14} />}>
                Back to Products
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="mt-5"
            >
              <button
                onClick={() => navigate("/user/home")}
                className="inline-flex items-center gap-1.5 text-xs
                  font-semibold transition-colors duration-200"
                style={{ color: "#4f6080" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "#d4b26a")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "#4f6080")
                }
              >
                Return to Home
              </button>
            </motion.div>

            <div className="mt-5 pt-5"
              style={{ borderTop: "1px solid rgba(19,33,60,0.08)" }}>
              <div className="flex items-center justify-center gap-2 mb-3">
                <Star size={9} style={{ color: "rgba(212,178,106,0.5)" }} />
                <span className="text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: "#4f6080" }}>
                  Browse collections
                </span>
                <Star size={9} style={{ color: "rgba(212,178,106,0.5)" }} />
              </div>
              <div className="flex items-center justify-center
                gap-1.5 flex-wrap">
                {[
                  { label: "Crochet",      icon: Scissors },
                  { label: "Embroidery",   icon: Palette  },
                  { label: "Woolen",       icon: Shirt    },
                  { label: "Pipe Cleaner", icon: Flower2  },
                ].map(({ label, icon: CatIcon }) => (
                  <motion.button
                    key={label}
                    onClick={() =>
                      navigate(`/user/products?category=${label}`)
                    }
                    whileHover={{ scale: 1.06, y: -1 }}
                    whileTap={{  scale: 0.96          }}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5
                      rounded-full text-[10px] font-bold transition-all"
                    style={{
                      background: "rgba(212,178,106,0.12)",
                      color:      "#13213c",
                      border:     "1px solid rgba(212,178,106,0.3)",
                    }}
                  >
                    <CatIcon size={10} strokeWidth={2} />
                    {label}
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </GlassCard>
      </FullScreenWrapper>
    </FullScreenShell>
  );
};

// ══════════════════════════════════════════════════════════════════════════
const UserViewProducts = ({ view = "list" }) => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [product,  setProduct ] = useState(null);
  const [loading,  setLoading ] = useState(true);
  const [hasError, setHasError] = useState(false);

  const fetchProduct = useCallback(async () => {
    setLoading(true);
    setHasError(false);
    try {
      const { data } = await getProductById(id);
      setProduct(data);
    } catch {
      setHasError(true);
      toast.error("Product not found");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (view === "detail" && id) fetchProduct();
    else setLoading(false);
  }, [id, view, fetchProduct]);

  if (loading) return <LoadingScreen />;

  if (hasError || (view === "detail" && !product))
    return (
      <ErrorScreen
        onRetry={fetchProduct}
        onBack={() => navigate("/user/products")}
      />
    );

  if (view === "detail" && product) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={product._id}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0  }}
          exit={{    opacity: 0, y: -24 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          <ProductDetails
            product={product}
            onReviewAdded={fetchProduct}
          />
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key="user-product-list"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0  }}
        exit={{    opacity: 0, y: -16 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <ProductSections />
      </motion.div>
    </AnimatePresence>
  );
};

export default UserViewProducts;