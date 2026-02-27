import { useState, useEffect }    from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion }                 from "framer-motion";
import {
  Upload, X, ArrowLeft, ImagePlus, Edit,
} from "lucide-react";
import { getProductById, updateProduct } from "../../services/api";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import toast          from "react-hot-toast";

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

const inputStyle = (focused, err) => ({
  width: "100%", padding: "10px 14px",
  background: C.surfaceAlt,
  border: `1px solid ${err ? C.red : focused ? C.gold : C.border}`,
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
  <label className="block text-[10px] font-black mb-1.5 uppercase tracking-widest"
    style={{ color: C.textMuted }}>
    {children}
    {optional && (
      <span className="ml-1 normal-case tracking-normal font-normal">
        (optional)
      </span>
    )}
  </label>
);

const FocusInput = ({
  as: Tag = "input", name, value, onChange,
  placeholder, type = "text", rows, step, min, error,
}) => {
  const [focused, setFocused] = useState(false);
  return (
    <Tag
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      rows={rows}
      step={step}
      min={min}
      style={{
        ...inputStyle(focused, error),
        ...(Tag === "textarea" ? { resize: "none" } : {}),
      }}
      onFocus={() => setFocused(true)}
      onBlur={()  => setFocused(false)}
    />
  );
};

// ══════════════════════════════════════════════════════════════════════════
const EditProduct = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [fetchLoading,    setFetchLoading   ] = useState(true);
  const [saveLoading,     setSaveLoading    ] = useState(false);
  const [newImages,       setNewImages      ] = useState([]);   // File[]
  const [newPreviews,     setNewPreviews    ] = useState([]);   // string[]
  const [existingImages,  setExistingImages ] = useState([]);   // {url,public_id}[]
  const [removedImages,   setRemovedImages  ] = useState([]);   // public_id[]
  const [errors,          setErrors         ] = useState({});

  const [form, setForm] = useState({
    name: "", description: "", price: "", category: "Crochet",
    stock: "", featured: false, tags: "",
  });

  // ── Fetch existing product ─────────────────────────────────────────────
  useEffect(() => {
    getProductById(id)
      .then(({ data }) => {
        setForm({
          name:        data.name        ?? "",
          description: data.description ?? "",
          price:       data.price       ?? "",
          category:    data.category    ?? "Crochet",
          stock:       data.stock       ?? "",
          // ✅ Normalize both `featured` and legacy `isFeatured`
          featured:    data.featured    ?? data.isFeatured ?? false,
          tags:        Array.isArray(data.tags)
            ? data.tags.join(", ")
            : (data.tags ?? ""),
        });
        setExistingImages(data.images || []);
      })
      .catch(() => {
        toast.error("Product not found");
        navigate("/admin/products");
      })
      .finally(() => setFetchLoading(false));
  }, [id]);

  // ── Image handlers ─────────────────────────────────────────────────────
  const handleNewImages = (e) => {
    const files = Array.from(e.target.files);
    const total = existingImages.length + newImages.length + files.length;
    if (total > 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    setNewImages  ((p) => [...p, ...files]);
    setNewPreviews((p) => [
      ...p, ...files.map((f) => URL.createObjectURL(f)),
    ]);
    e.target.value = "";
  };

  const removeExistingImage = (img) => {
    setExistingImages((p) =>
      p.filter((i) => i.public_id !== img.public_id)
    );
    setRemovedImages((p) => [...p, img.public_id]);
  };

  const removeNewImage = (i) => {
    URL.revokeObjectURL(newPreviews[i]);
    setNewImages  ((p) => p.filter((_, idx) => idx !== i));
    setNewPreviews((p) => p.filter((_, idx) => idx !== i));
  };

  // ── Field handler ──────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm  ((f) => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors((err) => ({ ...err, [name]: "" }));
  };

  // ── Validation ─────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.name.trim())        errs.name        = "Required";
    if (!form.description.trim()) errs.description = "Required";
    if (!form.price || Number(form.price) < 0)
      errs.price = "Valid price required";
    if (form.stock === "" || Number(form.stock) < 0)
      errs.stock = "Valid stock required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const totalImages = existingImages.length + newImages.length;
    if (totalImages === 0) {
      toast.error("Product must have at least one image");
      return;
    }

    setSaveLoading(true);
    try {
      const fd = new FormData();

      // Scalar fields
      fd.append("name",        form.name.trim());
      fd.append("description", form.description.trim());
      fd.append("price",       form.price);
      fd.append("category",    form.category);
      fd.append("stock",       form.stock);
      fd.append("tags",        form.tags.trim());

      // ✅ Boolean as string — backend coerces with parseBool()
      fd.append("featured", String(form.featured));

      // ✅ New image files
      newImages.forEach((img) => fd.append("images", img));

      // ✅ Key must match controller: "removedImages"
      if (removedImages.length > 0) {
        fd.append("removedImages", JSON.stringify(removedImages));
      }

      await updateProduct(id, fd);
      toast.success("Product updated successfully!");
      navigate("/admin/products");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaveLoading(false);
    }
  };

  if (fetchLoading) return <LoadingSpinner text="Loading product…" />;

  const totalImages = existingImages.length + newImages.length;

  // ── Render ─────────────────────────────────────────────────────────────
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

      {/* Title */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: C.goldLight, border: `1px solid ${C.goldBorder}` }}
        >
          <Edit size={18} style={{ color: C.gold }} />
        </div>
        <div>
          <h2 className="text-xl font-black" style={{ color: C.text }}>
            Edit Product
          </h2>
          <p className="text-xs" style={{ color: C.textSub }}>
            Update product information
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* ── Images ───────────────────────────────────────────────── */}
        <FormSection title={`Images (${totalImages}/5)`}>
          <div className="flex flex-wrap gap-3">

            {/* Existing images from Cloudinary */}
            {existingImages.map((img, i) => (
              <div
                key={img.public_id ?? i}
                className="relative w-24 h-24 group"
              >
                <img
                  src={img.url}
                  alt={`Image ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                  style={{ border: `1px solid ${C.border}` }}
                />
                {i === 0 && (
                  <span
                    className="absolute bottom-1 left-1 text-[8px] font-black
                      px-1.5 py-0.5 rounded-md uppercase tracking-widest"
                    style={{ background: C.navy, color: "#fff" }}
                  >
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeExistingImage(img)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                    flex items-center justify-center text-white
                    opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: C.red }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}

            {/* New image previews */}
            {newPreviews.map((src, i) => (
              <div key={`new-${i}`} className="relative w-24 h-24 group">
                <img
                  src={src}
                  alt={`New ${i + 1}`}
                  className="w-full h-full object-cover rounded-xl"
                  style={{ border: `2px dashed ${C.gold}` }}
                />
                <span
                  className="absolute bottom-1 left-1 text-[8px] font-black
                    px-1.5 py-0.5 rounded-md uppercase tracking-widest"
                  style={{ background: C.gold, color: "#fff" }}
                >
                  New
                </span>
                <button
                  type="button"
                  onClick={() => removeNewImage(i)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full
                    flex items-center justify-center text-white
                    opacity-0 group-hover:opacity-100 transition-all"
                  style={{ background: C.red }}
                >
                  <X size={11} />
                </button>
              </div>
            ))}

            {/* Upload button */}
            {totalImages < 5 && (
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
                <span className="text-[10px] font-semibold">Add</span>
                {/* ✅ key remounts input to allow re-selecting same file */}
                <input
                  key={newImages.length}
                  type="file"
                  multiple
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleNewImages}
                  className="hidden"
                />
              </label>
            )}
          </div>

          <p className="text-[11px]" style={{ color: C.textMuted }}>
            Hover an image and click × to remove · Max 5 images total
          </p>
        </FormSection>

        {/* ── Product Details ──────────────────────────────────────── */}
        <FormSection title="Product Details">

          <div>
            <FieldLabel>Product Name</FieldLabel>
            <FocusInput
              name="name" value={form.name}
              onChange={handleChange}
              placeholder="Product name"
              error={errors.name}
            />
            {errors.name && (
              <p className="text-xs mt-1" style={{ color: C.red }}>
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <FieldLabel>Description</FieldLabel>
            <FocusInput
              as="textarea"
              name="description" value={form.description}
              onChange={handleChange}
              placeholder="Describe your product…"
              rows={4} error={errors.description}
            />
            {errors.description && (
              <p className="text-xs mt-1" style={{ color: C.red }}>
                {errors.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <FieldLabel>Price (USD)</FieldLabel>
              <FocusInput
                name="price" value={form.price}
                onChange={handleChange}
                type="number" min="0" step="0.01"
                placeholder="29.99" error={errors.price}
              />
              {errors.price && (
                <p className="text-xs mt-1" style={{ color: C.red }}>
                  {errors.price}
                </p>
              )}
            </div>
            <div>
              <FieldLabel>Stock</FieldLabel>
              <FocusInput
                name="stock" value={form.stock}
                onChange={handleChange}
                type="number" min="0"
                placeholder="10" error={errors.stock}
              />
              {errors.stock && (
                <p className="text-xs mt-1" style={{ color: C.red }}>
                  {errors.stock}
                </p>
              )}
            </div>
          </div>

          <div>
            <FieldLabel>Category</FieldLabel>
            <select
              name="category"
              value={form.category}
              onChange={handleChange}
              style={{ ...inputStyle(false, false), cursor: "pointer" }}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel optional>Tags</FieldLabel>
            <FocusInput
              name="tags" value={form.tags}
              onChange={handleChange}
              placeholder="handmade, crochet, gift"
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
                Show on homepage highlights
              </p>
            </div>
          </label>
        </FormSection>

        {/* ── Submit ─────────────────────────────────────────────────── */}
        <button
          type="submit"
          disabled={saveLoading}
          className="w-full py-3.5 rounded-2xl text-sm font-black
            tracking-wide transition-all duration-200 flex items-center
            justify-center gap-2 disabled:cursor-not-allowed"
          style={{
            background: saveLoading
              ? "rgba(19,33,60,0.15)"
              : `linear-gradient(135deg, ${C.navy}, ${C.navyLight})`,
            color:     "#fff",
            boxShadow: saveLoading
              ? "none"
              : "0 4px 20px rgba(19,33,60,0.2)",
          }}
        >
          {saveLoading ? (
            <><Upload size={15} className="animate-spin" /> Saving…</>
          ) : (
            "Save Changes"
          )}
        </button>
      </form>
    </motion.div>
  );
};

export default EditProduct;