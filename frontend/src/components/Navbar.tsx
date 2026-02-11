import { NavLink, type NavLinkRenderProps } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import "./Navbar.css";
import { http } from "../services/http";
import { useQueryClient } from "@tanstack/react-query";

import muLogo from "../assets/mu-logo.png";
import ictLogo from "../assets/ict-logo.png";

function linkClassName({ isActive }: NavLinkRenderProps) {
  return isActive ? "menuLink menuLinkActive" : "menuLink";
}

type LinksState = {
  linkedinUrl: string;
  githubUrl: string;
};

function normalizeUrl(input: string) {
  const v = String(input ?? "").trim();
  if (!v) return "";

  // already ok
  if (/^https?:\/\//i.test(v)) return v;

  // user pasted "www...."
  if (/^www\./i.test(v)) return `https://${v}`;

  // user pasted "linkedin.com/..." or "github.com/..."
  if (/^(linkedin\.com|github\.com)/i.test(v)) return `https://${v}`;

  return v; // keep as-is (will fail validation below)
}

export default function Navbar() {
  const queryClient = useQueryClient();

  const [showDropdown, setShowDropdown] = useState(false);
  const [showLinksModal, setShowLinksModal] = useState(false);
  const [links, setLinks] = useState<LinksState>({ linkedinUrl: "", githubUrl: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  const openLinksModal = async () => {
    setError("");
    setShowDropdown(false);
    setShowLinksModal(true);

    try {
      const res = await http.get("/api/me/links");
      setLinks({
        linkedinUrl: res.data?.linkedinUrl ?? "",
        githubUrl: res.data?.githubUrl ?? "",
      });
    } catch {
      // ignore (modal still opens)
    }
  };

  const saveLinks = async () => {
    setError("");
    setSaving(true);

    try {
      const li = normalizeUrl(links.linkedinUrl);
      const gh = normalizeUrl(links.githubUrl);

      // ✅ Friendly validation (after normalization)
      if (li && !/^https?:\/\//i.test(li)) {
        setError("LinkedIn URL must start with http:// or https://");
        setSaving(false);
        return;
      }
      if (gh && !/^https?:\/\//i.test(gh)) {
        setError("GitHub URL must start with http:// or https://");
        setSaving(false);
        return;
      }

      await http.put("/api/me/links", { linkedinUrl: li, githubUrl: gh });

      // ✅ Update UI immediately (HomePage uses ["me"])
      queryClient.invalidateQueries({ queryKey: ["me"] });

      setShowLinksModal(false);
    } catch {
      setError("Save failed. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
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
                <button className="dropdownItem" onClick={openLinksModal}>
                  Edit LinkedIn / GitHub
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

      {/* Modal: edit links */}
      {showLinksModal && (
        <div className="modalOverlay" role="dialog" aria-modal="true">
          <div className="modalCard">
            <div className="modalTitle">Profile Links</div>
            <div className="modalSub">Paste LinkedIn & GitHub URLs (we’ll auto-add https:// if missing)</div>

            <label className="modalLabel">LinkedIn</label>
            <input
              className="modalInput"
              placeholder="https://www.linkedin.com/in/yourname"
              value={links.linkedinUrl}
              onChange={(e) => setLinks((p) => ({ ...p, linkedinUrl: e.target.value }))}
            />

            <label className="modalLabel">GitHub</label>
            <input
              className="modalInput"
              placeholder="https://github.com/yourname"
              value={links.githubUrl}
              onChange={(e) => setLinks((p) => ({ ...p, githubUrl: e.target.value }))}
            />

            {error && <div className="modalError">{error}</div>}

            <div className="modalActions">
              <button
                className="modalBtn ghost"
                onClick={() => setShowLinksModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button className="modalBtn primary" onClick={saveLinks} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
