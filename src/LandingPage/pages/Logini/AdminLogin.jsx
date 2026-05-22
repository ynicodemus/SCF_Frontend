import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../../../axios";
import "./css/adminlogin.css";  // ✅ Separate CSS file

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginClick = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/admins/login/", { email, password });
      if (res.data?.token) {
        localStorage.setItem("adminToken", res.data.token);
        navigate("/Admin/Dashboard");
      } else {
        setError(res.data.error || "Login failed: no token returned");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      {/* LEFT SIDE - IMAGE */}
      <div className="admin-login-image"></div>

      {/* RIGHT SIDE - FORM */}
      <div className="admin-login-form">
        <img 
          src="/images/logo.png" 
          alt="System Logo" 
          className="admin-login-logo" 
        />
        <h2>Admin Login</h2>

        <div className="form-section">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter admin email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label>Password</label>
          <input
            type="password"
            placeholder="Enter password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="forgot-password">
          <Link to="/admin/forgot-password">Forgot password?</Link>
        </div>

        {error && <p className="error-text">{error}</p>}

        <button
          type="button"
          className="login-btn"
          onClick={handleLoginClick}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <button
          type="button"
          onClick={() => navigate("/Account")}
          disabled={loading}
          className="back-btn"
        >
          Back to Senior Citizen Login
        </button>
      </div>
    </div>
  );
}

export default AdminLogin;
