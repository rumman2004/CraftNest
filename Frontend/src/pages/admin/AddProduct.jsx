import { useState }    from "react";
import { useNavigate } from "react-router-dom";
import { motion }      from "framer-motion";
import {
  Upload, X, ArrowLeft, ImagePlus, Tag,
} from "lucide-react";
import { createProduct } from "../../services/api";
import toast             from "react-hot-toast";

const C = {
  navy: "#13213c", navyLight: "#264670",
  gold: "#d4b26a", goldLight: "rgba(212,178,106,0.12)",
  goldBorder: "rgba(212,178,106,0.2)",
  text: "#13213c", textSub: "#4f6080",
  textMuted: "rgba(19,33,60,0.4)",
  border: "rgba(19,33,60,0.07)",
  surface: "#ffffff", surfaceAlt: "rgba(19,33,60,0.025)",
  red: "#ef4444",
};

const CATEGORIES = ["Crochet","Embroidery","Pipe Cleaner","Woolen","Other"];

const inputClass = (err) => ({
  width: "100%", padding: "10px 14px",
  background: C.surfaceAlt,
  border: `1px solid ${err ? C.red : C.border}`,
  borderRadius: "12px", color: C.text,
  fontSize: "13px", outline: "none",
  transition: "border-color 0.15s",
});

const FormSection = ({ title, children }) => (
  <div className="rounded-2xl p-6 space-y-4"
    style={{ background: C.surface, border: `1px solid ${C.border}`,
      boxShadow: "0 2px 12px rgba(19,33,60,0.05)" }}>
    <h3 className="text-sm font-black" style={{ color: C.text }}>{title}</h3>
    {children}
  </div>
);

const FieldLabel = ({ children, optional }) => (
  <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest"
    style={{ color: C.textMuted }}>
    {children}
    {optional && (
      <span className="ml-1.5 normal-case tracking-normal font-normal"
        style={{ color: C.textMuted }}>(optional)</span>
    )}
  </label>
);

const ErrorMsg = ({ msg }) =>
  msg ? <p className="text-xs mt-1" style={{ color: C.red }}>{msg}</p> : null;

// ══════════════════════════════════════════════════════════════════════════
const AddProduct = () => {
  const navigate             = useNavigate();
  const [loading,  setLoading ] = useState(false);
  const [images,   setImages  ] = useState([]);   // File[]
  const [previews, setPreviews] = useState([]);   // string[] (object URLs)
  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "Crochet",
    stock: "", featured: false, tags: "",
  });
  const [errors, setErrors] = useState({});

  // ── Image handlers ───────────────────────────────────────────────────────
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setImages  ((p) => [...p, ...files]);
    setPreviews((p) => [
      ...p, ...files.map((f) => URL.createObjectURL(f)),
    ]);
    // Reset the input so the same file can be re-selected if removed
    e.target.value = "";
  };

  const removeImage = (i) => {
    // Revoke the object URL to free memory
    URL.revokeObjectURL(previews[i]);
    setImages  ((p) => p.filter((_, idx) => idx !== i));
    setPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  // ── Field handler ─────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm  ((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())
      errs.name = "Product name is required";
    if (!form.description.trim())
      errs.description = "Description is required";
    if (!form.price || isNaN(form.price) || Number(form.price) < 0)
      errs.price = "Enter a valid price";
    if (form.stock === "" || isNaN(form.stock) || Number(form.stock) < 0)
      errs.stock = "Enter a valid stock amount";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setLoading(true);
    try {
      const fd = new FormData();

      // Scalar fields
      fd.append("name",        form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price",       form.price);
      fd.append("category",    form.category);
      fd.append("stock",       form.stock);
      fd.append("tags",        form.tags.trim());

      // ✅ Send boolean as string explicitly — backend parses with parseBool()
      fd.append("featured", String(form.featured));

      // ✅ Append each File object individually under the "images" key
      images.forEach((img) => fd.append("images", img));

      await createProduct(fd);
      toast.success("Product created successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl"
    >
      {/* Back */}
      <button
        onClick={() => navigate("/admin/products")}
        className="flex items-center gap-2 text-sm font-semibold mb-6
          transition-all duration-150"
        style={{ color: C.textSub }}
        onMouseEnter={(e) => (e.currentTarget.style.color = C.navy)}
        onMouseLeave={(e) => (e.currentTarget.style.color = C.textSub)}
      >
        <ArrowLeft size={15} /> Back to Products
      </button>

      {/* Page title */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: C.goldLight, border: `1px solid ${C.goldBorder}` }}
        >
          <Tag size={18} style={{ color: C.gold }} />
        </div>
        <div>
          <h2 className="text-xl font-black" style={{ color: C.text }}>
            Add New Product
          </h2>
          <p className="text-xs" style={{ color: C.textSub }}>
            Fill in the details below
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Images ─────────────────────────────────────────────────── */}
        <FormSection title={`Product Images (${images.length}/5)`}>
          <div className="flex flex-wrap gap-3">

            {/* Previews */}
            {previews.map((src, i) => (
              <div key={i} className="relative w-24 h-24 group">
                <img
                  src={src}
                  alt={`Preview ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                  style={{ border: `1px solid ${C.border}` }}
                />
                <button
                  type="button"
                  onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                    flex items-center justify-center text-white
                    opacity-0 group-hover:opacity-100 transition-all duration-150"
                  style={{ background: C.red }}
                >
                  <X size={11} />
                </button>
                {i === 0 && (
                  <span
                    className="absolute bottom-1 left-1 text-[8px] font-black
                      px-1.5 py-0.5 rounded-md uppercase tracking-widest"
                    style={{ background: C.navy, color: "#fff" }}
                  >
                    Main
                  </span>
                )}
              </div>
            ))}

            {/* Upload button */}
            {images.length < 5 && (
              <label
                className="w-24 h-24 flex flex-col items-center justify-center
                  gap-1 rounded-xl cursor-pointer transition-all duration-150"
                style={{
                  background: C.surfaceAlt,
                  border:     `2px dashed ${C.border}`,
                  color:      C.textMuted,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = C.gold;
                  e.currentTarget.style.color       = C.gold;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = C.border;
                  e.currentTarget.style.color       = C.textMuted;
                }}
              >
                <ImagePlus size={20} />
                <span className="text-[10px] font-semibold">
                  {images.length === 0 ? "Upload" : "Add More"}
                </span>
                {/*
                  ✅ key trick: put a unique key on the input so React
                  re-mounts it after each selection — prevents the browser
                  "same file selected, no change event" problem.
                */}
                <input
                  key={images.length}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="text-[11px]" style={{ color: C.textMuted }}>
            First image is the main thumbnail · JPG, PNG, WebP · Max 5 · 5 MB each
          </p>
        </FormSection>

        {/* ── Product Details ─────────────────────────────────────────── */}
        <FormSection title="Product Details">

          {/* Name */}
          <div>
            <FieldLabel>Product Name</FieldLabel>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Beautiful Crochet Tote Bag"
              style={inputClass(errors.name)}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e)  => (e.target.style.borderColor =
                errors.name ? C.red : C.border)}
            />
            <ErrorMsg msg={errors.name} />
          </div>

          {/* Description */}
          <div>
            <FieldLabel>Description</FieldLabel>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Describe your handmade product in detail…"
              style={{ ...inputClass(errors.description), resize: "none" }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e)  => (e.target.style.borderColor =
                errors.description ? C.red : C.border)}
            />
            <ErrorMsg msg={errors.description} />
          </div>

          {/* Price + Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Price (USD)</FieldLabel>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="29.99"
                style={inputClass(errors.price)}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e)  => (e.target.style.borderColor =
                  errors.price ? C.red : C.border)}
              />
              <ErrorMsg msg={errors.price} />
            </div>
            <div>
              <FieldLabel>Stock Quantity</FieldLabel>
              <input
                type="number"
                name="stock"
                value={form.stock}
                onChange={handleChange}
                min="0"
                placeholder="10"
                style={inputClass(errors.stock)}
                onFocus={(e) => (e.target.style.borderColor = C.gold)}
                onBlur={(e)  => (e.target.style.borderColor =
                  errors.stock ? C.red : C.border)}
              />
              <ErrorMsg msg={errors.stock} />
            </div>
          </div>

          {/* Category */}
          <div>
            <FieldLabel>Category</FieldLabel>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ ...inputClass(false), cursor: "pointer" }}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e)  => (e.target.style.borderColor = C.border)}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Tags */}
          <div>
            <FieldLabel optional>Tags</FieldLabel>
            <input
              type="text"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              placeholder="handmade, crochet, gift, cozy"
              style={inputClass(false)}
              onFocus={(e) => (e.target.style.borderColor = C.gold)}
              onBlur={(e)  => (e.target.style.borderColor = C.border)}
            />
            <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>
              Separate tags with commas
            </p>
          </div>

          {/* Featured checkbox */}
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <div
              className="w-5 h-5 rounded-md flex items-center justify-center
                transition-all duration-150 flex-shrink-0"
              style={{
                background: form.featured ? C.navy    : C.surfaceAlt,
                border:     `2px solid ${form.featured ? C.navy : C.border}`,
              }}
            >
              {form.featured && (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="#fff" strokeWidth="1.5"
                    strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
              <input
                type="checkbox"
                name="featured"
                checked={form.featured}
                onChange={handleChange}
                className="sr-only"
              />
            </div>
            <div>
              <p className="text-sm font-semibold" style={{ color: C.text }}>
                Featured Product
              </p>
              <p className="text-[11px]" style={{ color: C.textMuted }}>
                Highlighted on the homepage
              </p>
            </div>
          </label>
        </FormSection>

        {/* ── Submit ──────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-2xl text-sm font-black
            tracking-wide transition-all duration-200 flex items-center
            justify-center gap-2 disabled:cursor-not-allowed"
          style={{
            background: loading
              ? "rgba(19,33,60,0.15)"
              : `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
            color:     "#fff",
            boxShadow: loading ? "none" : "0 4px 20px rgba(19,33,60,0.2)",
          }}
        >
          {loading ? (
            <><Upload size={15} className="animate-spin" /> Creating…</>
          ) : (
            "Create Product"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default AddProduct;