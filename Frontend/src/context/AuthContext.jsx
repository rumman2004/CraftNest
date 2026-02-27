import {
  createContext, useContext, useReducer,
  useEffect, useState, useCallback,
} from "react";

const AuthContext = createContext();

const STORAGE_KEY = "craftnest_user";

// ── Reducer ────────────────────────────────────────────────────────────────
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN":
      return { user: action.payload, isAuthenticated: true  };
    case "LOGOUT":
      return { user: null,           isAuthenticated: false };
    case "UPDATE":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// ── Helper: check JWT expiry ───────────────────────────────────────────────
const isTokenExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 < Date.now();
  } catch {
    return true;
  }
};

// ── Helper: restore from localStorage ─────────────────────────────────────
const restoreUser = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    if (!parsed?.token) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    if (isTokenExpired(parsed.token)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

// ══════════════════════════════════════════════════════════════════════════
export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [state, dispatch] = useReducer(authReducer, {
    user:            null,
    isAuthenticated: false,
  });

  // Restore session on mount
  useEffect(() => {
    const user = restoreUser();
    if (user) dispatch({ type: "LOGIN", payload: user });
    setLoading(false);
  }, []);

  // Keep localStorage in sync
  useEffect(() => {
    if (state.user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [state.user]);

  // ── Actions ────────────────────────────────────────────────────────────
  const login = useCallback((userData) => {
    dispatch({ type: "LOGIN", payload: userData });
  }, []);

  // ✅ logout now accepts an optional resetCart callback
  // so CartContext can be wiped on logout without circular imports
  const logout = useCallback((resetCartFn) => {
    localStorage.removeItem(STORAGE_KEY);
    dispatch({ type: "LOGOUT" });
    if (typeof resetCartFn === "function") resetCartFn();
  }, []);

  const updateUser = useCallback((data) => {
    dispatch({ type: "UPDATE", payload: data });
  }, []);

  const isAdmin = state.user?.role === "admin";
  const token   = state.user?.token ?? null;

  return (
    <AuthContext.Provider
      value={{
        ...state,
        loading,
        isAdmin,
        token,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
};