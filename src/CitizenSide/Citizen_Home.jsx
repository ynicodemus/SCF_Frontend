import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import '../css/navbar.css'; 
// import '../AdminSide/css/TopBar.css'; // Ginawang pareho ng Admin para consistent

function CitizenHome() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/'; // Or '/login' kung meron kang login page
  };
  

  return (
    <div className={`admin-layout ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Sidebar */}
      <>
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isSidebarOpen ? '✖' : '☰'}
        </button>

        <div className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
          <ul>
            <li><Link to="/citizen/CDashboard">Dashboard</Link></li>
            <li><Link to="/Citizen/MyProfile">My Profile</Link></li>
            <li><Link to="/citizen/Damayan">Damayan</Link></li>
            <li><Link to="/citizen/Calendar">Calendar</Link></li>
            <li><Link to="/citizen/CNotification">Notifications</Link></li>
            <li>
              <button onClick={handleLogout} style={{ background: "none", border: "none", cursor: "pointer" }}>
                Logout
              </button>
              </li>
          </ul>
        </div>
      </>

      {/* Main Content Area */}
      <div className="admin-main">
        <div className="topbar"></div>
        <div className="admin-main-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default CitizenHome;