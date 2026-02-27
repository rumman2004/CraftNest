import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }    from "./context/AuthContext";
import { CartProvider }    from "./context/CartContext";
import { ProductProvider } from "./context/ProductContext";

import PublicLayout from "./components/layout/PublicLayout";
import UserLayout   from "./components/layout/UserLayout";
import AdminLayout  from "./components/layout/AdminLayout";

import { AdminRoute, UserRoute } from "./components/common/ProtectedRoute";

import Landing            from "./pages/Landing";
import Login              from "./pages/Login";
import SignUp             from "./pages/SignUp";
import PublicHome         from "./pages/public/PublicHome";
import PublicViewProducts from "./pages/public/PublicViewProducts";
import About              from "./pages/public/About";

import UserHome     from "./pages/users/UserHome";
import Cart         from "./pages/users/Cart";
import Checkout     from "./pages/users/Checkout";
import OrderHistory from "./pages/users/OrderHistory";
import OrderDetail  from "./pages/users/OrderDetail";
import UserProfile  from "./pages/users/UserProfile";
import Products     from "./pages/users/UserViewProducts";

import Dashboard         from "./pages/admin/Dashboard";
import AdminProductsList from "./pages/admin/AdminProductsList";
import AddProduct        from "./pages/admin/AddProduct";
import EditProduct       from "./pages/admin/EditProduct";
import Inventory         from "./pages/admin/Inventory";
import Orders            from "./pages/admin/Orders";
import Sales             from "./pages/admin/Sales";
import Analysis          from "./pages/admin/Analysis";
import AdminProfile      from "./pages/admin/AdminProfile";
import UsersPage         from "./pages/admin/Users";

const App = () => {
  return (
    <BrowserRouter
      future={{
        v7_startTransition:   true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <ProductProvider>
            <Routes>

              <Route path="/" element={<Landing />} />

              <Route path="/login"  element={<Login  />} />
              <Route path="/signup" element={<SignUp />} />

              {/* ── Public Routes ──────────────────────────── */}
              <Route element={<PublicLayout />}>
                <Route path="/home"        element={<PublicHome />} />
                <Route path="/shop"        element={<PublicViewProducts view="list"   />} />
                {/* ✅ Public product detail */}
                <Route path="/shop/:id"    element={<PublicViewProducts view="detail" />} />
                <Route path="/about"       element={<About />} />
              </Route>

              {/* ── User Routes ────────────────────────────── */}
              <Route
                element={
                  <UserRoute>
                    <UserLayout />
                  </UserRoute>
                }
              >
                <Route path="/user/home"           element={<UserHome     />} />
                <Route path="/user/cart"           element={<Cart         />} />
                <Route path="/user/checkout"       element={<Checkout     />} />
                <Route path="/user/products"       element={<Products view="list"   />} />
                {/* ✅ User product detail — was MISSING */}
                <Route path="/user/products/:id"   element={<Products view="detail" />} />
                <Route path="/user/orders"         element={<OrderHistory />} />
                <Route path="/user/orders/:id"     element={<OrderDetail  />} />
                <Route path="/user/profile"        element={<UserProfile  />} />
              </Route>

              {/* ── Admin Routes ───────────────────────────── */}
              <Route
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard"         element={<Dashboard         />} />
                <Route path="/admin/products"          element={<AdminProductsList />} />
                <Route path="/admin/products/add"      element={<AddProduct        />} />
                <Route path="/admin/products/edit/:id" element={<EditProduct       />} />
                <Route path="/admin/inventory"         element={<Inventory         />} />
                <Route path="/admin/orders"            element={<Orders            />} />
                <Route path="/admin/sales"             element={<Sales             />} />
                <Route path="/admin/analysis"          element={<Analysis          />} />
                <Route path="/admin/users"             element={<UsersPage         />} />
                <Route path="/admin/profile"           element={<AdminProfile      />} />
              </Route>

              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </ProductProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;