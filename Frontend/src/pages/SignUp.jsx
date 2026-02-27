// pages/SignUp.jsx

import { useState, useRef, useEffect } from "react";
import { Link, useNavigate }           from "react-router-dom";
import {
  motion, AnimatePresence,
  useMotionValue, useTransform,
} from "framer-motion";
import {
  UserPlus, Mail, Lock, Sparkles, ArrowRight,
  ShieldCheck, Star, Heart, CheckCircle2,
  Scissors, Palette, Flower2, Gem, Leaf, User,
  Phone, ChevronDown, Search, X,
} from "lucide-react";
import { registerUser } from "../services/api";
import { useAuth }      from "../context/AuthContext";
import toast            from "react-hot-toast";
import Input            from "../components/ui/Input";
import Button           from "../components/ui/Button";

// ══════════════════════════════════════════════════════════════════════════
// Country dial-code data
// ══════════════════════════════════════════════════════════════════════════
const COUNTRIES = [
  { code: "+1",   iso: "US", flag: "🇺🇸", name: "United States",  digits: 10 },
  { code: "+1",   iso: "CA", flag: "🇨🇦", name: "Canada",          digits: 10 },
  { code: "+44",  iso: "GB", flag: "🇬🇧", name: "United Kingdom",  digits: 10 },
  { code: "+91",  iso: "IN", flag: "🇮🇳", name: "India",           digits: 10 },
  { code: "+61",  iso: "AU", flag: "🇦🇺", name: "Australia",       digits: 9  },
  { code: "+86",  iso: "CN", flag: "🇨🇳", name: "China",           digits: 11 },
  { code: "+81",  iso: "JP", flag: "🇯🇵", name: "Japan",           digits: 10 },
  { code: "+82",  iso: "KR", flag: "🇰🇷", name: "South Korea",     digits: 10 },
  { code: "+49",  iso: "DE", flag: "🇩🇪", name: "Germany",         digits: 10 },
  { code: "+33",  iso: "FR", flag: "🇫🇷", name: "France",          digits: 9  },
  { code: "+39",  iso: "IT", flag: "🇮🇹", name: "Italy",           digits: 10 },
  { code: "+34",  iso: "ES", flag: "🇪🇸", name: "Spain",           digits: 9  },
  { code: "+55",  iso: "BR", flag: "🇧🇷", name: "Brazil",          digits: 11 },
  { code: "+52",  iso: "MX", flag: "🇲🇽", name: "Mexico",          digits: 10 },
  { code: "+971", iso: "AE", flag: "🇦🇪", name: "UAE",             digits: 9  },
  { code: "+966", iso: "SA", flag: "🇸🇦", name: "Saudi Arabia",    digits: 9  },
  { code: "+92",  iso: "PK", flag: "🇵🇰", name: "Pakistan",        digits: 10 },
  { code: "+880", iso: "BD", flag: "🇧🇩", name: "Bangladesh",      digits: 10 },
  { code: "+94",  iso: "LK", flag: "🇱🇰", name: "Sri Lanka",       digits: 9  },
  { code: "+60",  iso: "MY", flag: "🇲🇾", name: "Malaysia",        digits: 9  },
  { code: "+65",  iso: "SG", flag: "🇸🇬", name: "Singapore",       digits: 8  },
  { code: "+63",  iso: "PH", flag: "🇵🇭", name: "Philippines",     digits: 10 },
  { code: "+62",  iso: "ID", flag: "🇮🇩", name: "Indonesia",       digits: 11 },
  { code: "+66",  iso: "TH", flag: "🇹🇭", name: "Thailand",        digits: 9  },
  { code: "+84",  iso: "VN", flag: "🇻🇳", name: "Vietnam",         digits: 9  },
  { code: "+90",  iso: "TR", flag: "🇹🇷", name: "Turkey",          digits: 10 },
  { code: "+20",  iso: "EG", flag: "🇪🇬", name: "Egypt",           digits: 10 },
  { code: "+234", iso: "NG", flag: "🇳🇬", name: "Nigeria",         digits: 10 },
  { code: "+27",  iso: "ZA", flag: "🇿🇦", name: "South Africa",    digits: 9  },
  { code: "+254", iso: "KE", flag: "🇰🇪", name: "Kenya",           digits: 9  },
  { code: "+7",   iso: "RU", flag: "🇷🇺", name: "Russia",          digits: 10 },
  { code: "+31",  iso: "NL", flag: "🇳🇱", name: "Netherlands",     digits: 9  },
  { code: "+46",  iso: "SE", flag: "🇸🇪", name: "Sweden",          digits: 9  },
  { code: "+47",  iso: "NO", flag: "🇳🇴", name: "Norway",          digits: 8  },
  { code: "+45",  iso: "DK", flag: "🇩🇰", name: "Denmark",         digits: 8  },
  { code: "+41",  iso: "CH", flag: "🇨🇭", name: "Switzerland",     digits: 9  },
  { code: "+32",  iso: "BE", flag: "🇧🇪", name: "Belgium",         digits: 9  },
  { code: "+48",  iso: "PL", flag: "🇵🇱", name: "Poland",          digits: 9  },
  { code: "+351", iso: "PT", flag: "🇵🇹", name: "Portugal",        digits: 9  },
  { code: "+30",  iso: "GR", flag: "🇬🇷", name: "Greece",          digits: 10 },
  { code: "+64",  iso: "NZ", flag: "🇳🇿", name: "New Zealand",     digits: 9  },
  { code: "+54",  iso: "AR", flag: "🇦🇷", name: "Argentina",       digits: 10 },
  { code: "+56",  iso: "CL", flag: "🇨🇱", name: "Chile",           digits: 9  },
  { code: "+57",  iso: "CO", flag: "🇨🇴", name: "Colombia",        digits: 10 },
  { code: "+58",  iso: "VE", flag: "🇻🇪", name: "Venezuela",       digits: 10 },
  { code: "+51",  iso: "PE", flag: "🇵🇪", name: "Peru",            digits: 9  },
  { code: "+880", iso: "BD", flag: "🇧🇩", name: "Bangladesh",      digits: 10 },
  { code: "+98",  iso: "IR", flag: "🇮🇷", name: "Iran",            digits: 10 },
  { code: "+964", iso: "IQ", flag: "🇮🇶", name: "Iraq",            digits: 10 },
  { code: "+972", iso: "IL", flag: "🇮🇱", name: "Israel",          digits: 9  },
  { code: "+212", iso: "MA", flag: "🇲🇦", name: "Morocco",         digits: 9  },
];

// ── Phone helpers ──────────────────────────────────────────────────────────
const digitsOnly  = (v) => v.replace(/\D/g, "");

// Live-format while typing  (###-###-#### for 10-digit, else spaced triples)
const formatPhone = (raw, expectedDigits) => {
  const d = digitsOnly(raw).slice(0, expectedDigits);
  if (expectedDigits === 10) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)}-${d.slice(3)}`;
    return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  }
  if (expectedDigits === 11) {
    if (d.length <= 3) return d;
    if (d.length <= 7) return `${d.slice(0,3)}-${d.slice(3)}`;
    return `${d.slice(0,3)}-${d.slice(3,7)}-${d.slice(7)}`;
  }
  // generic: space every 3
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
};

const validatePhone = (raw, country) => {
  const d = digitsOnly(raw);
  if (!d)                       return "Phone number is required";
  if (d.length < country.digits)
    return `Enter ${country.digits} digits for ${country.name} (${d.length}/${country.digits})`;
  if (d.length > country.digits)
    return `Too many digits for ${country.name}`;
  return "";
};

// ── Static data ────────────────────────────────────────────────────────────
const particles = [
  { icon: Flower2,  x: "4%",  y: "7%",  size: 17, dur: 3.2, delay: 0   },
  { icon: Heart,    x: "90%", y: "5%",  size: 15, dur: 3.8, delay: 0.5 },
  { icon: Gem,      x: "93%", y: "48%", size: 14, dur: 2.9, delay: 0.3 },
  { icon: Scissors, x: "2%",  y: "58%", size: 15, dur: 3.5, delay: 0.8 },
  { icon: Leaf,     x: "84%", y: "78%", size: 14, dur: 4.0, delay: 0.2 },
  { icon: Sparkles, x: "11%", y: "84%", size: 14, dur: 3.3, delay: 0.6 },
  { icon: Star,     x: "50%", y: "2%",  size: 14, dur: 3.6, delay: 0.4 },
  { icon: Palette,  x: "68%", y: "91%", size: 15, dur: 3.1, delay: 0.9 },
];

const perks = [
  { icon: ShieldCheck,  label: "SSL Secured"    },
  { icon: Star,         label: "4.9 Rated"      },
  { icon: Heart,        label: "Free to Join"   },
  { icon: CheckCircle2, label: "Instant Access" },
];

const getStrength = (pw) => {
  if (!pw)           return { level: 0, label: "",           barColor: "" };
  if (pw.length < 4) return { level: 1, label: "Too short",  barColor: "#ef4444" };
  if (pw.length < 6) return { level: 2, label: "Weak",       barColor: "#f97316" };
  if (pw.length < 9) return { level: 3, label: "Fair",       barColor: "#d4b26a" };
  return               { level: 4, label: "Strong",     barColor: "#22c55e" };
};

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
    transition: { delay: 0.3 + i * 0.08, duration: 0.38, ease: "easeOut" },
  }),
};

// ══════════════════════════════════════════════════════════════════════════
// PhoneField  — country picker + formatted input + live validation
// ══════════════════════════════════════════════════════════════════════════
const PhoneField = ({ value, country, onPhoneChange, onCountryChange, error, touched }) => {
  const [open,   setOpen  ] = useState(false);
  const [search, setSearch] = useState("");
  const wrapRef    = useRef(null);
  const searchRef  = useRef(null);

  // Focus search box when dropdown opens
  useEffect(() => {
    if (open) setTimeout(() => searchRef.current?.focus(), 60);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target))
        setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filtered = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search) ||
      c.iso.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelect = (c) => {
    onCountryChange(c);
    onPhoneChange(""); // clear number when country changes
    setOpen(false);
    setSearch("");
  };

  const handleInput = (e) => {
    onPhoneChange(formatPhone(e.target.value, country.digits));
  };

  const digits     = digitsOnly(value);
  const isComplete = digits.length === country.digits;
  const showValid  = touched && isComplete && !error;
  const showError  = touched && !!error;

  // Determine border colour
  const borderColor = showError
    ? "#ef4444"
    : showValid
      ? "#22c55e"
      : open
        ? "#d4b26a"
        : "rgba(19,33,60,0.12)";

  return (
    <div ref={wrapRef} className="relative">

      {/* Label */}
      <label
        className="flex items-center gap-1 text-[11px] sm:text-xs
          font-bold tracking-wide uppercase mb-1.5"
        style={{ color: "#13213c" }}
      >
        <Phone size={10} style={{ color: "#d4b26a" }} />
        Phone Number
        <span style={{ color: "#ef4444" }}>*</span>
      </label>

      {/* Input row */}
      <div
        className="flex rounded-xl sm:rounded-2xl overflow-visible
          transition-all duration-200"
        style={{
          border:     `1.5px solid ${borderColor}`,
          boxShadow:  showError
            ? "0 0 0 3px rgba(239,68,68,0.1)"
            : showValid
              ? "0 0 0 3px rgba(34,197,94,0.1)"
              : open
                ? "0 0 0 3px rgba(212,178,106,0.15)"
                : "none",
          background: "rgba(255,255,255,0.8)",
        }}
      >
        {/* ── Dial-code button ──────────────────────────────────────── */}
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3
            py-2.5 sm:py-3 flex-shrink-0 transition-colors duration-150
            focus:outline-none border-r"
          style={{
            borderColor: borderColor,
            background:  open
              ? "rgba(212,178,106,0.08)"
              : "rgba(19,33,60,0.02)",
            borderRadius: "0",
          }}
        >
          <span className="text-sm sm:text-base leading-none">
            {country.flag}
          </span>
          <span
            className="text-[11px] sm:text-xs font-bold hidden xs:inline"
            style={{ color: "#13213c" }}
          >
            {country.code}
          </span>
          <motion.div
            animate={{ rotate: open ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={11} style={{ color: "#4f545f" }} />
          </motion.div>
        </button>

        {/* ── Phone number input ────────────────────────────────────── */}
        <div className="relative flex-1 flex items-center">
          <input
            type="tel"
            inputMode="numeric"
            value={value}
            onChange={handleInput}
            placeholder={
              country.digits === 10
                ? "000-000-0000"
                : "0".repeat(country.digits)
            }
            className="w-full bg-transparent py-2.5 sm:py-3 pl-3 pr-8
              text-xs sm:text-sm font-medium focus:outline-none
              placeholder:font-normal"
            style={{
              color:       "#13213c",
              caretColor:  "#d4b26a",
              letterSpacing: "0.04em",
            }}
          />

          {/* Status icon — right side inside input */}
          <div className="absolute right-2.5 pointer-events-none">
            <AnimatePresence mode="wait">
              {showValid && (
                <motion.div
                  key="valid"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{    scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  <CheckCircle2 size={15} style={{ color: "#22c55e" }} />
                </motion.div>
              )}
              {showError && (
                <motion.div
                  key="error"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{    scale: 0, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 18 }}
                >
                  <X size={14} style={{ color: "#ef4444" }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Digit progress bar */}
      <div className="mt-1.5 flex items-center gap-2">
        <div
          className="flex-1 h-[2.5px] rounded-full overflow-hidden"
          style={{ background: "rgba(19,33,60,0.07)" }}
        >
          <motion.div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${Math.min((digits.length / country.digits) * 100, 100)}%`,
              background: showValid
                ? "#22c55e"
                : showError
                  ? "#ef4444"
                  : "linear-gradient(to right,#d4b26a,#264670)",
            }}
          />
        </div>
        <span
          className="text-[9px] sm:text-[10px] font-bold tabular-nums
            flex-shrink-0"
          style={{
            color: showValid
              ? "#22c55e"
              : showError
                ? "#ef4444"
                : "rgba(19,33,60,0.4)",
          }}
        >
          {digits.length}/{country.digits}
        </span>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {showError && (
          <motion.p
            key="phone-err"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0,  height: "auto" }}
            exit={{    opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.2 }}
            className="text-[10px] sm:text-xs font-semibold mt-1 flex
              items-center gap-1"
            style={{ color: "#ef4444" }}
          >
            <X size={10} />
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* ── Country dropdown ─────────────────────────────────────────── */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22,1,0.36,1] }}
            className="absolute left-0 top-[calc(100%+6px)] w-full
              rounded-2xl overflow-hidden z-[999]"
            style={{
              background: "rgba(255,255,255,0.98)",
              border:     "1.5px solid rgba(212,178,106,0.3)",
              boxShadow:
                "0 16px 48px rgba(19,33,60,0.15)," +
                "0 4px 16px rgba(212,178,106,0.1)",
              backdropFilter: "blur(20px)",
            }}
          >
            {/* Search box */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 border-b"
              style={{ borderColor: "rgba(19,33,60,0.06)" }}
            >
              <Search size={13} style={{ color: "#d4b26a", flexShrink: 0 }} />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="flex-1 bg-transparent text-xs sm:text-sm
                  focus:outline-none placeholder:text-gray-400"
                style={{ color: "#13213c" }}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="flex-shrink-0 hover:opacity-60
                    transition-opacity"
                >
                  <X size={11} style={{ color: "#4f545f" }} />
                </button>
              )}
            </div>

            {/* List */}
            <ul
              className="overflow-y-auto"
              style={{ maxHeight: "200px" }}
            >
              {filtered.length === 0 ? (
                <li className="px-3 py-4 text-center text-xs"
                  style={{ color: "#4f545f" }}>
                  No countries found
                </li>
              ) : (
                filtered.map((c, i) => {
                  const isSelected =
                    c.iso === country.iso && c.code === country.code;
                  return (
                    <motion.li
                      key={`${c.iso}-${i}`}
                      whileHover={{ backgroundColor: "rgba(212,178,106,0.08)" }}
                      onClick={() => handleSelect(c)}
                      className="flex items-center gap-2.5 px-3 py-2
                        cursor-pointer transition-colors duration-100
                        text-xs sm:text-sm"
                      style={{
                        background: isSelected
                          ? "rgba(212,178,106,0.1)"
                          : "transparent",
                      }}
                    >
                      <span className="text-base leading-none flex-shrink-0">
                        {c.flag}
                      </span>
                      <span
                        className="flex-1 font-medium truncate"
                        style={{ color: "#13213c" }}
                      >
                        {c.name}
                      </span>
                      <span
                        className="font-bold flex-shrink-0 tabular-nums"
                        style={{
                          color: isSelected ? "#d4b26a" : "#4f545f",
                          fontSize: "11px",
                        }}
                      >
                        {c.code}
                      </span>
                      {isSelected && (
                        <CheckCircle2
                          size={13}
                          style={{ color: "#d4b26a", flexShrink: 0 }}
                        />
                      )}
                    </motion.li>
                  );
                })
              )}
            </ul>

            {/* Footer hint */}
            <div
              className="px-3 py-2 text-center text-[9px] sm:text-[10px]
                font-semibold border-t"
              style={{
                color:       "rgba(19,33,60,0.35)",
                borderColor: "rgba(19,33,60,0.06)",
              }}
            >
              {COUNTRIES.length} countries · {filtered.length} shown
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SignUp
// ══════════════════════════════════════════════════════════════════════════
const SignUp = () => {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirm: "",
  });
  const [phone,        setPhone       ] = useState("");
  const [country,      setCountry     ] = useState(COUNTRIES[0]); // US default
  const [phoneTouched, setPhoneTouched] = useState(false);
  const [errors,       setErrors      ] = useState({});
  const [loading,      setLoading     ] = useState(false);
  const [success,      setSuccess     ] = useState(false);

  const cardRef = useRef(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const glareX  = useTransform(rotateY, [-12, 12], ["20%", "80%"]);
  const glareY  = useTransform(rotateX, [-12, 12], ["20%", "80%"]);

  const { login } = useAuth();
  const navigate  = useNavigate();
  const strength  = getStrength(form.password);

  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    rotateY.set(
      ((e.clientX - (rect.left + rect.width  / 2)) / (rect.width  / 2)) * 6
    );
    rotateX.set(
      ((e.clientY - (rect.top  + rect.height / 2)) / (rect.height / 2)) * -6
    );
  };
  const resetTilt = () => { rotateX.set(0); rotateY.set(0); };

  const handleChange = (e) => {
    setForm  ((f)  => ({ ...f,  [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: "" }));
  };

  const handlePhoneChange = (val) => {
    setPhone(val);
    setPhoneTouched(true);
    setErrors((er) => ({ ...er, phone: "" }));
  };

  const handleCountryChange = (c) => {
    setCountry(c);
    setPhone("");
    setPhoneTouched(false);
    setErrors((er) => ({ ...er, phone: "" }));
  };

  // ── Validate all fields ────────────────────────────────────────────────
  const validate = () => {
    const errs = {};

    if (!form.name.trim())
      errs.name = "Full name is required";

    if (!form.email.trim())
      errs.email = "Email address is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address";

    // Phone
    setPhoneTouched(true);
    const phoneErr = validatePhone(phone, country);
    if (phoneErr) errs.phone = phoneErr;

    if (!form.password)
      errs.password = "Password is required";
    else if (form.password.length < 6)
      errs.password = "Minimum 6 characters";

    if (form.password !== form.confirm)
      errs.confirm = "Passwords do not match";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await registerUser({
        name:     form.name,
        email:    form.email,
        password: form.password,
        phone:    `${country.code}${digitsOnly(phone)}`,
      });
      setSuccess(true);
      login(data);
      toast.success(`Welcome to CraftNest, ${data.name}!`);
      await new Promise((r) => setTimeout(r, 800));
      navigate("/user/home", { replace: true });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Registration failed. Try again."
      );
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center
        px-4 py-8 sm:py-12 relative overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg,#f3f4f7 0%,#eef0f6 50%,#f3f4f7 100%)",
      }}
    >
      {/* Grid texture */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(19,33,60,0.4) 1px, transparent 1px),
            linear-gradient(90deg,rgba(19,33,60,0.4) 1px,transparent 1px)
          `,
          backgroundSize: "56px 56px",
        }}
      />

      {/* Ambient blobs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <motion.div
          animate={{ scale: [1,1.12,1], opacity: [0.4,0.6,0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-48 -left-48 w-[380px] sm:w-[480px]
            h-[380px] sm:h-[480px] rounded-full blur-3xl"
          style={{ background: "rgba(212,178,106,0.18)" }}
        />
        <motion.div
          animate={{ scale: [1,1.18,1], opacity: [0.25,0.4,0.25] }}
          transition={{ duration: 10, repeat: Infinity,
            ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-48 -right-48 w-[360px] sm:w-[460px]
            h-[360px] sm:h-[460px] rounded-full blur-3xl"
          style={{ background: "rgba(38,70,112,0.12)" }}
        />
      </div>

      {/* Floating particles */}
      {particles.map((p, i) => {
        const FloatIcon = p.icon;
        return (
          <motion.div
            key={i}
            className="absolute select-none pointer-events-none hidden sm:block"
            style={{ left: p.x, top: p.y, color: "rgba(212,178,106,0.4)" }}
            animate={{
              y:      [0, -16, 0],
              rotate: [0, 9, -9, 0],
              scale:  [1, 1.08, 1],
            }}
            transition={{
              duration: p.dur, repeat: Infinity,
              ease: "easeInOut", delay: p.delay,
            }}
          >
            <FloatIcon size={p.size} strokeWidth={1.3} />
          </motion.div>
        );
      })}

      {/* ── 3-D card ─────────────────────────────────────────────────── */}
      <motion.div
        ref={cardRef}
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        onMouseMove={handleMouseMove}
        onMouseLeave={resetTilt}
        onTouchStart={resetTilt}
        className="relative z-10 w-full max-w-[400px] sm:max-w-[440px]"
      >
        {/* Depth shadow layers */}
        <div
          className="absolute inset-x-6 sm:inset-x-8 -bottom-4 sm:-bottom-5
            h-full rounded-[2rem] blur-2xl -z-10"
          style={{
            background:
              "linear-gradient(to bottom,rgba(212,178,106,0.2)," +
              "rgba(38,70,112,0.15))",
          }}
        />
        <div
          className="absolute inset-x-3 sm:inset-x-4 -bottom-2
            h-full rounded-[2rem] -z-10 blur-sm"
          style={{ background: "rgba(255,255,255,0.7)" }}
        />

        {/* Card surface */}
        <div
          className="relative backdrop-blur-2xl rounded-[1.8rem]
            sm:rounded-[2rem] overflow-visible"
          style={{
            background: "rgba(255,255,255,0.97)",
            border:     "1px solid rgba(19,33,60,0.08)",
            boxShadow:
              "0 24px 64px rgba(19,33,60,0.1)," +
              "0 8px 24px rgba(212,178,106,0.08)",
          }}
        >
          {/* Glare overlay */}
          <motion.div
            className="absolute inset-0 rounded-[1.8rem] sm:rounded-[2rem]
              pointer-events-none z-30 opacity-0 hover:opacity-100
              transition-opacity duration-500"
            style={{
              background: `radial-gradient(circle at ${glareX} ${glareY},
                rgba(212,178,106,0.07) 0%, transparent 60%)`,
            }}
          />

          {/* Gold top bar */}
          <div
            className="h-[2.5px] sm:h-[3px] w-full rounded-t-[1.8rem]
              sm:rounded-t-[2rem]"
            style={{
              background:
                "linear-gradient(to right,#d4b26a,#264670,#13213c)",
            }}
          />

          {/* Corner accents */}
          <div
            className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32
              pointer-events-none rounded-bl-full"
            style={{
              background:
                "linear-gradient(to bottom left," +
                "rgba(212,178,106,0.1),transparent)",
            }}
          />
          <div
            className="absolute bottom-0 left-0 w-20 sm:w-24 h-20 sm:h-24
              pointer-events-none rounded-tr-full"
            style={{
              background:
                "linear-gradient(to top right," +
                "rgba(38,70,112,0.06),transparent)",
            }}
          />

          {/* ── Content ─────────────────────────────────────────────── */}
          <div className="relative z-10 px-5 pt-6 pb-5
            sm:px-9 sm:pt-8 sm:pb-7">

            {/* Header */}
            <div className="text-center mb-5 sm:mb-7">
              <motion.div
                className="relative inline-block mb-3 sm:mb-4"
                animate={{ y: [0, -5, 0] }}
                transition={{
                  duration: 3.5, repeat: Infinity, ease: "easeInOut",
                }}
              >
                <div
                  className="absolute inset-0 rounded-[1.2rem] blur-xl
                    opacity-35 scale-[1.15]"
                  style={{
                    background:
                      "linear-gradient(135deg,#d4b26a,#264670)",
                  }}
                />
                <div
                  className="relative w-14 h-14 sm:w-[72px] sm:h-[72px]
                    rounded-[1.2rem] sm:rounded-[1.4rem]
                    flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg,#13213c,#264670)",
                    boxShadow: "0 12px 30px rgba(19,33,60,0.35)",
                  }}
                >
                  <Heart
                    size={22}
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
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 7, repeat: Infinity, ease: "linear",
                    }}
                    className="absolute -top-1.5 -right-1.5 sm:-top-2
                      sm:-right-2 w-[18px] h-[18px] sm:w-[22px]
                      sm:h-[22px] rounded-full flex items-center
                      justify-center shadow-md"
                    style={{
                      background:
                        "linear-gradient(135deg,#d4b26a,#c69e4f)",
                      border: "2px solid rgba(255,255,255,0.8)",
                    }}
                  >
                    <Sparkles
                      size={8}
                      className="text-white sm:hidden"
                    />
                    <Sparkles
                      size={10}
                      className="text-white hidden sm:block"
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: 0.28, duration: 0.45 }}
                className="text-xl sm:text-[1.75rem] font-black
                  tracking-tight leading-tight mb-1"
                style={{ color: "#13213c" }}
              >
                Create Your{" "}
                <span className="text-gradient">Account</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.38, duration: 0.4 }}
                className="text-[11px] sm:text-sm"
                style={{ color: "#4f545f" }}
              >
                Join the{" "}
                <span className="font-bold" style={{ color: "#d4b26a" }}>
                  CraftNest
                </span>{" "}
                community today
              </motion.p>
            </div>

            {/* ── Form ──────────────────────────────────────────────── */}
            <form
              onSubmit={handleSubmit}
              className="space-y-3 sm:space-y-4"
              noValidate
            >
              {/* Full name */}
              <motion.div
                custom={0} variants={fieldVariants}
                initial="hidden" animate="visible"
              >
                <Input
                  label="Full Name" name="name" type="text"
                  value={form.name} onChange={handleChange}
                  placeholder="Jane Smith" autoComplete="name"
                  required error={errors.name}
                  icon={<User size={15} />}
                />
              </motion.div>

              {/* Email */}
              <motion.div
                custom={1} variants={fieldVariants}
                initial="hidden" animate="visible"
              >
                <Input
                  label="Email Address" name="email" type="email"
                  value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email"
                  required error={errors.email}
                  icon={<Mail size={15} />}
                />
              </motion.div>

              {/* ── Phone ─────────────────────────────────────────── */}
              <motion.div
                custom={2} variants={fieldVariants}
                initial="hidden" animate="visible"
              >
                <PhoneField
                  value={phone}
                  country={country}
                  onPhoneChange={handlePhoneChange}
                  onCountryChange={handleCountryChange}
                  error={errors.phone}
                  touched={phoneTouched}
                />
              </motion.div>

              {/* Password */}
              <motion.div
                custom={3} variants={fieldVariants}
                initial="hidden" animate="visible"
              >
                <Input
                  label="Password" name="password" type="password"
                  value={form.password} onChange={handleChange}
                  placeholder="Min. 6 characters"
                  autoComplete="new-password"
                  required error={errors.password}
                  icon={<Lock size={15} />}
                />
                {/* Strength bar */}
                {form.password && (
                  <motion.div
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0  }}
                    className="mt-1.5 sm:mt-2 space-y-1"
                  >
                    <div className="flex gap-1">
                      {[1,2,3,4].map((lvl) => (
                        <div
                          key={lvl}
                          className="h-0.5 sm:h-1 flex-1 rounded-full
                            transition-all duration-300"
                          style={{
                            background:
                              lvl <= strength.level
                                ? strength.barColor
                                : "rgba(19,33,60,0.1)",
                          }}
                        />
                      ))}
                    </div>
                    <p
                      className="text-[9px] sm:text-[10px] font-semibold"
                      style={{ color: strength.barColor }}
                    >
                      {strength.label}
                    </p>
                  </motion.div>
                )}
              </motion.div>

              {/* Confirm password */}
              <motion.div
                custom={4} variants={fieldVariants}
                initial="hidden" animate="visible"
                className="relative"
              >
                <Input
                  label="Confirm Password" name="confirm" type="password"
                  value={form.confirm} onChange={handleChange}
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  required error={errors.confirm}
                  icon={<Lock size={15} />}
                />
                <AnimatePresence>
                  {form.confirm && form.password === form.confirm && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1   }}
                      exit={{    opacity: 0, scale: 0.5 }}
                      className="absolute right-10 top-[38px] sm:top-[42px]
                        pointer-events-none"
                    >
                      <CheckCircle2
                        size={15}
                        style={{ color: "#22c55e" }}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Submit */}
              <motion.div
                custom={5} variants={fieldVariants}
                initial="hidden" animate="visible"
              >
                <Button
                  type="submit"
                  variant={success ? "success" : "primary"}
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={success}
                  icon={success ? null : <UserPlus size={17} />}
                  iconRight={
                    !loading && !success
                      ? <ArrowRight size={15}
                          className="group-hover:translate-x-1
                            transition-transform duration-200" />
                      : null
                  }
                >
                  {success
                    ? "Account Created! Redirecting…"
                    : loading
                      ? "Creating your account…"
                      : "Create My Account"}
                </Button>
              </motion.div>
            </form>

            {/* Divider */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-3 my-3 sm:my-4"
            >
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    "linear-gradient(to right,transparent," +
                    "rgba(19,33,60,0.12),transparent)",
                }}
              />
              <span
                className="text-[9px] sm:text-[10px] font-bold
                  tracking-widest uppercase px-1"
                style={{ color: "#4f545f" }}
              >
                Have an account?
              </span>
              <div
                className="flex-1 h-px"
                style={{
                  background:
                    "linear-gradient(to right,transparent," +
                    "rgba(19,33,60,0.12),transparent)",
                }}
              />
            </motion.div>

            {/* Sign-in link */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              <Link
                to="/login"
                className="group relative flex items-center
                  justify-center gap-1.5 sm:gap-2 w-full py-2.5
                  sm:py-3.5 rounded-2xl font-bold text-xs sm:text-sm
                  transition-all duration-300 active:scale-[0.98]"
                style={{
                  background: "var(--color-oxford-gray-light)",
                  color:      "#4f545f",
                  border:     "1px solid rgba(19,33,60,0.1)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "#d4b26a";
                  e.currentTarget.style.color       = "#13213c";
                  e.currentTarget.style.background  =
                    "rgba(212,178,106,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor =
                    "rgba(19,33,60,0.1)";
                  e.currentTarget.style.color      = "#4f545f";
                  e.currentTarget.style.background =
                    "var(--color-oxford-gray-light)";
                }}
              >
                <span className="relative">Sign In Instead</span>
                <ArrowRight
                  size={12}
                  className="relative group-hover:translate-x-1
                    transition-transform duration-200"
                />
              </Link>
            </motion.div>

            {/* Perks strip */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-4 gap-1 mt-3 sm:mt-5"
            >
              {perks.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex flex-col items-center gap-1 py-1
                    sm:py-1.5 rounded-xl transition-colors duration-200"
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
                    style={{ color: "#d4b26a" }}
                  />
                  <span
                    className="text-[8px] sm:text-[10px] font-semibold
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

export default SignUp;