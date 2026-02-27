// pages/user/Checkout.jsx

import { useState, useRef, useEffect }  from "react";
import { useNavigate }                  from "react-router-dom";
import { motion, AnimatePresence }      from "framer-motion";
import {
  ShoppingBag, MapPin, CreditCard, CheckCircle,
  ArrowLeft, ArrowRight, Lock, User, Phone,
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
  goldLight:  "rgba(212,178,106,0.12)",
  goldBorder: "rgba(212,178,106,0.2)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.4)",
  border:     "rgba(19,33,60,0.07)",
  surface:    "#ffffff",
  bg:         "#f4f5f8",
  green:      "#22c55e",
  red:        "#ef4444",
};

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
    emoji: "💵",
    desc:  "Pay when your order arrives",
  },
  {
    value: "Online",
    label: "Credit / Debit Card",
    emoji: "💳",
    desc:  "Secure online card payment",
  },
];

// ── Free shipping threshold — must match the backend ──────────────────────
const FREE_SHIPPING_THRESHOLD = 500;
const SHIPPING_FEE             = 49;

// ── Spinner ────────────────────────────────────────────────────────────────
const Spinner = ({ size = 15 }) => (
  <svg className="animate-spin" width={size} height={size}
    viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="3"
      strokeDasharray="32" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
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
        className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl
          transition-all duration-150"
        style={{
          background: readOnly ? "rgba(19,33,60,0.02)" : "rgba(19,33,60,0.025)",
          border:     `1px solid ${error ? C.red : focused ? C.gold : C.border}`,
          boxShadow:  focused && !readOnly
            ? "0 0 0 3px rgba(212,178,106,0.12)" : "none",
          opacity: readOnly ? 0.7 : 1,
        }}
      >
        {Icon && (
          <Icon size={14} style={{
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
            font-medium placeholder:font-normal placeholder:text-opacity-50"
          style={{ color: C.text, caretColor: C.gold }}
        />
        {/* Auto-filled indicator */}
        {readOnly && (
          <span className="text-[9px] font-bold px-1.5 py-0.5
            rounded-md flex-shrink-0"
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
    className={`relative rounded-3xl p-6 sm:p-8 ${className}`}
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 4px 24px rgba(19,33,60,0.06)",
    }}
  >
    {children}
  </div>
);

// ── Section heading ────────────────────────────────────────────────────────
const SectionHead = ({ icon: Icon, title, accentColor }) => (
  <div className="flex items-center gap-3 mb-6">
    <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
      style={{ background: `${accentColor}18`, border: `1px solid ${accentColor}30` }}>
      <Icon size={18} style={{ color: accentColor }} />
    </div>
    <h2 className="text-lg font-black" style={{ color: C.text }}>{title}</h2>
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

  // ── Shipping form — pre-filled from user profile ───────────────────────
  const [shipping, setShipping] = useState({
    fullName: "",
    email:    "",
    phone:    "",
    street:   "",
    city:     "",
    state:    "",
    pincode:  "",
    country:  "",
  });

  // Auto-fill shipping from user context whenever user changes
  useEffect(() => {
    if (!user) return;
    setShipping((prev) => ({
      // Only fill empty fields — don't overwrite user edits
      fullName: prev.fullName || user.name  || "",
      email:    prev.email    || user.email || "",
      phone:    prev.phone    || user.phone || "",
      // Address sub-fields
      street:   prev.street   || user.address?.street  || "",
      city:     prev.city     || user.address?.city    || "",
      state:    prev.state    || user.address?.state   || "",
      pincode:  prev.pincode  || user.address?.zip     || "",
      country:  prev.country  || user.address?.country || "",
    }));
  }, [user]);

  // ── Totals ─────────────────────────────────────────────────────────────
  const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
  const totalAmount  = totalPrice + shippingCost;

  // ── Empty cart guard ───────────────────────────────────────────────────
  if (items.length === 0 && !placedOrder) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center">
        <div className="w-20 h-20 rounded-3xl flex items-center
          justify-center mx-auto mb-6"
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
            boxShadow:  "0 4px 18px rgba(19,33,60,0.25)",
          }}
        >
          <ShoppingBag size={16} /> Go Shopping
        </motion.button>
      </div>
    );
  }

  // ── Validation ─────────────────────────────────────────────────────────
  const validateShipping = () => {
    const errs = {};
    if (!shipping.fullName.trim()) errs.fullName = "Full name is required";
    if (!shipping.email.trim())    errs.email    = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email))
      errs.email = "Enter a valid email";
    if (!shipping.phone.trim())    errs.phone    = "Phone number is required";
    if (!shipping.street.trim())   errs.street   = "Street address is required";
    if (!shipping.city.trim())     errs.city     = "City is required";
    if (!shipping.state.trim())    errs.state    = "State is required";
    if (!shipping.pincode.trim())  errs.pincode  = "Pincode is required";
    if (!shipping.country.trim())  errs.country  = "Country is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleShippingChange = (e) => {
    setShipping((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors  ((f) => ({ ...f, [e.target.name]: ""             }));
  };

  // ── Navigation ─────────────────────────────────────────────────────────
  const nextStep = () => {
    if (step === 1 && !validateShipping()) return;
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevStep = () => {
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ── Place order ────────────────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (items.length === 0) { toast.error("Your cart is empty"); return; }

    setLoading(true);
    try {
      // Snapshot items in case cart clears before step 4 renders
      snapshot.current = items.map((item) => ({
        product:  item._id,
        name:     item.name,
        image:    item.images?.[0]?.url || "",
        price:    item.price,
        quantity: item.quantity,
      }));

      const orderData = {
        // ── items — matches Order schema field name ────────────────────
        orderItems: snapshot.current,

        // ── Full shipping address including email ──────────────────────
        shippingAddress: {
          fullName: shipping.fullName,
          email:    shipping.email,
          phone:    shipping.phone,
          street:   shipping.street,
          city:     shipping.city,
          state:    shipping.state,
          pincode:  shipping.pincode,
          country:  shipping.country,
        },

        paymentMethod,

        // Send client-calculated totals too — backend will re-verify
        itemsPrice:    totalPrice,
        shippingPrice: shippingCost,
        totalPrice:    totalAmount,
      };

      const { data } = await createOrder(orderData);
      setPlacedOrder(data);
      clearCart();
      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
      toast.success("Order placed successfully! 🎉");
    } catch (err) {
      console.error("[Checkout] place order error:", err);
      toast.error(err.response?.data?.message || "Failed to place order");
    } finally {
      setLoading(false);
    }
  };

  // ── Step indicator ─────────────────────────────────────────────────────
  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-10">
      {STEPS.map((s, idx) => {
        const Icon        = s.icon;
        const isCompleted = step > s.id;
        const isActive    = step === s.id;
        return (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <motion.div
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 22 }}
                className="w-10 h-10 rounded-full flex items-center
                  justify-center font-bold text-sm shadow-md"
                style={
                  isCompleted
                    ? { background: C.green, color: "#fff" }
                    : isActive
                    ? {
                        background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                        color:      "#fff",
                        boxShadow:  "0 4px 16px rgba(19,33,60,0.3)",
                      }
                    : { background: "#f0f2f5", color: C.textMuted }
                }
              >
                {isCompleted ? <CheckCircle size={17} /> : <Icon size={15} />}
              </motion.div>
              <span className="text-[10px] mt-1.5 font-semibold whitespace-nowrap"
                style={{
                  color: isCompleted ? C.green
                    : isActive       ? C.navy
                    : C.textMuted,
                }}>
                {s.label}
              </span>
            </div>
            {idx < STEPS.length - 1 && (
              <div className="w-10 sm:w-16 h-0.5 mb-5 mx-1 transition-all duration-500"
                style={{ background: step > s.id ? C.green : "rgba(19,33,60,0.1)" }} />
            )}
          </div>
        );
      })}
    </div>
  );

  // ── Order summary sidebar ──────────────────────────────────────────────
  const displayItems = placedOrder
    ? snapshot.current
    : items;

  const OrderSummary = () => (
    <div className="relative rounded-3xl p-6 sticky top-24"
      style={{
        background: C.surface,
        border:     `1px solid ${C.border}`,
        boxShadow:  "0 4px 24px rgba(19,33,60,0.06)",
      }}
    >
      <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-3xl"
        style={{ background: "linear-gradient(to right,#d4b26a,#264670)" }} />

      <h3 className="font-black text-sm mb-4 pt-1" style={{ color: C.text }}>
        Order Summary
      </h3>

      <div className="space-y-3 mb-5 max-h-52 overflow-y-auto pr-1">
        {displayItems.map((item) => (
          <div key={item._id ?? item.product} className="flex items-center gap-3">
            <img
              src={item.images?.[0]?.url ?? item.image ?? "/placeholder.jpg"}
              alt={item.name}
              className="w-12 h-12 rounded-2xl object-cover flex-shrink-0"
              style={{ border: `1px solid ${C.border}` }}
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate" style={{ color: C.text }}>
                {item.name}
              </p>
              <p className="text-[11px]" style={{ color: C.textSub }}>
                ₹{item.price?.toFixed(0)} × {item.quantity}
              </p>
            </div>
            <p className="text-xs font-bold flex-shrink-0" style={{ color: C.gold }}>
              ₹{(item.price * item.quantity).toFixed(0)}
            </p>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="pt-4 space-y-2 text-sm"
        style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex justify-between" style={{ color: C.textSub }}>
          <span>Subtotal</span>
          <span>₹{totalPrice.toFixed(0)}</span>
        </div>
        <div className="flex justify-between" style={{ color: C.textSub }}>
          <span>Shipping</span>
          <span style={{
            color:      shippingCost === 0 ? C.green : C.textSub,
            fontWeight: shippingCost === 0 ? 700     : 400,
          }}>
            {shippingCost === 0 ? "FREE 🎉" : `₹${shippingCost}`}
          </span>
        </div>
        {shippingCost > 0 && (
          <p className="text-[11px]" style={{ color: C.textMuted }}>
            Add ₹{(FREE_SHIPPING_THRESHOLD - totalPrice).toFixed(0)} more for free shipping!
          </p>
        )}
        <div className="flex justify-between font-black text-base pt-2"
          style={{ borderTop: `1px solid ${C.border}`, color: C.text }}>
          <span>Total</span>
          <span style={{
            background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor:  "transparent",
          }}>
            ₹{totalAmount.toFixed(0)}
          </span>
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      style={{ minHeight: "100vh", background: C.bg }}
    >
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        {step < 4 && (
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => step === 1 ? navigate("/user/cart") : prevStep()}
            className="w-9 h-9 rounded-xl flex items-center justify-center
              transition-all duration-150"
            style={{
              background: C.surface,
              border:     `1px solid ${C.border}`,
              color:      C.textSub,
            }}
          >
            <ArrowLeft size={17} />
          </motion.button>
        )}
        <h1 className="text-2xl sm:text-3xl font-black" style={{ color: C.text }}>
          {step === 4 ? "Order Confirmed! 🎉" : "Checkout"}
        </h1>
      </div>

      <StepIndicator />

      <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
        {/* ── Main content ─────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">

            {/* ── Step 1: Shipping ──────────────────────────────────── */}
            {step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{    opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <SectionHead icon={MapPin} title="Shipping Address"
                    accentColor={C.gold} />

                  {/* Auto-fill notice */}
                  {user && (
                    <div className="flex items-center gap-2 mb-5 px-3.5
                      py-2.5 rounded-2xl"
                      style={{
                        background: "rgba(212,178,106,0.08)",
                        border:     `1px solid ${C.goldBorder}`,
                      }}
                    >
                      <User size={13} style={{ color: C.gold }} />
                      <p className="text-xs" style={{ color: C.textSub }}>
                        Fields pre-filled from your profile. Edit if needed.
                      </p>
                    </div>
                  )}

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Field
                      label="Full Name" name="fullName"
                      value={shipping.fullName}
                      onChange={handleShippingChange}
                      placeholder="Jane Smith"
                      error={errors.fullName} icon={User}
                    />
                    <Field
                      label="Email" name="email" type="email"
                      value={shipping.email}
                      onChange={handleShippingChange}
                      placeholder="jane@example.com"
                      error={errors.email}
                    />
                    <Field
                      label="Phone" name="phone"
                      value={shipping.phone}
                      onChange={handleShippingChange}
                      placeholder="+91 98765 43210"
                      error={errors.phone} icon={Phone}
                    />
                    <Field
                      label="Country" name="country"
                      value={shipping.country}
                      onChange={handleShippingChange}
                      placeholder="India"
                      error={errors.country}
                    />
                    <Field
                      label="Street Address" name="street"
                      value={shipping.street}
                      onChange={handleShippingChange}
                      placeholder="123 Craft Lane, Apt 4B"
                      error={errors.street}
                      colSpan="sm:col-span-2"
                    />
                    <Field
                      label="City" name="city"
                      value={shipping.city}
                      onChange={handleShippingChange}
                      placeholder="Mumbai"
                      error={errors.city}
                    />
                    <Field
                      label="State" name="state"
                      value={shipping.state}
                      onChange={handleShippingChange}
                      placeholder="Maharashtra"
                      error={errors.state}
                    />
                    <Field
                      label="Pincode / ZIP" name="pincode"
                      value={shipping.pincode}
                      onChange={handleShippingChange}
                      placeholder="400001"
                      error={errors.pincode}
                    />
                  </div>

                  <div className="flex justify-end mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-3
                        rounded-2xl text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                        boxShadow:  "0 4px 18px rgba(19,33,60,0.25)",
                      }}
                    >
                      Continue to Payment <ArrowRight size={15} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── Step 2: Payment ───────────────────────────────────── */}
            {step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{    opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
              >
                <Card>
                  <SectionHead icon={CreditCard} title="Payment Method"
                    accentColor={C.navyLight} />

                  <div className="space-y-3">
                    {PAYMENT_METHODS.map((method) => {
                      const active = paymentMethod === method.value;
                      return (
                        <motion.label
                          key={method.value}
                          whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                          className="flex items-center gap-4 p-4 rounded-2xl
                            cursor-pointer transition-all duration-200"
                          style={{
                            border:     `2px solid ${active ? C.gold : C.border}`,
                            background: active ? C.goldLight : C.surface,
                          }}
                        >
                          <input type="radio" name="paymentMethod"
                            value={method.value} checked={active}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="sr-only" />
                          <span className="text-2xl">{method.emoji}</span>
                          <div className="flex-1">
                            <p className="font-bold text-sm" style={{ color: C.text }}>
                              {method.label}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
                              {method.desc}
                            </p>
                          </div>
                          {active && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                              <CheckCircle size={18} style={{ color: C.gold }} />
                            </motion.div>
                          )}
                        </motion.label>
                      );
                    })}
                  </div>

                  <div className="mt-5 flex items-center gap-2.5 px-4 py-3 rounded-2xl"
                    style={{
                      background: "rgba(34,197,94,0.08)",
                      border:     "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    <Lock size={14} style={{ color: C.green }} />
                    <p className="text-xs" style={{ color: "#15803d" }}>
                      Your payment information is always secure and encrypted.
                    </p>
                  </div>

                  <div className="flex justify-between mt-6">
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={prevStep}
                      className="flex items-center gap-2 px-5 py-2.5
                        rounded-2xl text-sm font-bold transition-all duration-150"
                      style={{
                        background: "#f4f5f8", color: C.textSub,
                        border:     `1px solid ${C.border}`,
                      }}
                    >
                      <ArrowLeft size={15} /> Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      onClick={nextStep}
                      className="flex items-center gap-2 px-6 py-2.5
                        rounded-2xl text-sm font-bold text-white"
                      style={{
                        background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                        boxShadow:  "0 4px 18px rgba(19,33,60,0.25)",
                      }}
                    >
                      Review Order <ArrowRight size={15} strokeWidth={2.5} />
                    </motion.button>
                  </div>
                </Card>
              </motion.div>
            )}

            {/* ── Step 3: Review ────────────────────────────────────── */}
            {step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0  }}
                exit={{    opacity: 0, x: -24 }}
                transition={{ duration: 0.25 }}
                className="space-y-4"
              >
                {/* Shipping summary */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={15} style={{ color: C.gold }} />
                      <h3 className="font-black text-sm" style={{ color: C.text }}>
                        Shipping To
                      </h3>
                    </div>
                    <button onClick={() => setStep(1)}
                      className="text-xs font-bold" style={{ color: C.gold }}>
                      Edit
                    </button>
                  </div>
                  <div className="text-sm space-y-0.5" style={{ color: C.textSub }}>
                    <p className="font-bold" style={{ color: C.text }}>
                      {shipping.fullName}
                    </p>
                    <p className="text-xs" style={{ color: C.textMuted }}>
                      {shipping.email}
                    </p>
                    <p>{shipping.street}</p>
                    <p>
                      {shipping.city}, {shipping.state} — {shipping.pincode}
                    </p>
                    <p>{shipping.country}</p>
                    <p className="mt-1">📞 {shipping.phone}</p>
                  </div>
                </Card>

                {/* Payment summary */}
                <Card>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} style={{ color: C.gold }} />
                      <h3 className="font-black text-sm" style={{ color: C.text }}>
                        Payment Method
                      </h3>
                    </div>
                    <button onClick={() => setStep(2)}
                      className="text-xs font-bold" style={{ color: C.gold }}>
                      Edit
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.emoji}
                    </span>
                    <p className="font-bold text-sm" style={{ color: C.text }}>
                      {PAYMENT_METHODS.find((m) => m.value === paymentMethod)?.label}
                    </p>
                  </div>
                </Card>

                {/* Items summary */}
                <Card>
                  <div className="flex items-center gap-2 mb-4">
                    <ShoppingBag size={15} style={{ color: C.gold }} />
                    <h3 className="font-black text-sm" style={{ color: C.text }}>
                      Order Items ({items.length})
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {items.map((item) => (
                      <div key={item._id} className="flex items-center gap-4
                        p-3 rounded-2xl" style={{ background: C.bg }}>
                        <img
                          src={item.images?.[0]?.url || "/placeholder.jpg"}
                          alt={item.name}
                          className="w-14 h-14 object-cover rounded-2xl flex-shrink-0"
                          style={{ border: `1px solid ${C.border}` }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm truncate"
                            style={{ color: C.text }}>{item.name}</p>
                          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
                            ₹{item.price?.toFixed(0)} × {item.quantity}
                          </p>
                        </div>
                        <p className="font-bold text-sm flex-shrink-0"
                          style={{ color: C.gold }}>
                          ₹{(item.price * item.quantity).toFixed(0)}
                        </p>
                      </div>
                    ))}
                  </div>
                </Card>

                <div className="flex justify-between">
                  <motion.button
                    whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                    onClick={prevStep}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl
                      text-sm font-bold transition-all duration-150"
                    style={{
                      background: "#f4f5f8", color: C.textSub,
                      border:     `1px solid ${C.border}`,
                    }}
                  >
                    <ArrowLeft size={15} /> Back
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{  scale: 0.97           }}
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex items-center gap-2 px-7 py-3 rounded-2xl
                      text-sm font-black text-white disabled:cursor-not-allowed"
                    style={{
                      background: loading
                        ? "rgba(19,33,60,0.2)"
                        : `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                      boxShadow: loading ? "none" : "0 6px 24px rgba(19,33,60,0.3)",
                    }}
                  >
                    {loading
                      ? <><Spinner size={15} /> Placing Order…</>
                      : "Place Order 🎉"
                    }
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* ── Step 4: Success ───────────────────────────────────── */}
            {step === 4 && placedOrder && (
              <motion.div key="step4"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1    }}
                transition={{ type: "spring", stiffness: 200, damping: 22 }}
              >
                <Card className="text-center">
                  <div className="absolute top-0 left-0 right-0 h-[3px]
                    rounded-t-3xl"
                    style={{ background: "linear-gradient(to right,#d4b26a,#264670)" }} />

                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring",
                      stiffness: 200, damping: 16 }}
                    className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-full
                      flex items-center justify-center text-white mb-6"
                    style={{
                      background: `linear-gradient(135deg,${C.green},#16a34a)`,
                      boxShadow:  "0 8px 32px rgba(34,197,94,0.3)",
                    }}
                  >
                    <CheckCircle size={42} />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0  }}
                    transition={{ delay: 0.35 }}
                  >
                    <h2 className="text-2xl sm:text-3xl font-black mb-2"
                      style={{ color: C.text }}>
                      Order Placed! 🎉
                    </h2>
                    <p className="text-sm mb-1" style={{ color: C.textSub }}>
                      Thank you! We'll start preparing your order right away.
                    </p>
                    <p className="text-xs font-mono mb-2"
                      style={{ color: C.textMuted }}>
                      Order #{placedOrder._id?.slice(-10).toUpperCase()}
                    </p>

                    {/* Delivery address confirmation */}
                    <div className="rounded-2xl px-4 py-3 mb-4 text-left"
                      style={{
                        background: C.goldLight,
                        border:     `1px solid ${C.goldBorder}`,
                      }}
                    >
                      <p className="text-[10px] font-black uppercase tracking-widest
                        mb-1.5 flex items-center gap-1" style={{ color: C.gold }}>
                        <MapPin size={10} /> Delivering To
                      </p>
                      <p className="text-xs font-semibold" style={{ color: C.text }}>
                        {placedOrder.shippingAddress?.fullName}
                      </p>
                      <p className="text-xs" style={{ color: C.textSub }}>
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
                    <div className="rounded-2xl p-5 text-left mb-8 space-y-2"
                      style={{ background: C.bg }}>
                      <div className="flex justify-between text-sm"
                        style={{ color: C.textSub }}>
                        <span>Items</span>
                        <span>₹{placedOrder.itemsPrice?.toFixed(0)}</span>
                      </div>
                      <div className="flex justify-between text-sm"
                        style={{ color: C.textSub }}>
                        <span>Shipping</span>
                        <span style={{
                          color:      placedOrder.shippingPrice === 0 ? C.green : C.textSub,
                          fontWeight: placedOrder.shippingPrice === 0 ? 700 : 400,
                        }}>
                          {placedOrder.shippingPrice === 0
                            ? "FREE"
                            : `₹${placedOrder.shippingPrice?.toFixed(0)}`}
                        </span>
                      </div>
                      <div className="flex justify-between font-black text-base pt-2"
                        style={{ borderTop: `1px solid ${C.border}`, color: C.text }}>
                        <span>Total</span>
                        <span style={{
                          background:           "linear-gradient(to right,#d4b26a,#c69e4f)",
                          WebkitBackgroundClip: "text",
                          WebkitTextFillColor:  "transparent",
                        }}>
                          ₹{placedOrder.totalPrice?.toFixed(0)}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/user/orders/${placedOrder._id}`)}
                        className="flex items-center justify-center gap-2
                          px-6 py-3 rounded-2xl text-sm font-bold text-white"
                        style={{
                          background: `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                          boxShadow:  "0 4px 18px rgba(19,33,60,0.25)",
                        }}
                      >
                        View Order Details
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                        onClick={() => navigate("/shop")}
                        className="flex items-center justify-center gap-2
                          px-6 py-3 rounded-2xl text-sm font-bold
                          transition-all duration-150"
                        style={{
                          background: "#f4f5f8", color: C.textSub,
                          border:     `1px solid ${C.border}`,
                        }}
                      >
                        <ShoppingBag size={15} /> Continue Shopping
                      </motion.button>
                    </div>
                  </motion.div>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Order summary sidebar ──────────────────────────────── */}
        {step < 4 && (
          <div className="lg:col-span-1">
            <OrderSummary />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Checkout;