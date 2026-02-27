import { NavLink, useNavigate }    from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, ShoppingBag, Users,
  BarChart2, Warehouse, TrendingUp, LogOut,
  X, User, Heart, ChevronRight,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { to: "/admin/dashboard", icon: LayoutDashboard, label: "Dashboard"  },
  { to: "/admin/products",  icon: Package,          label: "Products"   },
  { to: "/admin/orders",    icon: ShoppingBag,      label: "Orders"     },
  { to: "/admin/inventory", icon: Warehouse,        label: "Inventory"  },
  { to: "/admin/sales",     icon: TrendingUp,       label: "Sales"      },
  { to: "/admin/analysis",  icon: BarChart2,        label: "Analysis"   },
  { to: "/admin/users",     icon: Users,            label: "Users"      },
  { to: "/admin/profile",   icon: User,             label: "My Profile" },
];

// ── Individual nav item ────────────────────────────────────────────────────
const NavItem = ({ to, icon: Icon, label, onClose }) => (
  <NavLink
    to={to}
    onClick={onClose}
    end={to === "/admin/dashboard"}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl
      text-sm transition-all duration-150 group relative"
    style={({ isActive }) =>
      isActive
        ? {
            background: "linear-gradient(135deg,#13213c 0%,#264670 100%)",
            color:      "#ffffff",
            fontWeight: "700",
            boxShadow:  "0 4px 16px rgba(19,33,60,0.25)",
          }
        : {
            color:      "#4f545f",
            fontWeight: "500",
          }
    }
  >
    {({ isActive }) => (
      <>
        {/* Icon bubble */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center
            flex-shrink-0 transition-all duration-150"
          style={{
            background: isActive
              ? "rgba(255,255,255,0.15)"
              : "rgba(19,33,60,0.05)",
          }}
        >
          <Icon
            size={14}
            strokeWidth={isActive ? 2.5 : 2}
            style={{ color: isActive ? "#d4b26a" : "#4f545f" }}
          />
        </div>

        <span className="flex-1 text-[13px]">{label}</span>

        {/* Arrow on active */}
        {isActive && (
          <ChevronRight
            size={13}
            strokeWidth={2.5}
            style={{ color: "rgba(212,178,106,0.8)" }}
          />
        )}
      </>
    )}
  </NavLink>
);

// ── Sidebar content ────────────────────────────────────────────────────────
const SidebarContent = ({ onClose }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div
      className="h-full flex flex-col select-none overflow-hidden"
      style={{
        background:  "#ffffff",
        borderRight: "1px solid rgba(19,33,60,0.07)",
      }}
    >
      {/* ── Gold + navy gradient accent ───────────────────────── */}
      <div
        className="h-[3px] w-full flex-shrink-0"
        style={{
          background:
            "linear-gradient(90deg,#d4b26a 0%,#264670 50%,#d4b26a 100%)",
        }}
      />

      {/* ── Brand header ──────────────────────────────────────── */}
      <div
        className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
        style={{ borderBottom: "1px solid rgba(19,33,60,0.06)" }}
      >
        <div className="flex items-center gap-2.5">
          {/* Logo */}
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center
              flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #d4b26a 0%, #264670 100%)",
              boxShadow: "0 4px 14px rgba(19,33,60,0.2)",
            }}
          >
            <Heart size={14} fill="#fff" strokeWidth={0} />
          </div>
          <div>
            <h2
              className="font-black text-[13px] tracking-tight leading-none"
              style={{ color: "#13213c" }}
            >
              CraftNest
            </h2>
            <p
              className="text-[9px] font-bold uppercase tracking-widest mt-0.5"
              style={{ color: "#d4b26a" }}
            >
              Admin Panel
            </p>
          </div>
        </div>

        {/* Close — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center
              rounded-lg transition-all duration-150"
            style={{
              background: "rgba(19,33,60,0.04)",
              color:      "#4f545f",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(19,33,60,0.09)";
              e.currentTarget.style.color      = "#13213c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(19,33,60,0.04)";
              e.currentTarget.style.color      = "#4f545f";
            }}
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* ── Admin card ────────────────────────────────────────── */}
      <div className="px-3 py-3 flex-shrink-0">
        <div
          className="flex items-center gap-3 p-3 rounded-2xl"
          style={{
            background:
              "linear-gradient(135deg,rgba(19,33,60,0.03) 0%,rgba(212,178,106,0.06) 100%)",
            border: "1px solid rgba(19,33,60,0.06)",
          }}
        >
          {/* Avatar */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
              text-white font-black text-sm flex-shrink-0"
            style={{
              background:
                "linear-gradient(135deg, #d4b26a 0%, #264670 100%)",
              boxShadow: "0 3px 12px rgba(19,33,60,0.18)",
            }}
          >
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p
              className="text-[13px] font-bold truncate leading-tight"
              style={{ color: "#13213c" }}
            >
              {user?.name}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {/* Online dot */}
              <span
                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                style={{ background: "#22c55e" }}
              />
              <p
                className="text-[10px] font-semibold"
                style={{ color: "#d4b26a" }}
              >
                Administrator
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Section label ─────────────────────────────────────── */}
      <p
        className="px-4 pb-1.5 text-[9px] font-black uppercase
          tracking-[0.15em] flex-shrink-0"
        style={{ color: "rgba(19,33,60,0.3)" }}
      >
        Main Menu
      </p>

      {/* ── Navigation ────────────────────────────────────────── */}
      <nav className="flex-1 px-3 space-y-0.5 overflow-y-auto pb-2">
        {navLinks.map((link) => (
          <NavItem key={link.to} {...link} onClose={onClose} />
        ))}
      </nav>

      {/* ── Footer: email + logout ─────────────────────────────── */}
      <div
        className="flex-shrink-0 p-3"
        style={{ borderTop: "1px solid rgba(19,33,60,0.06)" }}
      >
        {/* Email chip */}
        <p
          className="text-[10px] font-medium text-center mb-2 truncate
            px-2"
          style={{ color: "rgba(19,33,60,0.35)" }}
        >
          {user?.email}
        </p>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5
            rounded-xl text-[13px] font-bold transition-all duration-150"
          style={{
            background: "rgba(239,68,68,0.05)",
            color:      "rgba(239,68,68,0.75)",
            border:     "1px solid rgba(239,68,68,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.1)";
            e.currentTarget.style.color      = "#ef4444";
            e.currentTarget.style.border     =
              "1px solid rgba(239,68,68,0.2)";
            e.currentTarget.style.boxShadow  =
              "0 4px 14px rgba(239,68,68,0.12)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(239,68,68,0.05)";
            e.currentTarget.style.color      = "rgba(239,68,68,0.75)";
            e.currentTarget.style.border     =
              "1px solid rgba(239,68,68,0.1)";
            e.currentTarget.style.boxShadow  = "none";
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center
              justify-center flex-shrink-0"
            style={{ background: "rgba(239,68,68,0.1)" }}
          >
            <LogOut size={13} strokeWidth={2.5} />
          </div>
          Sign Out
        </button>
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
const AdminSidebar = ({ open, onClose }) => (
  <>
    {/* Desktop */}
    <aside className="hidden lg:block w-60 flex-shrink-0 sticky top-0 h-screen">
      <SidebarContent />
    </aside>

    {/* Mobile drawer */}
    <AnimatePresence>
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <motion.div
            initial={{ x: -260 }}
            animate={{ x: 0     }}
            exit={{    x: -260  }}
            transition={{ type: "tween", duration: 0.22, ease: "easeOut" }}
            className="w-60 h-full flex-shrink-0"
          >
            <SidebarContent onClose={onClose} />
          </motion.div>

          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex-1 cursor-pointer"
            style={{ background: "rgba(19,33,60,0.5)" }}
            onClick={onClose}
          />
        </div>
      )}
    </AnimatePresence>
  </>
);

export default AdminSidebar;