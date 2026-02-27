// pages/user/UserProfile.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence }                  from "framer-motion";
import { useAuth }                                  from "../../context/AuthContext";
import {
  updateProfile,
  uploadProfileImage,
  deleteProfileImage,
}                                                   from "../../services/api";
import {
  User, Mail, Lock, Eye, EyeOff,
  ShieldCheck, Save, Sparkles, Phone,
  MapPin, Home, Building2, Map,
  Globe, Hash, ChevronDown, Search,
  CheckCircle2, X, Camera, BadgeCheck,
  Shield, Trash2, Upload,
}                                                   from "lucide-react";
import toast                                        from "react-hot-toast";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.1)",
  goldBorder: "rgba(212,178,106,0.22)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.4)",
  border:     "rgba(19,33,60,0.07)",
  surface:    "#ffffff",
  bg:         "#f4f5f8",
  green:      "#22c55e",
  red:        "#ef4444",
};

// ── Country list ───────────────────────────────────────────────────────────
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
  { code: "+7",   iso: "RU", flag: "🇷🇺", name: "Russia",          digits: 10 },
  { code: "+31",  iso: "NL", flag: "🇳🇱", name: "Netherlands",     digits: 9  },
  { code: "+46",  iso: "SE", flag: "🇸🇪", name: "Sweden",          digits: 9  },
  { code: "+41",  iso: "CH", flag: "🇨🇭", name: "Switzerland",     digits: 9  },
  { code: "+48",  iso: "PL", flag: "🇵🇱", name: "Poland",          digits: 9  },
  { code: "+30",  iso: "GR", flag: "🇬🇷", name: "Greece",          digits: 10 },
  { code: "+64",  iso: "NZ", flag: "🇳🇿", name: "New Zealand",     digits: 9  },
  { code: "+54",  iso: "AR", flag: "🇦🇷", name: "Argentina",       digits: 10 },
  { code: "+57",  iso: "CO", flag: "🇨🇴", name: "Colombia",        digits: 10 },
];

// ── Pure helpers ───────────────────────────────────────────────────────────
const digitsOnly  = (v) => v.replace(/\D/g, "");

const formatPhone = (raw, digits) => {
  const d = digitsOnly(raw).slice(0, digits);
  if (digits === 10) {
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)}-${d.slice(3)}`;
    return `${d.slice(0,3)}-${d.slice(3,6)}-${d.slice(6)}`;
  }
  return d.replace(/(\d{3})(?=\d)/g, "$1 ").trim();
};

const parseStoredPhone = (stored) => {
  if (!stored) return { country: COUNTRIES[0], local: "" };
  const match = COUNTRIES.slice()
    .sort((a, b) => b.code.length - a.code.length)
    .find((c) => stored.startsWith(c.code));
  if (!match) return { country: COUNTRIES[0], local: stored };
  return { country: match, local: formatPhone(stored.slice(match.code.length), match.digits) };
};

const joinName = (u) => u?.name || u?.email?.split("@")[0] || "User";

const getInitials = (name) =>
  name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");

// ── Safely extract a string URL from whatever avatar value the server
//    returns. Guards against { url, public_id } objects leaking through.
const resolveAvatarUrl = (avatar) => {
  if (!avatar) return null;
  if (typeof avatar === "string" && avatar.trim()) return avatar.trim();
  if (typeof avatar === "object") {
    const url = avatar.url ?? avatar.secure_url ?? null;
    return typeof url === "string" && url.trim() ? url.trim() : null;
  }
  return null;
};

const MAX_BYTES      = 5 * 1024 * 1024; // 5 MB
const CLOUD_NAME     = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET  = import.meta.env.VITE_CLOUDINARY_PRESET;

// ── Spinner (reused in several places) ────────────────────────────────────
const Spinner = ({ size = 14 }) => (
  <svg className="animate-spin" width={size} height={size}
    viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10"
      stroke="currentColor" strokeWidth="3"
      strokeDasharray="32" opacity="0.3" />
    <path d="M12 2a10 10 0 0 1 10 10"
      stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════
// AvatarUploader
// ══════════════════════════════════════════════════════════════════════════
const AvatarUploader = ({ user, onUpdate }) => {
  // ── Always resolve to a plain string URL, never an object ──────────────
  const [preview,   setPreview  ] = useState(() => resolveAvatarUrl(user?.avatar));
  const [uploading, setUploading] = useState(false);
  const [deleting,  setDeleting ] = useState(false);
  const [dragOver,  setDragOver ] = useState(false);
  const fileRef = useRef(null);
  const name    = joinName(user);
  const busy    = uploading || deleting;

  // Re-sync preview whenever the user object changes
  useEffect(() => {
    setPreview(resolveAvatarUrl(user?.avatar));
  }, [user?.avatar]);

  // ── Upload file to Cloudinary, return secure_url string ───────────────
  const uploadToCloudinary = useCallback(async (file) => {
    if (!CLOUD_NAME || !UPLOAD_PRESET) {
      // Dev fallback: convert to base64 and use that as the "URL"
      // (works for testing but don't use in production)
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    const fd = new FormData();
    fd.append("file",           file);
    fd.append("upload_preset",  UPLOAD_PRESET);
    fd.append("folder",         "craftnest/avatars");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: "POST", body: fd }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message ?? "Cloudinary upload failed");
    }

    const json = await res.json();
    // Always return the plain string, never the full object
    return json.secure_url;
  }, []);

  // ── Core upload handler ────────────────────────────────────────────────
  const handleFile = useCallback(async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file (JPG, PNG, WebP…)");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast.error("Image must be smaller than 5 MB");
      return;
    }

    setUploading(true);
    try {
      // 1. Upload to Cloudinary → get back a plain https string
      const avatarUrl = await uploadToCloudinary(file);

      // 2. Persist the URL string to our backend
      //    Send: { avatar: "https://res.cloudinary.com/…" }  ← string only
      const { data } = await uploadProfileImage({ avatar: avatarUrl });

      // 3. data.avatar from the server is also a plain string
      //    resolveAvatarUrl is an extra safety net
      const resolvedUrl = resolveAvatarUrl(data.avatar) ?? avatarUrl;

      onUpdate(data);                // update AuthContext
      setPreview(resolvedUrl);       // update local preview
      toast.success("Profile picture updated! 🎉");
    } catch (err) {
      console.error("[AvatarUploader] upload error:", err);
      toast.error(err.response?.data?.message ?? err.message ?? "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }, [uploadToCloudinary, onUpdate]);

  // ── Drag & drop ────────────────────────────────────────────────────────
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    if (!busy) handleFile(e.dataTransfer.files?.[0]);
  }, [busy, handleFile]);

  // ── Remove avatar ──────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!preview || busy) return;
    setDeleting(true);
    try {
      const { data } = await deleteProfileImage();
      onUpdate(data);
      setPreview(null);
      toast.success("Profile picture removed");
    } catch (err) {
      toast.error(err.response?.data?.message ?? "Could not remove photo");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">

      {/* Avatar + drop zone */}
      <div
        role="button" tabIndex={0}
        aria-label="Change profile picture"
        className="relative group cursor-pointer outline-none"
        onClick={() => !busy && fileRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && !busy && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); if (!busy) setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        <motion.div
          animate={{
            boxShadow: [
              "0 0 0 0px  rgba(212,178,106,0.35)",
              "0 0 0 8px  rgba(212,178,106,0.08)",
              "0 0 0 0px  rgba(212,178,106,0.35)",
            ],
          }}
          transition={{ duration: 3, repeat: Infinity }}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden
            flex items-center justify-center text-white font-black
            transition-transform duration-200 group-hover:scale-[1.03]"
          style={{
            background: preview
              ? "transparent"
              : "linear-gradient(135deg,#13213c,#264670)",
            border:    `2px solid ${dragOver ? C.gold : "rgba(212,178,106,0.3)"}`,
            fontSize:  "2rem",
          }}
        >
          {preview
            ? <img src={preview} alt={name} className="w-full h-full object-cover" />
            : getInitials(name)
          }
        </motion.div>

        {/* Hover overlay */}
        <div
          className="absolute inset-0 rounded-3xl flex flex-col items-center
            justify-center gap-1 opacity-0 group-hover:opacity-100
            transition-opacity duration-200"
          style={{
            background: dragOver ? "rgba(212,178,106,0.28)" : "rgba(19,33,60,0.55)",
          }}
        >
          {busy
            ? <Spinner size={22} />
            : <>
                <Camera size={18} color="white" />
                <span className="text-[9px] font-bold text-white tracking-wider">
                  {dragOver ? "DROP HERE" : "CHANGE"}
                </span>
              </>
          }
        </div>

        {/* Online dot */}
        <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-[2.5px]"
          style={{ background: C.green, borderColor: "#13213c" }} />
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        <motion.button
          type="button" disabled={busy}
          whileHover={!busy ? { y: -1 } : {}}
          whileTap={!busy  ? { scale: 0.96 } : {}}
          onClick={() => !busy && fileRef.current?.click()}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
            text-[11px] font-bold transition-all duration-150
            disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: C.goldLight,
            border:     `1px solid ${C.goldBorder}`,
            color:      C.navy,
          }}
        >
          {uploading ? <><Spinner size={11} /> Uploading…</> : <><Upload size={11} /> Upload Photo</>}
        </motion.button>

        <AnimatePresence>
          {preview && (
            <motion.button
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1     }}
              exit={{    opacity: 0, scale: 0.85   }}
              transition={{ duration: 0.15 }}
              type="button" disabled={busy}
              whileHover={!busy ? { y: -1 } : {}}
              whileTap={!busy  ? { scale: 0.96 } : {}}
              onClick={handleDelete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
                text-[11px] font-bold transition-all duration-150
                disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: "rgba(239,68,68,0.08)",
                border:     "1px solid rgba(239,68,68,0.2)",
                color:      C.red,
              }}
            >
              {deleting
                ? <><Spinner size={11} /> Removing…</>
                : <><Trash2 size={11} /> Remove</>
              }
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <p className="text-[10px] text-center" style={{ color: C.textMuted }}>
        JPG · PNG · WebP · GIF &nbsp;·&nbsp; Max 5 MB · Drag & drop supported
      </p>

      <input
        ref={fileRef} type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};

// ── Section divider ────────────────────────────────────────────────────────
const Divider = ({ label, icon: Icon }) => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-px" style={{ background: C.border }} />
    <span className="flex items-center gap-1.5 text-[10px] font-black
      uppercase tracking-widest px-2" style={{ color: C.textMuted }}>
      {Icon && <Icon size={10} />}{label}
    </span>
    <div className="flex-1 h-px" style={{ background: C.border }} />
  </div>
);

// ── Generic text / email / password field ─────────────────────────────────
const Field = ({
  label, name, value, onChange, placeholder,
  error, type = "text", icon: Icon, helper, readOnly,
}) => {
  const [focused,  setFocused ] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPass ? "text" : "password") : type;

  return (
    <div>
      <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5"
        style={{ color: C.textMuted }}>
        {label}
      </label>
      <div
        className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150"
        style={{
          background: readOnly ? "rgba(19,33,60,0.02)" : "rgba(19,33,60,0.025)",
          border:     `1.5px solid ${error ? C.red : focused ? C.gold : C.border}`,
          boxShadow:  focused
            ? `0 0 0 3px ${error ? "rgba(239,68,68,0.1)" : "rgba(212,178,106,0.12)"}`
            : "none",
          opacity: readOnly ? 0.6 : 1,
        }}
      >
        {Icon && (
          <Icon size={15} style={{ color: focused ? C.gold : C.textMuted,
            flexShrink: 0, transition: "color 0.15s" }} />
        )}
        <input
          type={inputType} name={name} value={value}
          onChange={onChange} placeholder={placeholder} readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={()  => setFocused(false)}
          className="flex-1 bg-transparent outline-none text-sm
            font-medium placeholder:font-normal"
          style={{ color: C.text, caretColor: C.gold }}
        />
        {isPassword && value && (
          <button type="button" onClick={() => setShowPass((v) => !v)}
            className="flex-shrink-0 transition-colors duration-150"
            style={{ color: C.textMuted }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.gold)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.textMuted)}>
            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-[11px] mt-1.5 font-medium flex items-center gap-1"
          style={{ color: C.red }}>
          <X size={10} />{error}
        </p>
      )}
      {helper && !error && (
        <p className="text-[11px] mt-1.5" style={{ color: C.textMuted }}>{helper}</p>
      )}
    </div>
  );
};

// ── Address input (inline focus style via capture) ─────────────────────────
const AddrInput = ({ name, value, onChange, placeholder, icon: Icon }) => (
  <div
    className="flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-150"
    style={{ background: "rgba(19,33,60,0.025)", border: `1.5px solid ${C.border}` }}
    onFocusCapture={(e) => {
      e.currentTarget.style.borderColor = C.gold;
      e.currentTarget.style.boxShadow   = "0 0 0 3px rgba(212,178,106,0.12)";
    }}
    onBlurCapture={(e) => {
      e.currentTarget.style.borderColor = C.border;
      e.currentTarget.style.boxShadow   = "none";
    }}
  >
    <Icon size={14} style={{ color: C.textMuted, flexShrink: 0 }} />
    <input
      name={name} value={value} onChange={onChange} placeholder={placeholder}
      className="flex-1 bg-transparent outline-none text-sm
        font-medium placeholder:font-normal"
      style={{ color: C.text, caretColor: C.gold }}
    />
  </div>
);

// ── Phone field ────────────────────────────────────────────────────────────
const PhoneField = ({ local, country, onLocalChange, onCountryChange, error }) => {
  const [open,    setOpen   ] = useState(false);
  const [search,  setSearch ] = useState("");
  const [focused, setFocused] = useState(false);
  const wrapRef = useRef(null);
  const srchRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => srchRef.current?.focus(), 50);
  }, [open]);

  useEffect(() => {
    const fn = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const filtered = COUNTRIES.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search) ||
    c.iso.toLowerCase().includes(search.toLowerCase())
  );

  const digits     = digitsOnly(local);
  const isComplete = digits.length === country.digits;
  const showValid  = isComplete && !error;
  const border     = error ? C.red : showValid ? C.green
    : (focused || open) ? C.gold : C.border;

  return (
    <div ref={wrapRef} className="relative">
      <label className="flex items-center gap-1 text-[10px] font-black
        uppercase tracking-widest mb-1.5" style={{ color: C.textMuted }}>
        <Phone size={10} /> Phone Number
      </label>

      <div className="flex rounded-2xl overflow-visible transition-all duration-150"
        style={{
          border:     `1.5px solid ${border}`,
          boxShadow:  (focused || open)
            ? `0 0 0 3px ${error ? "rgba(239,68,68,0.1)" : "rgba(212,178,106,0.12)"}`
            : "none",
          background: "rgba(19,33,60,0.025)",
        }}
      >
        {/* Dial-code button */}
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-1 px-3 py-3 border-r flex-shrink-0
            focus:outline-none transition-colors duration-150"
          style={{ borderColor: border, background: open ? C.goldLight : "transparent" }}>
          <span className="text-sm leading-none">{country.flag}</span>
          <span className="text-[11px] font-bold" style={{ color: C.text }}>{country.code}</span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronDown size={11} style={{ color: C.textMuted }} />
          </motion.div>
        </button>

        {/* Number input */}
        <div className="relative flex-1 flex items-center">
          <input type="tel" inputMode="numeric" value={local}
            onChange={(e) => onLocalChange(formatPhone(e.target.value, country.digits))}
            onFocus={() => setFocused(true)}
            onBlur={()  => setFocused(false)}
            placeholder={country.digits === 10 ? "000-000-0000" : "─".repeat(country.digits)}
            className="w-full bg-transparent py-3 pl-3 pr-8 text-sm
              font-medium focus:outline-none"
            style={{ color: C.text, caretColor: C.gold }}
          />
          <div className="absolute right-3 pointer-events-none">
            <AnimatePresence mode="wait">
              {showValid && (
                <motion.div key="ok"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <CheckCircle2 size={14} style={{ color: C.green }} />
                </motion.div>
              )}
              {error && !showValid && (
                <motion.div key="err"
                  initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                  <X size={13} style={{ color: C.red }} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Digit progress bar */}
      <div className="mt-1.5 flex items-center gap-2">
        <div className="flex-1 h-[2px] rounded-full overflow-hidden"
          style={{ background: "rgba(19,33,60,0.07)" }}>
          <div className="h-full rounded-full transition-all duration-300"
            style={{
              width:      `${Math.min((digits.length / country.digits) * 100, 100)}%`,
              background: showValid ? C.green : error ? C.red
                : "linear-gradient(to right,#d4b26a,#264670)",
            }} />
        </div>
        <span className="text-[9px] font-bold tabular-nums flex-shrink-0"
          style={{ color: showValid ? C.green : error ? C.red : C.textMuted }}>
          {digits.length}/{country.digits}
        </span>
      </div>

      {error && (
        <p className="text-[11px] mt-1 font-medium flex items-center gap-1"
          style={{ color: C.red }}>
          <X size={10} />{error}
        </p>
      )}

      {/* Country dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0,  scale: 1    }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute left-0 top-[calc(100%+6px)] w-full
              rounded-2xl overflow-hidden z-[999]"
            style={{
              background: "rgba(255,255,255,0.99)",
              border:     `1.5px solid ${C.goldBorder}`,
              boxShadow:  "0 16px 48px rgba(19,33,60,0.14)",
            }}
          >
            <div className="flex items-center gap-2 px-3 py-2.5 border-b"
              style={{ borderColor: C.border }}>
              <Search size={12} style={{ color: C.gold, flexShrink: 0 }} />
              <input ref={srchRef} value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search country or code…"
                className="flex-1 bg-transparent text-xs focus:outline-none"
                style={{ color: C.text }} />
              {search && (
                <button type="button" onClick={() => setSearch("")}>
                  <X size={11} style={{ color: C.textMuted }} />
                </button>
              )}
            </div>

            <ul className="overflow-y-auto" style={{ maxHeight: 180 }}>
              {filtered.length === 0
                ? <li className="py-4 text-center text-xs"
                    style={{ color: C.textSub }}>No results</li>
                : filtered.map((c, i) => {
                    const sel = c.iso === country.iso && c.code === country.code;
                    return (
                      <li key={`${c.iso}-${i}`}
                        onClick={() => { onCountryChange(c); onLocalChange(""); setOpen(false); setSearch(""); }}
                        className="flex items-center gap-2.5 px-3 py-2
                          cursor-pointer text-xs transition-colors duration-100"
                        style={{ background: sel ? C.goldLight : "transparent" }}
                        onMouseEnter={(e) => { if (!sel) e.currentTarget.style.background = "rgba(212,178,106,0.06)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = sel ? C.goldLight : "transparent"; }}
                      >
                        <span className="text-base leading-none">{c.flag}</span>
                        <span className="flex-1 font-medium truncate" style={{ color: C.text }}>{c.name}</span>
                        <span className="font-bold tabular-nums"
                          style={{ color: sel ? C.gold : C.textSub, fontSize: 11 }}>
                          {c.code}
                        </span>
                        {sel && <CheckCircle2 size={12} style={{ color: C.gold }} />}
                      </li>
                    );
                  })
              }
            </ul>

            <div className="px-3 py-1.5 text-center text-[9px] font-semibold border-t"
              style={{ color: C.textMuted, borderColor: C.border }}>
              {filtered.length}/{COUNTRIES.length} countries
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Info chip (read-only summary) ──────────────────────────────────────────
const InfoChip = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 px-4 py-3 rounded-2xl"
    style={{ background: "rgba(19,33,60,0.025)", border: `1px solid ${C.border}` }}>
    <div className="w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0"
      style={{ background: C.goldLight, border: `1px solid ${C.goldBorder}` }}>
      <Icon size={13} style={{ color: C.gold }} />
    </div>
    <div className="min-w-0">
      <p className="text-[9px] font-black uppercase tracking-widest"
        style={{ color: C.textMuted }}>{label}</p>
      <p className="text-xs font-semibold truncate mt-0.5"
        style={{ color: value ? C.text : C.textMuted }}>
        {value || "Not set"}
      </p>
    </div>
  </div>
);

// ── Password strength bar ──────────────────────────────────────────────────
const StrengthBar = ({ password }) => {
  if (!password) return null;
  const len   = password.length;
  const level = len >= 10 ? 3 : len >= 6 ? 2 : 1;
  const label = ["", "Weak", "Fair", "Strong"][level];
  const color = [C.red, C.red, "#f59e0b", C.green][level];
  return (
    <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
      className="space-y-1.5">
      <div className="flex gap-1">
        {[1,2,3].map((l) => (
          <div key={l} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: l <= level ? color : "rgba(19,33,60,0.08)" }} />
        ))}
      </div>
      <p className="text-[10px] font-semibold" style={{ color }}>{label} password</p>
    </motion.div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// UserProfile (main page)
// ══════════════════════════════════════════════════════════════════════════
const UserProfile = () => {
  const { user, updateUser } = useAuth();

  const { country: initCountry, local: initLocal } = parseStoredPhone(user?.phone);

  const [form, setForm] = useState({
    name:     user?.name  || "",
    email:    user?.email || "",
    password: "",
    confirm:  "",
  });

  const [phoneLocal,   setPhoneLocal  ] = useState(initLocal);
  const [phoneCountry, setPhoneCountry] = useState(initCountry);

  const [address, setAddress] = useState({
    street:  user?.address?.street  || "",
    city:    user?.address?.city    || "",
    state:   user?.address?.state   || "",
    zip:     user?.address?.zip     || "",
    country: user?.address?.country || "",
  });

  const [loading, setLoading] = useState(false);
  const [errors,  setErrors ] = useState({});
  const [section, setSection] = useState("account");

  // Re-sync all fields when user context updates
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({ ...f, name: user.name || "", email: user.email || "" }));
    const { country: c, local: l } = parseStoredPhone(user.phone);
    setPhoneLocal(l);
    setPhoneCountry(c);
    setAddress({
      street:  user.address?.street  || "",
      city:    user.address?.city    || "",
      state:   user.address?.state   || "",
      zip:     user.address?.zip     || "",
      country: user.address?.country || "",
    });
  }, [user]);

  const handleChange  = (e) => {
    setForm  ((f)  => ({ ...f,  [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: ""             }));
  };

  const handleAddress = (e) => {
    setAddress((a)  => ({ ...a,  [e.target.name]: e.target.value }));
    setErrors ((er) => ({ ...er, [e.target.name]: ""             }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim())  errs.name  = "Name is required";
    if (!form.email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email";
    if (phoneLocal) {
      const d = digitsOnly(phoneLocal);
      if (d.length > 0 && d.length !== phoneCountry.digits)
        errs.phone = `Must be ${phoneCountry.digits} digits for ${phoneCountry.name}`;
    }
    if (form.password) {
      if (form.password.length < 6)          errs.password = "Minimum 6 characters";
      if (form.password !== form.confirm)    errs.confirm  = "Passwords do not match";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      // ── Build payload ────────────────────────────────────────────────────
      // IMPORTANT: never include `avatar` here.
      // Avatar is managed exclusively by AvatarUploader via its own API call.
      // Including it here would risk sending a stale or wrong-shaped value.
      const payload = {
        name:    form.name,
        email:   form.email,
        address: {
          street:  address.street,
          city:    address.city,
          state:   address.state,
          zip:     address.zip,     // always "zip" — matches schema
          country: address.country,
        },
      };

      // Phone — only include if the local digits are complete
      const d = digitsOnly(phoneLocal);
      if (d.length === phoneCountry.digits) {
        payload.phone = `${phoneCountry.code}${d}`;
      } else if (!phoneLocal.trim()) {
        payload.phone = ""; // explicit clear
      }
      // If partially typed, leave phone out of payload entirely

      if (form.password) payload.password = form.password;

      const { data } = await updateProfile(payload);
      updateUser(data);
      toast.success("Profile updated! ✅");
      setForm((f) => ({ ...f, password: "", confirm: "" }));
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "account",  label: "Account",  icon: User   },
    { id: "address",  label: "Address",  icon: MapPin },
    { id: "security", label: "Security", icon: Shield },
  ];

  const displayName = joinName(user);
  // Resolve the avatar URL safely — never pass an object to <img src>
  const avatarUrl   = resolveAvatarUrl(user?.avatar);

  return (
    <div className="min-h-screen py-6 sm:py-10 px-4" style={{ background: C.bg }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0  }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl mx-auto"
      >

        {/* ── Hero card ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ delay: 0.05 }}
          className="relative rounded-3xl overflow-hidden mb-5"
          style={{
            background: "linear-gradient(135deg,#13213c 0%,#264670 100%)",
            boxShadow:  "0 8px 32px rgba(19,33,60,0.25)",
          }}
        >
          <div className="absolute inset-0 pointer-events-none opacity-[0.06]"
            style={{
              backgroundImage: "radial-gradient(circle,#d4b26a 1px,transparent 1px)",
              backgroundSize:  "24px 24px",
            }} />
          <div className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(to right,transparent,#d4b26a,transparent)" }} />

          <div className="relative flex flex-col sm:flex-row items-center
            sm:items-start gap-5 sm:gap-6 p-5 sm:p-7">

            {/* AvatarUploader manages its own upload/delete API calls */}
            <div className="flex-shrink-0">
              <AvatarUploader user={user} onUpdate={updateUser} />
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left">
              <h2 className="text-lg sm:text-xl font-black text-white truncate">
                {displayName}
              </h2>
              <p className="text-xs sm:text-sm mt-0.5 truncate"
                style={{ color: "rgba(255,255,255,0.6)" }}>
                {user?.email}
              </p>

              <div className="flex items-center justify-center sm:justify-start
                gap-2 mt-3 flex-wrap">
                <span className="inline-flex items-center gap-1.5 text-[10px]
                  font-bold px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(212,178,106,0.18)",
                    color:      "#d4b26a",
                    border:     "1px solid rgba(212,178,106,0.3)",
                  }}>
                  <BadgeCheck size={11} />
                  {user?.role === "admin" ? "Admin" : "Customer"}
                </span>
                <span className="inline-flex items-center gap-1.5 text-[10px]
                  font-bold px-3 py-1 rounded-full"
                  style={{
                    background: "rgba(255,255,255,0.1)",
                    color:      "rgba(255,255,255,0.7)",
                    border:     "1px solid rgba(255,255,255,0.15)",
                  }}>
                  <Sparkles size={10} /> CraftNest Member
                </span>
              </div>

              <div className="flex flex-col gap-1.5 mt-3">
                {user?.phone && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold
                    justify-center sm:justify-start"
                    style={{ color: "rgba(255,255,255,0.65)" }}>
                    <Phone size={10} style={{ color: "#d4b26a" }} />
                    {user.phone}
                  </div>
                )}
                {user?.address?.city && (
                  <div className="flex items-center gap-1.5 text-[10px] font-semibold
                    justify-center sm:justify-start"
                    style={{ color: "rgba(255,255,255,0.65)" }}>
                    <MapPin size={10} style={{ color: "#d4b26a" }} />
                    {[user.address.city, user.address.state, user.address.country]
                      .filter(Boolean).join(", ")}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Info chips ─────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5"
        >
          <InfoChip icon={User}  label="Full Name" value={user?.name}  />
          <InfoChip icon={Mail}  label="Email"     value={user?.email} />
          <InfoChip icon={Phone} label="Phone"     value={user?.phone} />
          <InfoChip
            icon={MapPin} label="Location"
            value={
              user?.address?.city
                ? [user.address.city, user.address.country].filter(Boolean).join(", ")
                : null
            }
          />
        </motion.div>

        {/* ── Tab bar ────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="flex gap-1 p-1 rounded-2xl mb-4"
          style={{ background: "rgba(19,33,60,0.05)", border: `1px solid ${C.border}` }}
        >
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} type="button" onClick={() => setSection(id)}
              className="flex-1 flex items-center justify-center gap-1.5
                py-2 rounded-xl text-xs font-bold transition-all duration-200"
              style={{
                background: section === id ? C.surface : "transparent",
                color:      section === id ? C.navy    : C.textSub,
                boxShadow:  section === id ? "0 2px 8px rgba(19,33,60,0.08)" : "none",
              }}>
              <Icon size={13} />{label}
            </button>
          ))}
        </motion.div>

        {/* ── Edit card ──────────────────────────────────────────────── */}
        <div className="relative rounded-3xl overflow-hidden"
          style={{
            background: C.surface,
            border:     `1px solid ${C.border}`,
            boxShadow:  "0 4px 32px rgba(19,33,60,0.07)",
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: "linear-gradient(to right,#d4b26a,#264670,#13213c)" }} />

          <form onSubmit={handleSubmit}>
            <div className="p-5 sm:p-8 space-y-5">
              <AnimatePresence mode="wait">

                {/* Account tab */}
                {section === "account" && (
                  <motion.div key="account"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0   }}
                    exit={{    opacity: 0, x:  12  }}
                    transition={{ duration: 0.22 }}
                    className="space-y-4"
                  >
                    <Divider label="Personal Info" icon={User} />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Field label="Full Name" name="name"
                        value={form.name} onChange={handleChange}
                        placeholder="Jane Smith" error={errors.name} icon={User} />
                      <Field label="Email Address" name="email" type="email"
                        value={form.email} onChange={handleChange}
                        placeholder="jane@example.com" error={errors.email} icon={Mail} />
                    </div>
                    <PhoneField
                      local={phoneLocal} country={phoneCountry}
                      onLocalChange={setPhoneLocal} onCountryChange={setPhoneCountry}
                      error={errors.phone}
                    />
                  </motion.div>
                )}

                {/* Address tab */}
                {section === "address" && (
                  <motion.div key="address"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0   }}
                    exit={{    opacity: 0, x:  12  }}
                    transition={{ duration: 0.22 }}
                    className="space-y-4"
                  >
                    <Divider label="Shipping Address" icon={MapPin} />

                    <div>
                      <label className="block text-[10px] font-black uppercase
                        tracking-widest mb-1.5" style={{ color: C.textMuted }}>
                        Street / Apartment
                      </label>
                      <AddrInput name="street" value={address.street}
                        onChange={handleAddress}
                        placeholder="123 Main Street, Apt 4B" icon={Home} />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: "city",  label: "City",            icon: Building2, ph: "New York" },
                        { name: "state", label: "State / Province", icon: Map,       ph: "NY"       },
                      ].map(({ name, label, icon: Icon, ph }) => (
                        <div key={name}>
                          <label className="block text-[10px] font-black uppercase
                            tracking-widest mb-1.5" style={{ color: C.textMuted }}>
                            {label}
                          </label>
                          <AddrInput name={name} value={address[name]}
                            onChange={handleAddress} placeholder={ph} icon={Icon} />
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { name: "zip",     label: "ZIP / Postal Code", icon: Hash,  ph: "10001"        },
                        { name: "country", label: "Country",           icon: Globe, ph: "United States" },
                      ].map(({ name, label, icon: Icon, ph }) => (
                        <div key={name}>
                          <label className="block text-[10px] font-black uppercase
                            tracking-widest mb-1.5" style={{ color: C.textMuted }}>
                            {label}
                          </label>
                          <AddrInput name={name} value={address[name]}
                            onChange={handleAddress} placeholder={ph} icon={Icon} />
                        </div>
                      ))}
                    </div>

                    {(address.street || address.city) && (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                        className="rounded-2xl p-4"
                        style={{ background: C.goldLight, border: `1px solid ${C.goldBorder}` }}
                      >
                        <p className="text-[10px] font-black uppercase tracking-widest
                          mb-1.5 flex items-center gap-1" style={{ color: C.gold }}>
                          <MapPin size={10} /> Preview
                        </p>
                        <p className="text-xs font-semibold leading-relaxed"
                          style={{ color: C.text }}>
                          {[address.street, address.city, address.state,
                            address.zip, address.country].filter(Boolean).join(", ")}
                        </p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {/* Security tab */}
                {section === "security" && (
                  <motion.div key="security"
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0   }}
                    exit={{    opacity: 0, x:  12  }}
                    transition={{ duration: 0.22 }}
                    className="space-y-4"
                  >
                    <Divider label="Change Password" icon={Lock} />

                    <Field label="Account Email (read-only)" name="_email"
                      value={form.email} placeholder="—" icon={Mail} readOnly />

                    <Field label="New Password" name="password" type="password"
                      value={form.password} onChange={handleChange}
                      placeholder="Enter new password…"
                      error={errors.password}
                      helper="Leave blank to keep current password"
                      icon={Lock} />

                    <StrengthBar password={form.password} />

                    <AnimatePresence>
                      {form.password && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{    opacity: 0, height: 0     }}
                          transition={{ duration: 0.2 }}
                        >
                          <Field label="Confirm New Password" name="confirm"
                            type="password"
                            value={form.confirm} onChange={handleChange}
                            placeholder="Re-enter new password…"
                            error={errors.confirm} icon={Lock} />
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="rounded-2xl p-4 space-y-2"
                      style={{ background: "rgba(19,33,60,0.03)", border: `1px solid ${C.border}` }}>
                      <p className="text-[10px] font-black uppercase tracking-widest
                        flex items-center gap-1" style={{ color: C.textMuted }}>
                        <ShieldCheck size={10} /> Security Tips
                      </p>
                      {[
                        "Use at least 10 characters",
                        "Mix letters, numbers & symbols",
                        "Never reuse passwords",
                      ].map((tip) => (
                        <p key={tip} className="text-[11px] flex items-center gap-2"
                          style={{ color: C.textSub }}>
                          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                            style={{ background: C.gold }} />
                          {tip}
                        </p>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Save button */}
              <div className="pt-1">
                <motion.button type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.01, y: -1 } : {}}
                  whileTap={!loading  ? { scale: 0.98          } : {}}
                  className="w-full flex items-center justify-center gap-2.5
                    py-3 sm:py-3.5 rounded-2xl text-sm font-black text-white
                    transition-all duration-200 disabled:cursor-not-allowed"
                  style={{
                    background: loading
                      ? "rgba(19,33,60,0.2)"
                      : `linear-gradient(135deg,${C.navy},${C.navyLight})`,
                    boxShadow: loading ? "none" : "0 6px 24px rgba(19,33,60,0.25)",
                  }}
                >
                  {loading
                    ? <><Spinner size={15} /> Saving…</>
                    : <><Save size={16} /> Save Changes</>
                  }
                </motion.button>
              </div>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

export default UserProfile;