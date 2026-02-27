// pages/admin/UsersPage.jsx

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence }          from "framer-motion";
import {
  Users, Search, RefreshCw, Shield, ShieldOff,
  Trash2, UserCheck, UserX, Mail, Phone,
  Calendar, MoreVertical, X, AlertTriangle,
  ChevronDown, Filter, ShoppingBag, IndianRupee,
  ChevronLeft, ChevronRight,
} from "lucide-react";
import {
  getAllUsers,
  updateUserByAdmin,
  deleteUser,
} from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast          from "react-hot-toast";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.12)",
  goldBorder: "rgba(212,178,106,0.2)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.4)",
  border:     "rgba(19,33,60,0.07)",
  surface:    "#ffffff",
  surfaceAlt: "rgba(19,33,60,0.025)",
  green:      "#22c55e",
  red:        "#ef4444",
  orange:     "#f97316",
  purple:     "#8b5cf6",
};

const PAGE_LIMIT = 15;

// ── Helpers ────────────────────────────────────────────────────────────────
const fmtDate = (d) =>
  d
    ? new Date(d).toLocaleDateString("en-IN", {
        month: "short",
        day:   "numeric",
        year:  "numeric",
      })
    : "—";

const fmtINR = (n = 0) =>
  `₹${Number(n).toLocaleString("en-IN", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;

const avatarGradient = (name = "") => {
  const gradients = [
    `linear-gradient(135deg, ${C.navyLight}, ${C.navy})`,
    `linear-gradient(135deg, #d4b26a, #b8922e)`,
    `linear-gradient(135deg, #8b5cf6, #6d28d9)`,
    `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
    `linear-gradient(135deg, #22c55e, #15803d)`,
    `linear-gradient(135deg, #f97316, #c2410c)`,
  ];
  const idx = (name.charCodeAt(0) || 0) % gradients.length;
  return gradients[idx];
};

// ── Sub-components ─────────────────────────────────────────────────────────
const StatCard = ({ label, value, icon: Icon, accent, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ delay, duration: 0.3 }}
    className="rounded-2xl p-5 relative overflow-hidden"
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 16px rgba(19,33,60,0.06)",
    }}
  >
    <div className="absolute top-0 left-0 right-0 h-[3px]"
      style={{ background: accent }} />
    <div className="flex items-start justify-between mt-1">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
          style={{ color: C.textMuted }}>
          {label}
        </p>
        <p className="text-2xl font-black" style={{ color: C.text }}>
          {value}
        </p>
      </div>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
        <Icon size={18} style={{ color: accent }} strokeWidth={2} />
      </div>
    </div>
  </motion.div>
);

const RoleBadge = ({ role }) => (
  <span
    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full
      text-[10px] font-black uppercase tracking-widest"
    style={
      role === "admin"
        ? { background: C.goldLight,           color: C.gold      }
        : { background: "rgba(38,70,112,0.08)", color: C.navyLight }
    }
  >
    {role === "admin" ? <Shield size={9} /> : <UserCheck size={9} />}
    {role}
  </span>
);

// isActive can be undefined on old docs — treat undefined as active
const StatusBadge = ({ isActive }) => {
  const active = isActive !== false;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
        text-[10px] font-black"
      style={
        active
          ? { background: "rgba(34,197,94,0.1)",  color: C.green }
          : { background: "rgba(239,68,68,0.1)",  color: C.red   }
      }
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: active ? C.green : C.red }} />
      {active ? "Active" : "Inactive"}
    </span>
  );
};

// ── Confirm Modal ──────────────────────────────────────────────────────────
const ConfirmModal = ({
  open, title, message, confirmLabel,
  confirmColor, onConfirm, onCancel, loading,
}) => (
  <AnimatePresence>
    {open && (
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(19,33,60,0.5)", backdropFilter: "blur(4px)" }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0 }}
          animate={{ scale: 1,    opacity: 1 }}
          exit={{    scale: 0.92, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="w-full max-w-sm rounded-2xl overflow-hidden"
          style={{
            background: C.surface,
            border:     `1px solid ${C.border}`,
            boxShadow:  "0 24px 60px rgba(19,33,60,0.2)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background: `${confirmColor}15`,
                  border:     `1px solid ${confirmColor}30`,
                }}>
                <AlertTriangle size={17} style={{ color: confirmColor }} />
              </div>
              <h3 className="text-sm font-black" style={{ color: C.text }}>
                {title}
              </h3>
            </div>
            <button onClick={onCancel}
              className="w-7 h-7 flex items-center justify-center rounded-xl
                transition-all duration-150"
              style={{ background: C.surfaceAlt, color: C.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.background =
                "rgba(19,33,60,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background =
                C.surfaceAlt)}>
              <X size={14} />
            </button>
          </div>

          <div className="px-6 py-5">
            <p className="text-sm" style={{ color: C.textSub }}>{message}</p>
          </div>

          <div className="flex items-center justify-end gap-3 px-6 py-4"
            style={{ borderTop: `1px solid ${C.border}` }}>
            <button onClick={onCancel} disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-bold
                transition-all duration-150"
              style={{
                background: C.surfaceAlt,
                border:     `1px solid ${C.border}`,
                color:      C.textSub,
              }}>
              Cancel
            </button>
            <button onClick={onConfirm} disabled={loading}
              className="px-4 py-2 rounded-xl text-xs font-black
                transition-all duration-150 flex items-center gap-2
                disabled:opacity-60"
              style={{
                background: confirmColor,
                color:      "#fff",
                boxShadow:  `0 4px 14px ${confirmColor}40`,
              }}>
              {loading && <RefreshCw size={11} className="animate-spin" />}
              {confirmLabel}
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── User Detail Drawer ─────────────────────────────────────────────────────
const UserDrawer = ({
  user, onClose, onToggleStatus,
  onToggleRole, onDelete, loading,
}) => (
  <AnimatePresence>
    {user && (
      <>
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-40"
          style={{ background: "rgba(19,33,60,0.4)", backdropFilter: "blur(4px)" }}
          onClick={onClose}
        />

        <motion.div
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "tween", duration: 0.25, ease: "easeOut" }}
          className="fixed right-0 top-0 h-full w-full max-w-sm z-50 overflow-y-auto"
          style={{
            background: C.surface,
            borderLeft: `1px solid ${C.border}`,
            boxShadow:  "-8px 0 40px rgba(19,33,60,0.12)",
          }}
        >
          {/* Accent line */}
          <div className="h-[3px] w-full" style={{
            background:
              "linear-gradient(90deg,#d4b26a 0%,#264670 50%,#d4b26a 100%)",
          }} />

          {/* Drawer header */}
          <div className="flex items-center justify-between px-6 py-5"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <h3 className="text-sm font-black" style={{ color: C.text }}>
              User Details
            </h3>
            <button onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-xl
                transition-all duration-150"
              style={{ background: C.surfaceAlt, color: C.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.background =
                "rgba(19,33,60,0.08)")}
              onMouseLeave={(e) => (e.currentTarget.style.background =
                C.surfaceAlt)}>
              <X size={15} />
            </button>
          </div>

          {/* Avatar + name */}
          <div className="px-6 py-6 flex flex-col items-center text-center"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center
                text-white text-3xl font-black mb-4"
              style={{
                background: avatarGradient(user.name),
                boxShadow:  "0 8px 24px rgba(19,33,60,0.2)",
              }}
            >
              {user.name?.[0]?.toUpperCase()}
            </div>
            <h4 className="text-lg font-black" style={{ color: C.text }}>
              {user.name}
            </h4>
            <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
              {user.email}
            </p>
            <div className="flex items-center gap-2 mt-3">
              <RoleBadge   role={user.role}     />
              <StatusBadge isActive={user.isActive} />
            </div>
          </div>

          {/* Info rows */}
          <div className="px-6 py-5 space-y-4"
            style={{ borderBottom: `1px solid ${C.border}` }}>
            {[
              { icon: Mail,     label: "Email",  value: user.email              },
              { icon: Phone,    label: "Phone",  value: user.phone || "—"       },
              { icon: Calendar, label: "Joined", value: fmtDate(user.createdAt) },
              {
                icon:  Shield,
                label: "Role",
                value: user.role.charAt(0).toUpperCase() + user.role.slice(1),
              },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center
                  justify-center flex-shrink-0"
                  style={{ background: C.surfaceAlt }}>
                  <Icon size={14} style={{ color: C.textSub }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-widest"
                    style={{ color: C.textMuted }}>
                    {label}
                  </p>
                  <p className="text-xs font-semibold truncate"
                    style={{ color: C.text }}>
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order stats — shown if controller returns them */}
          {(user.orderCount != null || user.totalSpend != null) && (
            <div className="px-6 py-5 grid grid-cols-2 gap-3"
              style={{ borderBottom: `1px solid ${C.border}` }}>
              <div className="p-3 rounded-xl text-center"
                style={{ background: C.surfaceAlt }}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <ShoppingBag size={12} style={{ color: C.textMuted }} />
                </div>
                <p className="text-lg font-black" style={{ color: C.text }}>
                  {user.orderCount ?? 0}
                </p>
                <p className="text-[10px] font-semibold"
                  style={{ color: C.textMuted }}>
                  Orders
                </p>
              </div>
              <div className="p-3 rounded-xl text-center"
                style={{ background: C.surfaceAlt }}>
                <div className="flex items-center justify-center gap-1 mb-1">
                  <IndianRupee size={12} style={{ color: C.textMuted }} />
                </div>
                <p className="text-lg font-black" style={{ color: C.text }}>
                  {fmtINR(user.totalSpend ?? 0)}
                </p>
                <p className="text-[10px] font-semibold"
                  style={{ color: C.textMuted }}>
                  Total Spend
                </p>
              </div>
            </div>
          )}

          {/* Address */}
          {user.address && (
            <div className="mx-6 my-5 p-4 rounded-2xl"
              style={{ background: C.surfaceAlt }}>
              <p className="text-[10px] font-black uppercase tracking-widest mb-2"
                style={{ color: C.textMuted }}>
                Address
              </p>
              <p className="text-xs" style={{ color: C.textSub }}>
                {[
                  user.address.street,
                  user.address.city,
                  user.address.state,
                  user.address.country,
                  user.address.postalCode,
                ].filter(Boolean).join(", ") || "—"}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-5 space-y-3"
            style={{ borderTop: `1px solid ${C.border}` }}>
            <button
              onClick={() => onToggleRole(user)}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-bold transition-all duration-150 disabled:opacity-60"
              style={{
                background: C.goldLight,
                border:     `1px solid ${C.goldBorder}`,
                color:      C.gold,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background =
                "rgba(212,178,106,0.22)")}
              onMouseLeave={(e) => (e.currentTarget.style.background =
                C.goldLight)}
            >
              <Shield size={15} />
              {user.role === "admin" ? "Revoke Admin Access" : "Grant Admin Access"}
            </button>

            <button
              onClick={() => onToggleStatus(user)}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-bold transition-all duration-150 disabled:opacity-60"
              style={{
                background: user.isActive !== false
                  ? "rgba(239,68,68,0.07)"
                  : "rgba(34,197,94,0.07)",
                border: `1px solid ${user.isActive !== false
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(34,197,94,0.15)"}`,
                color: user.isActive !== false ? C.red : C.green,
              }}
            >
              {user.isActive !== false
                ? <><ShieldOff size={15} /> Deactivate Account</>
                : <><UserCheck size={15} /> Activate Account</>
              }
            </button>

            <button
              onClick={() => onDelete(user)}
              disabled={loading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                text-sm font-bold transition-all duration-150 disabled:opacity-60"
              style={{
                background: "rgba(239,68,68,0.06)",
                border:     "1px solid rgba(239,68,68,0.12)",
                color:      C.red,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background =
                "rgba(239,68,68,0.12)")}
              onMouseLeave={(e) => (e.currentTarget.style.background =
                "rgba(239,68,68,0.06)")}
            >
              <Trash2 size={15} />
              Delete User
            </button>
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

// ═══════════════════════════════════════════════════════════════════════════
// Main Page
// ═══════════════════════════════════════════════════════════════════════════
const UsersPage = () => {
  const [users,         setUsers        ] = useState([]);
  const [total,         setTotal        ] = useState(0);
  const [totalPages,    setTotalPages   ] = useState(1);
  const [page,          setPage         ] = useState(1);
  const [loading,       setLoading      ] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Filters (sent to API)
  const [search,       setSearch      ] = useState("");
  const [roleFilter,   setRoleFilter  ] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy,       setSortBy      ] = useState("newest");

  // UI
  const [selectedUser, setSelectedUser] = useState(null);
  const [confirm,      setConfirm     ] = useState(null);

  // ── Load — sends all filters to the server ───────────────────────────
  const load = useCallback(
    (p = page) => {
      setLoading(true);

      // Build query params that match adminController.getAllUsers
      const params = {
        page:  p,
        limit: PAGE_LIMIT,
      };
      if (search.trim())           params.search = search.trim();
      if (roleFilter  !== "All")   params.role   = roleFilter.toLowerCase();

      getAllUsers(params)
        .then(({ data }) => {
          // Controller returns { users, total, page, totalPages }
          // Fall back to plain array for backwards compatibility
          if (Array.isArray(data)) {
            setUsers(data);
            setTotal(data.length);
            setTotalPages(1);
          } else {
            setUsers(Array.isArray(data?.users) ? data.users : []);
            setTotal(data?.total      ?? 0);
            setTotalPages(data?.totalPages ?? 1);
          }
          setPage(p);
        })
        .catch(() => toast.error("Failed to load users"))
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [search, roleFilter, page]
  );

  // Re-fetch whenever search, role filter, or page changes
  // Debounce the search so we don't fire on every keystroke
  useEffect(() => {
    const t = setTimeout(() => load(1), search ? 350 : 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, roleFilter]);

  useEffect(() => { load(page); }, [page]); // eslint-disable-line

  // ── Client-side status filter + sort (fast, no extra request) ────────
  const filtered = (() => {
    let list = [...users];

    if (statusFilter === "Active")
      list = list.filter((u) => u.isActive !== false);
    else if (statusFilter === "Inactive")
      list = list.filter((u) => u.isActive === false);

    if (sortBy === "newest")
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "oldest")
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    else if (sortBy === "name")
      list.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));

    return list;
  })();

  // ── Actions ───────────────────────────────────────────────────────────
  const commitAction = async () => {
    if (!confirm) return;
    setActionLoading(true);
    const { type, user } = confirm;

    try {
      if (type === "delete") {
        await deleteUser(user._id);
        setUsers((prev) => prev.filter((u) => u._id !== user._id));
        setTotal((t) => t - 1);
        setSelectedUser(null);
        toast.success(`${user.name} deleted`);

      } else if (type === "status") {
        const newActive = user.isActive === false ? true : false;
        const { data }  = await updateUserByAdmin(user._id, {
          isActive: newActive,
        });
        setUsers((prev) => prev.map((u) => u._id === user._id ? data : u));
        if (selectedUser?._id === user._id) setSelectedUser(data);
        toast.success(
          data.isActive !== false
            ? `${user.name} activated`
            : `${user.name} deactivated`
        );

      } else if (type === "role") {
        const newRole  = user.role === "admin" ? "user" : "admin";
        const { data } = await updateUserByAdmin(user._id, { role: newRole });
        setUsers((prev) => prev.map((u) => u._id === user._id ? data : u));
        if (selectedUser?._id === user._id) setSelectedUser(data);
        toast.success(
          newRole === "admin"
            ? `${user.name} is now an admin`
            : `${user.name}'s admin access revoked`
        );
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setActionLoading(false);
      setConfirm(null);
    }
  };

  const askDelete = (user) => setConfirm({
    type:    "delete",
    user,
    title:   "Delete User",
    message: `Permanently delete "${user.name}"? This cannot be undone.`,
    label:   "Delete",
    color:   C.red,
  });

  const askStatus = (user) => setConfirm({
    type:    "status",
    user,
    title:   user.isActive !== false ? "Deactivate User" : "Activate User",
    message: user.isActive !== false
      ? `Deactivating "${user.name}" will prevent them from logging in.`
      : `Activating "${user.name}" will restore their access.`,
    label:   user.isActive !== false ? "Deactivate" : "Activate",
    color:   user.isActive !== false ? C.red : C.green,
  });

  const askRole = (user) => setConfirm({
    type:    "role",
    user,
    title:   user.role === "admin" ? "Revoke Admin" : "Grant Admin",
    message: user.role === "admin"
      ? `Remove admin privileges from "${user.name}"?`
      : `Grant admin privileges to "${user.name}"? They will have full access.`,
    label:   user.role === "admin" ? "Revoke" : "Grant",
    color:   user.role === "admin" ? C.red : C.gold,
  });

  // ── Stats (from current page data) ───────────────────────────────────
  const totalAdmins   = users.filter((u) => u.role === "admin").length;
  const activeUsers   = users.filter((u) => u.isActive !== false).length;
  const inactiveUsers = users.filter((u) => u.isActive === false).length;

  const ROLE_FILTERS   = [
    { key: "All",   label: "All Roles" },
    { key: "User",  label: "Users"     },
    { key: "Admin", label: "Admins"    },
  ];
  const STATUS_FILTERS = ["All", "Active", "Inactive"];

  if (loading && users.length === 0)
    return <LoadingSpinner text="Loading users…" />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{ color: C.text }}>
            Users
            <span className="ml-2 text-sm font-semibold"
              style={{ color: C.textMuted }}>
              ({total})
            </span>
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
            Manage registered accounts
          </p>
        </div>

        <button onClick={() => load(1)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl
            text-xs font-bold transition-all duration-150"
          style={{
            background: C.surfaceAlt,
            border:     `1px solid ${C.border}`,
            color:      C.textSub,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.goldLight;
            e.currentTarget.style.color      = C.gold;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.surfaceAlt;
            e.currentTarget.style.color      = C.textSub;
          }}>
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {/* ── Stat Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total Users"    value={total}         icon={Users}     accent={C.navyLight} delay={0}    />
        <StatCard label="Administrators" value={totalAdmins}   icon={Shield}    accent={C.gold}      delay={0.07} />
        <StatCard label="Active"         value={activeUsers}   icon={UserCheck} accent={C.green}     delay={0.14} />
        <StatCard label="Inactive"       value={inactiveUsers} icon={UserX}     accent={C.red}       delay={0.21} />
      </div>

      {/* ── Toolbar ───────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row gap-3 items-start
        sm:items-center flex-wrap">

        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: C.textMuted }} />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-8 py-2.5 rounded-xl text-sm
              focus:outline-none transition-all duration-150"
            style={{
              background: C.surface,
              border:     `1px solid ${C.border}`,
              color:      C.text,
            }}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e)  => (e.target.style.borderColor = C.border)}
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(1); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2
                text-xs font-black w-4 h-4 flex items-center justify-center
                rounded-full"
              style={{ background: C.textMuted, color: "#fff" }}>
              ×
            </button>
          )}
        </div>

        {/* Role filter — server-side */}
        <div className="flex gap-1.5">
          {ROLE_FILTERS.map(({ key, label }) => (
            <button key={key}
              onClick={() => { setRoleFilter(key); setPage(1); }}
              className="px-3 py-2 rounded-xl text-xs font-bold
                transition-all duration-150"
              style={
                roleFilter === key
                  ? { background: C.navy, color: "#fff" }
                  : {
                      background: C.surfaceAlt,
                      border:     `1px solid ${C.border}`,
                      color:      C.textSub,
                    }
              }>
              {label}
            </button>
          ))}
        </div>

        {/* Status filter — client-side on current page */}
        <div className="flex gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="px-3 py-2 rounded-xl text-xs font-bold
                transition-all duration-150"
              style={
                statusFilter === s
                  ? {
                      background: s === "Active"   ? "rgba(34,197,94,0.12)"
                                : s === "Inactive" ? "rgba(239,68,68,0.1)"
                                : C.navy,
                      color: s === "Active"   ? C.green
                           : s === "Inactive" ? C.red
                           : "#fff",
                      border: `1px solid ${
                        s === "Active"   ? "rgba(34,197,94,0.3)"
                        : s === "Inactive" ? "rgba(239,68,68,0.2)"
                        : "transparent"
                      }`,
                    }
                  : {
                      background: C.surfaceAlt,
                      border:     `1px solid ${C.border}`,
                      color:      C.textSub,
                    }
              }>
              {s}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="relative ml-auto">
          <Filter size={11}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: C.textMuted }} />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="pl-8 pr-7 py-2 rounded-xl text-xs font-bold
              focus:outline-none cursor-pointer appearance-none
              transition-all duration-150"
            style={{
              background: C.surfaceAlt,
              border:     `1px solid ${C.border}`,
              color:      C.textSub,
            }}
            onFocus={(e) => (e.target.style.borderColor = C.gold)}
            onBlur={(e)  => (e.target.style.borderColor = C.border)}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name"  >Name A–Z</option>
          </select>
          <ChevronDown size={11}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: C.textMuted }} />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border:     `1px solid ${C.border}`,
          boxShadow:  "0 2px 16px rgba(19,33,60,0.05)",
        }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["User","Email","Phone","Role","Status","Joined","Actions"].map((h) => (
                  <th key={h}
                    className="px-5 py-3.5 text-left text-[10px] font-black
                      uppercase tracking-widest whitespace-nowrap"
                    style={{ color: C.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <RefreshCw size={20} className="animate-spin mx-auto"
                      style={{ color: C.textMuted }} />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-14">
                    <Users size={28}
                      style={{ color: C.textMuted, margin: "0 auto 8px" }} />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      No users found
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((user, i) => (
                  <motion.tr
                    key={user._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    style={{ borderBottom: `1px solid ${C.border}` }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = C.surfaceAlt)}
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")}
                  >
                    {/* User */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-xl flex items-center
                            justify-center text-white text-sm font-black
                            flex-shrink-0"
                          style={{
                            background: avatarGradient(user.name),
                            boxShadow:  "0 2px 8px rgba(19,33,60,0.15)",
                          }}>
                          {user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold truncate max-w-[130px]"
                            style={{ color: C.text }}>
                            {user.name ?? "—"}
                          </p>
                          <p className="text-[10px]" style={{ color: C.textMuted }}>
                            {user._id.slice(-6).toUpperCase()}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Mail size={11} style={{ color: C.textMuted }} />
                        <span className="text-xs truncate max-w-[160px]"
                          style={{ color: C.textSub }}>
                          {user.email ?? "—"}
                        </span>
                      </div>
                    </td>

                    {/* Phone — ✅ was missing from table */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <Phone size={11} style={{ color: C.textMuted }} />
                        <span className="text-xs" style={{ color: C.textSub }}>
                          {user.phone || "—"}
                        </span>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <RoleBadge role={user.role} />
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <StatusBadge isActive={user.isActive} />
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5">
                      <span className="text-[11px]" style={{ color: C.textMuted }}>
                        {fmtDate(user.createdAt)}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => askStatus(user)}
                          title={user.isActive !== false ? "Deactivate" : "Activate"}
                          className="w-8 h-8 flex items-center justify-center
                            rounded-xl transition-all duration-150"
                          style={{
                            background: user.isActive !== false
                              ? "rgba(239,68,68,0.07)"
                              : "rgba(34,197,94,0.07)",
                            color: user.isActive !== false ? C.red : C.green,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background =
                            user.isActive !== false
                              ? "rgba(239,68,68,0.15)"
                              : "rgba(34,197,94,0.15)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background =
                            user.isActive !== false
                              ? "rgba(239,68,68,0.07)"
                              : "rgba(34,197,94,0.07)")}>
                          {user.isActive !== false
                            ? <UserX size={13} />
                            : <UserCheck size={13} />}
                        </button>

                        <button onClick={() => askRole(user)}
                          title={user.role === "admin" ? "Revoke Admin" : "Make Admin"}
                          className="w-8 h-8 flex items-center justify-center
                            rounded-xl transition-all duration-150"
                          style={{ background: C.goldLight, color: C.gold }}
                          onMouseEnter={(e) => (e.currentTarget.style.background =
                            "rgba(212,178,106,0.22)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background =
                            C.goldLight)}>
                          <Shield size={13} />
                        </button>

                        <button onClick={() => setSelectedUser(user)}
                          title="View Details"
                          className="w-8 h-8 flex items-center justify-center
                            rounded-xl transition-all duration-150"
                          style={{
                            background: "rgba(38,70,112,0.07)",
                            color:      C.navyLight,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background =
                            "rgba(38,70,112,0.14)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background =
                            "rgba(38,70,112,0.07)")}>
                          <MoreVertical size={13} />
                        </button>

                        <button onClick={() => askDelete(user)}
                          title="Delete User"
                          className="w-8 h-8 flex items-center justify-center
                            rounded-xl transition-all duration-150"
                          style={{
                            background: "rgba(239,68,68,0.07)",
                            color:      C.red,
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background =
                            "rgba(239,68,68,0.15)")}
                          onMouseLeave={(e) => (e.currentTarget.style.background =
                            "rgba(239,68,68,0.07)")}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table footer + pagination ──────────────────────────── */}
        {!loading && filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-3 flex-wrap gap-3"
            style={{ borderTop: `1px solid ${C.border}` }}>
            <p className="text-[11px]" style={{ color: C.textMuted }}>
              Showing {filtered.length} of {total} users
              {search && (
                <span> matching <strong>"{search}"</strong></span>
              )}
            </p>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-7 h-7 flex items-center justify-center rounded-xl
                    transition-all duration-150 disabled:opacity-30"
                  style={{
                    background: C.surfaceAlt,
                    border:     `1px solid ${C.border}`,
                    color:      C.textSub,
                  }}>
                  <ChevronLeft size={13} />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 || p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1)
                      acc.push("…");
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === "…" ? (
                      <span key={`ellipsis-${idx}`}
                        className="text-xs" style={{ color: C.textMuted }}>
                        …
                      </span>
                    ) : (
                      <button key={p}
                        onClick={() => setPage(p)}
                        className="w-7 h-7 flex items-center justify-center
                          rounded-xl text-xs font-bold transition-all duration-150"
                        style={
                          page === p
                            ? { background: C.navy, color: "#fff" }
                            : {
                                background: C.surfaceAlt,
                                border:     `1px solid ${C.border}`,
                                color:      C.textSub,
                              }
                        }>
                        {p}
                      </button>
                    )
                  )
                }

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-7 h-7 flex items-center justify-center rounded-xl
                    transition-all duration-150 disabled:opacity-30"
                  style={{
                    background: C.surfaceAlt,
                    border:     `1px solid ${C.border}`,
                    color:      C.textSub,
                  }}>
                  <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── User Detail Drawer ─────────────────────────────────────── */}
      <UserDrawer
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
        onToggleStatus={askStatus}
        onToggleRole={askRole}
        onDelete={askDelete}
        loading={actionLoading}
      />

      {/* ── Confirm Modal ──────────────────────────────────────────── */}
      <ConfirmModal
        open={!!confirm}
        title={confirm?.title        ?? ""}
        message={confirm?.message    ?? ""}
        confirmLabel={confirm?.label ?? "Confirm"}
        confirmColor={confirm?.color ?? C.red}
        onConfirm={commitAction}
        onCancel={() => setConfirm(null)}
        loading={actionLoading}
      />
    </div>
  );
};

export default UsersPage;