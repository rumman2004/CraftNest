import { useState }  from "react";
import { Outlet }    from "react-router-dom";
import { Toaster }   from "react-hot-toast";
import AdminSidebar  from "./AdminSidebar";
import AdminNav      from "./AdminNav";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#f0f2f5" }}>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius:   "14px",
            background:     "#ffffff",
            color:          "#13213c",
            fontSize:       "13px",
            fontWeight:     "500",
            border:         "1px solid rgba(19,33,60,0.08)",
            boxShadow:      "0 8px 32px rgba(19,33,60,0.12)",
            padding:        "12px 16px",
          },
          success: {
            iconTheme: { primary: "#d4b26a", secondary: "#ffffff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#ffffff" },
          },
        }}
      />

      {/* Sidebar */}
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        <AdminNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 sm:p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;