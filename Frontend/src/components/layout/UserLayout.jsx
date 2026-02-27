import { Outlet }  from "react-router-dom";
import { Toaster } from "react-hot-toast";
import UserNav     from "./UserNav";
import Footer      from "./Footer";

const UserLayout = () => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundColor: "var(--color-oxford-gray-light)",
        color: "var(--color-oxford-navy)",
      }}
    >
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            borderRadius:   "16px",
            background:     "rgba(255,255,255,0.97)",
            backdropFilter: "blur(12px)",
            border:         "1px solid rgba(212,178,106,0.25)",
            color:          "#13213c",
            fontSize:       "14px",
            fontWeight:     "500",
            boxShadow:      "0 8px 32px rgba(19,33,60,0.1)",
            padding:        "12px 16px",
          },
          success: {
            iconTheme: {
              primary:   "#d4b26a",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary:   "#dc2626",
              secondary: "#ffffff",
            },
          },
        }}
      />
      <UserNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default UserLayout;