import { useState, useEffect } from "react";
import { getProducts } from "../services/api";

const useProducts = (params = {}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1, pages: 1, total: 0,
  });

  const key = JSON.stringify(params);

  useEffect(() => {
    let cancelled = false;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await getProducts(params);
        if (!cancelled) {
          setProducts(data.products);
          setPagination({ page: data.page, pages: data.pages, total: data.total });
        }
      } catch (err) {
        if (!cancelled)
          setError(err.response?.data?.message || "Failed to fetch");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetch();
    return () => { cancelled = true; };
  }, [key]);

  return { products, loading, error, pagination };
};

export default useProducts;