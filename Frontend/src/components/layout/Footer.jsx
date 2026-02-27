import { Link }    from "react-router-dom";
import { Heart }   from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const Footer = () => {
  const year              = new Date().getFullYear();
  const { isAuthenticated } = useAuth();

  // ✅ All paths derived from auth state — matches App.jsx routes exactly
  const homePath = isAuthenticated ? "/user/home"     : "/home";
  const shopPath = isAuthenticated ? "/user/products" : "/shop";

  const quickLinks = [
    { to: homePath,           label: "Home"    },
    { to: shopPath,           label: "Shop"    },
    { to: "/about",           label: "About"   },
    // ✅ Hide login if already authenticated
    ...(!isAuthenticated
      ? [{ to: "/login",  label: "Login"  },
         { to: "/signup", label: "Sign Up" }]
      : [{ to: "/user/orders",  label: "My Orders"  },
         { to: "/user/profile", label: "My Profile" }]
    ),
  ];

  const shopCategories = [
    "Crochet",
    "Embroidery",
    "Pipe Cleaner",
    "Woolen",
  ];

  const linkStyle = { color: "#4f545f" };
  const hoverOn   = (e) => (e.currentTarget.style.color = "#d4b26a");
  const hoverOff  = (e) => (e.currentTarget.style.color = "#4f545f");

  return (
    <footer
      className="mt-auto backdrop-blur-xl"
      style={{
        background: "rgba(255,255,255,0.95)",
        borderTop:  "1px solid rgba(19,33,60,0.08)",
      }}
    >
      {/* Gold top accent */}
      <div
        className="h-[2px] w-full"
        style={{
          background:
            "linear-gradient(to right,#13213c,#d4b26a,#264670)",
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

          {/* ── Brand ───────────────────────────────────────────── */}
          <div className="sm:col-span-2">
            <Link
              to={homePath}
              className="flex items-center gap-2.5 mb-4 w-fit"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center
                  justify-center shadow-md flex-shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg,#13213c,#264670)",
                }}
              >
                <Heart
                  size={16}
                  className="text-white"
                  strokeWidth={2}
                  fill="rgba(212,178,106,0.5)"
                />
              </div>
              <span
                className="text-2xl font-black tracking-tight"
                style={{
                  background:           "linear-gradient(to right,#13213c,#264670)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor:  "transparent",
                  backgroundClip:       "text",
                }}
              >
                CraftNest
              </span>
            </Link>

            <p
              className="text-sm leading-relaxed max-w-xs mb-4"
              style={{ color: "#4f545f" }}
            >
              Handcrafted with love. Every piece is unique — made from
              our hands to your heart.
            </p>

            {/* Auth status pill */}
            {isAuthenticated ? (
              <span
                className="inline-flex items-center gap-1.5
                  text-[11px] font-semibold px-3 py-1 rounded-full"
                style={{
                  background: "rgba(34,197,94,0.08)",
                  color:      "#15803d",
                  border:     "1px solid rgba(34,197,94,0.2)",
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Signed in
              </span>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5
                  text-[11px] font-semibold px-3 py-1 rounded-full
                  transition-all duration-150"
                style={{
                  background: "rgba(212,178,106,0.1)",
                  color:      "#92670a",
                  border:     "1px solid rgba(212,178,106,0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background =
                    "rgba(212,178,106,0.18)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background =
                    "rgba(212,178,106,0.1)";
                }}
              >
                Sign in to your account →
              </Link>
            )}
          </div>

          {/* ── Shop categories ─────────────────────────────────── */}
          <div>
            <h4
              className="font-bold mb-4 text-xs tracking-widest uppercase"
              style={{ color: "#13213c" }}
            >
              Shop
            </h4>
            <ul className="space-y-2.5">
              {shopCategories.map((cat) => (
                <li key={cat}>
                  <Link
                    // ✅ Correct category path based on auth state
                    to={`${shopPath}?category=${cat}`}
                    className="text-sm transition-colors duration-200"
                    style={linkStyle}
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Quick links ─────────────────────────────────────── */}
          <div>
            <h4
              className="font-bold mb-4 text-xs tracking-widest uppercase"
              style={{ color: "#13213c" }}
            >
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm transition-colors duration-200"
                    style={linkStyle}
                    onMouseEnter={hoverOn}
                    onMouseLeave={hoverOff}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ── Bottom bar ──────────────────────────────────────────── */}
        <div
          className="mt-8 pt-6 flex flex-col sm:flex-row justify-between
            items-center gap-3"
          style={{ borderTop: "1px solid rgba(19,33,60,0.08)" }}
        >
          <p className="text-xs" style={{ color: "#4f545f" }}>
            © {year} CraftNest. All rights reserved. Made with ❤️
          </p>
          <p className="text-xs" style={{ color: "#4f545f" }}>
            100% Handmade · Eco-Friendly · Unique
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;