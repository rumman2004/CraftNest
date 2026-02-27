// ── Format price to INR ────────────────────────────────────────────────────
export const formatPrice = (amount) =>
  new Intl.NumberFormat("en-IN", {
    style:    "currency",
    currency: "INR",
  }).format(amount);

// ── Calculate shipping ─────────────────────────────────────────────────────
export const calcShipping = (itemsPrice) => (itemsPrice >= 500 ? 0 : 50);

// ── Paginate array ─────────────────────────────────────────────────────────
export const paginate = (array, page = 1, limit = 12) => {
  const start = (page - 1) * limit;
  return {
    data:       array.slice(start, start + limit),
    total:      array.length,
    page,
    totalPages: Math.ceil(array.length / limit),
  };
};

// ── Truncate text ──────────────────────────────────────────────────────────
export const truncate = (str, n = 100) =>
  str.length > n ? str.slice(0, n) + "…" : str;