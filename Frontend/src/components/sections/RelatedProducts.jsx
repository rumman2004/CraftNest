import { useState, useEffect } from "react";
import { motion }              from "framer-motion";
import { Sparkles }            from "lucide-react";
import { getProducts }         from "../../services/api";
import ProductCard             from "../ui/ProductCard";

const RelatedProducts = ({ category, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading,  setLoading ] = useState(true);

  useEffect(() => {
    if (!category) return;
    setLoading(true);
    getProducts({ category })
      .then(({ data }) => {
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.products)
          ? data.products
          : [];
        setProducts(
          list.filter((p) => p._id !== currentProductId).slice(0, 4)
        );
      })
      .catch((err) => console.error("Related products error:", err))
      .finally(() => setLoading(false));
  }, [category, currentProductId]);

  if (!loading && products.length === 0) return null;

  return (
    <section
      className="py-12 sm:py-16"
      style={{ background: "#f7f8fa" }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center
              flex-shrink-0"
            style={{
              background: "rgba(212,178,106,0.12)",
              border:     "1px solid rgba(212,178,106,0.25)",
            }}
          >
            <Sparkles size={16} style={{ color: "#d4b26a" }} />
          </div>
          <div>
            <h2
              className="text-xl sm:text-2xl font-black"
              style={{ color: "#13213c" }}
            >
              You Might Also Like
            </h2>
            <p className="text-xs mt-0.5" style={{ color: "#4f6080" }}>
              More from the <span className="font-semibold">{category}</span> collection
            </p>
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="rounded-2xl animate-pulse"
                style={{
                  height:     320,
                  background: "rgba(19,33,60,0.06)",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product, i) => (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0  }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default RelatedProducts;