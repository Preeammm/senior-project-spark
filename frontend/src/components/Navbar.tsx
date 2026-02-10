import { NavLink, type NavLinkRenderProps } from "react-router-dom";
import { useState } from "react";
import "./Navbar.css";

import muLogo from "../assets/mu-logo.png";
import ictLogo from "../assets/ict-logo.png";

function linkClassName({ isActive }: NavLinkRenderProps) {
  return isActive ? "menuLink menuLinkActive" : "menuLink";
}

export default function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  return (
    <header className="navbar">
      <div className="navInner">
        {/* Left: 2 logos */}
        <div className="brand">
          <img className="brandLogoMu" src={muLogo} alt="Mahidol University" />
          <img className="brandLogoIct" src={ictLogo} alt="ICT" />
        </div>

        {/* Center: menu */}
        <nav className="menu">
          <NavLink to="/home" className={linkClassName}>
            Home
          </NavLink>
          <NavLink to="/projects" className={linkClassName}>
            My Assessments
          </NavLink>
          <NavLink to="/courses" className={linkClassName}>
            My Courses
          </NavLink>
          <NavLink to="/portfolio" className={linkClassName}>
            Portfolio Content Generator
          </NavLink>
        </nav>

        {/* Right: profile */}
        <div className="profile">
          <div className="avatar">YS</div>
          <div className="caret" onClick={toggleDropdown} style={{ cursor: "pointer" }}>
            ▾
          </div>
          {showDropdown && (
            <div className="dropdown">
              <button className="dropdownItem" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
