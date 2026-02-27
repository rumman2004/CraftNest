import { createContext, useContext, useState, useCallback } from "react";
import { getProducts, getProductById } from "../services/api";

const ProductContext = createContext();

export const ProductProvider = ({ children }) => {
  const [products, setProducts] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1, pages: 1, total: 0,
  });

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getProducts(params);
      setProducts(data.products);
      setPagination({ page: data.page, pages: data.pages, total: data.total });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProduct = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await getProductById(id);
      setCurrentProduct(data);
    } catch (err) {
      setError(err.response?.data?.message || "Product not found");
    } finally {
      setLoading(false);
    }
  }, []);

  const clearProduct = () => setCurrentProduct(null);

  return (
    <ProductContext.Provider
      value={{
        products, currentProduct, loading, error, pagination,
        fetchProducts, fetchProduct, clearProduct,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
};

export const useProduct = () => {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProduct must be inside ProductProvider");
  return ctx;
};