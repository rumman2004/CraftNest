import { forwardRef } from "react";
import { AlertCircle, Info } from "lucide-react";

const Textarea = forwardRef((
  {
    label, name, placeholder, value, onChange, error,
    required = false, disabled = false, rows = 4,
    helper = null, className = "", ...rest
  },
  ref
) => (
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

    <textarea
      ref={ref}
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      disabled={disabled}
      rows={rows}
      {...rest}
      className={`
        input-field resize-none
        disabled:opacity-50 disabled:cursor-not-allowed
        ${error ? "!border-red-400 !ring-red-300/50" : ""}
      `.replace(/\s+/g, " ").trim()}
    />

    {error && (
      <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm text-red-500
        flex items-center gap-1">
        <AlertCircle size={12} className="flex-shrink-0" />
        {error}
      </p>
    )}
    {helper && !error && (
      <p
        className="mt-1 sm:mt-1.5 text-[11px] sm:text-xs flex items-center gap-1"
        style={{ color: "#4f545f" }}
      >
        <Info size={11} className="flex-shrink-0" />
        {helper}
      </p>
    )}
  </div>
));

Textarea.displayName = "Textarea";
export default Textarea;