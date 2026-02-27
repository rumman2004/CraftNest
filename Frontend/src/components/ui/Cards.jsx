import { motion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
// ── Base card ──────────────────────────────────────────────────────────────
export const Card = ({
  children,
  className = "",
  hover = false,
  onClick,
  padding = "md",
}) => {
  const paddings = {
    none: "",
    sm:   "p-3 sm:p-4",
    md:   "p-4 sm:p-6",
    lg:   "p-5 sm:p-7",
    xl:   "p-6 sm:p-8",
  };

  return (
    <motion.div
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`
        relative rounded-2xl sm:rounded-3xl
        border border-[#13213c]/8
        shadow-sm
        ${hover
          ? "cursor-pointer transition-shadow duration-300"
          : ""
        }
        ${paddings[padding]}
        ${className}
      `}
      style={{
        background: "var(--glass-bg)",
        ...(hover ? {
          "--hover-shadow": "0 20px 40px rgba(19,33,60,0.15)",
        } : {}),
      }}
    >
      {children}
    </motion.div>
  );
};

// ── Glass card ─────────────────────────────────────────────────────────────
export const GlassCard = ({
  children,
  className = "",
  topBar    = true,
  padding   = "md",
}) => {
  const paddings = {
    none: "",
    sm:   "p-3 sm:p-5",
    md:   "p-5 sm:p-7",
    lg:   "p-6 sm:p-9",
    xl:   "p-7 sm:p-10",
  };

  return (
    <div className={`relative z-10 ${className}`}>
      {/* Depth shadow layers */}
      <div
        className="absolute inset-x-6 sm:inset-x-8 -bottom-3 sm:-bottom-4
          h-full rounded-[1.5rem] sm:rounded-[2rem] blur-xl -z-10"
        style={{
          background:
            "linear-gradient(to bottom, rgba(212,178,106,0.2), rgba(38,70,112,0.15))",
        }}
      />
      <div
        className="absolute inset-x-3 sm:inset-x-4 -bottom-1.5 sm:-bottom-2
          h-full rounded-[1.5rem] sm:rounded-[2rem] blur-sm -z-10"
        style={{ background: "rgba(255,255,255,0.6)" }}
      />

      {/* Surface */}
      <div
        className={`
          relative backdrop-blur-2xl
          rounded-[1.5rem] sm:rounded-[2rem] overflow-hidden
          ${paddings[padding]}
        `}
        style={{
          background: "rgba(255,255,255,0.97)",
          border: "1px solid rgba(19,33,60,0.08)",
          boxShadow:
            "0 16px 48px rgba(19,33,60,0.1), 0 4px 16px rgba(212,178,106,0.08)",
        }}
      >
        {topBar && (
          <div
            className="absolute top-0 left-0 right-0 h-[2.5px] sm:h-[3px]"
            style={{
              background:
                "linear-gradient(to right, #d4b26a, #264670, #13213c)",
            }}
          />
        )}
        {/* Corner accents */}
        <div
          className="absolute top-0 right-0 w-20 h-20 sm:w-28 sm:h-28
            pointer-events-none rounded-bl-full"
          style={{
            background:
              "linear-gradient(to bottom-left, rgba(212,178,106,0.12), transparent)",
          }}
        />
        <div
          className="absolute bottom-0 left-0 w-14 h-14 sm:w-20 sm:h-20
            pointer-events-none rounded-tr-full"
          style={{
            background:
              "linear-gradient(to top-right, rgba(38,70,112,0.08), transparent)",
          }}
        />
        {children}
      </div>
    </div>
  );
};

// ── Gradient card ──────────────────────────────────────────────────────────
export const GradientCard = ({
  children,
  className = "",
  padding   = "md",
}) => {
  const paddings = {
    none: "",
    sm:   "p-4 sm:p-6",
    md:   "p-6 sm:p-10",
    lg:   "p-8 sm:p-14",
    xl:   "p-10 sm:p-16",
  };

  return (
    <div
      className={`
        relative rounded-[1.5rem] sm:rounded-[2.5rem] overflow-hidden
        text-center
        ${paddings[padding]}
        ${className}
      `}
      style={{
        background: "linear-gradient(135deg, #13213c 0%, #264670 60%, #1a3254 100%)",
        boxShadow: "0 20px 60px rgba(19,33,60,0.4)",
      }}
    >
      {/* Gold dot texture */}
      <div
        className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(circle, #d4b26a 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Gold accent top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] pointer-events-none"
        style={{
          background: "linear-gradient(to right, #d4b26a, #c69e4f, #d4b26a)",
        }}
      />
      {/* Blobs */}
      <div
        className="absolute -top-10 sm:-top-16 -left-10 sm:-left-16
          w-36 sm:w-56 h-36 sm:h-56 rounded-full blur-2xl pointer-events-none"
        style={{ background: "rgba(212,178,106,0.12)" }}
      />
      <div
        className="absolute -bottom-8 sm:-bottom-12 -right-8 sm:-right-12
          w-32 sm:w-48 h-32 sm:h-48 rounded-full blur-2xl pointer-events-none"
        style={{ background: "rgba(255,255,255,0.06)" }}
      />
      <div
        className="absolute top-1/2 left-1/2 w-48 sm:w-72 h-48 sm:h-72
          rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2
          pointer-events-none"
        style={{ background: "rgba(212,178,106,0.06)" }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// ── Feature card ───────────────────────────────────────────────────────────
export const FeatureCard = ({
  icon: Icon,
  cornerIcon: CornerIcon,
  title,
  desc,
  gradient,
  glow,
  bg,
  border,
  text,
  learnMore = false,
}) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className={`
      group relative rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-7
      border shadow-md hover:shadow-2xl
      transition-shadow duration-300 overflow-hidden
      ${bg} ${border} ${glow}
    `}
  >
    {/* Hover top bar */}
    <div
      className="absolute top-0 left-0 right-0 h-[3px]
        opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{
        background: "linear-gradient(to right, #d4b26a, #264670)",
      }}
    />
    {/* Corner glow */}
    <div
      className="absolute -top-6 sm:-top-8 -right-6 sm:-right-8
        w-20 sm:w-24 h-20 sm:h-24 rounded-full pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #d4b26a, #264670)",
        opacity: 0.08,
      }}
    />

    {/* Icon bubble */}
    <div
      className={`
        relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl
        flex items-center justify-center
        mb-3 sm:mb-5 shadow-lg
        group-hover:scale-110 transition-transform duration-300
        ${gradient}
      `}
    >
      <div className="absolute inset-0 rounded-xl sm:rounded-2xl overflow-hidden pointer-events-none">
        <div className="absolute -top-2.5 -left-2 w-8 h-8 bg-white/20 rounded-full blur-md" />
      </div>
      {Icon && (
        <>
          <Icon size={20} className="text-white relative z-10 sm:hidden" strokeWidth={1.8} />
          <Icon size={26} className="text-white relative z-10 hidden sm:block" strokeWidth={1.8} />
        </>
      )}
      {CornerIcon && (
        <div
          className="absolute -bottom-1.5 -right-1.5 w-4 h-4 sm:w-5 sm:h-5
            rounded-md sm:rounded-lg flex items-center justify-center
            shadow-sm border border-white/60"
          style={{ background: "rgba(255,255,255,0.95)" }}
        >
          <CornerIcon size={8} className={`${text} sm:hidden`} strokeWidth={2.2} />
          <CornerIcon size={10} className={`${text} hidden sm:block`} strokeWidth={2.2} />
        </div>
      )}
    </div>

    <h3
      className="font-extrabold text-sm sm:text-base mb-1.5 sm:mb-2"
      style={{ color: "#13213c" }}
    >
      {title}
    </h3>
    <p className="text-xs sm:text-sm leading-relaxed" style={{ color: "#4f545f" }}>
      {desc}
    </p>

    {learnMore && (
      <div
        className={`flex items-center gap-1 mt-3 sm:mt-4
          text-[11px] sm:text-xs font-bold ${text}
          opacity-0 group-hover:opacity-100
          translate-y-1 group-hover:translate-y-0
          transition-all duration-200`}
      >
        Learn more →
      </div>
    )}
  </motion.div>
);

// ── Stat card ──────────────────────────────────────────────────────────────
export const StatCard = ({ icon: Icon, value, label }) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }}
    className="flex flex-col items-center text-center gap-1.5 sm:gap-2"
  >
    <div
      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl
        backdrop-blur-sm flex items-center justify-center
        mb-0.5 sm:mb-1 shadow-lg"
      style={{
        background: "rgba(212,178,106,0.2)",
        border: "1px solid rgba(212,178,106,0.4)",
      }}
    >
      <Icon size={18} className="sm:hidden" style={{ color: "#d4b26a" }} />
      <Icon size={22} className="hidden sm:block" style={{ color: "#d4b26a" }} />
    </div>
    <p
      className="text-2xl sm:text-3xl lg:text-4xl font-black
        tracking-tight leading-none text-white"
    >
      {value}
    </p>
    <p className="text-white/80 text-[11px] sm:text-sm font-semibold tracking-wide">
      {label}
    </p>
  </motion.div>
);

// ── Team member card ───────────────────────────────────────────────────────
export const TeamCard = ({
  name, role, avatarIcon: AvatarIcon,
  specialtyIcon: SpecialtyIcon, specialty,
  gradient, glow, years, quote,
}) => (
  <motion.div
    variants={{ hidden: { opacity: 0, y: 36 }, show: { opacity: 1, y: 0 } }}
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ type: "spring", stiffness: 300, damping: 20 }}
    className="group relative rounded-2xl sm:rounded-3xl overflow-hidden
      shadow-md hover:shadow-2xl transition-shadow duration-300"
    style={{
      background: "var(--glass-bg)",
      border: "1px solid var(--glass-border)",
    }}
  >
    {/* Gold top bar */}
    <div
      className="h-1 sm:h-1.5 w-full"
      style={{
        background: "linear-gradient(to right, #d4b26a, #264670)",
      }}
    />
    <div
      className={`absolute inset-0 opacity-0 group-hover:opacity-[0.03]
        transition-opacity duration-300 pointer-events-none ${gradient}`}
    />

    <div className="p-4 sm:p-6 lg:p-7 text-center">
      <motion.div
        className="relative inline-block mb-4 sm:mb-5"
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <div
          className={`absolute inset-0 rounded-2xl sm:rounded-3xl
            blur-xl opacity-25 scale-110 pointer-events-none ${gradient}`}
        />
        <div
          className={`relative w-16 h-16 sm:w-20 sm:h-20 mx-auto
            rounded-2xl sm:rounded-3xl flex items-center justify-center
            shadow-xl ${gradient} ${glow}`}
        >
          <div className="absolute inset-0 rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none">
            <div className="absolute -top-3 -left-2.5 w-11 sm:w-14 h-11 sm:h-14 bg-white/20 rounded-full blur-lg" />
          </div>
          {AvatarIcon && (
            <>
              <AvatarIcon size={26} className="text-white relative z-10 sm:hidden" strokeWidth={1.6} />
              <AvatarIcon size={32} className="text-white relative z-10 hidden sm:block" strokeWidth={1.6} />
            </>
          )}
          <div
            className="absolute -bottom-2 -right-2 rounded-lg sm:rounded-xl
              px-1.5 sm:px-2 py-0.5 text-[8px] sm:text-[9px] font-black
              shadow-md whitespace-nowrap"
            style={{
              background: "#ffffff",
              color: "#13213c",
              border: "1px solid rgba(19,33,60,0.1)",
            }}
          >
            {years}
          </div>
        </div>
      </motion.div>

      <h3
        className="font-extrabold text-sm sm:text-base mb-0.5"
        style={{ color: "#13213c" }}
      >
        {name}
      </h3>
      <p
        className="text-[11px] sm:text-xs font-bold mb-2 sm:mb-3"
        style={{ color: "#d4b26a" }}
      >
        {role}
      </p>

      {SpecialtyIcon && (
        <div
          className="inline-flex items-center gap-1 sm:gap-1.5
            px-2.5 sm:px-3 py-0.5 sm:py-1
            rounded-full text-[10px] sm:text-xs font-semibold mb-3 sm:mb-4"
          style={{
            background: "var(--color-oxford-gray-light)",
            color: "#4f545f",
            border: "1px solid rgba(19,33,60,0.08)",
          }}
        >
          <SpecialtyIcon size={9} className="sm:hidden" />
          <SpecialtyIcon size={11} className="hidden sm:block" />
          {specialty}
        </div>
      )}

      <div
        className="px-2.5 sm:px-3 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl"
        style={{
          background: "var(--color-oxford-gray-light)",
          border: "1px solid rgba(19,33,60,0.06)",
        }}
      >
        <p
          className="text-[10px] sm:text-xs italic leading-relaxed"
          style={{ color: "#4f545f" }}
        >
          "{quote}"
        </p>
      </div>
    </div>
  </motion.div>
);