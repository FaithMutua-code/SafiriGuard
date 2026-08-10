import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PAGE_TITLES = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Platform overview and statistics",
  },
  "/vehicle-owners": {
    title: "Vehicle Owners",
    subtitle: "Manage registered vehicle owners",
  },
  "/vehicles": { title: "Vehicles", subtitle: "Manage registered vehicles" },
  "/iot-devices": {
    title: "IoT Devices",
    subtitle: "Monitor connected devices",
  },
  "/trips": { title: "Trips", subtitle: "View all recorded trips" },
  "/driving-behaviour": {
    title: "Driving Behaviour",
    subtitle: "Unsafe driving events",
  },
  "/system": {
    title: "System Management",
    subtitle: "Users, settings, and platform info",
  },
};

const TopBar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const page = PAGE_TITLES[location.pathname] || {
    title: "SafariGuard Admin",
    subtitle: "",
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <div className="topbar-title">{page.title}</div>
        {page.subtitle && (
          <div className="topbar-subtitle">{page.subtitle}</div>
        )}
      </div>
      <div className="topbar-right">
        <div className="topbar-badge">
          <div className="topbar-dot" />
          Super Admin
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          <span>⎋</span> Logout
        </button>
      </div>
    </header>
  );
};

export default TopBar;
