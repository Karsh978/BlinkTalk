import { Link, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare, Settings, User } from "lucide-react";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <style>{`
        .nav-link {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 7px 13px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          transition: background 0.15s, color 0.15s, border-color 0.15s;
          border: 1.5px solid transparent;
          color: #8b8fa8;
          cursor: pointer;
          background: transparent;
          font-family: inherit;
          white-space: nowrap;
        }
        .nav-link:hover {
          background: #f4f4fa;
          color: #1a1a2e;
        }
        .nav-link.active {
          background: #ede9ff;
          color: #6c63ff;
          border-color: rgba(108,99,255,0.2);
        }
        .nav-link.logout:hover {
          background: #fff0f2;
          color: #ff4d6d;
          border-color: rgba(255,77,109,0.15);
        }

        .nav-avatar {
          width: 22px; height: 22px;
          border-radius: 50%;
          object-fit: cover;
          border: 1.5px solid rgba(108,99,255,0.3);
        }

        .nav-logo-icon {
          width: 34px; height: 34px;
          border-radius: 10px;
          background: linear-gradient(135deg, #6c63ff, #a78bfa);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 10px rgba(108,99,255,0.25);
          transition: transform 0.2s, box-shadow 0.2s;
          flex-shrink: 0;
        }
        .nav-logo-wrap:hover .nav-logo-icon {
          transform: scale(1.07);
          box-shadow: 0 4px 16px rgba(108,99,255,0.4);
        }

        .nav-divider {
          width: 1px; height: 20px;
          background: #ebebf5;
          margin: 0 4px;
        }

        @media (max-width: 480px) {
          .nav-label { display: none; }
        }
      `}</style>

      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          height: 56,
          zIndex: 50,
          background: "rgba(255,255,255,0.94)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderBottom: "1px solid #ebebf5",
          fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          boxShadow: "0 1px 10px rgba(0,0,0,0.05)",
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: "0 auto",
            padding: "0 20px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* ── Logo ── */}
          <Link
            to="/"
            className="nav-logo-wrap"
            style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}
          >
            <div className="nav-logo-icon">
              <MessageSquare size={16} color="#fff" />
            </div>
            <span style={{
              fontSize: 16,
              fontWeight: 800,
              color: "#1a1a2e",
              letterSpacing: "-0.03em",
            }}>
              Chat<span style={{ color: "#6c63ff" }}>App</span>
            </span>
          </Link>

          {/* ── Nav Actions ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <Link
              to="/settings"
              className={`nav-link${isActive("/settings") ? " active" : ""}`}
            >
              <Settings size={15} />
              <span className="nav-label">Settings</span>
            </Link>

            {authUser && (
              <>
                <div className="nav-divider" />

                <Link
                  to="/profile"
                  className={`nav-link${isActive("/profile") ? " active" : ""}`}
                >
                  {authUser.profilePic ? (
                    <img src={authUser.profilePic} alt="" className="nav-avatar" />
                  ) : (
                    <User size={15} />
                  )}
                  <span className="nav-label">Profile</span>
                </Link>

                <button onClick={logout} className="nav-link logout">
                  <LogOut size={15} />
                  <span className="nav-label">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Spacer */}
      <div style={{ height: 56, flexShrink: 0 }} />
    </>
  );
};

export default Navbar;