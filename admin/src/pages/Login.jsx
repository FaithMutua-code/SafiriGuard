import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Invalid credentials. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-orb-1" />
      <div className="login-orb-2" />

      <div className="login-card">
        <div className="login-logo-wrap">
          <div className="login-shield">🛡️</div>
          <div>
            <div className="login-brand">SafariGuard</div>
            <div className="login-tagline">Administrator Platform</div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="login-error">
              <span>⚠️</span>
              {error}
            </div>
          )}

          <div className="login-input-wrap">
            <span className="login-input-icon">✉️</span>
            <input
              id="admin-email"
              type="email"
              className="login-input"
              placeholder="admin@safariguard.co.ke"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div className="login-input-wrap">
            <span className="login-input-icon">🔒</span>
            <input
              id="admin-password"
              type={showPassword ? "text" : "password"}
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              style={{ paddingRight: "44px" }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                color: "var(--text-light)",
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? (
              <div className="spinner" />
            ) : (
              <>
                Sign In to Admin Portal <span>→</span>
              </>
            )}
          </button>
        </form>

        <div className="login-hint">
          Default credentials: <code>admin@safariguard.co.ke</code> /{" "}
          <code>Admin@1234</code>
        </div>
      </div>
    </div>
  );
};

export default Login;
