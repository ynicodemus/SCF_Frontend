import { NavLink } from 'react-router-dom';
import { useState } from 'react';
import './css/NavBar.css';

function LandingPageNavbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="LandingPageNav">

      {/* Logo + Text (clickable → go to home) */}
      <NavLink to="/LPHome" className="logo-container">
        <img src="/images/logo.png" alt="SeniorConnect Logo" className="nav-logo-img" />
        <h1 className="logo-text">SeniorConnect</h1>
      </NavLink>

      {/* Hamburger */}
      <div
        className={`hamburger ${open ? 'open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      <ul className={`LP_NavLink ${open ? 'show' : ''}`}>
        <li>
          <NavLink to="/LPHome" end className={({ isActive }) => isActive ? "active" : ""}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/ActProg" className={({ isActive }) => isActive ? "active" : ""}>
            Activities & Program
          </NavLink>
        </li>
        <li>
          <NavLink to="/About" className={({ isActive }) => isActive ? "active" : ""}>
            About Us
          </NavLink>
        </li>
        <li>
          <NavLink to="/Account" className={({ isActive }) => isActive ? "active" : ""}>
            Account
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}

export default LandingPageNavbar;
