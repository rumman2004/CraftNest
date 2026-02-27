// pages/admin/AdminProductsList.jsx

import { useState, useEffect, useCallback } from "react";
import { Link }                             from "react-router-dom";
import { motion }                           from "framer-motion";
import {
  Plus, Edit2, Trash2, Search, Package,
  Star, RefreshCw,
} from "lucide-react";
import { getProducts, deleteProduct }       from "../../services/api";
import LoadingSpinner                       from "../../components/common/LoadingSpinner";
import toast                                from "react-hot-toast";

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
  red:        "#ef4444",
  green:      "#22c55e",
  orange:     "#f97316",
};

const stockColor = (s) =>
  s === 0 ? C.red : s < 5 ? C.orange : C.green;

const AdminProductsList = () => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading ] = useState(true);
  const [search,   setSearch  ] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    getProducts({ limit: 100, search })
      .then(({ data }) =>
        setProducts(Array.isArray(data?.products) ? data.products : [])
      )
      .catch(() => toast.error("Failed to load products"))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      toast.success("Product deleted");
      setProducts((p) => p.filter((item) => item._id !== id));
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row justify-between
        items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-black tracking-tight"
            style={{ color: C.text }}>
            Products
            <span className="ml-2 text-sm font-semibold"
              style={{ color: C.textMuted }}>
              ({products.length})
            </span>
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
            Manage your product catalogue
          </p>
        </div>

        <Link
          to="/admin/products/add"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl
            text-sm font-bold transition-all duration-150"
          style={{
            background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
            color:      "#fff",
            boxShadow:  "0 4px 16px rgba(19,33,60,0.2)",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.boxShadow = "0 6px 22px rgba(19,33,60,0.3)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.boxShadow = "0 4px 16px rgba(19,33,60,0.2)")
          }
        >
          <Plus size={16} strokeWidth={2.5} />
          Add Product
        </Link>
      </div>

      {/* ── Toolbar ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: C.textMuted }} />
          <input
            type="text"
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-10 py-2.5 rounded-xl text-sm
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
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2
                w-4 h-4 flex items-center justify-center rounded-full
                text-xs font-bold"
              style={{ background: C.textMuted, color: "#fff" }}
            >
              ×
            </button>
          )}
        </div>

        <button
          onClick={load}
          className="w-9 h-9 flex items-center justify-center rounded-xl
            transition-all duration-150"
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
          }}
        >
          <RefreshCw size={14} />
        </button>
      </div>

      {/* ── Table ──────────────────────────────────────────────────── */}
      {loading ? (
        <LoadingSpinner />
      ) : (
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
                  {["Product","Category","Price","Stock","Rating","Actions"]
                    .map((h) => (
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
                {products.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-14">
                      <Package size={28}
                        style={{ color: C.textMuted, margin: "0 auto 8px" }} />
                      <p className="text-sm" style={{ color: C.textMuted }}>
                        No products found
                      </p>
                    </td>
                  </tr>
                ) : (
                  products.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      style={{ borderBottom: `1px solid ${C.border}` }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = C.surfaceAlt)
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
                    >
                      {/* Product */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <img
                              src={p.images?.[0]?.url || "/placeholder.jpg"}
                              alt={p.name}
                              className="w-11 h-11 rounded-xl object-cover"
                              style={{ border: `1px solid ${C.border}` }}
                            />
                            {p.featured && (
                              <span
                                className="absolute -top-1.5 -right-1.5 w-4 h-4
                                  rounded-full flex items-center justify-center"
                                style={{ background: C.gold }}
                              >
                                <Star size={8} fill="#fff" strokeWidth={0} />
                              </span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate max-w-[140px]"
                              style={{ color: C.text }}>
                              {p.name}
                            </p>
                            <p className="text-[10px] font-medium"
                              style={{ color: C.textMuted }}>
                              ID: {p._id.slice(-6).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-5 py-3.5">
                        <span
                          className="px-2.5 py-1 rounded-full text-[10px] font-bold"
                          style={{ background: C.goldLight, color: C.gold }}
                        >
                          {p.category}
                        </span>
                      </td>

                      {/* Price — ✅ ₹, no decimals */}
                      <td className="px-5 py-3.5">
                        <span className="text-sm font-black"
                          style={{ color: C.text }}>
                          ₹{p.price?.toFixed(0)}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: stockColor(p.stock) }}
                          />
                          <span className="text-sm font-black"
                            style={{ color: stockColor(p.stock) }}>
                            {p.stock === 0 ? "Out" : p.stock}
                          </span>
                          {p.stock > 0 && (
                            <span className="text-[10px]"
                              style={{ color: C.textMuted }}>
                              units
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Rating */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          <Star size={11} fill={C.gold} strokeWidth={0} />
                          <span className="text-xs font-bold"
                            style={{ color: C.text }}>
                            {(p.ratings ?? 0).toFixed(1)}
                          </span>
                          {p.numReviews > 0 && (
                            <span className="text-[10px]"
                              style={{ color: C.textMuted }}>
                              ({p.numReviews})
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2">
                          <Link
                            to={`/admin/products/edit/${p._id}`}
                            className="w-8 h-8 flex items-center justify-center
                              rounded-xl transition-all duration-150"
                            style={{
                              background: "rgba(38,70,112,0.08)",
                              color:      C.navyLight,
                            }}
                            onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(38,70,112,0.15)")
                            }
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(38,70,112,0.08)")
                            }
                          >
                            <Edit2 size={13} />
                          </Link>

                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            disabled={deleting === p._id}
                            className="w-8 h-8 flex items-center justify-center
                              rounded-xl transition-all duration-150
                              disabled:opacity-40"
                            style={{
                              background: "rgba(239,68,68,0.08)",
                              color:      C.red,
                            }}
                            onMouseEnter={(e) => {
                              if (deleting !== p._id)
                                e.currentTarget.style.background =
                                  "rgba(239,68,68,0.15)";
                            }}
                            onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "rgba(239,68,68,0.08)")
                            }
                          >
                            {deleting === p._id
                              ? <RefreshCw size={13} className="animate-spin" />
                              : <Trash2 size={13} />
                            }
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {products.length > 0 && (
            <div className="px-5 py-3"
              style={{ borderTop: `1px solid ${C.border}` }}>
              <p className="text-[11px]" style={{ color: C.textMuted }}>
                {products.length} product{products.length !== 1 ? "s" : ""}
                {search && (
                  <span> matching <strong>"{search}"</strong></span>
                )}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminProductsList;