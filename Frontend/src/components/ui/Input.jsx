import { forwardRef, useState } from "react";
import { Eye, EyeOff, AlertCircle, Info } from "lucide-react";

const Input = forwardRef((
  {
    label, name, type = "text", placeholder, value, onChange,
    error, required = false, disabled = false,
    icon = null, helper = null, className = "", ...rest
  },
  ref
) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType  = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs sm:text-sm font-semibold mb-1 sm:mb-1.5"
          style={{ color: "#13213c" }}
        >
          {label}
          {required && (
            <span style={{ color: "#d4b26a" }} className="ml-1">*</span>
          )}
        </label>
      )}

      <div className="relative">
        {icon && (
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "#4f545f" }}
          >
            {icon}
          </span>
        )}

        <input
          ref={ref}
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          {...rest}
          className={`
            input-field
            disabled:opacity-50 disabled:cursor-not-allowed
            ${icon ? "pl-9 sm:pl-10" : ""}
            ${isPassword ? "pr-10 sm:pr-12" : ""}
            ${error ? "!border-red-400 !ring-red-300/50" : ""}
          `.replace(/\s+/g, " ").trim()}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2
              transition-colors p-0.5"
            style={{ color: "#4f545f" }}
          >
            {showPassword
              ? <EyeOff size={15} className="sm:hidden" />
              : <Eye    size={15} className="sm:hidden" />
            }
            {showPassword
              ? <EyeOff size={17} className="hidden sm:block" />
              : <Eye    size={17} className="hidden sm:block" />
            }
          </button>
        )}
      </div>

      {error && (
        <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-500
          flex items-center gap-1">
          <AlertCircle size={12} className="flex-shrink-0" />
          {error}
        </p>
      )}
      {helper && !error && (
        <p
          className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs
            flex items-center gap-1"
          style={{ color: "#4f545f" }}
        >
          <Info size={11} className="flex-shrink-0" />
          {helper}
        </p>
      )}
    </div>
  );
});

Input.displayName = "Input";
export default Input;