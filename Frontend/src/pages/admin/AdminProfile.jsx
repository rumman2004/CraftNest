// pages/admin/AdminProfile.jsx

import { useState, useEffect }  from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth }              from "../../context/AuthContext";
import { updateProfile, updatePassword } from "../../services/api";
import {
  Shield, Lock, Eye, EyeOff, User,
  Mail, Phone, Key, CheckCircle, XCircle,
  Sparkles, AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

// ── Palette ────────────────────────────────────────────────────────────────
const C = {
  navy:       "#13213c",
  navyLight:  "#264670",
  navyGlass:  "rgba(19,33,60,0.04)",
  gold:       "#d4b26a",
  goldLight:  "rgba(212,178,106,0.12)",
  goldBorder: "rgba(212,178,106,0.25)",
  text:       "#13213c",
  textSub:    "#4f6080",
  textMuted:  "rgba(19,33,60,0.38)",
  border:     "rgba(19,33,60,0.08)",
  surface:    "#ffffff",
  surfaceAlt: "rgba(19,33,60,0.03)",
  green:      "#22c55e",
  greenLight: "rgba(34,197,94,0.1)",
  red:        "#ef4444",
  redLight:   "rgba(239,68,68,0.1)",
};

// ── Phone validation ───────────────────────────────────────────────────────
// Accepts: +91 98765 43210 / 9876543210 / +1 234 567 8900 etc.
const PHONE_RE = /^\+?[\d\s\-().]{7,15}$/;
const INDIA_RE = /^(\+91[\s-]?)?[6-9]\d{9}$/;

const validatePhone = (val) => {
  if (!val) return null;                              // empty = no error
  const clean = val.replace(/\s/g, "");
  if (clean.startsWith("+91") || (!clean.startsWith("+") && clean.length === 10)) {
    return INDIA_RE.test(clean)
      ? null
      : "Enter a valid 10-digit Indian mobile number";
  }
  return PHONE_RE.test(val)
    ? null
    : "Enter a valid phone number (7–15 digits, optional country code)";
};

// ── Password strength ──────────────────────────────────────────────────────
const getStrength = (pwd) => {
  if (!pwd) return { score: 0, label: "", color: C.border };
  let s = 0;
  if (pwd.length >= 8)              s++;
  if (/[A-Z]/.test(pwd))            s++;
  if (/[0-9]/.test(pwd))            s++;
  if (/[^A-Za-z0-9]/.test(pwd))    s++;
  const map = [
    { label: "Too short",  color: C.red    },
    { label: "Weak",       color: C.red    },
    { label: "Fair",       color: "#f59e0b"},
    { label: "Good",       color: C.gold   },
    { label: "Strong",     color: C.green  },
  ];
  return { score: s, ...map[s] };
};

// ── Tiny reusable pieces ───────────────────────────────────────────────────
const Label = ({ children }) => (
  <p className="text-[10px] font-black uppercase tracking-widest mb-1.5"
    style={{ color: C.textMuted }}>
    {children}
  </p>
);

const Hint = ({ ok, text }) => (
  <motion.p
    initial={{ opacity: 0, y: -4 }}
    animate={{ opacity: 1, y: 0  }}
    className="text-[11px] font-semibold flex items-center gap-1 mt-1"
    style={{ color: ok ? C.green : C.red }}
  >
    {ok
      ? <CheckCircle size={10} />
      : <XCircle     size={10} />
    }
    {text}
  </motion.p>
);

// ── Decorated input ────────────────────────────────────────────────────────
const Input = ({
  label, icon: Icon, type = "text", value, onChange,
  placeholder, disabled, error, success,
  rightEl,               // e.g. show/hide password button
}) => {
  const [focused, setFocused] = useState(false);
  const borderColor = error   ? C.red
                    : success ? C.green
                    : focused ? C.gold
                    :           C.border;
  return (
    <div>
      <Label>{label}</Label>
      <div className="relative">
        {/* Left icon */}
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <Icon size={13}
              style={{ color: focused ? C.gold : C.textMuted,
                       transition: "color 0.15s" }} />
          </div>
        )}

        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          className="w-full py-2.5 rounded-xl text-sm focus:outline-none
            transition-all duration-150 disabled:opacity-50"
          style={{
            paddingLeft:  Icon  ? "2.4rem" : "1rem",
            paddingRight: rightEl ? "2.8rem" : "1rem",
            background:   disabled ? C.surfaceAlt : C.surface,
            border:       `1.5px solid ${borderColor}`,
            color:        C.text,
            boxShadow:    focused
              ? `0 0 0 3px ${error ? "rgba(239,68,68,0.1)" : "rgba(212,178,106,0.12)"}`
              : "none",
          }}
        />

        {/* Right element */}
        {rightEl && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightEl}
          </div>
        )}
      </div>

      <AnimatePresence>
        {error && <Hint ok={false} text={error} />}
      </AnimatePresence>
    </div>
  );
};

// ── Avatar initials ────────────────────────────────────────────────────────
const Avatar = ({ name, size = 80 }) => (
  <div
    className="rounded-2xl flex items-center justify-center
      text-white font-black select-none flex-shrink-0"
    style={{
      width:      size,
      height:     size,
      fontSize:   size * 0.38,
      background: `linear-gradient(135deg,${C.navyLight},${C.gold})`,
      boxShadow:  "0 8px 28px rgba(19,33,60,0.22)",
    }}
  >
    {name?.[0]?.toUpperCase() ?? "A"}
  </div>
);

// ── Section card ──────────────────────────────────────────────────────────
const SectionCard = ({ title, icon: Icon, accent, badge, children }) => (
  <div className="rounded-2xl overflow-hidden"
    style={{
      background: C.surface,
      border:     `1px solid ${C.border}`,
      boxShadow:  "0 2px 20px rgba(19,33,60,0.06)",
    }}>
    {/* Header strip */}
    <div className="relative px-6 py-4 flex items-center justify-between"
      style={{
        background:   C.surfaceAlt,
        borderBottom: `1px solid ${C.border}`,
      }}>
      {/* Coloured left bar */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-2xl"
        style={{ background: accent }} />

      <div className="flex items-center gap-3 ml-2">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center"
          style={{ background: `${accent}18`, border: `1px solid ${accent}30` }}>
          <Icon size={14} style={{ color: accent }} />
        </div>
        <h3 className="text-sm font-black" style={{ color: C.text }}>{title}</h3>
      </div>

      {badge && (
        <span className="text-[10px] font-black px-2.5 py-1 rounded-full"
          style={{ background: C.goldLight, color: C.gold }}>
          {badge}
        </span>
      )}
    </div>

    <div className="p-6">{children}</div>
  </div>
);

// ── Submit button ──────────────────────────────────────────────────────────
const SubmitBtn = ({ loading, label, accent = C.navy }) => (
  <motion.button
    type="submit"
    disabled={loading}
    whileHover={{ scale: loading ? 1 : 1.015 }}
    whileTap={{   scale: loading ? 1 : 0.975 }}
    className="w-full py-3 rounded-xl text-sm font-black tracking-wide
      flex items-center justify-center gap-2 disabled:opacity-60
      transition-all duration-150"
    style={{
      background: `linear-gradient(135deg,${accent},${
        accent === C.navy ? C.navyLight : "#b8922e"
      })`,
      color:     "#fff",
      boxShadow: `0 4px 18px ${accent}30`,
    }}
  >
    {loading
      ? <>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
            className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full"
          />
          Saving…
        </>
      : label
    }
  </motion.button>
);

// ═══════════════════════════════════════════════════════════════════════════
// Main component
// ═══════════════════════════════════════════════════════════════════════════
const AdminProfile = () => {
  const { user, updateUser } = useAuth();

  // ── Profile form ─────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState({
    name:  user?.name  ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  });
  const [phoneError,    setPhoneError   ] = useState("");
  const [profileLoading,setProfileLoading]= useState(false);

  // Validate phone live
  useEffect(() => {
    setPhoneError(validatePhone(profileForm.phone) ?? "");
  }, [profileForm.phone]);

  const handleProfile = async (e) => {
    e.preventDefault();
    if (!profileForm.name.trim() || !profileForm.email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const phoneErr = validatePhone(profileForm.phone);
    if (phoneErr) { toast.error(phoneErr); return; }

    setProfileLoading(true);
    try {
      const { data } = await updateProfile(profileForm);
      updateUser(data);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  // ── Password form ─────────────────────────────────────────────────────
  const [pwdForm, setPwdForm] = useState({
    currentPassword: "",
    newPassword:     "",
    confirmPassword: "",
  });
  const [showPwd, setShowPwd] = useState({
    current: false, next: false, confirm: false,
  });
  const [pwdLoading, setPwdLoading] = useState(false);

  const strength    = getStrength(pwdForm.newPassword);
  const pwdMatch    = pwdForm.newPassword &&
                      pwdForm.confirmPassword &&
                      pwdForm.newPassword === pwdForm.confirmPassword;
  const pwdMismatch = pwdForm.newPassword &&
                      pwdForm.confirmPassword &&
                      pwdForm.newPassword !== pwdForm.confirmPassword;

  const handlePassword = async (e) => {
    e.preventDefault();
    if (!pwdForm.currentPassword || !pwdForm.newPassword) {
      toast.error("All password fields are required");
      return;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    setPwdLoading(true);
    try {
      await updatePassword({
        currentPassword: pwdForm.currentPassword,
        newPassword:     pwdForm.newPassword,
      });
      toast.success("Password changed!");
      setPwdForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  const EyeBtn = ({ field }) => (
    <button
      type="button"
      onClick={() => setShowPwd((p) => ({ ...p, [field]: !p[field] }))}
      style={{ color: C.textMuted }}
      className="transition-colors duration-150 hover:text-[#4f6080]"
    >
      {showPwd[field]
        ? <EyeOff size={14} />
        : <Eye    size={14} />
      }
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl space-y-6"
    >
      {/* ── Page header ───────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-black" style={{ color: C.text }}>
            My Profile
          </h2>
          <p className="text-xs mt-0.5" style={{ color: C.textSub }}>
            Manage your account settings and security
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl
          text-[11px] font-bold"
          style={{ background: C.goldLight, color: C.gold,
                   border: `1px solid ${C.goldBorder}` }}>
          <Sparkles size={11} />
          Admin
        </div>
      </div>

      {/* ── Hero card ─────────────────────────────────────────────── */}
      <div className="rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(135deg,${C.navy} 0%,${C.navyLight} 100%)`,
          boxShadow:  "0 8px 32px rgba(19,33,60,0.22)",
        }}>
        {/* gold shimmer strip */}
        <div className="h-[3px] w-full"
          style={{
            background:
              "linear-gradient(90deg,transparent,#d4b26a 40%,#f0d080 60%,transparent)",
          }} />

        <div className="p-6 flex items-center gap-5">
          <Avatar name={user?.name} />

          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-black text-white truncate">
              {user?.name}
            </h3>
            <p className="text-sm mt-0.5 truncate"
              style={{ color: "rgba(255,255,255,0.55)" }}>
              {user?.email}
            </p>

            <div className="flex items-center flex-wrap gap-2 mt-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                rounded-full text-[10px] font-black uppercase tracking-widest"
                style={{ background: C.goldLight, color: C.gold,
                         border: `1px solid ${C.goldBorder}` }}>
                <Shield size={9} /> Administrator
              </span>

              {user?.phone && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1
                  rounded-full text-[10px] font-semibold"
                  style={{ background: "rgba(255,255,255,0.08)",
                           color:      "rgba(255,255,255,0.6)" }}>
                  <Phone size={9} /> {user.phone}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Profile form ──────────────────────────────────────────── */}
      <SectionCard
        title="Personal Information"
        icon={User}
        accent={C.navyLight}
        badge="Edit"
      >
        <form onSubmit={handleProfile} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              icon={User}
              value={profileForm.name}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, name: e.target.value }))
              }
              placeholder="Your full name"
            />
            <Input
              label="Email Address"
              icon={Mail}
              type="email"
              value={profileForm.email}
              onChange={(e) =>
                setProfileForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="your@email.com"
            />
          </div>

          {/* Phone with live validation */}
          <Input
            label="Phone Number"
            icon={Phone}
            type="tel"
            value={profileForm.phone}
            onChange={(e) =>
              setProfileForm((f) => ({ ...f, phone: e.target.value }))
            }
            placeholder="e.g. 9876543210 or +91 98765 43210"
            error={profileForm.phone ? phoneError : ""}
            success={profileForm.phone && !phoneError}
          />

          {/* Phone format hints */}
          <div className="rounded-xl p-3 space-y-1"
            style={{ background: C.surfaceAlt,
                     border: `1px solid ${C.border}` }}>
            <p className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: C.textMuted }}>
              Accepted formats
            </p>
            {[
              "9876543210          (10-digit India)",
              "+91 98765 43210    (India with code)",
              "+1 234 567 8900    (International)",
            ].map((ex) => (
              <p key={ex} className="text-[11px] font-mono"
                style={{ color: C.textSub }}>
                {ex}
              </p>
            ))}
          </div>

          {/* Role (read-only) */}
          <Input
            label="Role"
            icon={Shield}
            value="Administrator"
            disabled
          />

          <SubmitBtn loading={profileLoading} label="Save Profile" />
        </form>
      </SectionCard>

      {/* ── Password form ─────────────────────────────────────────── */}
      <SectionCard
        title="Change Password"
        icon={Lock}
        accent={C.gold}
        badge="Security"
      >
        <form onSubmit={handlePassword} className="space-y-4">
          <Input
            label="Current Password"
            icon={Key}
            value={pwdForm.currentPassword}
            onChange={(e) =>
              setPwdForm((f) => ({ ...f, currentPassword: e.target.value }))
            }
            placeholder="Enter your current password"
            type={showPwd.current ? "text" : "password"}
            rightEl={<EyeBtn field="current" />}
          />

          <Input
            label="New Password"
            icon={Lock}
            value={pwdForm.newPassword}
            onChange={(e) =>
              setPwdForm((f) => ({ ...f, newPassword: e.target.value }))
            }
            placeholder="Min. 6 characters"
            type={showPwd.next ? "text" : "password"}
            rightEl={<EyeBtn field="next" />}
          />

          {/* Strength meter */}
          <AnimatePresence>
            {pwdForm.newPassword && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{    opacity: 0, height: 0     }}
                className="space-y-2"
              >
                {/* Bar */}
                <div className="flex gap-1">
                  {[0,1,2,3].map((i) => (
                    <div key={i} className="h-1.5 flex-1 rounded-full overflow-hidden"
                      style={{ background: "rgba(19,33,60,0.07)" }}>
                      <motion.div
                        className="h-full rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: i < strength.score ? "100%" : "0%" }}
                        transition={{ duration: 0.25, delay: i * 0.05 }}
                        style={{ background: strength.color }}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] font-bold"
                  style={{ color: strength.color }}>
                  {strength.label}
                </p>

                {/* Rules checklist */}
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { ok: pwdForm.newPassword.length >= 8,      text: "8+ characters"      },
                    { ok: /[A-Z]/.test(pwdForm.newPassword),    text: "Uppercase letter"    },
                    { ok: /[0-9]/.test(pwdForm.newPassword),    text: "Number"              },
                    { ok: /[^A-Za-z0-9]/.test(pwdForm.newPassword), text: "Special character"},
                  ].map(({ ok, text }) => (
                    <div key={text}
                      className="flex items-center gap-1.5 text-[11px] font-semibold"
                      style={{ color: ok ? C.green : C.textMuted }}>
                      {ok
                        ? <CheckCircle size={10} />
                        : <AlertCircle size={10} />
                      }
                      {text}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Input
            label="Confirm New Password"
            icon={Lock}
            value={pwdForm.confirmPassword}
            onChange={(e) =>
              setPwdForm((f) => ({ ...f, confirmPassword: e.target.value }))
            }
            placeholder="Repeat your new password"
            type={showPwd.confirm ? "text" : "password"}
            rightEl={<EyeBtn field="confirm" />}
            error={pwdMismatch ? "Passwords do not match" : ""}
            success={!!pwdMatch}
          />

          <AnimatePresence>
            {pwdMatch && (
              <motion.p
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0  }}
                exit={{    opacity: 0, y: -4  }}
                className="text-[11px] font-semibold flex items-center gap-1"
                style={{ color: C.green }}>
                <CheckCircle size={10} /> Passwords match
              </motion.p>
            )}
          </AnimatePresence>

          <SubmitBtn loading={pwdLoading} label="Change Password" accent={C.navy} />
        </form>
      </SectionCard>
    </motion.div>
  );
};

export default AdminProfile;