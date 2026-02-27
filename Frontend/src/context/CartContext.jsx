import {
  createContext, useContext, useReducer, useEffect, useCallback,
} from "react";

const CartContext = createContext();

// ── Reducer ────────────────────────────────────────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {
    case "SET":
      return action.payload;

    case "ADD": {
      const exists = state.find((i) => i._id === action.payload._id);
      if (exists) {
        return state.map((i) =>
          i._id === action.payload._id
            ? { ...i, quantity: Math.min(i.quantity + 1, i.stock) }
            : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }

    case "REMOVE":
      return state.filter((i) => i._id !== action.payload);

    case "UPDATE_QTY":
      return state.map((i) =>
        i._id === action.payload.id
          ? { ...i, quantity: action.payload.qty }
          : i
      );

    case "CLEAR":
      return [];

    default:
      return state;
  }
};

// ── Persist helpers ────────────────────────────────────────────────────────
const CART_KEY = "craftnest_cart";

const loadCart = () => {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const saveCart = (items) => {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  } catch {
    /* storage full — silently ignore */
  }
};

const clearStoredCart = () => {
  try {
    localStorage.removeItem(CART_KEY);
  } catch { /* ignore */ }
};

// ══════════════════════════════════════════════════════════════════════════
export const CartProvider = ({ children }) => {
  const [items, dispatch] = useReducer(cartReducer, [], loadCart);

  // Persist to localStorage on every change
  useEffect(() => {
    saveCart(items);
  }, [items]);

  // ── Public actions ────────────────────────────────────────────────────
  const addToCart = useCallback((product) => {
    dispatch({ type: "ADD", payload: product });
  }, []);

  const removeFromCart = useCallback((id) => {
    dispatch({ type: "REMOVE", payload: id });
  }, []);

  const updateQuantity = useCallback((id, qty) => {
    dispatch({ type: "UPDATE_QTY", payload: { id, qty } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
    clearStoredCart();
  }, []);

  // Called on logout — wipe cart from memory AND storage
  const resetCart = useCallback(() => {
    dispatch({ type: "CLEAR" });
    clearStoredCart();
  }, []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        resetCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside <CartProvider>");
  return ctx;
};