import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import VehicleOwners from "./pages/VehicleOwners";
import Vehicles from "./pages/Vehicles";
import IoTDevices from "./pages/IoTDevices";
import Trips from "./pages/Trips";
import DrivingBehaviour from "./pages/DrivingBehaviour";
import SystemManagement from "./pages/SystemManagement";

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "16px",
          background: "var(--bg)",
        }}
      >
        <div style={{ fontSize: "40px" }}>🛡️</div>
        <div
          className="spinner spinner-dark"
          style={{ width: "32px", height: "32px", borderWidth: "3px" }}
        />
        <div style={{ color: "var(--text-muted)", fontSize: "14px" }}>
          Loading SafariGuard Admin…
        </div>
      </div>
    );
  return token ? children : <Navigate to="/login" replace />;
};

const Layout = ({ children }) => (
  <div className="app-layout">
    <Sidebar />
    <div className="main-content">
      <TopBar />
      <main className="page-content">{children}</main>
    </div>
  </div>
);

const App = () => (
  <AuthProvider>
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Layout>
                <Dashboard />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicle-owners"
          element={
            <PrivateRoute>
              <Layout>
                <VehicleOwners />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/vehicles"
          element={
            <PrivateRoute>
              <Layout>
                <Vehicles />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/iot-devices"
          element={
            <PrivateRoute>
              <Layout>
                <IoTDevices />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/trips"
          element={
            <PrivateRoute>
              <Layout>
                <Trips />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/driving-behaviour"
          element={
            <PrivateRoute>
              <Layout>
                <DrivingBehaviour />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route
          path="/system"
          element={
            <PrivateRoute>
              <Layout>
                <SystemManagement />
              </Layout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  </AuthProvider>
);

export default App;
