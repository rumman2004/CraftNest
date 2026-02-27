import { useState, useRef, useEffect }  from "react";
import { Link, NavLink, useNavigate }   from "react-router-dom";
import { motion, AnimatePresence }      from "framer-motion";
import {
  ShoppingCart, Home, Package, User,
  LogOut, Menu, X, Heart,
  ShoppingBag, Search,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.1)",
  goldBorder: "rgba(212,178,106,0.2)",
  text:       "#13213c",
  textSub:    "#4f6080",
  border:     "rgba(19,33,60,0.07)",
  red:        "#dc2626",
};

const navLinks = [
  { to: "/user/home",     icon: Home,        label: "Home"     },
  { to: "/user/products", icon: ShoppingBag, label: "Products" },
  { to: "/user/orders",   icon: Package,     label: "Orders"   },
  { to: "/user/profile",  icon: User,        label: "Profile"  },
];

// ── Thin divider ───────────────────────────────────────────────────────────
const Divider = () => (
  <div
    className="my-1.5"
    style={{ borderTop: `1px solid ${C.border}` }}
  />
);

// ══════════════════════════════════════════════════════════════════════════
const UserNav = () => {
  const { user, logout } = useAuth();
  const { totalItems }   = useCart();
  const navigate         = useNavigate();

  const [mobileOpen,  setMobileOpen ] = useState(false);
  const [searchOpen,  setSearchOpen ] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef(null);

  // ── Auto-focus search input when it opens ─────────────────────────────
  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // ── Close search on Escape ────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setSearchQuery("");
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // ── Close mobile menu on resize to md+ ────────────────────────────────
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth >= 768) setMobileOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setMobileOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/user/products?search=${encodeURIComponent(q)}`);
    setSearchQuery("");
    setSearchOpen(false);
    setMobileOpen(false);
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav
      className="sticky top-0 z-50 backdrop-blur-xl"
      style={{
        background:   "rgba(255,255,255,0.93)",
        borderBottom: `1px solid ${C.border}`,
        boxShadow:    "0 1px 20px rgba(19,33,60,0.07)",
      }}
    >
      {/* ── Gold top accent bar ───────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px] pointer-events-none"
        style={{
          background:
            "linear-gradient(to right,#13213c,#d4b26a,#264670)",
        }}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-5 lg:px-8">

        {/* ── Main bar ──────────────────────────────────────────────── */}
        <div className="flex items-center justify-between h-14 sm:h-16">

          {/* Logo */}
          <Link
            to="/user/home"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl
                flex items-center justify-center shadow-md flex-shrink-0"
              style={{
                background: "linear-gradient(135deg,#13213c,#264670)",
              }}
            >
              <Heart
                size={13}
                className="text-white"
                strokeWidth={2}
                fill="rgba(212,178,106,0.5)"
              />
            </div>
            {/* ✅ Hide text on very small screens to save space */}
            <span
              className="hidden xs:inline-block sm:inline-block
                text-lg sm:text-xl font-black tracking-tight"
              style={{
                background:           "linear-gradient(to right,#13213c,#264670)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor:  "transparent",
                backgroundClip:       "text",
              }}
            >
              CraftNest
            </span>
          </Link>

          {/* ── Desktop nav links ──────────────────────────────────── */}
          <div className="hidden md:flex items-center gap-0.5 lg:gap-1">
            {navLinks.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className="flex items-center gap-1.5 lg:gap-2
                  px-3 lg:px-4 py-2 rounded-xl
                  text-xs lg:text-sm font-semibold
                  transition-all duration-200 whitespace-nowrap"
                style={({ isActive }) => ({
                  color:      isActive ? C.text                    : C.textSub,
                  background: isActive ? "rgba(212,178,106,0.12)" : "transparent",
                })}
              >
                <Icon size={14} />
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── Right-side actions ─────────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Search toggle */}
            <button
              onClick={() => {
                setSearchOpen((v) => !v);
                setSearchQuery("");
              }}
              aria-label="Toggle search"
              className="p-2 sm:p-2.5 rounded-xl
                transition-all duration-200"
              style={{
                color:      searchOpen ? C.text : C.textSub,
                background: searchOpen ? C.goldLight : "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.goldLight;
                e.currentTarget.style.color      = C.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  searchOpen ? C.goldLight : "transparent";
                e.currentTarget.style.color =
                  searchOpen ? C.text : C.textSub;
              }}
            >
              {searchOpen
                ? <X size={17} />
                : <Search size={17} />
              }
            </button>

            {/* Cart */}
            <Link
              to="/user/cart"
              aria-label="Shopping cart"
              className="relative p-2 sm:p-2.5 rounded-xl
                transition-all duration-200"
              style={{ color: C.textSub }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = C.goldLight;
                e.currentTarget.style.color      = C.text;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color      = C.textSub;
              }}
            >
              <ShoppingCart size={17} />
              {totalItems > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 h-[17px]
                    min-w-[17px] px-0.5 rounded-full text-white
                    text-[9px] sm:text-[10px]
                    flex items-center justify-center font-black"
                  style={{
                    background:
                      "linear-gradient(135deg,#d4b26a,#c69e4f)",
                  }}
                >
                  {totalItems > 9 ? "9+" : totalItems}
                </motion.span>
              )}
            </Link>

            {/* User chip — desktop only */}
            <div
              className="hidden md:flex items-center gap-2
                px-2.5 lg:px-3 py-1.5 rounded-xl"
              style={{
                background: C.goldLight,
                border:     `1px solid ${C.goldBorder}`,
              }}
            >
              <div
                className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg flex items-center
                  justify-center text-white text-[10px] lg:text-xs
                  font-bold shadow-sm flex-shrink-0"
                style={{
                  background: "linear-gradient(135deg,#13213c,#264670)",
                }}
              >
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span
                className="text-xs lg:text-sm font-semibold
                  max-w-[80px] lg:max-w-[120px] truncate"
                style={{ color: C.text }}
              >
                {user?.name?.split(" ")[0]}
              </span>
            </div>

            {/* Logout — desktop only */}
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5
                px-2.5 lg:px-3 py-2 rounded-xl
                text-xs lg:text-sm font-semibold
                transition-colors duration-200 whitespace-nowrap"
              style={{ color: C.red }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(220,38,38,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <LogOut size={14} />
              <span className="hidden lg:inline">Logout</span>
            </button>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              className="md:hidden p-2 sm:p-2.5 rounded-xl
                transition-colors duration-200"
              style={{ color: C.textSub }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background =
                  "rgba(19,33,60,0.06)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
              }}
            >
              <motion.div
                animate={{ rotate: mobileOpen ? 90 : 0 }}
                transition={{ duration: 0.18 }}
              >
                {mobileOpen ? <X size={19} /> : <Menu size={19} />}
              </motion.div>
            </button>
          </div>
        </div>

        {/* ── Desktop search bar ─────────────────────────────────────── */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              key="desktop-search"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0     }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden hidden md:block"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <form
                onSubmit={handleSearch}
                className="flex items-center gap-2.5 py-3"
              >
                {/* Input wrapper */}
                <div
                  className="flex items-center gap-2.5 flex-1
                    px-4 py-2.5 rounded-2xl transition-all duration-150"
                  style={{
                    background: "rgba(19,33,60,0.03)",
                    border:     "1px solid rgba(19,33,60,0.09)",
                  }}
                  onFocusCapture={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(212,178,106,0.5)";
                    e.currentTarget.style.boxShadow  =
                      "0 0 0 3px rgba(212,178,106,0.1)";
                  }}
                  onBlurCapture={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(19,33,60,0.09)";
                    e.currentTarget.style.boxShadow  = "none";
                  }}
                >
                  <Search
                    size={15}
                    style={{ color: C.textSub, flexShrink: 0 }}
                  />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search handcrafted products…"
                    className="flex-1 bg-transparent outline-none
                      text-sm font-medium"
                    style={{ color: C.text, caretColor: C.gold }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        searchInputRef.current?.focus();
                      }}
                      style={{ color: C.textSub }}
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{  scale: 0.97  }}
                  disabled={!searchQuery.trim()}
                  className="flex items-center gap-2 px-5 py-2.5
                    rounded-2xl text-sm font-bold text-white
                    flex-shrink-0 transition-all duration-150
                    disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{
                    background:
                      "linear-gradient(135deg,#13213c,#264670)",
                    boxShadow: searchQuery.trim()
                      ? "0 4px 14px rgba(19,33,60,0.25)"
                      : "none",
                  }}
                >
                  <Search size={14} />
                  Search
                </motion.button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Mobile drawer ──────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0     }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden"
              style={{ borderTop: `1px solid ${C.border}` }}
            >
              <div className="py-2 space-y-0.5">

                {/* ── Mobile search ───────────────────────────────── */}
                <form onSubmit={handleSearch} className="px-1 pt-1 pb-2">
                  <div
                    className="flex items-center gap-2.5
                      px-3.5 py-2.5 rounded-2xl"
                    style={{
                      background: "rgba(19,33,60,0.03)",
                      border:     "1px solid rgba(19,33,60,0.09)",
                    }}
                  >
                    <Search
                      size={14}
                      style={{ color: C.textSub, flexShrink: 0 }}
                    />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search products…"
                      className="flex-1 bg-transparent outline-none
                        text-sm font-medium min-w-0"
                      style={{ color: C.text, caretColor: C.gold }}
                    />
                    {searchQuery ? (
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        style={{ color: C.textSub, flexShrink: 0 }}
                      >
                        <X size={13} />
                      </button>
                    ) : null}
                  </div>
                </form>

                <Divider />

                {/* ── Nav links ───────────────────────────────────── */}
                {navLinks.map(({ to, icon: Icon, label }) => (
                  <NavLink
                    key={to}
                    to={to}
                    onClick={closeMobile}
                    className="flex items-center gap-3 px-3 py-2.5
                      rounded-xl text-sm font-semibold
                      transition-all duration-150 mx-1"
                    style={({ isActive }) => ({
                      color:      isActive ? C.text                    : C.textSub,
                      background: isActive ? "rgba(212,178,106,0.12)" : "transparent",
                    })}
                  >
                    {/* Active indicator dot */}
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <span
                            className="w-1.5 h-1.5 rounded-full
                              flex-shrink-0 -ml-0.5"
                            style={{ background: C.gold }}
                          />
                        )}
                        <Icon size={15} />
                        {label}
                      </>
                    )}
                  </NavLink>
                ))}

                <Divider />

                {/* ── User chip ───────────────────────────────────── */}
                <div
                  className="flex items-center gap-3 px-3 py-3
                    rounded-xl mx-1"
                  style={{
                    background: C.goldLight,
                    border:     `1px solid ${C.goldBorder}`,
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center
                      justify-center text-white text-sm font-bold
                      shadow-sm flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg,#13213c,#264670)",
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-bold leading-tight truncate"
                      style={{ color: C.text }}
                    >
                      {user?.name}
                    </p>
                    <p
                      className="text-[11px] leading-tight truncate mt-0.5"
                      style={{ color: C.textSub }}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* ── Logout ──────────────────────────────────────── */}
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5
                    rounded-xl text-sm font-semibold mx-1
                    transition-all duration-150"
                  style={{
                    color: C.red,
                    width: "calc(100% - 8px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(220,38,38,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <LogOut size={15} />
                  Logout
                </button>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </nav>
  );
};

export default UserNav;