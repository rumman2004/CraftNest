import { useState, useEffect }  from "react";
import { motion }               from "framer-motion";
import {
  Package, AlertTriangle, CheckCircle,
  TrendingDown, Edit3, Check, X, Search,
  RefreshCw,
} from "lucide-react";
import { getProducts, updateProduct } from "../../services/api";
import LoadingSpinner               from "../../components/common/LoadingSpinner";
import toast                        from "react-hot-toast";

const C = {
  navy:      "#13213c", navyLight: "#264670",
  gold:      "#d4b26a", goldLight: "rgba(212,178,106,0.12)",
  goldBorder:"rgba(212,178,106,0.2)",
  text:      "#13213c", textSub:   "#4f6080",
  textMuted: "rgba(19,33,60,0.4)",
  border:    "rgba(19,33,60,0.07)",
  surface:   "#ffffff", surfaceAlt:"rgba(19,33,60,0.025)",
  green:     "#22c55e", red:       "#ef4444",
  orange:    "#f97316", blue:      "#3b82f6",
};

const stockLevel = (stock) => {
  if (stock === 0)  return { label: "Out of Stock", color: C.red,    bg: "rgba(239,68,68,0.1)"   };
  if (stock < 5)    return { label: "Critical",     color: C.orange, bg: "rgba(249,115,22,0.1)"  };
  if (stock < 20)   return { label: "Low",          color: C.gold,   bg: "rgba(212,178,106,0.12)"};
  return              { label: "In Stock",    color: C.green,  bg: "rgba(34,197,94,0.1)"   };
};

const SummaryCard = ({ label, value, color, bg, icon: Icon, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0  }}
    transition={{ delay }}
    className="rounded-2xl p-5 relative overflow-hidden"
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 16px rgba(19,33,60,0.06)",
    }}
  >
    <div className="absolute top-0 left-0 right-0 h-[3px]"
      style={{ background: color }} />
    <div className="flex items-center justify-between mt-1">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest mb-2"
          style={{ color: C.textMuted }}>{label}</p>
        <p className="text-2xl font-black" style={{ color: C.text }}>{value}</p>
      </div>
      <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
        style={{ background: bg, border: `1px solid ${color}30` }}>
        <Icon size={18} style={{ color }} />
      </div>
    </div>
  </motion.div>
);

const Inventory = () => {
  const [products,  setProducts ] = useState([]);
  const [filtered,  setFiltered ] = useState([]);
  const [loading,   setLoading  ] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [newStock,  setNewStock ] = useState({});
  const [search,    setSearch   ] = useState("");
  const [filter,    setFilter   ] = useState("All");
  const [saving,    setSaving   ] = useState(null);

  const load = () => {
    setLoading(true);
    getProducts({ limit: 200 })
      .then(({ data }) => {
        const list = Array.isArray(data?.products) ? data.products : [];
        setProducts(list);
        setFiltered(list);
      })
      .catch(() => toast.error("Failed to load inventory"))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  // Search + filter
  useEffect(() => {
    let list = [...products];
    if (filter === "Out")      list = list.filter((p) => p.stock === 0);
    else if (filter === "Low") list = list.filter((p) => p.stock > 0 && p.stock < 5);
    else if (filter === "OK")  list = list.filter((p) => p.stock >= 20);
    if (search.trim())
      list = list.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
      );
    setFiltered(list);
  }, [search, filter, products]);

  const handleUpdateStock = async (id, name) => {
    const val = newStock[id];
    if (val === undefined || val === "") return;
    if (Number(val) < 0) { toast.error("Stock cannot be negative"); return; }
    setSaving(id);
    try {
      const fd = new FormData();
      fd.append("stock", val);
      await updateProduct(id, fd);
      setProducts((prev) =>
        prev.map((p) => (p._id === id ? { ...p, stock: Number(val) } : p))
      );
      setEditingId(null);
      setNewStock((ns) => { const n = { ...ns }; delete n[id]; return n; });
      toast.success(`Stock updated for "${name}"`);
    } catch {
      toast.error("Failed to update stock");
    } finally {
      setSaving(null);
    }
  };

  const summary = [
    {
      label: "Total Products",
      value: products.length,
      color: C.navyLight,
      bg:    "rgba(38,70,112,0.1)",
      icon:  Package,
      delay: 0,
    },
    {
      label: "Out of Stock",
      value: products.filter((p) => p.stock === 0).length,
      color: C.red,
      bg:    "rgba(239,68,68,0.1)",
      icon:  AlertTriangle,
      delay: 0.07,
    },
    {
      label: "Critical (< 5)",
      value: products.filter((p) => p.stock > 0 && p.stock < 5).length,
      color: C.orange,
      bg:    "rgba(249,115,22,0.1)",
      icon:  TrendingDown,
      delay: 0.14,
    },
    {
      label: "Well Stocked",
      value: products.filter((p) => p.stock >= 20).length,
      color: C.green,
      bg:    "rgba(34,197,94,0.1)",
      icon:  CheckCircle,
      delay: 0.21,
    },
  ];

  const FILTERS = [
    { key: "All", label: "All"        },
    { key: "Out", label: "Out of Stock"},
    { key: "Low", label: "Critical"   },
    { key: "OK",  label: "Well Stocked"},
  ];

  if (loading) return <LoadingSpinner text="Loading inventory…" />;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{ color: C.text }}>Inventory</h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
            Manage product stock levels
          </p>
        </div>
        <button onClick={load}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl
            text-xs font-bold transition-all duration-150"
          style={{ background: C.surfaceAlt, border: `1px solid ${C.border}`,
            color: C.textSub }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = C.goldLight;
            e.currentTarget.style.color      = C.gold;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = C.surfaceAlt;
            e.currentTarget.style.color      = C.textSub;
          }}
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {summary.map((s) => <SummaryCard key={s.label} {...s} />)}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: C.textMuted }} />
          <input
            type="text"
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-4 py-2 rounded-xl text-sm
              focus:outline-none transition-all duration-150"
            style={{
              background: C.surface,
              border:     `1px solid ${C.border}`,
              color:      C.text,
            }}
            onFocus={(e) =>
              (e.target.style.borderColor = C.gold)
            }
            onBlur={(e) =>
              (e.target.style.borderColor = C.border)
            }
          />
        </div>

        {/* Filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {FILTERS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold
                transition-all duration-150"
              style={
                filter === key
                  ? { background: C.navy, color: "#fff" }
                  : { background: C.surfaceAlt,
                      border:     `1px solid ${C.border}`,
                      color:      C.textSub }
              }
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: C.surface,
          border:     `1px solid ${C.border}`,
          boxShadow:  "0 2px 16px rgba(19,33,60,0.05)",
        }}
      >
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Product", "Category", "Stock", "Status", "Update Stock"].map((h) => (
                  <th key={h}
                    className="px-5 py-3.5 text-left text-[10px] font-black
                      uppercase tracking-widest"
                    style={{ color: C.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-14">
                    <Package size={28} style={{ color: C.textMuted, margin: "0 auto 8px" }} />
                    <p className="text-sm" style={{ color: C.textMuted }}>
                      No products found
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((p, i) => {
                  const level = stockLevel(p.stock);
                  const isEditing = editingId === p._id;
                  return (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background =
                          C.surfaceAlt)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.images?.[0]?.url || "/placeholder.jpg"}
                            alt={p.name}
                            className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                            style={{ border: `1px solid ${C.border}` }}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate max-w-[160px]"
                              style={{ color: C.text }}>
                              {p.name}
                            </p>
                            {p.featured && (
                              <span className="text-[9px] font-black uppercase
                                tracking-widest"
                                style={{ color: C.gold }}>
                                Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px]
                          font-bold"
                          style={{
                            background: C.goldLight,
                            color:      C.gold,
                          }}>
                          {p.category}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3.5">
                        <span className="text-base font-black"
                          style={{ color: level.color }}>
                          {p.stock}
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 rounded-full text-[10px]
                          font-black"
                          style={{
                            background: level.bg,
                            color:      level.color,
                          }}>
                          {level.label}
                        </span>
                      </td>

                      {/* Edit stock */}
                      <td className="px-5 py-3.5">
                        {isEditing ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              value={newStock[p._id] ?? ""}
                              onChange={(e) =>
                                setNewStock((ns) => ({
                                  ...ns,
                                  [p._id]: e.target.value,
                                }))
                              }
                              className="w-20 px-2.5 py-1.5 rounded-xl text-sm
                                font-bold focus:outline-none"
                              style={{
                                background: C.surfaceAlt,
                                border:     `1px solid ${C.gold}`,
                                color:      C.text,
                              }}
                              placeholder={p.stock}
                              autoFocus
                              onKeyDown={(e) => {
                                if (e.key === "Enter")
                                  handleUpdateStock(p._id, p.name);
                                if (e.key === "Escape") setEditingId(null);
                              }}
                            />
                            <button
                              onClick={() => handleUpdateStock(p._id, p.name)}
                              disabled={saving === p._id}
                              className="w-7 h-7 rounded-lg flex items-center
                                justify-center transition-all duration-150"
                              style={{
                                background: "rgba(34,197,94,0.12)",
                                color:      C.green,
                              }}
                            >
                              {saving === p._id
                                ? <RefreshCw size={12} className="animate-spin" />
                                : <Check size={13} strokeWidth={2.5} />
                              }
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="w-7 h-7 rounded-lg flex items-center
                                justify-center transition-all duration-150"
                              style={{
                                background: "rgba(239,68,68,0.1)",
                                color:      C.red,
                              }}
                            >
                              <X size={13} strokeWidth={2.5} />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingId(p._id)}
                            className="flex items-center gap-1.5 px-3 py-1.5
                              rounded-xl text-xs font-bold transition-all
                              duration-150"
                            style={{
                              background: C.goldLight,
                              color:      C.gold,
                              border:     `1px solid ${C.goldBorder}`,
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background =
                                "rgba(212,178,106,0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = C.goldLight;
                            }}
                          >
                            <Edit3 size={11} strokeWidth={2.5} />
                            Edit
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        {filtered.length > 0 && (
          <div
            className="px-5 py-3 flex items-center justify-between"
            style={{ borderTop: `1px solid ${C.border}` }}
          >
            <p className="text-[11px] font-medium" style={{ color: C.textMuted }}>
              Showing {filtered.length} of {products.length} products
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inventory;