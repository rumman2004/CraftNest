import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion }   from "framer-motion";
import { ShoppingCart, Eye, Star, Sparkles, LogIn } from "lucide-react";
import { useCart }  from "../../context/CartContext";
import { useAuth }  from "../../context/AuthContext";
import toast        from "react-hot-toast";

const ProductCard = ({ product }) => {
  const { addToCart }       = useCart();
  const { isAuthenticated } = useAuth();
  const navigate            = useNavigate();
  const location            = useLocation();

  // ✅ Route to correct detail page based on current path
  const detailPath = location.pathname.startsWith("/user")
    ? `/user/products/${product._id}`
    : `/shop/${product._id}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock === 0) return;
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your cart", {
        duration: 3000, icon: "🔒",
      });
      navigate("/login", { state: { from: detailPath } });
      return;
    }
    addToCart(product);
    toast.success(`${product.name} added to cart!`, { duration: 2000 });
  };

  const rating    = product.ratings    ?? 0;
  const reviews   = product.numReviews ?? 0;
  const fullStars = Math.floor(rating);
  const hasHalf   = rating - fullStars >= 0.5;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="product-card group"
    >
      {/* ── Image ─────────────────────────────────────────────── */}
      <Link to={detailPath}>
        <div
          className="relative h-44 sm:h-52 overflow-hidden"
          style={{ background: "#f4f5f8" }}
        >
          <img
            src={product.images?.[0]?.url || "/placeholder.jpg"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform
              duration-500 group-hover:scale-110"
          />

          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100
              transition-opacity duration-300 flex items-center justify-center"
            style={{ background: "rgba(19,33,60,0.4)" }}
          >
            <span
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                text-xs font-semibold shadow-lg"
              style={{ background: "#ffffff", color: "#13213c" }}
            >
              <Eye size={14} />
              Quick View
            </span>
          </div>

          <div className="absolute top-2 sm:top-3 left-2 sm:left-3
            flex flex-col gap-1 sm:gap-1.5">
            {product.featured && (
              <span
                className="inline-flex items-center gap-1 text-white
                  text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 sm:py-1
                  rounded-full font-semibold shadow-md"
                style={{ background: "linear-gradient(to right,#d4b26a,#c69e4f)" }}
              >
                <Sparkles size={9} /> Featured
              </span>
            )}
            {product.stock === 0 && (
              <span
                className="text-white text-[10px] sm:text-xs px-2 sm:px-2.5
                  py-0.5 sm:py-1 rounded-full font-semibold"
                style={{ background: "rgba(19,33,60,0.85)" }}
              >
                Sold Out
              </span>
            )}
            {product.stock > 0 && product.stock <= 5 && (
              <span
                className="text-white text-[10px] sm:text-xs px-2 sm:px-2.5
                  py-0.5 sm:py-1 rounded-full font-semibold"
                style={{ background: "#c69e4f" }}
              >
                Only {product.stock} left
              </span>
            )}
          </div>
        </div>
      </Link>

      {/* ── Content ───────────────────────────────────────────── */}
      <div className="p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <Link to={detailPath} className="min-w-0 flex-1">
            <h3
              className="font-semibold text-xs sm:text-sm line-clamp-2
                leading-snug hover:text-[#d4b26a] transition-colors"
              style={{ color: "#13213c" }}
            >
              {product.name}
            </h3>
          </Link>
          <span
            className="flex-shrink-0 text-[10px] px-2 py-0.5 rounded-full
              font-semibold"
            style={{
              background: "rgba(212,178,106,0.15)",
              color:      "#13213c",
              border:     "1px solid rgba(212,178,106,0.3)",
            }}
          >
            {product.category}
          </span>
        </div>

        <div className="flex items-center gap-1.5 mb-2 sm:mb-3">
          <div className="flex items-center gap-px">
            {[1, 2, 3, 4, 5].map((n) => (
              <Star
                key={n}
                size={11}
                strokeWidth={1.5}
                style={{
                  color: n <= fullStars || (n === fullStars + 1 && hasHalf)
                    ? "#d4b26a" : "#d1d5db",
                  fill:  n <= fullStars
                    ? "#d4b26a"
                    : n === fullStars + 1 && hasHalf
                    ? "#d4b26a80" : "none",
                }}
              />
            ))}
          </div>
          <span className="text-[10px] sm:text-xs" style={{ color: "#4f6080" }}>
            ({reviews})
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <span
            className="text-base sm:text-xl font-extrabold"
            style={{
              background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor:  "transparent",
              backgroundClip:       "text",
            }}
          >
            ₹{product.price?.toLocaleString("en-IN", {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>

          <motion.button
            whileTap={{ scale: 0.92 }}
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5
              sm:px-3 sm:py-2 rounded-xl sm:rounded-2xl
              text-[10px] sm:text-xs font-semibold
              transition-all duration-200 disabled:cursor-not-allowed"
            style={
              product.stock === 0
                ? { background: "#f4f5f8", color: "#4f6080" }
                : !isAuthenticated
                ? {
                    background: "linear-gradient(to right,rgba(19,33,60,0.07),rgba(19,33,60,0.1))",
                    color:      "#13213c",
                    border:     "1px solid rgba(19,33,60,0.12)",
                  }
                : {
                    background: "linear-gradient(to right,#13213c,#264670)",
                    color:      "#ffffff",
                    boxShadow:  "0 4px 12px rgba(19,33,60,0.3)",
                  }
            }
          >
            {product.stock === 0 ? (
              "Sold Out"
            ) : !isAuthenticated ? (
              <>
                <LogIn size={11} className="sm:hidden" />
                <LogIn size={13} className="hidden sm:block" />
                Login
              </>
            ) : (
              <>
                <ShoppingCart size={11} className="sm:hidden" />
                <ShoppingCart size={14} className="hidden sm:block" />
                Add
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;