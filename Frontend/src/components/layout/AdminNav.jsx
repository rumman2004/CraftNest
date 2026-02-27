import { Link, useNavigate }          from "react-router-dom";
import { Menu, Bell, ExternalLink,
         ChevronDown, LogOut, User }  from "lucide-react";
import { useState }                   from "react";
import { useAuth }                    from "../../context/AuthContext";

const AdminNav = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = () => {
    setDropOpen(false);
    logout();
    navigate("/");
  };

  return (
    <header
      className="sticky top-0 z-40 px-4 sm:px-6 h-16
        flex items-center justify-between flex-shrink-0"
      style={{
        background:   "rgba(255,255,255,0.98)",
        borderBottom: "1px solid rgba(19,33,60,0.06)",
        boxShadow:    "0 1px 16px rgba(19,33,60,0.06)",
        backdropFilter: "blur(12px)",
      }}
    >

      {/* ── Left ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">

        {/* Hamburger */}
        <button
          onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center
            rounded-xl transition-all duration-200"
          style={{
            background: "rgba(19,33,60,0.04)",
            border:     "1px solid rgba(19,33,60,0.07)",
            color:      "#4f545f",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(19,33,60,0.08)";
            e.currentTarget.style.color      = "#13213c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(19,33,60,0.04)";
            e.currentTarget.style.color      = "#4f545f";
          }}
        >
          <Menu size={18} />
        </button>

        {/* Divider */}
        <div
          className="hidden sm:block w-px h-6"
          style={{ background: "rgba(19,33,60,0.08)" }}
        />

        {/* Title block */}
        <div>
          <h1
            className="font-black text-sm sm:text-[15px] tracking-tight
              leading-none"
            style={{ color: "#13213c" }}
          >
            Admin Panel
          </h1>
          <p
            className="text-[11px] mt-0.5 font-medium hidden sm:block"
            style={{ color: "#d4b26a" }}
          >
            Welcome back, {user?.name?.split(" ")[0]}
          </p>
        </div>
      </div>

      {/* ── Right ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 sm:gap-2">

        {/* View Store pill */}
        <Link
          to="/home"
          className="hidden sm:flex items-center gap-1.5 h-8 px-3
            rounded-lg text-[11px] font-bold tracking-wide
            transition-all duration-200"
          style={{
            background: "linear-gradient(135deg,rgba(212,178,106,0.12),rgba(38,70,112,0.08))",
            color:      "#b8922e",
            border:     "1px solid rgba(212,178,106,0.3)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,rgba(212,178,106,0.22),rgba(38,70,112,0.14))";
            e.currentTarget.style.color      = "#d4b26a";
            e.currentTarget.style.borderColor= "rgba(212,178,106,0.5)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,rgba(212,178,106,0.12),rgba(38,70,112,0.08))";
            e.currentTarget.style.color      = "#b8922e";
            e.currentTarget.style.borderColor= "rgba(212,178,106,0.3)";
          }}
        >
          <ExternalLink size={11} strokeWidth={2.5} />
          View Store
        </Link>

        {/* Bell */}
        <button
          className="relative w-9 h-9 flex items-center justify-center
            rounded-xl transition-all duration-200"
          style={{
            background: "rgba(19,33,60,0.03)",
            border:     "1px solid rgba(19,33,60,0.07)",
            color:      "#4f545f",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(19,33,60,0.07)";
            e.currentTarget.style.color      = "#13213c";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(19,33,60,0.03)";
            e.currentTarget.style.color      = "#4f545f";
          }}
        >
          <Bell size={16} strokeWidth={2} />
          {/* Notification dot */}
          <span
            className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full"
            style={{
              background: "#d4b26a",
              boxShadow:  "0 0 0 2px #fff",
            }}
          />
        </button>

        {/* Thin divider */}
        <div
          className="w-px h-6 hidden sm:block"
          style={{ background: "rgba(19,33,60,0.08)" }}
        />

        {/* Avatar dropdown trigger */}
        <div className="relative">
          <button
            onClick={() => setDropOpen((p) => !p)}
            className="flex items-center gap-2 h-9 pl-1.5 pr-2.5
              rounded-xl transition-all duration-200"
            style={{
              background: dropOpen
                ? "rgba(19,33,60,0.06)"
                : "rgba(19,33,60,0.03)",
              border: dropOpen
                ? "1px solid rgba(19,33,60,0.12)"
                : "1px solid rgba(19,33,60,0.07)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(19,33,60,0.06)";
            }}
            onMouseLeave={(e) => {
              if (!dropOpen)
                e.currentTarget.style.background = "rgba(19,33,60,0.03)";
            }}
          >
            {/* Avatar */}
            <div
              className="w-6 h-6 rounded-lg flex items-center justify-center
                text-white text-[10px] font-black flex-shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, #d4b26a 0%, #264670 100%)",
                boxShadow: "0 2px 8px rgba(19,33,60,0.2)",
              }}
            >
              {user?.name?.[0]?.toUpperCase()}
            </div>

            <span
              className="hidden sm:block text-[11px] font-bold
                max-w-[72px] truncate"
              style={{ color: "#13213c" }}
            >
              {user?.name?.split(" ")[0]}
            </span>

            <ChevronDown
              size={11}
              strokeWidth={2.5}
              style={{
                color:      "#4f545f",
                transform:  dropOpen ? "rotate(180deg)" : "rotate(0)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {/* ── Dropdown ──────────────────────────────────────────── */}
          {dropOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setDropOpen(false)}
              />
              <div
                className="absolute right-0 top-full mt-2 w-48
                  rounded-2xl overflow-hidden z-20"
                style={{
                  background: "#ffffff",
                  border:     "1px solid rgba(19,33,60,0.08)",
                  boxShadow:
                    "0 4px 6px -1px rgba(19,33,60,0.08)," +
                    "0 16px 40px -4px rgba(19,33,60,0.14)",
                }}
              >
                {/* User info header */}
                <div
                  className="px-4 py-3 flex items-center gap-3"
                  style={{
                    background:
                      "linear-gradient(135deg,rgba(212,178,106,0.07),rgba(38,70,112,0.07))",
                    borderBottom: "1px solid rgba(19,33,60,0.06)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center
                      justify-center text-white text-xs font-black
                      flex-shrink-0"
                    style={{
                      background:
                        "linear-gradient(135deg, #d4b26a 0%, #264670 100%)",
                      boxShadow: "0 2px 8px rgba(19,33,60,0.2)",
                    }}
                  >
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-xs font-bold truncate leading-tight"
                      style={{ color: "#13213c" }}
                    >
                      {user?.name}
                    </p>
                    <p
                      className="text-[10px] truncate mt-0.5"
                      style={{ color: "#4f545f" }}
                    >
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">

                  {/* View store — mobile only */}
                  <Link
                    to="/home"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 mx-1.5 px-3 py-2
                      rounded-xl text-xs font-semibold transition-all
                      duration-150 sm:hidden"
                    style={{ color: "#4f545f" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(212,178,106,0.08)";
                      e.currentTarget.style.color = "#d4b26a";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color      = "#4f545f";
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center
                        justify-center flex-shrink-0"
                      style={{ background: "rgba(212,178,106,0.1)" }}
                    >
                      <ExternalLink size={12} style={{ color: "#d4b26a" }} />
                    </div>
                    View Store
                  </Link>

                  {/* Profile */}
                  <Link
                    to="/admin/profile"
                    onClick={() => setDropOpen(false)}
                    className="flex items-center gap-3 mx-1.5 px-3 py-2
                      rounded-xl text-xs font-semibold transition-all
                      duration-150"
                    style={{ color: "#4f545f" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(19,33,60,0.04)";
                      e.currentTarget.style.color = "#13213c";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color      = "#4f545f";
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center
                        justify-center flex-shrink-0"
                      style={{ background: "rgba(19,33,60,0.05)" }}
                    >
                      <User size={12} style={{ color: "#264670" }} />
                    </div>
                    My Profile
                  </Link>

                  {/* Divider */}
                  <div
                    className="mx-3 my-1.5"
                    style={{
                      height:     "1px",
                      background: "rgba(19,33,60,0.06)",
                    }}
                  />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 mx-1.5 px-3
                      py-2 rounded-xl text-xs font-bold transition-all
                      duration-150"
                    style={{
                      color: "#ef4444",
                      width: "calc(100% - 12px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(239,68,68,0.07)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-lg flex items-center
                        justify-center flex-shrink-0"
                      style={{ background: "rgba(239,68,68,0.09)" }}
                    >
                      <LogOut size={12} style={{ color: "#ef4444" }} />
                    </div>
                    Sign Out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default AdminNav;