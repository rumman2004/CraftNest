import { useState }                       from "react";
import { motion, AnimatePresence }        from "framer-motion";
import {
  ShoppingCart, ArrowLeft, LogIn,
  Star, Tag, MessageSquare,
  ChevronLeft, ChevronRight, ZoomIn,
  Share2, Heart, Package, CheckCircle,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useCart }   from "../../context/CartContext";
import { useAuth }   from "../../context/AuthContext";
import { addReview } from "../../services/api";
import StarRating    from "../common/StarRating";
import Button        from "../ui/Button";
import Textarea      from "../ui/Textarea";
import RelatedProducts from "./RelatedProducts";
import toast         from "react-hot-toast";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.1)",
  goldBorder: "rgba(212,178,106,0.25)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.4)",
  border:     "rgba(19,33,60,0.08)",
  surface:    "#ffffff",
  surfaceAlt: "#f7f8fa",
  green:      "#22c55e",
  red:        "#ef4444",
};

// ── Image Gallery ──────────────────────────────────────────────────────────
const ImageGallery = ({ images = [], name }) => {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [pos,    setPos   ] = useState({ x: 50, y: 50 });

  const prev = () =>
    setActive((i) => (i - 1 + images.length) % images.length);
  const next = () =>
    setActive((i) => (i + 1) % images.length);

  const handleMouseMove = (e) => {
    if (!zoomed) return;
    const r = e.currentTarget.getBoundingClientRect();
    setPos({
      x: ((e.clientX - r.left) / r.width)  * 100,
      y: ((e.clientY - r.top)  / r.height) * 100,
    });
  };

  return (
    <div className="flex flex-col gap-3">

      {/* Main image */}
      <div
        className="relative rounded-2xl sm:rounded-3xl overflow-hidden
          w-full"
        style={{
          background:  C.surfaceAlt,
          border:      `1px solid ${C.border}`,
          aspectRatio: "1 / 1",
          cursor:      zoomed ? "zoom-out" : "zoom-in",
        }}
        onClick={() => setZoomed((z) => !z)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomed(false)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]?.url || "/placeholder.jpg"}
            alt={name}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1    }}
            exit={{    opacity: 0, scale: 0.97  }}
            transition={{ duration: 0.28 }}
            className="w-full h-full object-cover"
            style={
              zoomed
                ? {
                    transformOrigin: `${pos.x}% ${pos.y}%`,
                    transform: "scale(2.2)",
                    transition: "transform 0.1s ease",
                  }
                : {}
            }
          />
        </AnimatePresence>

        {/* Zoom hint */}
        {!zoomed && (
          <div
            className="absolute bottom-3 right-3 flex items-center
              gap-1.5 px-2.5 py-1.5 rounded-xl
              text-[10px] font-semibold pointer-events-none"
            style={{
              background:     "rgba(19,33,60,0.55)",
              color:          "#fff",
              backdropFilter: "blur(6px)",
            }}
          >
            <ZoomIn size={11} />
            Hover to zoom
          </div>
        )}

        {/* Image count pill */}
        {images.length > 1 && (
          <div
            className="absolute top-3 left-3 px-2.5 py-1
              rounded-full text-[10px] font-bold pointer-events-none"
            style={{
              background:     "rgba(19,33,60,0.55)",
              color:          "#fff",
              backdropFilter: "blur(6px)",
            }}
          >
            {active + 1} / {images.length}
          </div>
        )}

        {/* Prev / Next */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); prev(); }}
              className="absolute left-3 top-1/2 -translate-y-1/2
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-150 hover:scale-110 shadow-md"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              <ChevronLeft size={16} style={{ color: C.navy }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); next(); }}
              className="absolute right-3 top-1/2 -translate-y-1/2
                w-8 h-8 rounded-full flex items-center justify-center
                transition-all duration-150 hover:scale-110 shadow-md"
              style={{ background: "rgba(255,255,255,0.92)" }}
            >
              <ChevronRight size={16} style={{ color: C.navy }} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex-shrink-0 rounded-xl overflow-hidden
                transition-all duration-200"
              style={{
                width:     64,
                height:    64,
                border:    `2px solid ${i === active ? C.gold : "transparent"}`,
                opacity:   i === active ? 1 : 0.55,
                transform: i === active ? "scale(1.06)" : "scale(1)",
                boxShadow: i === active ? `0 4px 12px ${C.gold}40` : "none",
              }}
            >
              <img
                src={img.url}
                alt={`View ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Review Card ────────────────────────────────────────────────────────────
const ReviewCard = ({ r, i }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ delay: i * 0.05 }}
    className="rounded-2xl p-4 sm:p-5"
    style={{
      background: C.surfaceAlt,
      border:     `1px solid ${C.border}`,
    }}
  >
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center
            text-white text-sm font-black flex-shrink-0"
          style={{
            background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
          }}
        >
          {r.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-sm" style={{ color: C.text }}>
            {r.name}
          </p>
          <p className="text-[10px] mt-0.5" style={{ color: C.textMuted }}>
            {new Date(r.createdAt).toLocaleDateString("en-IN", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>
      </div>
      <StarRating rating={r.rating} size="text-xs" />
    </div>
    <p className="text-sm leading-relaxed" style={{ color: C.textSub }}>
      {r.comment}
    </p>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
const ProductDetails = ({ product, onReviewAdded }) => {
  const { addToCart }       = useCart();
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();

  // ✅ Derive all paths from current URL — no prop needed
  const isUserRoute = location.pathname.startsWith("/user");
  const homePath    = isUserRoute ? "/user/home"     : "/home";
  const shopPath    = isUserRoute ? "/user/products" : "/shop";
  const shopLabel   = isUserRoute ? "Products"       : "Shop";
  const detailPath  = isUserRoute
    ? `/user/products/${product._id}`
    : `/shop/${product._id}`;

  const [qty,        setQty       ] = useState(1);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const [wished,     setWished    ] = useState(false);

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart", {
        duration: 3000, icon: "🔒",
      });
      navigate("/login", { state: { from: detailPath } });
      return;
    }
    if (product.stock === 0) return;
    for (let i = 0; i < qty; i++) addToCart(product);
    toast.success(
      `${qty > 1 ? `${qty}× ` : ""}${product.name} added to cart! 🛒`
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handleReview = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      toast.error("Please write a comment");
      return;
    }
    setSubmitting(true);
    try {
      await addReview(product._id, reviewForm);
      toast.success("Review submitted! ⭐");
      setReviewForm({ rating: 5, comment: "" });
      onReviewAdded?.();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating  = product.ratings    ?? 0;
  const numReviews = product.numReviews ?? 0;

  const starCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: product.reviews?.filter(
      (r) => Math.round(r.rating) === star
    ).length ?? 0,
  }));

  return (
    <div style={{ background: "#ffffff" }}>

      {/* ── Sticky top bar ──────────────────────────────────────── */}
      <div
        className="sticky top-0 z-30"
        style={{
          background:   "rgba(255,255,255,0.94)",
          borderBottom: `1px solid ${C.border}`,
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          h-14 flex items-center justify-between gap-4">

          {/* Back */}
          <button
            onClick={() => navigate(shopPath)}
            className="flex items-center gap-2 text-sm font-semibold
              transition-colors duration-150 flex-shrink-0"
            style={{ color: C.textSub }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to {shopLabel}</span>
            <span className="sm:hidden">Back</span>
          </button>

          {/* ✅ Breadcrumb — hidden on mobile */}
          <nav
            className="hidden md:flex items-center gap-2 text-xs
              font-semibold min-w-0 flex-1 justify-center"
            style={{ color: C.textMuted }}
          >
            <Link
              to={homePath}
              className="transition-colors hover:underline flex-shrink-0"
              style={{ color: C.textSub }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
            >
              Home
            </Link>
            <span style={{ color: C.textMuted }}>/</span>
            <Link
              to={shopPath}
              className="transition-colors hover:underline flex-shrink-0"
              style={{ color: C.textSub }}
              onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
              onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
            >
              {shopLabel}
            </Link>
            <span style={{ color: C.textMuted }}>/</span>
            <span
              className="truncate max-w-[200px] font-bold"
              style={{ color: C.text }}
              title={product.name}
            >
              {product.name}
            </span>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{   scale: 0.94 }}
              onClick={handleShare}
              className="w-8 h-8 rounded-xl flex items-center
                justify-center transition-colors"
              style={{
                background: C.surfaceAlt,
                border:     `1px solid ${C.border}`,
              }}
            >
              <Share2 size={14} style={{ color: C.textSub }} />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{   scale: 0.94 }}
              onClick={() => setWished((w) => !w)}
              className="w-8 h-8 rounded-xl flex items-center
                justify-center transition-colors"
              style={{
                background: wished
                  ? "rgba(239,68,68,0.08)"
                  : C.surfaceAlt,
                border: `1px solid ${wished
                  ? "rgba(239,68,68,0.25)"
                  : C.border}`,
              }}
            >
              <Heart
                size={14}
                style={{
                  color: wished ? C.red : C.textSub,
                  fill:  wished ? C.red : "none",
                }}
              />
            </motion.button>
          </div>
        </div>
      </div>

      {/* ── Product section ─────────────────────────────────────── */}
      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          py-6 sm:py-10"
      >
        <div className="grid lg:grid-cols-2 gap-8 xl:gap-14">

          {/* Gallery */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0   }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          >
            <ImageGallery images={product.images} name={product.name} />
          </motion.div>

          {/* Info */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col gap-5"
          >
            {/* Category badge */}
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="inline-flex items-center gap-1.5
                  text-[11px] font-bold px-3 py-1 rounded-full"
                style={{
                  background: C.goldLight,
                  color:      C.gold,
                  border:     `1px solid ${C.goldBorder}`,
                }}
              >
                <Tag size={10} />
                {product.category}
              </span>
              {product.featured && (
                <span
                  className="inline-flex items-center gap-1
                    text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(139,92,246,0.1)",
                    color:      "#8b5cf6",
                    border:     "1px solid rgba(139,92,246,0.25)",
                  }}
                >
                  ✦ Featured
                </span>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-2xl sm:text-3xl xl:text-4xl font-black
                leading-tight"
              style={{ color: C.text }}
            >
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <StarRating rating={avgRating} size="text-base" />
              <span className="font-bold text-sm" style={{ color: C.text }}>
                {avgRating.toFixed(1)}
              </span>
              <span
                className="text-sm"
                style={{ color: C.textMuted }}
              >
                ({numReviews} review{numReviews !== 1 ? "s" : ""})
              </span>
            </div>

            {/* Divider */}
            <div className="h-px" style={{ background: C.border }} />

            {/* Price */}
            <div className="flex items-end gap-3">
              <p
                className="text-4xl sm:text-5xl font-black"
                style={{
                  background:           `linear-gradient(to right,${C.gold},#c69e4f)`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:  "transparent",
                  backgroundClip:       "text",
                }}
              >
                ₹{product.price?.toLocaleString("en-IN", {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                })}
              </p>
              <span
                className="text-xs font-medium mb-2"
                style={{ color: C.textMuted }}
              >
                incl. of taxes
              </span>
            </div>

            {/* Description */}
            <p
              className="text-sm sm:text-base leading-relaxed"
              style={{ color: C.textSub }}
            >
              {product.description}
            </p>

            {/* Divider */}
            <div className="h-px" style={{ background: C.border }} />

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: product.stock > 0 ? C.green : C.red,
                  boxShadow:  `0 0 6px ${
                    product.stock > 0 ? C.green : C.red
                  }70`,
                }}
              />
              <span
                className="text-sm font-semibold"
                style={{
                  color: product.stock > 0 ? "#15803d" : "#b91c1c",
                }}
              >
                {product.stock > 0
                  ? `In Stock — ${product.stock} unit${
                      product.stock !== 1 ? "s" : ""
                    } available`
                  : "Out of Stock"}
              </span>
            </div>

            {/* Qty + CTA */}
            {product.stock > 0 && (
              <div className="flex items-center gap-3 flex-wrap">
                {/* Stepper */}
                <div
                  className="flex items-center rounded-2xl overflow-hidden
                    flex-shrink-0"
                  style={{
                    background: C.surfaceAlt,
                    border:     `1px solid ${C.border}`,
                  }}
                >
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    className="w-11 h-11 font-bold text-xl
                      flex items-center justify-center
                      transition-colors duration-150"
                    style={{ color: C.textSub }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = C.gold)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = C.textSub)
                    }
                  >
                    −
                  </button>
                  <span
                    className="w-10 text-center font-black text-base"
                    style={{ color: C.text }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() =>
                      setQty((q) => Math.min(product.stock, q + 1))
                    }
                    className="w-11 h-11 font-bold text-xl
                      flex items-center justify-center
                      transition-colors duration-150"
                    style={{ color: C.textSub }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = C.gold)
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = C.textSub)
                    }
                  >
                    +
                  </button>
                </div>

                {/* Add to cart */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{   scale: 0.97         }}
                  onClick={handleAddToCart}
                  className="flex-1 min-w-[150px] flex items-center
                    justify-center gap-2.5 px-6 py-3.5
                    rounded-2xl font-bold text-sm text-white
                    transition-all duration-200"
                  style={{
                    background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                    boxShadow:  "0 6px 20px rgba(19,33,60,0.28)",
                  }}
                >
                  {isAuthenticated
                    ? <><ShoppingCart size={16} /> Add {qty > 1 ? `${qty} items` : "to Cart"}</>
                    : <><LogIn size={16} /> Login to Add to Cart</>
                  }
                </motion.button>
              </div>
            )}

            {/* Tags */}
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {product.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[11px] font-semibold
                      px-3 py-1 rounded-full"
                    style={{
                      background: C.surfaceAlt,
                      color:      C.textSub,
                      border:     `1px solid ${C.border}`,
                    }}
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Trust strip */}
            <div
              className="grid grid-cols-2 gap-2 p-4 rounded-2xl mt-1"
              style={{
                background: C.goldLight,
                border:     `1px solid ${C.goldBorder}`,
              }}
            >
              {[
                { icon: Package,      label: "Handcrafted",     sub: "Made with care"   },
                { icon: CheckCircle,  label: "Quality Assured", sub: "100% authentic"   },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center
                      justify-center flex-shrink-0"
                    style={{
                      background: `${C.gold}20`,
                      border:     `1px solid ${C.gold}30`,
                    }}
                  >
                    <Icon size={14} style={{ color: C.gold }} />
                  </div>
                  <div>
                    <p
                      className="text-[11px] font-bold"
                      style={{ color: C.text }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: C.textMuted }}
                    >
                      {sub}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Reviews ─────────────────────────────────────────────── */}
      <div style={{ background: C.surfaceAlt }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          py-10 sm:py-14">

          {/* Header */}
          <div
            className="flex items-center justify-between gap-4
              flex-wrap mb-8"
          >
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-xl flex items-center
                  justify-center"
                style={{
                  background: C.goldLight,
                  border:     `1px solid ${C.goldBorder}`,
                }}
              >
                <MessageSquare size={15} style={{ color: C.gold }} />
              </div>
              <div>
                <h2
                  className="text-lg sm:text-xl font-black"
                  style={{ color: C.text }}
                >
                  Customer Reviews
                </h2>
                <p className="text-xs" style={{ color: C.textMuted }}>
                  {numReviews} review{numReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {numReviews > 0 && (
              <div
                className="flex items-center gap-2 px-4 py-2
                  rounded-2xl"
                style={{
                  background: C.goldLight,
                  border:     `1px solid ${C.goldBorder}`,
                }}
              >
                <Star size={15} style={{ color: C.gold, fill: C.gold }} />
                <span
                  className="text-xl font-black"
                  style={{ color: C.text }}
                >
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-xs" style={{ color: C.textMuted }}>
                  / 5
                </span>
              </div>
            )}
          </div>

          {/* Rating breakdown */}
          {numReviews > 0 && (
            <div
              className="grid sm:grid-cols-2 gap-6 mb-8 p-5 sm:p-6
                rounded-2xl"
              style={{
                background: C.surface,
                border:     `1px solid ${C.border}`,
              }}
            >
              <div className="space-y-2">
                {starCounts.map(({ star, count }) => {
                  const pct = numReviews > 0
                    ? Math.round((count / numReviews) * 100)
                    : 0;
                  return (
                    <div key={star} className="flex items-center gap-2">
                      <span
                        className="text-xs font-semibold w-3 text-right
                          flex-shrink-0"
                        style={{ color: C.textSub }}
                      >
                        {star}
                      </span>
                      <Star
                        size={10}
                        style={{
                          color: C.gold, fill: C.gold,
                          flexShrink: 0,
                        }}
                      />
                      <div
                        className="flex-1 h-2 rounded-full overflow-hidden"
                        style={{ background: "rgba(19,33,60,0.06)" }}
                      >
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: C.gold }}
                        />
                      </div>
                      <span
                        className="text-[10px] font-semibold w-7
                          flex-shrink-0"
                        style={{ color: C.textMuted }}
                      >
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="flex flex-col items-center
                justify-center gap-2">
                <p
                  className="text-6xl font-black"
                  style={{ color: C.text }}
                >
                  {avgRating.toFixed(1)}
                </p>
                <StarRating rating={avgRating} size="text-xl" />
                <p className="text-xs" style={{ color: C.textMuted }}>
                  Based on {numReviews} review{numReviews !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Write review / login prompt */}
          {isAuthenticated ? (
            <form
              onSubmit={handleReview}
              className="rounded-2xl p-5 sm:p-6 mb-6"
              style={{
                background: C.surface,
                border:     `1px solid ${C.border}`,
              }}
            >
              <h3
                className="font-black text-sm mb-4"
                style={{ color: C.text }}
              >
                Write a Review
              </h3>
              <div className="mb-4">
                <p
                  className="text-xs font-semibold mb-2"
                  style={{ color: C.textSub }}
                >
                  Your Rating
                </p>
                <StarRating
                  rating={reviewForm.rating}
                  size="text-2xl"
                  interactive
                  onRate={(r) =>
                    setReviewForm((f) => ({ ...f, rating: r }))
                  }
                />
              </div>
              <Textarea
                label="Your Review"
                value={reviewForm.comment}
                onChange={(e) =>
                  setReviewForm((f) => ({
                    ...f, comment: e.target.value,
                  }))
                }
                placeholder="Share your experience with this product…"
                required
                rows={3}
                className="mb-4"
              />
              <Button type="submit" loading={submitting}>
                Submit Review
              </Button>
            </form>
          ) : (
            <div
              className="rounded-2xl p-5 mb-6 flex items-center
                justify-between gap-4 flex-wrap"
              style={{
                background: C.goldLight,
                border:     `1px solid ${C.goldBorder}`,
              }}
            >
              <div>
                <p className="font-bold text-sm" style={{ color: C.text }}>
                  Want to leave a review?
                </p>
                <p
                  className="text-xs mt-0.5"
                  style={{ color: C.textSub }}
                >
                  Log in to share your experience
                </p>
              </div>
              <Link to="/login" state={{ from: detailPath }}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{  scale: 0.97  }}
                  className="flex items-center gap-2 px-4 py-2.5
                    rounded-xl text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                  }}
                >
                  <LogIn size={14} />
                  Log In to Review
                </motion.button>
              </Link>
            </div>
          )}

          {/* Reviews list */}
          <div className="space-y-3">
            {!product.reviews?.length ? (
              <div
                className="text-center py-12 rounded-2xl"
                style={{
                  background: C.surface,
                  border:     `1px solid ${C.border}`,
                }}
              >
                <MessageSquare
                  size={28}
                  className="mx-auto mb-3"
                  style={{ color: C.textMuted }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: C.textSub }}
                >
                  No reviews yet — be the first!
                </p>
              </div>
            ) : (
              product.reviews.map((r, i) => (
                <ReviewCard key={r._id} r={r} i={i} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Related Products ────────────────────────────────────── */}
      <RelatedProducts
        category={product.category}
        currentProductId={product._id}
      />
    </div>
  );
};

export default ProductDetails;