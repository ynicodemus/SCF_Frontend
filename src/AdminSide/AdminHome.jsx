import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./AdminHome.css";

function AdminHome() {
  const navigate = useNavigate();

  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem("isSidebarOpen") === "true"
  );
  const [isFederationOpen, setIsFederationOpen] = useState(false);
  const [isDamayanOpen, setIsDamayanOpen] = useState(false);

  // ✅ Logout modal control
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    localStorage.setItem("isSidebarOpen", isSidebarOpen);
  }, [isSidebarOpen]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="admin-sidebar-header">Hello, Admin!</div>
        <ul className="admin-sidebar-list">
          <li>
            <Link to="/Admin/Dashboard" className="admin-link">
              Dashboard
            </Link>
          </li>

          {/* Federation Member Dropdown */}
          <li className="admin-dropdown">
            <div
              className={`admin-dropdown-header ${isFederationOpen ? "open" : ""}`}
              onClick={() => setIsFederationOpen(!isFederationOpen)}
            >
              <span>Federation Member</span>
              <span className={`arrow ${isFederationOpen ? "open" : ""}`}>▾</span>
            </div>
            {isFederationOpen && (
              <ul className="admin-submenu">
                <li>
                  <Link to="/Admin/FederationMembers" className="admin-sublink">
                    Members
                  </Link>
                </li>
                <li>
                  <Link to="/Admin/MemberRequest" className="admin-sublink">
                    Membership Requests
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Damayan Member Dropdown */}
          <li className="admin-dropdown">
            <div
              className={`admin-dropdown-header ${isDamayanOpen ? "open" : ""}`}
              onClick={() => setIsDamayanOpen(!isDamayanOpen)}
            >
              <span>Damayan Member</span>
              <span className={`arrow ${isDamayanOpen ? "open" : ""}`}>▾</span>
            </div>
            {isDamayanOpen && (
              <ul className="admin-submenu">
                <li>
                  <Link to="/Admin/DamayanMembers" className="admin-sublink">
                    Members
                  </Link>
                </li>
                <li>
                  <Link to="/Admin/DMemberRequest" className="admin-sublink">
                    Membership Requests
                  </Link>
                </li>
                <li>
                  <Link to="/Admin/DPaymentApproval" className="admin-sublink">
                    Payment Approval
                  </Link>
                </li>
                <li>
                  <Link to="/Admin/DClaimRequest" className="admin-sublink">
                    Claim Request
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li>
            <Link to="/admin/event" className="admin-link">
              Calendar
            </Link>
          </li>

          <li>
            <Link to="/Admin/Archive" className="admin-link">
              Archive
            </Link>
          </li>

          {/* 🚪 Logout Button */}
          <li>
            <button
              className="admin-link admin-logout-btn"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* Topbar */}
      <header
        className={`admin-topbar ${isSidebarOpen ? "shifted" : "full-width"}`}
      >
        <div className="admin-topbar-left">
          <button className="admin-toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? "✖" : "☰"}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main
        className={`admin-main-content ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
      >
        <Outlet />
      </main>

      {/* 🧾 Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out from the admin panel?</p>
            <div className="logout-modal-actions">
              <button className="logout-confirm-btn" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="logout-cancel-btn"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminHome;
