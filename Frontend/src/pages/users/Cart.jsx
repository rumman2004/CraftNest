import { Link, useNavigate }       from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ShoppingBag, ArrowRight, Minus, Plus, X } from "lucide-react";
import { useCart }                 from "../../context/CartContext";
import toast                       from "react-hot-toast";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.10)",
  goldBorder: "rgba(212,178,106,0.22)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.38)",
  border:     "rgba(19,33,60,0.07)",
  surface:    "#ffffff",
  bg:         "#f4f5f8",
  red:        "#ef4444",
  redLight:   "rgba(239,68,68,0.08)",
  green:      "#22c55e",
  greenLight: "rgba(34,197,94,0.1)",
};

const Cart = () => {
  const {
    items, removeFromCart, updateQuantity,
    clearCart, totalItems, totalPrice,
  } = useCart();
  const navigate = useNavigate();

  const FREE_THRESHOLD = 499;
  const SHIPPING       = totalPrice >= FREE_THRESHOLD ? 0 : 49;
  const total          = totalPrice + SHIPPING;
  const remaining      = FREE_THRESHOLD - totalPrice;

  // ── Empty state ──────────────────────────────────────────────────────────
  if (items.length === 0) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{ background: C.bg }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1    }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-sm text-center"
        >
          {/* Icon */}
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center
              mx-auto mb-6"
            style={{
              background: C.goldLight,
              border:     `1px solid ${C.goldBorder}`,
            }}
          >
            <ShoppingBag size={36} style={{ color: C.gold }} />
          </div>

          <h2 className="text-2xl font-black mb-2" style={{ color: C.text }}>
            Your cart is empty
          </h2>
          <p className="text-sm mb-8" style={{ color: C.textSub }}>
            Looks like you haven't added anything yet!
          </p>

          <Link to="/shop">
            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{   scale: 0.97  }}
              className="inline-flex items-center gap-2 px-7 py-3.5
                rounded-2xl font-bold text-sm text-white"
              style={{
                background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                boxShadow:  "0 6px 20px rgba(19,33,60,0.22)",
              }}
            >
              <ShoppingBag size={16} />
              Start Shopping
              <ArrowRight size={14} strokeWidth={2.5} />
            </motion.div>
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.35 }}
      className="min-h-screen"
      style={{ background: C.bg }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* ── Page header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-5 sm:mb-7">
          <div>
            <h1 className="text-xl sm:text-2xl font-black"
              style={{ color: C.text }}>
              My Cart
            </h1>
            <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
              {totalItems} item{totalItems > 1 ? "s" : ""}
            </p>
          </div>

          <button
            onClick={() => { clearCart(); toast.success("Cart cleared"); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
              text-xs font-bold transition-all duration-150"
            style={{
              background: C.redLight,
              color:      C.red,
              border:     `1px solid rgba(239,68,68,0.15)`,
            }}
          >
            <Trash2 size={12} />
            <span className="hidden sm:inline">Clear All</span>
            <span className="sm:hidden">Clear</span>
          </button>
        </div>

        {/* ── Free shipping progress bar ────────────────────────────── */}
        {SHIPPING > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0  }}
            className="rounded-2xl px-4 py-3 mb-4 sm:mb-5"
            style={{
              background: C.goldLight,
              border:     `1px solid ${C.goldBorder}`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-bold" style={{ color: C.gold }}>
                🚚 Add ₹{remaining.toFixed(0)} more for FREE shipping!
              </p>
              <p className="text-[10px]" style={{ color: C.textMuted }}>
                ₹{totalPrice.toFixed(0)} / ₹{FREE_THRESHOLD}
              </p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden"
              style={{ background: "rgba(212,178,106,0.2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{
                  background:
                    `linear-gradient(to right,${C.gold},#f5e6b8)`,
                }}
                animate={{
                  width: `${Math.min((totalPrice / FREE_THRESHOLD) * 100, 100)}%`,
                }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}

        {SHIPPING === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1    }}
            className="rounded-2xl px-4 py-2.5 mb-4 sm:mb-5 flex items-center
              gap-2"
            style={{
              background: C.greenLight,
              border:     "1px solid rgba(34,197,94,0.2)",
            }}
          >
            <span className="text-sm">🎉</span>
            <p className="text-[11px] font-bold" style={{ color: C.green }}>
              You've unlocked FREE shipping!
            </p>
          </motion.div>
        )}

        {/* ── Main grid ─────────────────────────────────────────────── */}
        <div className="flex flex-col lg:grid lg:grid-cols-3 gap-4 sm:gap-6">

          {/* ── Cart items ────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-3">
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item._id}
                  layout
                  initial={{ opacity: 0, y: 12           }}
                  animate={{ opacity: 1, y: 0            }}
                  exit={{    opacity: 0, scale: 0.95,
                             height: 0, marginBottom: 0,
                             transition: { duration: 0.22 } }}
                  className="rounded-2xl overflow-hidden"
                  style={{
                    background: C.surface,
                    border:     `1px solid ${C.border}`,
                    boxShadow:  "0 2px 10px rgba(19,33,60,0.05)",
                  }}
                >
                  {/* ── Mobile layout (< sm) ─────────────────────── */}
                  <div className="flex items-start gap-3 p-3 sm:hidden">
                    {/* Image */}
                    <img
                      src={item.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                    />

                    {/* Info + controls */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h3 className="text-xs font-bold leading-tight line-clamp-2"
                          style={{ color: C.text }}>
                          {item.name}
                        </h3>
                        {/* Remove */}
                        <button
                          onClick={() => {
                            removeFromCart(item._id);
                            toast.success("Removed");
                          }}
                          className="flex-shrink-0 w-6 h-6 rounded-lg flex
                            items-center justify-center transition-colors"
                          style={{
                            background: C.redLight,
                            color:      C.red,
                          }}
                        >
                          <X size={11} />
                        </button>
                      </div>

                      <p className="text-xs font-black mt-1"
                        style={{ color: C.gold }}>
                        ₹{item.price?.toFixed(0)}
                      </p>

                      {/* Qty + subtotal row */}
                      <div className="flex items-center justify-between mt-2">
                        {/* Qty stepper */}
                        <div className="flex items-center rounded-xl overflow-hidden"
                          style={{
                            border:     `1px solid ${C.border}`,
                            background: C.bg,
                          }}>
                          <button
                            onClick={() =>
                              item.quantity <= 1
                                ? removeFromCart(item._id)
                                : updateQuantity(item._id, item.quantity - 1)
                            }
                            className="w-7 h-7 flex items-center justify-center
                              transition-colors"
                            style={{ color: C.textSub }}
                          >
                            <Minus size={10} />
                          </button>
                          <span className="w-6 text-center text-xs font-black"
                            style={{ color: C.text }}>
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              item.quantity < item.stock &&
                              updateQuantity(item._id, item.quantity + 1)
                            }
                            className="w-7 h-7 flex items-center justify-center
                              transition-colors"
                            style={{
                              color: item.quantity >= item.stock
                                ? C.textMuted : C.textSub,
                            }}
                          >
                            <Plus size={10} />
                          </button>
                        </div>

                        {/* Subtotal */}
                        <p className="text-sm font-black"
                          style={{ color: C.navy }}>
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ── Desktop/tablet layout (sm+) ──────────────── */}
                  <div className="hidden sm:flex items-center gap-4 p-4">
                    {/* Image */}
                    <img
                      src={item.images?.[0]?.url || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-2xl flex-shrink-0"
                    />

                    {/* Name + price */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm leading-snug truncate"
                        style={{ color: C.text }}>
                        {item.name}
                      </h3>
                      <p className="text-sm font-black mt-1"
                        style={{ color: C.gold }}>
                        ₹{item.price?.toFixed(0)}
                      </p>
                      {item.quantity >= item.stock && (
                        <p className="text-[10px] mt-1 font-semibold"
                          style={{ color: C.red }}>
                          Max stock reached
                        </p>
                      )}
                    </div>

                    {/* Qty stepper */}
                    <div
                      className="flex items-center rounded-xl overflow-hidden
                        flex-shrink-0"
                      style={{
                        border:     `1.5px solid ${C.border}`,
                        background: C.bg,
                      }}
                    >
                      <button
                        onClick={() =>
                          item.quantity <= 1
                            ? removeFromCart(item._id)
                            : updateQuantity(item._id, item.quantity - 1)
                        }
                        className="w-9 h-9 flex items-center justify-center
                          transition-colors hover:bg-gray-100"
                        style={{ color: C.textSub }}
                      >
                        <Minus size={13} />
                      </button>
                      <span
                        className="w-9 text-center text-sm font-black"
                        style={{ color: C.text }}
                      >
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          item.quantity < item.stock &&
                          updateQuantity(item._id, item.quantity + 1)
                        }
                        className="w-9 h-9 flex items-center justify-center
                          transition-colors hover:bg-gray-100"
                        style={{
                          color: item.quantity >= item.stock
                            ? C.textMuted : C.textSub,
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    {/* Subtotal */}
                    <div className="text-right flex-shrink-0 w-20">
                      <p className="text-base font-black"
                        style={{ color: C.navy }}>
                        ₹{(item.price * item.quantity).toFixed(0)}
                      </p>
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => {
                        removeFromCart(item._id);
                        toast.success("Removed from cart");
                      }}
                      className="w-8 h-8 rounded-xl flex items-center
                        justify-center flex-shrink-0 transition-all duration-150"
                      style={{
                        background: C.redLight,
                        color:      C.red,
                        border:     "1px solid rgba(239,68,68,0.12)",
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* ── Order summary ──────────────────────────────────────────── */}
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-4 sm:p-5 lg:sticky lg:top-24"
              style={{
                background: C.surface,
                border:     `1px solid ${C.border}`,
                boxShadow:  "0 4px 20px rgba(19,33,60,0.07)",
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-black" style={{ color: C.text }}>
                  Order Summary
                </h2>
                <span
                  className="text-[10px] font-black px-2 py-1 rounded-full"
                  style={{ background: C.goldLight, color: C.gold }}
                >
                  {totalItems} items
                </span>
              </div>

              {/* Line items */}
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-xs"
                  style={{ color: C.textSub }}>
                  <span>Subtotal</span>
                  <span className="font-semibold"
                    style={{ color: C.text }}>
                    ₹{totalPrice.toFixed(0)}
                  </span>
                </div>

                <div className="flex justify-between text-xs"
                  style={{ color: C.textSub }}>
                  <span>Shipping</span>
                  <span
                    className="font-bold"
                    style={{ color: SHIPPING === 0 ? C.green : C.text }}
                  >
                    {SHIPPING === 0 ? "FREE 🎉" : `₹${SHIPPING}`}
                  </span>
                </div>

                {/* Divider */}
                <div className="h-px my-1"
                  style={{ background: C.border }} />

                <div className="flex justify-between items-center">
                  <span className="text-sm font-black"
                    style={{ color: C.text }}>
                    Total
                  </span>
                  <span className="text-lg font-black"
                    style={{ color: C.navy }}>
                    ₹{total.toFixed(0)}
                  </span>
                </div>
              </div>

              {/* Savings badge */}
              {SHIPPING === 0 && (
                <div
                  className="rounded-xl px-3 py-2 mb-4 text-center text-xs
                    font-bold"
                  style={{
                    background: C.greenLight,
                    color:      C.green,
                    border:     "1px solid rgba(34,197,94,0.2)",
                  }}
                >
                  You saved ₹49 on shipping! 🎉
                </div>
              )}

              {/* CTA buttons */}
              <div className="space-y-2.5">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{   scale: 0.97  }}
                  onClick={() => navigate("/user/checkout")}
                  className="w-full flex items-center justify-center gap-2
                    py-3.5 rounded-2xl text-sm font-black text-white
                    transition-all duration-150"
                  style={{
                    background:
                      `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                    boxShadow: "0 6px 20px rgba(19,33,60,0.22)",
                  }}
                >
                  Proceed to Checkout
                  <ArrowRight size={15} strokeWidth={2.5} />
                </motion.button>

                <Link to="/shop" className="block">
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    whileTap={{   scale: 0.98  }}
                    className="w-full flex items-center justify-center gap-2
                      py-3 rounded-2xl text-sm font-bold transition-all"
                    style={{
                      background: C.bg,
                      color:      C.textSub,
                      border:     `1.5px solid ${C.border}`,
                    }}
                  >
                    <ShoppingBag size={14} />
                    Continue Shopping
                  </motion.div>
                </Link>
              </div>

              {/* Trust badges */}
              <div className="mt-4 pt-4 grid grid-cols-3 gap-2"
                style={{ borderTop: `1px solid ${C.border}` }}>
                {[
                  { icon: "🔒", label: "Secure\nCheckout" },
                  { icon: "↩️", label: "Easy\nReturns"   },
                  { icon: "⚡", label: "Fast\nDelivery"  },
                ].map(({ icon, label }) => (
                  <div key={label}
                    className="flex flex-col items-center gap-1 text-center">
                    <span className="text-base">{icon}</span>
                    <p className="text-[9px] font-bold leading-tight
                      whitespace-pre-line"
                      style={{ color: C.textMuted }}>
                      {label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;