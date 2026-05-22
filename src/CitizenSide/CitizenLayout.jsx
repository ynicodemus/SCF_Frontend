import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "./css/navbar.css";

function CitizenLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMember, setIsMember] = useState(localStorage.getItem("isMember") === "true");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [firstName, setFirstName] = useState(localStorage.getItem("first_name") || "Citizen");

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

const handleLogout = () => {
  try {
    // Common auth/session keys
    localStorage.removeItem("citizenToken");
    localStorage.removeItem("adminToken");
    localStorage.removeItem("token");
    localStorage.removeItem("id_number");
    localStorage.removeItem("isMember");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("email");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");

    // Membership-related keys
    localStorage.removeItem("membershipSubmitted");
    localStorage.removeItem("approvedIdNumber");

    // Any other possibly stored user/profile blobs
    localStorage.removeItem("user");
    localStorage.removeItem("profile");
    localStorage.removeItem("user_profile");

    // Also clear sessionStorage (in case login stored stuff there)
    try {
      sessionStorage.removeItem("email");
      sessionStorage.removeItem("userEmail");
      sessionStorage.clear();
    } catch (e) {
      console.warn("sessionStorage clear failed", e);
    }

    // If you really want to be aggressive (uncomment if ok):
    // localStorage.clear();

  } catch (err) {
    console.error("logout cleanup error", err);
  } finally {
    // force full reload to clear any in-memory state that might still reflect old user
    navigate("/Account"); // replace with your login route
  }
};

  useEffect(() => {
    const handleStorageChange = () => {
      setIsMember(localStorage.getItem("isMember") === "true");
      setFirstName(localStorage.getItem("first_name") || "Citizen");
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  return (
    <div className="citLay-layout">
      {/* ====================== SIDEBAR ====================== */}
      <aside className={`citLay-sidebar ${isSidebarOpen ? "open" : "closed"}`}>
        <div className="citLay-sidebar-header">
           <span className="citLay-name">Good day!</span>
        </div>

        <ul className="citLay-sidebar-list">
          {isMember ? (
            <>
              <li>
                <Link to="/Citizen/MyProfile" className="citLay-link">My Profile</Link>
              </li>
              <li>
                <Link to="/citizen/Damayan" className="citLay-link">Damayan</Link>
              </li>
              <li>
                <Link to="/citizen/Calendar" className="citLay-link">Calendar</Link>
              </li>
              {/* <li>
                <Link to="/citizen/CNotification" className="citLay-link">Notifications</Link>
              </li> */}
            </>
          ) : (
            <>
              <li>
                <Link to="/citizen/RequestMember" className="citLay-link">Be A Member</Link>
              </li>
              <li>
                {/* <Link to="/citizen/VerifyAccount" className="citLay-link">Verify Account</Link> */}
              </li>
            </>
          )}

          <li>
            <button
              className="citLay-link citLay-logout"
              onClick={() => setShowLogoutConfirm(true)}
            >
              Logout
            </button>
          </li>
        </ul>
      </aside>

      {/* ====================== TOPBAR ====================== */}
      <header className={`citLay-topbar ${isSidebarOpen ? "shifted" : "full"}`}>
        <div className="citLay-topbar-left">
          <button className="citLay-toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? "✖" : "☰"}
          </button>
        </div>
      </header>

      {/* ====================== MAIN CONTENT ====================== */}
      <main
        className={`citLay-main ${isSidebarOpen ? "sidebar-open" : "sidebar-closed"}`}
      >
        <Outlet />
      </main>

      {/* ====================== LOGOUT MODAL ====================== */}
      {showLogoutConfirm && (
        <div
          className="citLay-logout-overlay"
          onClick={() => setShowLogoutConfirm(false)}
        >
          <div
            className="citLay-logout-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to log out of your account?</p>
            <div className="citLay-logout-actions">
              <button className="citLay-logout-confirm" onClick={handleLogout}>
                Yes, Logout
              </button>
              <button
                className="citLay-logout-cancel"
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

export default CitizenLayout;
