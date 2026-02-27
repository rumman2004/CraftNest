import { useState, useRef }              from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
} from "framer-motion";
import {
  LogIn, Mail, Lock, Sparkles, ArrowRight,
  ShieldCheck, Star, Heart, Zap,
  Scissors, Palette, Flower2, Shirt, Gem, Leaf,
} from "lucide-react";
import { loginUser } from "../services/api";
import { useAuth }   from "../context/AuthContext";
import toast         from "react-hot-toast";
import Input         from "../components/ui/Input";
import Button        from "../components/ui/Button";

// ── Floating icon particles ────────────────────────────────────────────────
const particles = [
  { icon: Sparkles, x: "4%",  y: "8%",  size: 18, dur: 3.2, delay: 0   },
  { icon: Heart,    x: "90%", y: "6%",  size: 16, dur: 3.8, delay: 0.5 },
  { icon: Gem,      x: "94%", y: "50%", size: 15, dur: 2.9, delay: 0.3 },
  { icon: Scissors, x: "2%",  y: "60%", size: 15, dur: 3.5, delay: 0.8 },
  { icon: Leaf,     x: "85%", y: "80%", size: 14, dur: 4.0, delay: 0.2 },
  { icon: Flower2,  x: "12%", y: "85%", size: 15, dur: 3.3, delay: 0.6 },
  { icon: Star,     x: "50%", y: "3%",  size: 14, dur: 3.6, delay: 0.4 },
  { icon: Palette,  x: "70%", y: "92%", size: 15, dur: 3.1, delay: 0.9 },
];

// ── Trust items ────────────────────────────────────────────────────────────
const trustItems = [
  { icon: ShieldCheck, label: "SSL Secured"    },
  { icon: Star,        label: "4.9 Rated"      },
  { icon: Heart,       label: "10k+ Members"   },
  { icon: Zap,         label: "Instant Access" },
];

// ── Variants ───────────────────────────────────────────────────────────────
const cardVariants = {
  hidden:  { opacity: 0, y: 60, scale: 0.93 },
  visible: {
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
  },
};
const fieldVariants = {
  hidden:  { opacity: 0, x: -16 },
  visible: (i) => ({
    opacity: 1, x: 0,
    transition: { delay: 0.35 + i * 0.1, duration: 0.4, ease: "easeOut" },
  }),
};

// ═══════════════════════════════════════════════════════════════════════════
const Login = () => {
  const [form,    setForm]    = useState({ email: "", password: "" });
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const cardRef = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX  = useTransform(rotateY, [-12, 12], ["20%", "80%"]);
  const glareY  = useTransform(rotateX, [-12, 12], ["20%", "80%"]);

  const { login }  = useAuth();
  const navigate   = useNavigate();
  const location   = useLocation();
  const from       = location.state?.from || null;

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    rotateY.set(((e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)) * 6);
    rotateX.set(((e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)) * -6);
  };
  const resetTilt = () => { rotateX.set(0); rotateY.set(0); };

  const handleChange = (e) => {
    setForm((f)    => ({ ...f,   [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er,  [e.target.name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email)    errs.email    = "Email address is required";
    if (!form.password) errs.password = "Password is required";
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    try {
      const { data } = await loginUser(form);
      setSuccess(true);
      login(data);
      toast.success(`Welcome back, ${data.name}!`);
      await new Promise((r) => setTimeout(r, 800));
      navigate(
        from ?? (data.role === "admin" ? "/admin/dashboard" : "/user/home"),
        { replace: true }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed. Please try again.");
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center
        px-4 py-10 sm:py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #f3f4f7 0%, #eef0f6 50%, #f3f4f7 100%)",
      }}
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
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -left-48 w-[400px] sm:w-[520px]
            h-[400px] sm:h-[520px] rounded-full blur-3xl"
          style={{ background: "rgba(212,178,106,0.18)" }}
        />
        <motion.div
          animate={{ scale: [1, 1.18, 1], opacity: [0.25, 0.4, 0.25] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-48 -right-48 w-[380px] sm:w-[480px]
            h-[380px] sm:h-[480px] rounded-full blur-3xl"
          style={{ background: "rgba(38,70,112,0.12)" }}
        />
      </div>

      {/* Floating icons */}
      {particles.map((p, i) => {
        const FloatIcon = p.icon;
        return (
          <motion.div
            key={i}
            className="absolute select-none pointer-events-none hidden sm:block"
            style={{ left: p.x, top: p.y, color: "rgba(212,178,106,0.4)" }}
            animate={{ y: [0, -16, 0], rotate: [0, 9, -9, 0], scale: [1, 1.08, 1] }}
            transition={{
              duration: p.dur, repeat: Infinity,
              ease: "easeInOut", delay: p.delay,
            }}
          >
            <FloatIcon size={p.size} strokeWidth={1.3} />
          </motion.div>
        );
      })}

      {/* 3-D card wrapper */}
      <motion.div
        ref={cardRef}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onTouchStart={resetTilt}
        className="relative z-10 w-full max-w-[400px] sm:max-w-[420px]"
      >
        {/* Depth layers */}
        <div
          className="absolute inset-x-6 sm:inset-x-8 -bottom-4 sm:-bottom-5
            h-full rounded-[2rem] sm:rounded-[2.2rem] blur-2xl -z-10"
          style={{
            background:
              "linear-gradient(to bottom, rgba(212,178,106,0.2), rgba(38,70,112,0.15))",
          }}
        />
        <div
          className="absolute inset-x-3 sm:inset-x-4 -bottom-2 sm:-bottom-2.5
            h-full rounded-[2rem] sm:rounded-[2.2rem] -z-10 blur-sm"
          style={{ background: "rgba(255,255,255,0.7)" }}
        />

        {/* Card */}
        <div
          className="relative backdrop-blur-2xl
            rounded-[1.8rem] sm:rounded-[2rem] overflow-hidden"
          style={{
            background: "rgba(255,255,255,0.97)",
            border: "1px solid rgba(19,33,60,0.08)",
            boxShadow:
              "0 24px 64px rgba(19,33,60,0.1), 0 8px 24px rgba(212,178,106,0.08)",
          }}
        >
          {/* Glare */}
          <motion.div
            className="absolute inset-0 rounded-[1.8rem] sm:rounded-[2rem]
              pointer-events-none z-30
              opacity-0 hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY},
                rgba(212,178,106,0.08) 0%, transparent 60%)`,
            }}
          />

          {/* Gold top bar */}
          <div
            className="h-[2.5px] sm:h-[3px] w-full"
            style={{
              background: "linear-gradient(to right, #d4b26a, #264670, #13213c)",
            }}
          />

          {/* Corner accents */}
          <div
            className="absolute top-0 right-0 w-28 sm:w-36 h-28 sm:h-36
              pointer-events-none rounded-bl-full"
            style={{
              background:
                "linear-gradient(to bottom-left, rgba(212,178,106,0.1), transparent)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-20 sm:w-28 h-20 sm:h-28
              pointer-events-none rounded-tr-full"
            style={{
              background:
                "linear-gradient(to top-right, rgba(38,70,112,0.06), transparent)",
            }}
          />

          {/* Content */}
          <div className="relative z-10 px-6 pt-7 pb-6 sm:px-9 sm:pt-9 sm:pb-7">

            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div
                className="relative inline-block mb-4 sm:mb-5"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Glow ring */}
                <div
                  className="absolute inset-0 rounded-[1.2rem] sm:rounded-[1.4rem]
                    blur-xl opacity-35 scale-[1.15]"
                  style={{
                    background: "linear-gradient(135deg, #d4b26a, #264670)",
                  }}
                />
                {/* Icon bubble */}
                <div
                  className="relative w-16 h-16 sm:w-[72px] sm:h-[72px]
                    rounded-[1.2rem] sm:rounded-[1.4rem]
                    flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #13213c, #264670)",
                    boxShadow: "0 12px 30px rgba(19,33,60,0.35)",
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-[1.2rem] sm:rounded-[1.4rem]
                      overflow-hidden pointer-events-none"
                  >
                    <div
                      className="absolute -top-3 -left-2.5 w-10 sm:w-12
                        h-10 sm:h-12 rounded-full blur-md"
                      style={{ background: "rgba(212,178,106,0.2)" }}
                    />
                  </div>
                  <Scissors
                    size={16}
                    className="absolute sm:hidden"
                    strokeWidth={1.2}
                    style={{
                      color: "rgba(212,178,106,0.3)",
                      transform: "rotate(-25deg) translate(-9px, 5px)",
                    }}
                  />
                  <Scissors
                    size={18}
                    className="absolute hidden sm:block"
                    strokeWidth={1.2}
                    style={{
                      color: "rgba(212,178,106,0.3)",
                      transform: "rotate(-25deg) translate(-11px, 7px)",
                    }}
                  />
                  <Heart
                    size={24}
                    className="text-white relative z-10 sm:hidden"
                    strokeWidth={1.6}
                    fill="rgba(212,178,106,0.4)"
                  />
                  <Heart
                    size={30}
                    className="text-white relative z-10 hidden sm:block"
                    strokeWidth={1.6}
                    fill="rgba(212,178,106,0.4)"
                  />
                  <Sparkles
                    size={11}
                    className="absolute sm:hidden"
                    strokeWidth={1.2}
                    style={{
                      color: "rgba(212,178,106,0.4)",
                      transform: "rotate(20deg) translate(9px, -6px)",
                    }}
                  />
                  <Sparkles
                    size={13}
                    className="absolute hidden sm:block"
                    strokeWidth={1.2}
                    style={{
                      color: "rgba(212,178,106,0.4)",
                      transform: "rotate(20deg) translate(12px, -8px)",
                    }}
                  />
                  {/* Rotating gold badge */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
                    className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2
                      w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full
                      flex items-center justify-center shadow-md"
                    style={{
                      background: "linear-gradient(135deg, #d4b26a, #c69e4f)",
                      border: "2px solid rgba(255,255,255,0.8)",
                    }}
                  >
                    <Sparkles size={9}  className="text-white sm:hidden" />
                    <Sparkles size={11} className="text-white hidden sm:block" />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="text-2xl sm:text-[1.75rem] font-black tracking-tight
                  leading-tight mb-1.5"
                style={{ color: "#13213c" }}
              >
                Welcome{" "}
                <span className="text-gradient">Back!</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38, duration: 0.4 }}
                className="text-xs sm:text-sm"
                style={{ color: "#4f545f" }}
              >
                Sign in to your{" "}
                <span className="font-bold" style={{ color: "#d4b26a" }}>
                  CraftNest
                </span>{" "}
                account
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>

              <motion.div custom={0} variants={fieldVariants} initial="hidden" animate="visible">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  error={errors.email}
                  icon={<Mail size={16} />}
                />
              </motion.div>

              <motion.div custom={1} variants={fieldVariants} initial="hidden" animate="visible">
                <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                  <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{ color: "#4f545f" }}
                  >
                    Password
                  </span>
                  <Link
                    to="/forgot-password"
                    className="text-[10px] sm:text-[11px] font-semibold
                      transition-colors duration-200"
                    style={{ color: "#d4b26a" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.color = "#c69e4f")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.color = "#d4b26a")
                    }
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  error={errors.password}
                  icon={<Lock size={16} />}
                />
              </motion.div>

              <motion.div custom={2} variants={fieldVariants} initial="hidden" animate="visible">
                <Button
                  type="submit"
                  variant={success ? "success" : "primary"}
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={success}
                  icon={success ? null : <LogIn size={17} />}
                >
                  {success
                    ? "Signed in! Redirecting…"
                    : loading
                      ? "Signing you in…"
                      : "Sign In to CraftNest"}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-3 my-4 sm:my-5"
            >
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(19,33,60,0.12), transparent)",
                }}
              />
              <span
                className="text-[9px] sm:text-[10px] font-bold tracking-widest
                  uppercase px-1"
                style={{ color: "#4f545f" }}
              >
                New here?
              </span>
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    "linear-gradient(to right, transparent, rgba(19,33,60,0.12), transparent)",
                }}
              />
            </motion.div>

            {/* Sign-up link */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                to="/signup"
                className="group relative flex items-center justify-center
                  gap-1.5 sm:gap-2 w-full py-3 sm:py-3.5 rounded-2xl
                  font-bold text-xs sm:text-sm
                  transition-all duration-300 active:scale-[0.98] overflow-hidden"
                style={{
                  background: "var(--color-oxford-gray-light)",
                  color: "#4f545f",
                  border: "1px solid rgba(19,33,60,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d4b26a";
                  e.currentTarget.style.color = "#13213c";
                  e.currentTarget.style.background =
                    "rgba(212,178,106,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(19,33,60,0.1)";
                  e.currentTarget.style.color = "#4f545f";
                  e.currentTarget.style.background =
                    "var(--color-oxford-gray-light)";
                }}
              >
                <span className="relative">Create a Free Account</span>
                <ArrowRight
                  size={13}
                  className="relative group-hover:translate-x-1
                    transition-transform duration-200"
                />
              </Link>
            </motion.div>

            {/* Trust strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-4 gap-1 mt-4 sm:mt-5"
            >
              {trustItems.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 py-1 sm:py-1.5
                    rounded-xl transition-colors duration-200"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background =
                      "rgba(212,178,106,0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon
                    size={12}
                    className="flex-shrink-0 sm:hidden"
                    style={{ color: "#d4b26a" }}
                  />
                  <Icon
                    size={14}
                    className="flex-shrink-0 hidden sm:block"
                    style={{ color: "#d4b26a" }}
                  />
                  <span
                    className="text-[9px] sm:text-[10px] font-semibold
                      text-center leading-tight"
                    style={{ color: "#4f545f" }}
                  >
                    {label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;