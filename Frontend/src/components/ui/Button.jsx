import { motion } from "framer-motion";

const variants = {
  primary: `
    relative overflow-hidden
    text-white
    shadow-md
  `,
  secondary: `
    border-2
    bg-transparent
  `,
  danger: `
    relative overflow-hidden
    bg-gradient-to-r from-red-500 to-red-700
    hover:from-red-600 hover:to-red-800
    text-white
    shadow-md shadow-red-200/50
    hover:shadow-lg hover:shadow-red-300/40
  `,
  ghost: `
    bg-transparent
  `,
  dark: `
    text-white
    shadow-sm
  `,
  success: `
    relative overflow-hidden
    bg-gradient-to-r from-emerald-500 to-teal-600
    hover:from-emerald-600 hover:to-teal-700
    text-white
    shadow-md shadow-emerald-200/50
    hover:shadow-lg hover:shadow-emerald-300/40
  `,
};

const sizes = {
  sm: "px-2.5 py-1 text-[11px] sm:px-3 sm:py-1.5 sm:text-xs rounded-lg sm:rounded-xl gap-1 sm:gap-1.5",
  md: "px-3.5 py-2 text-xs sm:px-5 sm:py-2.5 sm:text-sm rounded-xl sm:rounded-2xl gap-1.5 sm:gap-2",
  lg: "px-5 py-2.5 text-sm sm:px-7 sm:py-3.5 sm:text-base rounded-xl sm:rounded-2xl gap-1.5 sm:gap-2",
  xl: "px-6 py-3 text-sm sm:px-9 sm:py-4 sm:text-lg rounded-2xl sm:rounded-3xl gap-2 sm:gap-2.5",
};

const spinnerSizes = {
  sm: "h-3 w-3 sm:h-3.5 sm:w-3.5",
  md: "h-3.5 w-3.5 sm:h-4 sm:w-4",
  lg: "h-4 w-4 sm:h-[18px] sm:w-[18px]",
  xl: "h-4 w-4 sm:h-5 sm:w-5",
};

const SHIMMER_VARIANTS = new Set(["primary", "danger", "success"]);

// Inline style maps (avoids Tailwind purge issues with dynamic colors)
const variantStyles = {
  primary: {
    background: "linear-gradient(to right, #13213c, #264670)",
    boxShadow: "0 4px 14px rgba(19,33,60,0.35)",
  },
  secondary: {
    border: "2px solid #13213c",
    color: "#13213c",
  },
  ghost: {
    color: "#4f545f",
  },
  dark: {
    background: "#13213c",
    color: "#ffffff",
  },
};

const Button = ({
  children,
  variant   = "primary",
  size      = "md",
  loading   = false,
  disabled  = false,
  fullWidth = false,
  icon      = null,
  iconRight = null,
  onClick,
  type      = "button",
  className = "",
  style     = {},
}) => {
  const isDisabled = disabled || loading;

  const getHoverClass = () => {
    if (variant === "secondary") return "hover:border-[#d4b26a] hover:bg-[#13213c]/5";
    if (variant === "ghost")
      return "hover:bg-[#13213c]/8 hover:text-[#264670]";
    return "";
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={isDisabled ? {} : { y: -1, scale: 1.01 }}
      whileTap={isDisabled   ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 20 }}
      style={{ ...variantStyles[variant], ...style }}
      className={`
        inline-flex items-center justify-center font-bold
        transition-all duration-200
        select-none cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        disabled:pointer-events-none
        ${variants[variant]}
        ${sizes[size]}
        ${getHoverClass()}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `.replace(/\s+/g, " ").trim()}
    >
      {/* Shimmer sweep */}
      {SHIMMER_VARIANTS.has(variant) && !isDisabled && (
        <motion.span
          aria-hidden
          className="absolute inset-0 bg-gradient-to-r
            from-transparent via-white/20 to-transparent
            -skew-x-12 pointer-events-none"
          initial={{ x: "-130%" }}
          animate={{ x: "230%" }}
          transition={{
            duration: 2.6, repeat: Infinity,
            ease: "linear", repeatDelay: 3,
          }}
        />
      )}

      {loading ? (
        <span
          className={`flex-shrink-0 border-2 border-current
            border-t-transparent rounded-full animate-spin
            ${spinnerSizes[size]}`}
        />
      ) : icon ? (
        <span className="flex-shrink-0 relative z-10">{icon}</span>
      ) : null}

      {children && (
        <span className="relative z-10 leading-none truncate">
          {children}
        </span>
      )}

      {!loading && iconRight && (
        <span className="flex-shrink-0 relative z-10">{iconRight}</span>
      )}
    </motion.button>
  );
};

export default Button;