import { NavLink, type NavLinkRenderProps, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "./Navbar.css";

import muLogo from "../assets/mu-logo.png";
import ictLogo from "../assets/ict-logo.png";

function linkClassName({ isActive }: NavLinkRenderProps) {
  return isActive ? "menuLink menuLinkActive" : "menuLink";
}

export default function Navbar() {
  const navigate = useNavigate();

  const [showDropdown, setShowDropdown] = useState(false);
  const profileRef = useRef<HTMLDivElement | null>(null);

  const initials = useMemo(() => {
    const raw = localStorage.getItem("user");
    if (!raw) return "U";
    try {
      const u = JSON.parse(raw);
      const name = u?.name as string | undefined;
      if (name) {
        return name
          .split(" ")
          .filter(Boolean)
          .map((x: string) => x[0])
          .join("")
          .slice(0, 2)
          .toUpperCase();
      }
      const username = (u?.username as string | undefined) ?? "U";
      return username.slice(0, 2).toUpperCase();
    } catch {
      return "U";
    }
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!profileRef.current) return;
      if (!profileRef.current.contains(e.target as Node)) setShowDropdown(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const goProfile = () => {
    setShowDropdown(false);
    navigate("/profile");
  };

  return (
    <header className="navbar">
      <div className="navInner">
        {/* Left: logos */}
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
        <div className="profile" ref={profileRef}>
          <button
            className="profileBtn"
            type="button"
            onClick={() => setShowDropdown((v) => !v)}
            aria-label="Open profile menu"
          >
            <div className="avatar">{initials}</div>
            <div className="caret">▾</div>
          </button>

          {showDropdown && (
            <div className="dropdown">
              <button className="dropdownItem" onClick={goProfile}>
                Profile
              </button>

              <div className="dropdownSep" />

              <button className="dropdownItem danger" onClick={handleLogout}>
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
