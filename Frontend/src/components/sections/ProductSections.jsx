import {
  useState, useEffect, useCallback, useRef,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, PackageSearch, Sparkles,
  Scissors, Palette, Flower2, Shirt, LayoutGrid,
  List, ChevronDown, Star, X, Filter, ArrowUpDown,
} from "lucide-react";
import { getProducts } from "../../services/api";
import ProductCard     from "../ui/ProductCard";

// ── Category config ────────────────────────────────────────────────────────
const CATEGORIES = [
  { label: "All",          icon: LayoutGrid },
  { label: "Crochet",      icon: Scissors   },
  { label: "Embroidery",   icon: Palette    },
  { label: "Pipe Cleaner", icon: Flower2    },
  { label: "Woolen",       icon: Shirt      },
  { label: "Other",        icon: Sparkles   },
];

const SORT_OPTIONS = [
  { value: "newest",     label: "Newest First"    },
  { value: "oldest",     label: "Oldest First"    },
  { value: "price-asc",  label: "Price: Low → High" },
  { value: "price-desc", label: "Price: High → Low" },
  { value: "rating",     label: "Top Rated"         },
];

// ── Animation variants ─────────────────────────────────────────────────────
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show:   {
    opacity: 1, y: 0,
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] },
  },
};
const stagger = {
  hidden: {},
  show:   { transition: { staggerChildren: 0.06 } },
};

// ── Skeleton card ──────────────────────────────────────────────────────────
const SkeletonCard = () => (
  <div
    className="rounded-3xl overflow-hidden animate-pulse"
    style={{
      background: "rgba(255,255,255,0.85)",
      border:     "1px solid rgba(19,33,60,0.07)",
      boxShadow:  "0 2px 12px rgba(19,33,60,0.05)",
    }}
  >
    <div
      className="h-52"
      style={{ background: "linear-gradient(135deg,#e8eaee,#f0f2f5)" }}
    />
    <div className="p-4 space-y-3">
      <div
        className="h-4 rounded-full w-3/4"
        style={{ background: "rgba(19,33,60,0.08)" }}
      />
      <div
        className="h-3 rounded-full w-1/2"
        style={{ background: "rgba(19,33,60,0.05)" }}
      />
      <div className="flex justify-between items-center pt-1">
        <div
          className="h-5 rounded-full w-1/3"
          style={{ background: "rgba(19,33,60,0.08)" }}
        />
        <div
          className="h-8 w-8 rounded-xl"
          style={{ background: "rgba(19,33,60,0.08)" }}
        />
      </div>
    </div>
  </div>
);

// ── Empty state ────────────────────────────────────────────────────────────
const EmptyState = ({ search, category, onReset }) => (
  <motion.div
    initial={{ opacity: 0, y: 32 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="col-span-full flex flex-col items-center
      justify-center py-20 px-4"
  >
    <div className="relative w-full max-w-sm">
      {/* Depth layers */}
      <div
        className="absolute inset-x-8 -bottom-3 h-full
          rounded-[2rem] blur-xl -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(212,178,106,0.18)," +
            "rgba(38,70,112,0.12))",
        }}
      />
      <div
        className="absolute inset-x-4 -bottom-1.5 h-full
          rounded-[2rem] blur-sm -z-10"
        style={{ background: "rgba(255,255,255,0.7)" }}
      />

      <div
        className="relative rounded-[2rem] px-8 py-10
          text-center overflow-hidden"
        style={{
          background: "rgba(255,255,255,0.97)",
          border:     "1px solid rgba(19,33,60,0.08)",
          boxShadow:
            "0 16px 48px rgba(19,33,60,0.1)," +
            "0 4px 16px rgba(212,178,106,0.08)",
        }}
      >
        {/* Gold top bar */}
        <div
          className="absolute top-0 left-0 right-0 h-[3px]"
          style={{
            background:
              "linear-gradient(to right, #d4b26a, #264670, #13213c)",
          }}
        />
        {/* Corner accent */}
        <div
          className="absolute top-0 right-0 w-24 h-24 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right," +
              "rgba(212,178,106,0.1), transparent 70%)",
          }}
        />

        {/* Animated icon */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
          transition={{
            duration: 3.5, repeat: Infinity, ease: "easeInOut",
          }}
          className="relative inline-block mb-5"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
            transition={{
              duration: 3.5, repeat: Infinity, ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-2xl blur-xl scale-125
              pointer-events-none"
            style={{ background: "linear-gradient(135deg,#d4b26a,#264670)" }}
          />
          <div
            className="relative w-16 h-16 rounded-2xl flex items-center
              justify-center"
            style={{
              background:
                "linear-gradient(135deg, #13213c, #264670)",
              boxShadow: "0 8px 24px rgba(19,33,60,0.3)",
            }}
          >
            <div
              className="absolute -top-3 -left-2 w-10 h-10
                rounded-full blur-md"
              style={{ background: "rgba(212,178,106,0.2)" }}
            />
            <PackageSearch
              size={28}
              className="text-white relative z-10"
              strokeWidth={1.6}
            />
          </div>
        </motion.div>

        <h3
          className="text-lg font-black mb-2"
          style={{ color: "#13213c" }}
        >
          No products found
        </h3>
        <p
          className="text-sm leading-relaxed mb-6 max-w-[220px] mx-auto"
          style={{ color: "#4f6080" }}
        >
          {search
            ? `No results for "${search}"${
                category !== "All" ? ` in ${category}` : ""
              }.`
            : `No items in ${category} yet. Check back soon!`}
        </p>

        {/* Bouncing craft icons */}
        <div className="flex items-center justify-center gap-3 mb-6">
          {[Scissors, Palette, Flower2, Shirt].map((Icon, i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -6, 0] }}
              transition={{
                duration: 1.4, repeat: Infinity,
                delay: i * 0.2, ease: "easeInOut",
              }}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: "#f5f6f8",
                border:     "1px solid rgba(19,33,60,0.08)",
              }}
            >
              <Icon size={15} strokeWidth={1.8}
                style={{ color: "#d4b26a" }} />
            </motion.div>
          ))}
        </div>

        {/* Reset button */}
        <motion.button
          onClick={onReset}
          whileHover={{ scale: 1.03, y: -1 }}
          whileTap={{  scale: 0.97        }}
          className="relative inline-flex items-center gap-2 px-6 py-3
            rounded-2xl font-bold text-white text-sm overflow-hidden
            shadow-lg"
          style={{
            background:
              "linear-gradient(to right, #13213c, #264670)",
            boxShadow: "0 4px 18px rgba(19,33,60,0.35)",
          }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r
              from-transparent via-white/15 to-transparent -skew-x-12"
            initial={{ x: "-130%" }}
            animate={{ x: "230%"  }}
            transition={{
              duration: 2.2, repeat: Infinity,
              ease: "linear", repeatDelay: 2.5,
            }}
          />
          <X size={14} className="relative z-10" />
          <span className="relative z-10">Clear Filters</span>
        </motion.button>
      </div>
    </div>
  </motion.div>
);

// ══════════════════════════════════════════════════════════════════════════
// Main component
// ══════════════════════════════════════════════════════════════════════════
const ProductSections = () => {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [search,   setSearch  ] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy,   setSortBy  ] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [showSort, setShowSort] = useState(false);

  const sortRef    = useRef(null);
  const searchRef  = useRef(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getProducts();
      // Normalize: API may return { products: [] } or [] directly
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.products)
        ? data.products
        : [];
      setProducts(list);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // ── Close sort dropdown on outside click ──────────────────────────────
  useEffect(() => {
    if (!showSort) return;
    const handler = (e) => {
      if (sortRef.current && !sortRef.current.contains(e.target)) {
        setShowSort(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSort]);

  // ── Filter + sort ─────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...products];

    // Category filter
    if (category !== "All") {
      result = result.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.tags?.some?.((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort — use `ratings` field (matches backend schema)
    switch (sortBy) {
      case "oldest":
        result.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        break;
      case "price-asc":
        result.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
        break;
      case "rating":
        // Support both `ratings` and `rating` field names
        result.sort(
          (a, b) =>
            (b.ratings ?? b.rating ?? 0) -
            (a.ratings ?? a.rating ?? 0)
        );
        break;
      default: // "newest"
        result.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
    }

    setFiltered(result);
  }, [products, category, search, sortBy]);

  // ── Handlers ──────────────────────────────────────────────────────────
  const handleReset = () => {
    setSearch("");
    setCategory("All");
    setSortBy("newest");
  };

  const activeSortLabel =
    SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? "Sort";

  const hasActiveFilters = search.trim() || category !== "All";

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <section
      className="relative min-h-screen pb-24 overflow-x-hidden"
      style={{ background: "#f4f5f8" }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(19,33,60,0.4) 1px, transparent 1px),
            linear-gradient(90deg, rgba(19,33,60,0.4) 1px, transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Ambient blobs */}
      <div
        className="absolute -top-40 -left-40 w-[500px] h-[500px]
          rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(212,178,106,0.1)" }}
      />
      <div
        className="absolute -bottom-40 -right-40 w-[460px] h-[460px]
          rounded-full blur-3xl pointer-events-none"
        style={{ background: "rgba(38,70,112,0.08)" }}
      />

      <div
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
          pt-10 pb-4"
      >
        {/* ── Page header ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <span
            className="inline-flex items-center gap-2 px-3 py-1.5
              rounded-full text-xs font-bold tracking-widest uppercase mb-4"
            style={{
              background: "rgba(212,178,106,0.15)",
              color:      "#13213c",
              border:     "1px solid rgba(212,178,106,0.35)",
            }}
          >
            <Sparkles size={12} style={{ color: "#d4b26a" }} />
            Handcrafted with love
          </span>

          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight mb-1"
            style={{ color: "#13213c" }}
          >
            Our{" "}
            <span className="relative inline-block">
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #d4b26a, #264670)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Collection
              </span>
              <motion.svg
                viewBox="0 0 160 8"
                className="absolute -bottom-0.5 left-0 w-full"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <motion.path
                  d="M 0 4 Q 40 0 80 4 Q 120 8 160 4"
                  fill="none"
                  stroke="url(#shopGrad)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                />
                <defs>
                  <linearGradient
                    id="shopGrad" x1="0%" y1="0%" x2="100%" y2="0%"
                  >
                    <stop offset="0%"   stopColor="#d4b26a" />
                    <stop offset="100%" stopColor="#264670" />
                  </linearGradient>
                </defs>
              </motion.svg>
            </span>
          </h1>
          <p
            className="text-sm mt-2"
            style={{ color: "#4f6080" }}
          >
            Explore our handmade crafts — made with care, one stitch at a time
          </p>
        </motion.div>

        {/* ── Search + Sort + View ────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="flex gap-3 mb-5"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2
                pointer-events-none"
              style={{ color: "#4f6080" }}
            />
            <input
              ref={searchRef}
              type="text"
              placeholder="Search products…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-9 py-3 rounded-2xl text-sm
                font-medium focus:outline-none transition-all duration-200"
              style={{
                background: "rgba(255,255,255,0.9)",
                border:     "1px solid rgba(19,33,60,0.1)",
                color:      "#13213c",
                boxShadow:  "0 2px 8px rgba(19,33,60,0.05)",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#d4b26a";
                e.target.style.boxShadow =
                  "0 0 0 3px rgba(212,178,106,0.2)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = "rgba(19,33,60,0.1)";
                e.target.style.boxShadow =
                  "0 2px 8px rgba(19,33,60,0.05)";
              }}
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1   }}
                  exit={{    opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2
                    w-5 h-5 flex items-center justify-center rounded-full
                    transition-all duration-150"
                  style={{ background: "rgba(19,33,60,0.08)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(212,178,106,0.2)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      "rgba(19,33,60,0.08)")
                  }
                >
                  <X size={11} style={{ color: "#13213c" }} />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Sort dropdown */}
          <div className="relative" ref={sortRef}>
            <motion.button
              onClick={() => setShowSort((v) => !v)}
              whileHover={{ scale: 1.02 }}
              whileTap={{  scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl
                text-sm font-bold text-white whitespace-nowrap
                transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, #13213c, #264670)",
                boxShadow: "0 4px 14px rgba(19,33,60,0.3)",
              }}
            >
              <ArrowUpDown size={14} />
              <span className="hidden sm:inline">{activeSortLabel}</span>
              <ChevronDown
                size={13}
                style={{
                  transition:  "transform 0.2s",
                  transform:    showSort ? "rotate(180deg)" : "rotate(0)",
                }}
              />
            </motion.button>

            <AnimatePresence>
              {showSort && (
                <motion.div
                  initial={{ opacity: 0, y: 8,  scale: 0.95 }}
                  animate={{ opacity: 1, y: 0,  scale: 1    }}
                  exit={{    opacity: 0, y: 8,  scale: 0.95 }}
                  transition={{ duration: 0.17 }}
                  className="absolute right-0 top-full mt-2 w-52 z-50
                    rounded-2xl overflow-hidden"
                  style={{
                    background: "#ffffff",
                    border:     "1px solid rgba(19,33,60,0.09)",
                    boxShadow:
                      "0 4px 6px rgba(19,33,60,0.06)," +
                      "0 16px 40px rgba(19,33,60,0.14)",
                  }}
                >
                  <div
                    className="h-[2px] w-full"
                    style={{
                      background:
                        "linear-gradient(to right, #d4b26a, #264670)",
                    }}
                  />
                  <div className="p-1.5">
                    {SORT_OPTIONS.map((opt) => {
                      const isActive = sortBy === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => {
                            setSortBy(opt.value);
                            setShowSort(false);
                          }}
                          className="w-full flex items-center gap-2.5
                            px-3 py-2.5 rounded-xl text-xs font-semibold
                            text-left transition-all duration-150"
                          style={
                            isActive
                              ? {
                                  background:
                                    "rgba(212,178,106,0.12)",
                                  color: "#13213c",
                                }
                              : { color: "#4f6080" }
                          }
                          onMouseEnter={(e) => {
                            if (!isActive)
                              e.currentTarget.style.background =
                                "rgba(19,33,60,0.04)";
                          }}
                          onMouseLeave={(e) => {
                            if (!isActive)
                              e.currentTarget.style.background =
                                "transparent";
                          }}
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{
                              background: isActive
                                ? "#d4b26a"
                                : "rgba(19,33,60,0.2)",
                            }}
                          />
                          {opt.label}
                          {isActive && (
                            <Star
                              size={9}
                              fill="#d4b26a"
                              strokeWidth={0}
                              className="ml-auto flex-shrink-0"
                              style={{ color: "#d4b26a" }}
                            />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View mode toggle */}
          <div
            className="hidden sm:flex items-center gap-1 p-1 rounded-2xl"
            style={{
              background: "rgba(255,255,255,0.9)",
              border:     "1px solid rgba(19,33,60,0.1)",
              boxShadow:  "0 2px 8px rgba(19,33,60,0.05)",
            }}
          >
            {[
              { mode: "grid", icon: LayoutGrid },
              { mode: "list", icon: List       },
            ].map(({ mode, icon: Icon }) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className="p-2 rounded-xl transition-all duration-200"
                style={
                  viewMode === mode
                    ? {
                        background:
                          "linear-gradient(135deg, #13213c, #264670)",
                        color:     "#fff",
                        boxShadow: "0 2px 8px rgba(19,33,60,0.25)",
                      }
                    : { color: "#4f6080" }
                }
              >
                <Icon size={15} />
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Category pills ────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.45, delay: 0.15 }}
          className="flex items-center gap-2 flex-wrap mb-7"
        >
          <div
            className="flex items-center gap-1.5 mr-1 text-xs font-bold"
            style={{ color: "#4f6080" }}
          >
            <Filter size={12} />
            <span className="hidden sm:inline">Filter</span>
          </div>

          {CATEGORIES.map((cat) => {
            const CatIcon = cat.icon;
            const active  = category === cat.label;
            return (
              <motion.button
                key={cat.label}
                onClick={() => setCategory(cat.label)}
                whileHover={{ scale: 1.04, y: -1 }}
                whileTap={{   scale: 0.97         }}
                className="relative inline-flex items-center gap-1.5
                  px-3.5 py-2 rounded-2xl text-xs font-bold
                  transition-all duration-200 overflow-hidden"
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, #13213c, #264670)",
                        color:     "#fff",
                        boxShadow: "0 4px 14px rgba(19,33,60,0.28)",
                      }
                    : {
                        background: "rgba(255,255,255,0.85)",
                        color:      "#4f6080",
                        border:     "1px solid rgba(19,33,60,0.09)",
                      }
                }
              >
                {/* Shared layout animation for the active pill bg */}
                {active && (
                  <motion.div
                    layoutId="activeCat"
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #13213c, #264670)",
                    }}
                    transition={{
                      type:      "spring",
                      stiffness: 380,
                      damping:   30,
                    }}
                  />
                )}
                <CatIcon size={12} className="relative z-10"
                  strokeWidth={2} />
                <span className="relative z-10">{cat.label}</span>
              </motion.button>
            );
          })}

          {/* Clear filters pill */}
          <AnimatePresence>
            {hasActiveFilters && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{    opacity: 0, scale: 0.8 }}
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-3 py-2
                  rounded-2xl text-xs font-bold transition-all duration-200"
                style={{
                  background: "rgba(239,68,68,0.08)",
                  color:      "#ef4444",
                  border:     "1px solid rgba(239,68,68,0.15)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.14)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(239,68,68,0.08)";
                }}
              >
                <X size={11} />
                Clear
              </motion.button>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Results count ─────────────────────────────────────────── */}
        <AnimatePresence>
          {!loading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              className="flex items-center gap-2 mb-5"
            >
              <div
                className="w-1.5 h-1.5 rounded-full"
                style={{ background: "#d4b26a" }}
              />
              <span
                className="text-xs font-semibold"
                style={{ color: "#4f6080" }}
              >
                {filtered.length === 0
                  ? "No products found"
                  : `${filtered.length} handcrafted item${
                      filtered.length !== 1 ? "s" : ""
                    }`}
              </span>
              {hasActiveFilters && (
                <>
                  <span
                    className="text-xs"
                    style={{ color: "rgba(19,33,60,0.25)" }}
                  >
                    ·
                  </span>
                  <button
                    onClick={handleReset}
                    className="text-xs font-bold transition-colors duration-150"
                    style={{ color: "#d4b26a" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.opacity = "0.75")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.opacity = "1")
                    }
                  >
                    Reset filters
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Product grid / list ───────────────────────────────────── */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="skeletons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              className={`grid gap-5 ${
                viewMode === "list"
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </motion.div>

          ) : filtered.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
            >
              <EmptyState
                search={search}
                category={category}
                onReset={handleReset}
              />
            </motion.div>

          ) : (
            <motion.div
              key="products"
              variants={stagger}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, transition: { duration: 0.15 } }}
              className={`grid gap-5 ${
                viewMode === "list"
                  ? "grid-cols-1"
                  : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              }`}
            >
              {filtered.map((product) => (
                <motion.div key={product._id} variants={fadeUp}>
                  <ProductCard
                    product={product}
                    listView={viewMode === "list"}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default ProductSections;