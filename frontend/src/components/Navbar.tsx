import { NavLink, type NavLinkRenderProps } from "react-router-dom";
import "./Navbar.css";

import muLogo from "../assets/mu-logo.png";
import ictLogo from "../assets/ict-logo.png";

function linkClassName({ isActive }: NavLinkRenderProps) {
  return isActive ? "menuLink menuLinkActive" : "menuLink";
}

export default function Navbar() {
  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
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
            My Projects
          </NavLink>
          <NavLink to="/courses" className={linkClassName}>
            My Courses
          </NavLink>
          <NavLink to="/portfolio" className={linkClassName}>
            Portfolio Content Generator
          </NavLink>
        </nav>

        {/* Right: profile */}
        <div className="profile" onClick={handleLogout}>
          <div className="avatar">YS</div>
          <div className="caret">▾</div>
        </div>
      </div>
    </header>
  );
}
