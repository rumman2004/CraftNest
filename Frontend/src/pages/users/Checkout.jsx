import { useState, useRef, useEffect }  from "react";
import { useNavigate }                  from "react-router-dom";
import { motion, AnimatePresence }      from "framer-motion";
import {
  ShoppingBag, MapPin, CreditCard, CheckCircle,
  ArrowLeft, ArrowRight, Lock, User, Phone,
  Truck, Banknote, Package, Tag, Gift,
  BadgeCheck, RotateCcw, Zap, Mail,
} from "lucide-react";
import { useCart }     from "../../context/CartContext";
import { useAuth }     from "../../context/AuthContext";
import { createOrder } from "../../services/api";
import toast           from "react-hot-toast";

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
  green:      "#22c55e",
  greenLight: "rgba(34,197,94,0.09)",
  red:        "#ef4444",
};

const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE             = 49;

const STEPS = [
  { id: 1, label: "Shipping", icon: MapPin      },
  { id: 2, label: "Payment",  icon: CreditCard  },
  { id: 3, label: "Review",   icon: ShoppingBag },
  { id: 4, label: "Done",     icon: CheckCircle },
];

const PAYMENT_METHODS = [
  {
    value: "COD",
    label: "Cash on Delivery",
    icon:  Banknote,
    desc:  "Pay when your order arrives",
  },
  {
    value: "Online",
    label: "Credit / Debit Card",
    icon:  CreditCard,
    desc:  "Secure online card payment",
  },
];

// ── Micro components ───────────────────────────────────────────────────────
const Spinner = ({ size = 15 }) => (
  <svg className="animate-spin" width={size} height={size}
    viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke="currentColor"
      strokeWidth="3" strokeDasharray="32" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor"
      strokeWidth="3" strokeLinecap="round" />
  </svg>
);

const Divider = () => (
  <div className="h-px my-3" style={{ background: C.border }} />
);

// ── Field ──────────────────────────────────────────────────────────────────
const Field = ({
  label, name, value, onChange, placeholder,
  error, type = "text", colSpan = "", icon: Icon, readOnly,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <div className={colSpan}>
      <label className="block text-[10px] font-black uppercase
        tracking-widest mb-1.5" style={{ color: C.textMuted }}>
        {label}
      </label>
      <div
        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl
          transition-all duration-150"
        style={{
          background: "rgba(19,33,60,0.025)",
          border: `1.5px solid ${
            error   ? C.red  :
            focused ? C.gold : C.border
          }`,
          boxShadow: focused && !readOnly
            ? "0 0 0 3px rgba(212,178,106,0.11)" : "none",
          opacity: readOnly ? 0.65 : 1,
        }}
      >
        {Icon && (
          <Icon size={13} style={{
            color: focused ? C.gold : C.textMuted, flexShrink: 0,
          }} />
        )}
        <input
          type={type} name={name} value={value}
          onChange={onChange} placeholder={placeholder}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={()  => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm
            font-medium placeholder:font-normal"
          style={{
            color:       C.text,
            caretColor:  C.gold,
            "::placeholder": { color: C.textMuted },
          }}
        />
        {readOnly && (
          <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md
            flex-shrink-0"
            style={{
              background: "rgba(212,178,106,0.15)",
              color:      C.gold,
            }}>
            AUTO
          </span>
        )}
      </div>
      {error && (
        <p className="text-[11px] mt-1" style={{ color: C.red }}>{error}</p>
      )}
    </div>
  );
};

// ── Card ───────────────────────────────────────────────────────────────────
const Card = ({ children, className = "" }) => (
  <div
    className={`relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 ${className}`}
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 20px rgba(19,33,60,0.05)",
    }}
  >
    {children}
  </div>
);

// ── Section heading ────────────────────────────────────────────────────────
const SectionHead = ({ icon: Icon, title, accent = C.gold }) => (
  <div className="flex items-center gap-3 mb-5">
    <div className="w-9 h-9 rounded-xl flex items-center justify-center
      flex-shrink-0"
      style={{
        background: `${accent}18`,
        border:     `1px solid ${accent}30`,
      }}>
      <Icon size={16} style={{ color: accent }} />
    </div>
    <h2 className="text-base sm:text-lg font-black"
      style={{ color: C.text }}>
      {title}
    </h2>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// Checkout
// ══════════════════════════════════════════════════════════════════════════
const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user }                         = useAuth();
  const navigate                         = useNavigate();
  const snapshot                         = useRef([]);

  const [step,          setStep         ] = useState(1);
  const [loading,       setLoading      ] = useState(false);
  const [placedOrder,   setPlacedOrder  ] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [errors,        setErrors       ] = useState({});
  const [summaryOpen,   setSummaryOpen  ] = useState(false); // mobile toggle

  const [shipping, setShipping] = useState({
    fullName: "", email: "", phone: "",
    street: "", city: "", state: "", pincode: "", country: "",
  });

  useEffect(() => {
    if (!user) return;
    setShipping((p) => ({
      fullName: p.fullName || user.name            || "",
      email:    p.email    || user.email           || "",
      phone:    p.phone    || user.phone           || "",
      street:   p.street   || user.address?.street || "",
      city:     p.city     || user.address?.city   || "",
      state:    p.state    || user.address?.state  || "",
      pincode:  p.pincode  || user.address?.zip    || "",
      country:  p.country  || user.address?.country|| "",
    }));
  }, [user]);

  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount  = totalPrice + shippingCost;

  // ── Empty cart guard ─────────────────────────────────────────────────────
  if (items.length === 0 && !placedOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4"
        style={{ background: C.bg }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1    }}
          className="w-full max-w-sm text-center"
        >
          <div className="w-20 h-20 rounded-3xl flex items-center
            justify-center mx-auto mb-5"
            style={{ background: C.goldLight, border: `1px solid ${C.goldBorder}` }}>
            <ShoppingBag size={32} style={{ color: C.gold }} />
          </div>
          <h2 className="text-xl font-black mb-2" style={{ color: C.text }}>
            Your cart is empty
          </h2>
          <p className="text-sm mb-6" style={{ color: C.textSub }}>
            Add some handcrafted items before checking out.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/shop")}
            className="inline-flex items-center gap-2 px-6 py-3
              rounded-2xl text-sm font-bold text-white"
            style={{
              background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
              boxShadow:  "0 4px 18px rgba(19,33,60,0.22)",
            }}
          >
            <ShoppingBag size={15} /> Go Shopping
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // ── Validation ───────────────────────────────────────────────────────────
  const validateShipping = () => {
    const e = {};
    if (!shipping.fullName.trim()) e.fullName = "Required";
    if (!shipping.email.trim())    e.email    = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email))
      e.email = "Enter a valid email";
    if (!shipping.phone.trim())    e.phone    = "Required";
    if (!shipping.street.trim())   e.street   = "Required";
    if (!shipping.city.trim())     e.city     = "Required";
    if (!shipping.state.trim())    e.state    = "Required";
    if (!shipping.pincode.trim())  e.pincode  = "Required";
    if (!shipping.country.trim())  e.country  = "Required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleShippingChange = (e) => {
    setShipping((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors  ((f) => ({ ...f, [e.target.name]: ""             }));
  };

  const nextStep = () => {
    if (step === 1 && !validateShipping()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Place order ──────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!items.length) { toast.error("Your cart is empty"); return; }
    setLoading(true);
    try {
      snapshot.current = items.map((it) => ({
        product:  it._id,
        name:     it.name,
        image:    it.images?.[0]?.url || "",
        price:    it.price,
        quantity: it.quantity,
      }));

      const { data } = await createOrder({
        orderItems:      snapshot.current,
        shippingAddress: shipping,
        paymentMethod,
        itemsPrice:      totalPrice,
        shippingPrice:   shippingCost,
        totalPrice:      totalAmount,
      });

      setPlacedOrder(data);
      clearCart();
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  const displayItems = placedOrder ? snapshot.current : items;

  // ── Step indicator ───────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-7 sm:mb-10">
      {STEPS.map((s, idx) => {
        const Icon        = s.icon;
        const isCompleted = step > s.id;
        const isActive    = step === s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: isActive ? 1.12 : 1 }}
                transition={{ type: "spring", stiffness: 280, damping: 22 }}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center
                  justify-center text-xs font-bold"
                style={
                  isCompleted ? {
                    background: C.green,
                    color:      "#fff",
                    boxShadow:  "0 2px 10px rgba(34,197,94,0.3)",
                  } : isActive ? {
                    background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                    color:      "#fff",
                    boxShadow:  "0 4px 16px rgba(19,33,60,0.28)",
                  } : {
                    background: "#edf0f4",
                    color:      C.textMuted,
                  }
                }
              >
                {isCompleted
                  ? <CheckCircle size={14} />
                  : <Icon size={13} />
                }
              </motion.div>
              <span className="text-[9px] sm:text-[10px] mt-1 font-bold
                whitespace-nowrap"
                style={{
                  color: isCompleted ? C.green
                    : isActive       ? C.navy
                    : C.textMuted,
                }}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div
                className="w-6 sm:w-12 h-0.5 mb-5 mx-1 rounded-full
                  transition-all duration-500"
                style={{
                  background: step > s.id
                    ? C.green
                    : "rgba(19,33,60,0.09)",
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Order summary (sidebar + mobile drawer) ──────────────────────────────
  const OrderSummaryContent = () => (
    <>
      {/* Gold top bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl
        sm:rounded-t-3xl"
        style={{ background: "linear-gradient(to right,#d4b26a,#264670)" }} />

      <h3 className="font-black text-sm mb-4 pt-1 flex items-center gap-2"
        style={{ color: C.text }}>
        <Tag size={14} style={{ color: C.gold }} />
        Order Summary
      </h3>

      {/* Items list */}
      <div className="space-y-3 mb-4 max-h-48 overflow-y-auto pr-0.5
        scrollbar-thin">
        {displayItems.map((item) => (
          <div key={item._id ?? item.product}
            className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <img
                src={item.images?.[0]?.url ?? item.image ?? "/placeholder.jpg"}
                alt={item.name}
                className="w-11 h-11 rounded-xl object-cover"
                style={{ border: `1px solid ${C.border}` }}
              />
              {/* Qty badge */}
              <span
                className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full
                  text-white flex items-center justify-center text-[9px] font-black"
                style={{ background: C.navy }}
              >
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate"
                style={{ color: C.text }}>
                {item.name}
              </p>
              <p className="text-[10px]" style={{ color: C.textSub }}>
                ₹{item.price?.toFixed(0)} × {item.quantity}
              </p>
            </div>
            <p className="text-xs font-black flex-shrink-0"
              style={{ color: C.gold }}>
              ₹{(item.price * item.quantity).toFixed(0)}
            </p>
          </div>
        ))}
      </div>

      <Divider />

      {/* Totals */}
      <div className="space-y-2 text-xs">
        <div className="flex justify-between" style={{ color: C.textSub }}>
          <span className="flex items-center gap-1.5">
            <Package size={11} /> Subtotal
          </span>
          <span className="font-semibold" style={{ color: C.text }}>
            ₹{totalPrice.toFixed(0)}
          </span>
        </div>
        <div className="flex justify-between" style={{ color: C.textSub }}>
          <span className="flex items-center gap-1.5">
            <Truck size={11} /> Shipping
          </span>
          <span className="font-bold"
            style={{ color: shippingCost === 0 ? C.green : C.textSub }}>
            {shippingCost === 0 ? "FREE" : `₹${shippingCost}`}
          </span>
        </div>

        {/* Free shipping nudge */}
        {shippingCost > 0 && (
          <div className="rounded-xl px-3 py-2 mt-1"
            style={{
              background: C.goldLight,
              border:     `1px solid ${C.goldBorder}`,
            }}>
            <p className="text-[10px] font-bold" style={{ color: C.gold }}>
              Add ₹{(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(0)} more
              for free shipping!
            </p>
            <div className="h-1 rounded-full mt-1.5 overflow-hidden"
              style={{ background: "rgba(212,178,106,0.2)" }}>
              <motion.div
                className="h-full rounded-full"
                style={{ background: C.gold }}
                animate={{
                  width: `${Math.min(
                    (totalPrice / FREE_SHIPPING_THRESHOLD) * 100, 100,
                  )}%`,
                }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        )}

        {shippingCost === 0 && (
          <div className="flex items-center gap-1.5 rounded-xl px-3 py-2"
            style={{
              background: C.greenLight,
              border:     "1px solid rgba(34,197,94,0.2)",
            }}>
            <Gift size={11} style={{ color: C.green }} />
            <p className="text-[10px] font-bold" style={{ color: C.green }}>
              You unlocked free shipping!
            </p>
          </div>
        )}

        <Divider />

        <div className="flex justify-between items-center">
          <span className="text-sm font-black" style={{ color: C.text }}>
            Total
          </span>
          <span className="text-base font-black"
            style={{ color: C.navy }}>
            ₹{totalAmount.toFixed(0)}
          </span>
        </div>
      </div>

      {/* Trust badges */}
      <Divider />
      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: Lock,       label: "Secure\nCheckout" },
          { icon: RotateCcw,  label: "Easy\nReturns"   },
          { icon: Zap,        label: "Fast\nDelivery"  },
        ].map(({ icon: Icon, label }) => (
          <div key={label}
            className="flex flex-col items-center gap-1 text-center p-2
              rounded-xl"
            style={{ background: C.bg }}>
            <Icon size={14} style={{ color: C.textMuted }} />
            <p className="text-[9px] font-bold leading-tight whitespace-pre-line"
              style={{ color: C.textMuted }}>
              {label}
            </p>
          </div>
        ))}
      </div>
    </>
  );

  // ── Nav buttons ──────────────────────────────────────────────────────────
  const BackBtn = () => (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      onClick={prevStep}
      className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-2xl
        text-xs sm:text-sm font-bold transition-all duration-150"
      style={{
        background: C.bg,
        color:      C.textSub,
        border:     `1px solid ${C.border}`,
      }}
    >
      <ArrowLeft size={14} /> Back
    </motion.button>
  );

  const NextBtn = ({ label, onClick }) => (
    <motion.button
      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
      onClick={onClick ?? nextStep}
      className="flex items-center gap-2 px-5 sm:px-6 py-2.5 rounded-2xl
        text-xs sm:text-sm font-bold text-white"
      style={{
        background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
        boxShadow:  "0 4px 18px rgba(19,33,60,0.22)",
      }}
    >
      {label} <ArrowRight size={14} strokeWidth={2.5} />
    </motion.button>
  );

  // ── Main render ──────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="min-h-screen"
      style={{ background: C.bg }}
    >
      <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-5 sm:py-8">

        {/* ── Page header ──────────────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6 sm:mb-8">
          {step < 4 && (
            <motion.button
              whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
              onClick={() =>
                step === 1 ? navigate("/user/cart") : prevStep()
              }
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center
                justify-center transition-all"
              style={{
                background: C.surface,
                border:     `1px solid ${C.border}`,
                color:      C.textSub,
                boxShadow:  "0 1px 6px rgba(19,33,60,0.06)",
              }}
            >
              <ArrowLeft size={15} />
            </motion.button>
          )}
          <div>
            <h1 className="text-xl sm:text-2xl font-black"
              style={{ color: C.text }}>
              {step === 4 ? "Order Confirmed!" : "Checkout"}
            </h1>
            {step < 4 && (
              <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
                Step {step} of 3
              </p>
            )}
          </div>
        </div>

        <StepIndicator />

        {/* ── Mobile order summary toggle (steps 1–3) ──────────────── */}
        {step < 4 && (
          <motion.button
            onClick={() => setSummaryOpen((v) => !v)}
            className="w-full lg:hidden flex items-center justify-between
              px-4 py-3 rounded-2xl mb-4 transition-all"
            style={{
              background: C.surface,
              border:     `1px solid ${C.border}`,
            }}
          >
            <div className="flex items-center gap-2">
              <ShoppingBag size={14} style={{ color: C.gold }} />
              <span className="text-xs font-bold" style={{ color: C.text }}>
                {summaryOpen ? "Hide" : "Show"} order summary
              </span>
              <span className="text-xs font-black px-2 py-0.5 rounded-full"
                style={{ background: C.goldLight, color: C.gold }}>
                ₹{totalAmount.toFixed(0)}
              </span>
            </div>
            <motion.div
              animate={{ rotate: summaryOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ArrowRight size={13} style={{ color: C.textMuted }}
                className="rotate-90" />
            </motion.div>
          </motion.button>
        )}

        {/* Mobile summary panel */}
        <AnimatePresence>
          {summaryOpen && step < 4 && (
            <motion.div
              key="mobile-summary"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{    opacity: 0, height: 0      }}
              transition={{ duration: 0.25 }}
              className="lg:hidden mb-4 overflow-hidden"
            >
              <div className="relative rounded-2xl p-4"
                style={{
                  background: C.surface,
                  border:     `1px solid ${C.border}`,
                }}>
                <OrderSummaryContent />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Content grid ─────────────────────────────────────────── */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">

          {/* ── Steps ────────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <AnimatePresence mode="wait">

              {/* ─── Step 1: Shipping ─────────────────────────────── */}
              {step === 1 && (
                <motion.div key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0  }}
                  exit={{    opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <Card>
                    <SectionHead icon={MapPin}
                      title="Shipping Address" accent={C.gold} />

                    {/* Auto-fill notice */}
                    {user && (
                      <div className="flex items-center gap-2 mb-4 px-3 py-2.5
                        rounded-xl"
                        style={{
                          background: C.goldLight,
                          border:     `1px solid ${C.goldBorder}`,
                        }}>
                        <User size={12} style={{ color: C.gold }} />
                        <p className="text-[11px]" style={{ color: C.textSub }}>
                          Fields pre-filled from your profile — edit if needed.
                        </p>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <Field label="Full Name" name="fullName"
                        value={shipping.fullName}
                        onChange={handleShippingChange}
                        placeholder="Jane Smith"
                        error={errors.fullName} icon={User} />

                      <Field label="Email" name="email" type="email"
                        value={shipping.email}
                        onChange={handleShippingChange}
                        placeholder="jane@example.com"
                        error={errors.email} icon={Mail} />

                      <Field label="Phone" name="phone"
                        value={shipping.phone}
                        onChange={handleShippingChange}
                        placeholder="+91 98765 43210"
                        error={errors.phone} icon={Phone} />

                      <Field label="Country" name="country"
                        value={shipping.country}
                        onChange={handleShippingChange}
                        placeholder="India"
                        error={errors.country} />

                      <Field label="Street Address" name="street"
                        value={shipping.street}
                        onChange={handleShippingChange}
                        placeholder="123 Craft Lane, Apt 4B"
                        error={errors.street}
                        colSpan="sm:col-span-2" />

                      <Field label="City" name="city"
                        value={shipping.city}
                        onChange={handleShippingChange}
                        placeholder="Mumbai"
                        error={errors.city} />

                      <Field label="State" name="state"
                        value={shipping.state}
                        onChange={handleShippingChange}
                        placeholder="Maharashtra"
                        error={errors.state} />

                      <Field label="Pincode / ZIP" name="pincode"
                        value={shipping.pincode}
                        onChange={handleShippingChange}
                        placeholder="400001"
                        error={errors.pincode} />
                    </div>

                    <div className="flex justify-end mt-5">
                      <NextBtn label="Continue to Payment" />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 2: Payment ──────────────────────────────── */}
              {step === 2 && (
                <motion.div key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0  }}
                  exit={{    opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                >
                  <Card>
                    <SectionHead icon={CreditCard}
                      title="Payment Method" accent={C.navyLight} />

                    <div className="space-y-3 mb-5">
                      {PAYMENT_METHODS.map((method) => {
                        const active  = paymentMethod === method.value;
                        const MIcon   = method.icon;
                        return (
                          <motion.label
                            key={method.value}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{   scale: 0.99 }}
                            className="flex items-center gap-3 sm:gap-4 p-3.5
                              sm:p-4 rounded-2xl cursor-pointer
                              transition-all duration-150"
                            style={{
                              border:     `2px solid ${
                                active ? C.gold : C.border
                              }`,
                              background: active ? C.goldLight : C.surface,
                            }}
                          >
                            <input type="radio" name="paymentMethod"
                              value={method.value} checked={active}
                              onChange={(e) =>
                                setPaymentMethod(e.target.value)
                              }
                              className="sr-only" />

                            {/* Icon circle */}
                            <div
                              className="w-10 h-10 rounded-xl flex items-center
                                justify-center flex-shrink-0"
                              style={{
                                background: active
                                  ? "rgba(212,178,106,0.2)"
                                  : C.bg,
                                border: `1px solid ${
                                  active ? C.goldBorder : C.border
                                }`,
                              }}
                            >
                              <MIcon size={18}
                                style={{
                                  color: active ? C.gold : C.textSub,
                                }} />
                            </div>

                            <div className="flex-1">
                              <p className="font-bold text-sm"
                                style={{ color: C.text }}>
                                {method.label}
                              </p>
                              <p className="text-xs mt-0.5"
                                style={{ color: C.textSub }}>
                                {method.desc}
                              </p>
                            </div>

                            {active && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                              >
                                <BadgeCheck size={18}
                                  style={{ color: C.gold }} />
                              </motion.div>
                            )}
                          </motion.label>
                        );
                      })}
                    </div>

                    {/* Security notice */}
                    <div className="flex items-center gap-2.5 px-4 py-3
                      rounded-xl mb-5"
                      style={{
                        background: C.greenLight,
                        border:     "1px solid rgba(34,197,94,0.18)",
                      }}>
                      <Lock size={13} style={{ color: C.green }} />
                      <p className="text-[11px]" style={{ color: "#15803d" }}>
                        Your payment information is always secure and encrypted.
                      </p>
                    </div>

                    <div className="flex justify-between">
                      <BackBtn />
                      <NextBtn label="Review Order" />
                    </div>
                  </Card>
                </motion.div>
              )}

              {/* ─── Step 3: Review ───────────────────────────────── */}
              {step === 3 && (
                <motion.div key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0  }}
                  exit={{    opacity: 0, x: -20 }}
                  transition={{ duration: 0.22 }}
                  className="space-y-3 sm:space-y-4"
                >
                  {/* Shipping summary */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center
                          justify-center"
                          style={{
                            background: C.goldLight,
                            border:     `1px solid ${C.goldBorder}`,
                          }}>
                          <MapPin size={13} style={{ color: C.gold }} />
                        </div>
                        <h3 className="font-black text-sm"
                          style={{ color: C.text }}>
                          Shipping To
                        </h3>
                      </div>
                      <button onClick={() => setStep(1)}
                        className="text-[11px] font-bold px-2.5 py-1
                          rounded-lg transition-colors"
                        style={{
                          color:      C.gold,
                          background: C.goldLight,
                        }}>
                        Edit
                      </button>
                    </div>

                    <div className="rounded-xl p-3 space-y-0.5 text-xs"
                      style={{ background: C.bg }}>
                      <p className="font-bold text-sm"
                        style={{ color: C.text }}>
                        {shipping.fullName}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1"
                        style={{ color: C.textSub }}>
                        <Mail size={10} />
                        <span>{shipping.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5"
                        style={{ color: C.textSub }}>
                        <Phone size={10} />
                        <span>{shipping.phone}</span>
                      </div>
                      <div className="flex items-start gap-1.5 mt-1"
                        style={{ color: C.textSub }}>
                        <MapPin size={10} className="mt-0.5 flex-shrink-0" />
                        <span>
                          {shipping.street},{" "}
                          {shipping.city}, {shipping.state} –{" "}
                          {shipping.pincode}, {shipping.country}
                        </span>
                      </div>
                    </div>
                  </Card>

                  {/* Payment summary */}
                  <Card>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg flex items-center
                          justify-center"
                          style={{
                            background: "rgba(38,70,112,0.1)",
                            border:     "1px solid rgba(38,70,112,0.15)",
                          }}>
                          <CreditCard size={13}
                            style={{ color: C.navyLight }} />
                        </div>
                        <h3 className="font-black text-sm"
                          style={{ color: C.text }}>
                          Payment
                        </h3>
                      </div>
                      <button onClick={() => setStep(2)}
                        className="text-[11px] font-bold px-2.5 py-1
                          rounded-lg"
                        style={{
                          color:      C.gold,
                          background: C.goldLight,
                        }}>
                        Edit
                      </button>
                    </div>

                    {(() => {
                      const m = PAYMENT_METHODS.find(
                        (x) => x.value === paymentMethod,
                      );
                      const MIcon = m?.icon;
                      return (
                        <div className="flex items-center gap-3 rounded-xl p-3"
                          style={{ background: C.bg }}>
                          <div className="w-8 h-8 rounded-lg flex items-center
                            justify-center flex-shrink-0"
                            style={{
                              background: C.goldLight,
                              border:     `1px solid ${C.goldBorder}`,
                            }}>
                            {MIcon && (
                              <MIcon size={15} style={{ color: C.gold }} />
                            )}
                          </div>
                          <p className="font-bold text-sm"
                            style={{ color: C.text }}>
                            {m?.label}
                          </p>
                        </div>
                      );
                    })()}
                  </Card>

                  {/* Items summary */}
                  <Card>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-7 h-7 rounded-lg flex items-center
                        justify-center"
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          border:     "1px solid rgba(34,197,94,0.18)",
                        }}>
                        <Package size={13} style={{ color: C.green }} />
                      </div>
                      <h3 className="font-black text-sm"
                        style={{ color: C.text }}>
                        Items ({items.length})
                      </h3>
                    </div>

                    <div className="space-y-2">
                      {items.map((item) => (
                        <div key={item._id}
                          className="flex items-center gap-3 p-2.5 rounded-xl"
                          style={{ background: C.bg }}>
                          <img
                            src={item.images?.[0]?.url || "/placeholder.jpg"}
                            alt={item.name}
                            className="w-12 h-12 object-cover rounded-xl
                              flex-shrink-0"
                            style={{ border: `1px solid ${C.border}` }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-xs truncate"
                              style={{ color: C.text }}>
                              {item.name}
                            </p>
                            <p className="text-[11px] mt-0.5"
                              style={{ color: C.textSub }}>
                              ₹{item.price?.toFixed(0)} × {item.quantity}
                            </p>
                          </div>
                          <p className="font-black text-xs flex-shrink-0"
                            style={{ color: C.gold }}>
                            ₹{(item.price * item.quantity).toFixed(0)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>

                  {/* Nav buttons */}
                  <div className="flex justify-between pt-1">
                    <BackBtn />
                    <motion.button
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{   scale: 0.97          }}
                      onClick={handlePlaceOrder}
                      disabled={loading}
                      className="flex items-center gap-2 px-5 sm:px-7 py-3
                        rounded-2xl text-xs sm:text-sm font-black text-white
                        disabled:cursor-not-allowed"
                      style={{
                        background: loading
                          ? "rgba(19,33,60,0.18)"
                          : `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                        boxShadow: loading
                          ? "none"
                          : "0 6px 24px rgba(19,33,60,0.28)",
                      }}
                    >
                      {loading ? (
                        <><Spinner size={14} /> Placing Order…</>
                      ) : (
                        <>
                          <CheckCircle size={15} />
                          Place Order
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* ─── Step 4: Success ──────────────────────────────── */}
              {step === 4 && placedOrder && (
                <motion.div key="step4"
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1    }}
                  transition={{
                    type: "spring", stiffness: 200, damping: 22,
                  }}
                >
                  <Card className="text-center">
                    {/* Gold top bar */}
                    <div className="absolute top-0 left-0 right-0 h-[3px]
                      rounded-t-2xl sm:rounded-t-3xl"
                      style={{
                        background:
                          "linear-gradient(to right,#d4b26a,#264670)",
                      }} />

                    {/* Success icon */}
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        delay: 0.2, type: "spring",
                        stiffness: 200, damping: 16,
                      }}
                      className="w-16 h-16 sm:w-20 sm:h-20 mx-auto rounded-full
                        flex items-center justify-center text-white mb-5"
                      style={{
                        background:
                          `linear-gradient(135deg,${C.green},#16a34a)`,
                        boxShadow:
                          "0 8px 28px rgba(34,197,94,0.3)",
                      }}
                    >
                      <CheckCircle size={34} />
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0  }}
                      transition={{ delay: 0.3 }}
                    >
                      <h2 className="text-xl sm:text-2xl font-black mb-1.5"
                        style={{ color: C.text }}>
                        Order Placed!
                      </h2>
                      <p className="text-sm mb-1" style={{ color: C.textSub }}>
                        Thank you! We'll start preparing your order right away.
                      </p>
                      <p className="text-[11px] font-mono mb-5"
                        style={{ color: C.textMuted }}>
                        Order #{placedOrder._id?.slice(-10).toUpperCase()}
                      </p>

                      {/* Delivery address */}
                      <div className="rounded-2xl px-4 py-3 mb-4 text-left"
                        style={{
                          background: C.goldLight,
                          border:     `1px solid ${C.goldBorder}`,
                        }}>
                        <p className="text-[10px] font-black uppercase
                          tracking-widest mb-2 flex items-center gap-1"
                          style={{ color: C.gold }}>
                          <Truck size={11} /> Delivering To
                        </p>
                        <p className="text-xs font-bold"
                          style={{ color: C.text }}>
                          {placedOrder.shippingAddress?.fullName}
                        </p>
                        <p className="text-xs mt-0.5"
                          style={{ color: C.textSub }}>
                          {[
                            placedOrder.shippingAddress?.street,
                            placedOrder.shippingAddress?.city,
                            placedOrder.shippingAddress?.state,
                            placedOrder.shippingAddress?.pincode,
                            placedOrder.shippingAddress?.country,
                          ].filter(Boolean).join(", ")}
                        </p>
                      </div>

                      {/* Price breakdown */}
                      <div className="rounded-2xl p-4 text-left mb-6
                        space-y-2 text-xs"
                        style={{ background: C.bg }}>
                        <div className="flex justify-between"
                          style={{ color: C.textSub }}>
                          <span className="flex items-center gap-1.5">
                            <Package size={11} /> Items
                          </span>
                          <span>
                            ₹{placedOrder.itemsPrice?.toFixed(0)}
                          </span>
                        </div>
                        <div className="flex justify-between"
                          style={{ color: C.textSub }}>
                          <span className="flex items-center gap-1.5">
                            <Truck size={11} /> Shipping
                          </span>
                          <span style={{
                            color:      placedOrder.shippingPrice === 0
                              ? C.green : C.textSub,
                            fontWeight: placedOrder.shippingPrice === 0
                              ? 700 : 400,
                          }}>
                            {placedOrder.shippingPrice === 0
                              ? "FREE"
                              : `₹${placedOrder.shippingPrice?.toFixed(0)}`}
                          </span>
                        </div>
                        <div className="flex justify-between font-black
                          text-sm pt-2"
                          style={{
                            borderTop: `1px solid ${C.border}`,
                            color:     C.text,
                          }}>
                          <span>Total</span>
                          <span style={{ color: C.gold }}>
                            ₹{placedOrder.totalPrice?.toFixed(0)}
                          </span>
                        </div>
                      </div>

                      {/* CTA buttons */}
                      <div className="flex flex-col sm:flex-row gap-3
                        justify-center">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{   scale: 0.97  }}
                          onClick={() =>
                            navigate(`/user/orders/${placedOrder._id}`)
                          }
                          className="flex items-center justify-center gap-2
                            px-6 py-3 rounded-2xl text-sm font-bold
                            text-white"
                          style={{
                            background:
                              `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                            boxShadow:
                              "0 4px 18px rgba(19,33,60,0.22)",
                          }}
                        >
                          <Package size={14} />
                          View Order Details
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{   scale: 0.97  }}
                          onClick={() => navigate("/shop")}
                          className="flex items-center justify-center gap-2
                            px-6 py-3 rounded-2xl text-sm font-bold
                            transition-all duration-150"
                          style={{
                            background: C.bg,
                            color:      C.textSub,
                            border:     `1px solid ${C.border}`,
                          }}
                        >
                          <ShoppingBag size={14} />
                          Continue Shopping
                        </motion.button>
                      </div>
                    </motion.div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Desktop sidebar ─────────────────────────────────────── */}
          {step < 4 && (
            <div className="hidden lg:block lg:col-span-1">
              <div className="relative rounded-3xl p-5 sticky top-24"
                style={{
                  background: C.surface,
                  border:     `1px solid ${C.border}`,
                  boxShadow:  "0 4px 24px rgba(19,33,60,0.06)",
                }}>
                <OrderSummaryContent />
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default Checkout;