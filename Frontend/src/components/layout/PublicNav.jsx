import { useState, useRef, useEffect } from "react";
import { Link, NavLink, useNavigate }  from "react-router-dom";
import { motion, AnimatePresence }     from "framer-motion";
import {
  ShoppingCart, Menu, X, User, LogOut, Shield,
  Sparkles, Heart, ChevronDown, Package,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";

const navLinks = [
  { to: "/home",  label: "Home",  end: true },
  { to: "/shop",  label: "Shop"             },
  { to: "/about", label: "About"            },
];

const userMenuItems = [
  { to: "/user/home",   label: "My Account", icon: User    },
  { to: "/user/orders", label: "My Orders",  icon: Package },
];

const PublicNav = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems }                    = useCart();
  const [mobileOpen,   setMobileOpen]     = useState(false);
  const [dropdownOpen, setDropdownOpen]   = useState(false);
  const dropdownRef = useRef(null);
  const navigate    = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Lock body scroll when mobile menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    navigate("/");
    setDropdownOpen(false);
    setMobileOpen(false);
  };

  return (
    <>
      {/* ── Navbar ────────────────────────────────────────────────────── */}
      <nav
        className="sticky top-0 z-50 backdrop-blur-2xl"
        style={{
          background: "rgba(255,255,255,0.92)",
          borderBottom: "1px solid rgba(19,33,60,0.08)",
          boxShadow: "0 1px 24px rgba(19,33,60,0.07)",
        }}
      >
        {/* Gold top accent */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px]"
          style={{
            background:
              "linear-gradient(to right, #13213c, #d4b26a, #264670)",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link
              to="/home"
              className="flex items-center gap-2.5 group flex-shrink-0"
              onClick={() => setMobileOpen(false)}
            >
              <motion.div
                whileHover={{ scale: 1.08, rotate: 6 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
                className="relative w-9 h-9 rounded-xl flex items-center
                  justify-center shadow-md"
                style={{
                  background:
                    "linear-gradient(135deg, #13213c, #264670)",
                  boxShadow: "0 4px 14px rgba(19,33,60,0.3)",
                }}
              >
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden
                    pointer-events-none"
                >
                  <div
                    className="absolute -top-2 -left-1.5 w-6 h-6
                      rounded-full blur-sm"
                    style={{ background: "rgba(212,178,106,0.25)" }}
                  />
                </div>
                <Heart
                  size={16}
                  className="text-white relative z-10"
                  strokeWidth={2}
                  fill="rgba(212,178,106,0.5)"
                />
              </motion.div>

              <span
                className="text-xl font-black tracking-tight"
                style={{
                  background:
                    "linear-gradient(to right, #13213c, #264670)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                CraftNest
              </span>
            </Link>

            {/* ── Desktop nav links ──────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className="relative px-4 py-2 rounded-xl font-semibold
                    text-sm transition-all duration-200"
                  style={({ isActive }) => ({
                    color: isActive ? "#13213c" : "#4f545f",
                    background: isActive
                      ? "rgba(212,178,106,0.12)"
                      : "transparent",
                  })}
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.div
                          layoutId="navUnderline"
                          className="absolute bottom-0.5 left-3 right-3
                            h-0.5 rounded-full"
                          style={{
                            background:
                              "linear-gradient(to right, #d4b26a, #264670)",
                          }}
                          transition={{
                            type: "spring",
                            stiffness: 380,
                            damping: 30,
                          }}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>

            {/* ── Actions ───────────────────────────────────────────── */}
            <div className="flex items-center gap-1">

              {/* Cart */}
              <Link
                to="/user/cart"
                aria-label="Shopping cart"
                className="relative p-2.5 rounded-xl transition-all duration-200"
                style={{ color: "#4f545f" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(212,178,106,0.1)";
                  e.currentTarget.style.color = "#13213c";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#4f545f";
                }}
              >
                <ShoppingCart size={18} />
                <AnimatePresence>
                  {totalItems > 0 && (
                    <motion.span
                      key="badge"
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{    scale: 0, opacity: 0 }}
                      transition={{
                        type: "spring", stiffness: 500, damping: 20,
                      }}
                      className="absolute -top-0.5 -right-0.5 min-w-[18px]
                        h-[18px] px-1 rounded-full text-white text-[10px]
                        flex items-center justify-center font-black shadow-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, #d4b26a, #c69e4f)",
                      }}
                    >
                      {totalItems > 9 ? "9+" : totalItems}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>

              {/* Auth — authenticated */}
              {isAuthenticated ? (
                <div className="relative" ref={dropdownRef}>
                  <motion.button
                    onClick={() => setDropdownOpen((v) => !v)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 pl-1.5 pr-2.5 py-1.5
                      rounded-xl transition-all duration-200"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(19,33,60,0.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    {/* Avatar */}
                    <div
                      className="w-8 h-8 rounded-xl flex items-center
                        justify-center text-white font-black text-sm
                        shadow-md flex-shrink-0"
                      style={{
                        background:
                          "linear-gradient(135deg, #13213c, #264670)",
                        boxShadow: "0 4px 12px rgba(19,33,60,0.25)",
                      }}
                    >
                      {user?.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                    <span
                      className="hidden sm:block text-xs font-bold
                        max-w-[72px] truncate"
                      style={{ color: "#13213c" }}
                    >
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown
                      size={13}
                      className={`transition-transform duration-200
                        ${dropdownOpen ? "rotate-180" : ""}`}
                      style={{ color: "#4f545f" }}
                    />
                  </motion.button>

                  {/* Dropdown */}
                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.94, y: -6 }}
                        animate={{ opacity: 1, scale: 1,    y: 0  }}
                        exit={{    opacity: 0, scale: 0.94, y: -6 }}
                        transition={{
                          duration: 0.16,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="absolute right-0 top-[calc(100%+8px)]
                          w-56 backdrop-blur-xl rounded-2xl overflow-hidden
                          z-50"
                        style={{
                          background: "rgba(255,255,255,0.98)",
                          border: "1px solid rgba(19,33,60,0.08)",
                          boxShadow: "0 16px 48px rgba(19,33,60,0.12)",
                        }}
                      >
                        {/* Gold top bar */}
                        <div
                          className="h-[2px] w-full"
                          style={{
                            background:
                              "linear-gradient(to right, #d4b26a, #264670)",
                          }}
                        />

                        {/* User info header */}
                        <div
                          className="px-4 py-3.5"
                          style={{
                            background:
                              "linear-gradient(135deg, rgba(212,178,106,0.08), rgba(38,70,112,0.06))",
                            borderBottom: "1px solid rgba(19,33,60,0.06)",
                          }}
                        >
                          <div className="flex items-center gap-2.5">
                            <div
                              className="w-9 h-9 rounded-xl flex-shrink-0
                                flex items-center justify-center
                                text-white font-black text-sm shadow-md"
                              style={{
                                background:
                                  "linear-gradient(135deg, #13213c, #264670)",
                              }}
                            >
                              {user?.name?.[0]?.toUpperCase() ?? "U"}
                            </div>
                            <div className="min-w-0">
                              <p
                                className="font-bold text-sm truncate"
                                style={{ color: "#13213c" }}
                              >
                                {user?.name}
                              </p>
                              <p
                                className="text-xs truncate"
                                style={{ color: "#4f545f" }}
                              >
                                {user?.email}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Menu items */}
                        <div className="p-1.5 space-y-0.5">
                          {user?.role === "admin" ? (
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3
                                py-2.5 rounded-xl text-sm font-semibold
                                transition-all duration-150 group"
                              style={{ color: "#13213c" }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background =
                                  "rgba(212,178,106,0.1)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background =
                                  "transparent";
                              }}
                            >
                              <div
                                className="w-7 h-7 rounded-lg flex items-center
                                  justify-center shadow-sm"
                                style={{
                                  background:
                                    "linear-gradient(135deg, #13213c, #264670)",
                                }}
                              >
                                <Shield size={13} className="text-white" />
                              </div>
                              Admin Panel
                            </Link>
                          ) : (
                            userMenuItems.map(({ to, label, icon: Icon }) => (
                              <Link
                                key={to}
                                to={to}
                                onClick={() => setDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-3
                                  py-2.5 rounded-xl text-sm font-semibold
                                  transition-all duration-150"
                                style={{ color: "#4f545f" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background =
                                    "rgba(19,33,60,0.04)";
                                  e.currentTarget.style.color = "#13213c";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background =
                                    "transparent";
                                  e.currentTarget.style.color = "#4f545f";
                                }}
                              >
                                <div
                                  className="w-7 h-7 rounded-lg flex items-center
                                    justify-center"
                                  style={{
                                    background:
                                      "var(--color-oxford-gray-light)",
                                    border: "1px solid rgba(19,33,60,0.08)",
                                  }}
                                >
                                  <Icon
                                    size={13}
                                    style={{ color: "#4f545f" }}
                                  />
                                </div>
                                {label}
                              </Link>
                            ))
                          )}

                          {/* Divider */}
                          <div
                            className="h-px mx-2 my-1"
                            style={{
                              background: "rgba(19,33,60,0.07)",
                            }}
                          />

                          {/* Logout */}
                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5
                              px-3 py-2.5 rounded-xl text-sm font-semibold
                              transition-all duration-150"
                            style={{ color: "#dc2626" }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(220,38,38,0.06)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background =
                                "transparent";
                            }}
                          >
                            <div
                              className="w-7 h-7 rounded-lg flex items-center
                                justify-center"
                              style={{
                                background: "rgba(220,38,38,0.08)",
                              }}
                            >
                              <LogOut size={13} style={{ color: "#dc2626" }} />
                            </div>
                            Sign Out
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                /* Guest buttons */
                <div className="hidden md:flex items-center gap-2 ml-1">
                  <Link
                    to="/login"
                    className="px-4 py-2 text-sm font-bold rounded-xl
                      transition-all duration-200"
                    style={{
                      color: "#13213c",
                      border: "2px solid rgba(19,33,60,0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#d4b26a";
                      e.currentTarget.style.background =
                        "rgba(212,178,106,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(19,33,60,0.2)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    className="relative px-4 py-2 text-sm font-bold
                      text-white rounded-xl overflow-hidden
                      hover:-translate-y-0.5 transition-all duration-200
                      active:scale-95"
                    style={{
                      background:
                        "linear-gradient(to right, #13213c, #264670)",
                      boxShadow: "0 4px 14px rgba(19,33,60,0.35)",
                    }}
                  >
                    {/* Gold shimmer */}
                    <motion.div
                      className="absolute inset-0 -skew-x-12"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, rgba(212,178,106,0.25), transparent)",
                      }}
                      initial={{ x: "-130%" }}
                      animate={{ x: "230%" }}
                      transition={{
                        duration: 2.5, repeat: Infinity,
                        ease: "linear", repeatDelay: 3,
                      }}
                    />
                    <span className="relative flex items-center gap-1.5">
                      <Sparkles size={13} />
                      Sign Up
                    </span>
                  </Link>
                </div>
              )}

              {/* Mobile hamburger */}
              <motion.button
                onClick={() => setMobileOpen((v) => !v)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.93 }}
                aria-label="Toggle menu"
                className="md:hidden p-2.5 rounded-xl ml-0.5
                  transition-all duration-200"
                style={{ color: "#4f545f" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(19,33,60,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <AnimatePresence mode="wait">
                  {mobileOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0   }}
                      exit={{    opacity: 0, rotate: 90  }}
                      transition={{ duration: 0.15 }}
                    >
                      <X size={20} />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90  }}
                      animate={{ opacity: 1, rotate: 0   }}
                      exit={{    opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Menu size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Mobile menu ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{    opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: "rgba(19,33,60,0.35)", backdropFilter: "blur(4px)" }}
            />

            {/* Drawer */}
            <motion.div
              key="drawer"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: "0%"   }}
              exit={{    opacity: 0, x: "100%"  }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 right-0 bottom-0 z-50 w-[280px]
                md:hidden flex flex-col backdrop-blur-2xl"
              style={{
                background: "rgba(255,255,255,0.98)",
                borderLeft: "1px solid rgba(19,33,60,0.08)",
                boxShadow: "-16px 0 48px rgba(19,33,60,0.12)",
              }}
            >
              {/* Gold top bar */}
              <div
                className="h-[2px] w-full flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(to right, #13213c, #d4b26a, #264670)",
                }}
              />

              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-4
                  flex-shrink-0"
                style={{ borderBottom: "1px solid rgba(19,33,60,0.07)" }}
              >
                <Link
                  to="/home"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2.5"
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center
                      justify-center shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #13213c, #264670)",
                    }}
                  >
                    <Heart
                      size={14}
                      className="text-white"
                      strokeWidth={2}
                      fill="rgba(212,178,106,0.5)"
                    />
                  </div>
                  <span
                    className="font-black text-lg"
                    style={{
                      background: "linear-gradient(to right, #13213c, #264670)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    CraftNest
                  </span>
                </Link>

                <motion.button
                  onClick={() => setMobileOpen(false)}
                  whileTap={{ scale: 0.92 }}
                  className="p-2 rounded-xl transition-colors duration-200"
                  style={{ color: "#4f545f" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(19,33,60,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <X size={18} />
                </motion.button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
                {navLinks.map((link, i) => (
                  <motion.div
                    key={link.to}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0  }}
                    transition={{ delay: i * 0.07, duration: 0.22 }}
                  >
                    <NavLink
                      to={link.to}
                      end={link.end}
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center gap-3 px-4 py-3
                        rounded-2xl font-semibold text-sm
                        transition-all duration-200"
                      style={({ isActive }) => ({
                        color: isActive ? "#13213c" : "#4f545f",
                        background: isActive
                          ? "rgba(212,178,106,0.12)"
                          : "transparent",
                      })}
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <div
                              className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                              style={{
                                background:
                                  "linear-gradient(135deg, #d4b26a, #264670)",
                              }}
                            />
                          )}
                          {link.label}
                        </>
                      )}
                    </NavLink>
                  </motion.div>
                ))}

                {/* Authenticated mobile section */}
                {isAuthenticated && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0  }}
                    transition={{ delay: 0.25, duration: 0.22 }}
                    className="mt-3 pt-3 space-y-1"
                    style={{ borderTop: "1px solid rgba(19,33,60,0.07)" }}
                  >
                    {/* User info */}
                    <div className="flex items-center gap-3 px-4 py-3 mb-1">
                      <div
                        className="w-10 h-10 rounded-xl flex-shrink-0
                          flex items-center justify-center text-white
                          font-black text-sm shadow-md"
                        style={{
                          background:
                            "linear-gradient(135deg, #13213c, #264670)",
                        }}
                      >
                        {user?.name?.[0]?.toUpperCase() ?? "U"}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="font-bold text-sm truncate"
                          style={{ color: "#13213c" }}
                        >
                          {user?.name}
                        </p>
                        <p
                          className="text-xs truncate"
                          style={{ color: "#4f545f" }}
                        >
                          {user?.email}
                        </p>
                      </div>
                    </div>

                    {user?.role === "admin" ? (
                      <Link
                        to="/admin/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-3 px-4 py-3
                          rounded-2xl text-sm font-semibold
                          transition-all duration-200"
                        style={{ color: "#13213c" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "rgba(212,178,106,0.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <div
                          className="w-7 h-7 rounded-lg flex items-center
                            justify-center shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, #13213c, #264670)",
                          }}
                        >
                          <Shield size={13} className="text-white" />
                        </div>
                        Admin Panel
                      </Link>
                    ) : (
                      userMenuItems.map(({ to, label, icon: Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setMobileOpen(false)}
                          className="flex items-center gap-3 px-4 py-3
                            rounded-2xl text-sm font-semibold
                            transition-all duration-200"
                          style={{ color: "#4f545f" }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background =
                              "rgba(19,33,60,0.04)";
                            e.currentTarget.style.color = "#13213c";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = "transparent";
                            e.currentTarget.style.color = "#4f545f";
                          }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center
                              justify-center"
                            style={{
                              background: "var(--color-oxford-gray-light)",
                              border: "1px solid rgba(19,33,60,0.08)",
                            }}
                          >
                            <Icon size={13} style={{ color: "#4f545f" }} />
                          </div>
                          {label}
                        </Link>
                      ))
                    )}

                    <div
                      className="h-px mx-2"
                      style={{ background: "rgba(19,33,60,0.07)" }}
                    />

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3
                        rounded-2xl text-sm font-semibold
                        transition-all duration-200"
                      style={{ color: "#dc2626" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "rgba(220,38,38,0.06)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <div
                        className="w-7 h-7 rounded-lg flex items-center
                          justify-center"
                        style={{ background: "rgba(220,38,38,0.08)" }}
                      >
                        <LogOut size={13} style={{ color: "#dc2626" }} />
                      </div>
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </div>

              {/* Guest footer */}
              {!isAuthenticated && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0  }}
                  transition={{ delay: 0.2 }}
                  className="flex-shrink-0 p-4 space-y-2.5"
                  style={{ borderTop: "1px solid rgba(19,33,60,0.07)" }}
                >
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-center w-full
                      py-3 text-sm font-bold rounded-2xl
                      transition-all duration-200"
                    style={{
                      color: "#13213c",
                      border: "2px solid rgba(19,33,60,0.2)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#d4b26a";
                      e.currentTarget.style.background =
                        "rgba(212,178,106,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(19,33,60,0.2)";
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Login
                  </Link>

                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="relative flex items-center justify-center
                      gap-2 w-full py-3 text-sm font-bold text-white
                      rounded-2xl overflow-hidden
                      hover:-translate-y-0.5 transition-all duration-200
                      active:scale-95"
                    style={{
                      background:
                        "linear-gradient(to right, #13213c, #264670)",
                      boxShadow: "0 4px 16px rgba(19,33,60,0.3)",
                    }}
                  >
                    <motion.div
                      className="absolute inset-0 -skew-x-12"
                      style={{
                        background:
                          "linear-gradient(to right, transparent, rgba(212,178,106,0.2), transparent)",
                      }}
                      initial={{ x: "-130%" }}
                      animate={{ x: "230%" }}
                      transition={{
                        duration: 2.5, repeat: Infinity,
                        ease: "linear", repeatDelay: 3,
                      }}
                    />
                    <Sparkles size={14} className="relative z-10" />
                    <span className="relative z-10">Create Free Account</span>
                  </Link>
                </motion.div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default PublicNav;