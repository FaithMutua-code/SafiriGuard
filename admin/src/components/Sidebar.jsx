import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "🏠", label: "Dashboard" },
  { to: "/vehicle-owners", icon: "👤", label: "Vehicle Owners" },
  { to: "/vehicles", icon: "🚗", label: "Vehicles" },
  { to: "/iot-devices", icon: "📡", label: "IoT Devices" },
  { to: "/trips", icon: "🗺️", label: "Trips" },
  { to: "/driving-behaviour", icon: "⚠️", label: "Driving Behaviour" },
  { to: "/system", icon: "⚙️", label: "System" },
];

const Sidebar = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const initials = admin?.name
    ? admin.name
        .split(" ")
        .map((word) => word[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "SA";

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-logo">🛡️</div>

        <div>
          <div className="sidebar-title">SafariGuard</div>
          <div className="sidebar-subtitle">Admin Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        <div className="sidebar-section-label">Main Menu</div>

        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `sidebar-link${isActive ? " active" : ""}`
            }
          >
            <span className="sidebar-link-icon">{item.icon}</span>

            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer / User */}
      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{initials}</div>

          <div className="sidebar-user-info">
            <div className="sidebar-user-name">{admin?.name || "Admin"}</div>

            <div className="sidebar-user-role">Super Administrator</div>
          </div>
        </div>

        {/* Logout */}
        <button type="button" className="sidebar-logout" onClick={handleLogout}>
          <span>🚪</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
