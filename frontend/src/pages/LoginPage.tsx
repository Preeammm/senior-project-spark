import { useState } from "react";
import axios from "axios";
import "./LoginPage.css";

import ictFullLogo from "../assets/ictfull-logo.png";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const canSubmit = username.trim().length > 0 && password.trim().length > 0;

  const handleLogin = async () => {
    if (!canSubmit || loading) return;

    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/api/login`,
        { username, password }
      );

      localStorage.setItem("user", JSON.stringify(res.data));
      window.location.href = "/home";
    } catch (e) {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="loginPage">
      <div className="loginHeader">
        <div style={{ fontSize: 34 }}>🎒</div>
        <div>
          <div className="loginHeaderTitle">SPARK</div>
          <div className="loginHeaderSub">
            Student Portfolio for Achievements,
            <br />
            Readiness, and Knowledge
          </div>
        </div>
      </div>

      <hr className="hr" />

      <div className="loginCard">
        <div className="loginCardBody">
          <img className="ictfullLogo" src={ictFullLogo} alt="ICT" />

          <div className="loginFormCard">
            {/* Username */}
            <div className="loginField">
              <div className="loginLabelRow">
                <span className="loginLabelText">Username</span>
              </div>

              <div className="inputWrap">
                <input
                  className="loginInput"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your username"
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="loginField">
              <div className="loginLabelRow">
                <span className="loginLabelText">Password</span>
              </div>

              <div className="inputWrap">
                <input
                  className="loginInput"
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />

                <button
                  type="button"
                  className="pwToggle"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div className="forgotRow">
              <button
                type="button"
                className="forgotLink"
                onClick={() => alert("Please contact itcregistrar@mahidol.ac.th")}
              >
                Forgot password?
              </button>
            </div>

            {error && <div className="loginError">{error}</div>}

            <button
              className="loginButton"
              onClick={handleLogin}
              disabled={!canSubmit || loading}
            >
              {loading ? "Logging in..." : "Log in"}
            </button>

            <div className="loginHint">
              Example: <b>u6588000</b> / <b>P1234567</b>
            </div>
          </div>
        </div>
      </div>

      <div className="loginFooter">
        if you have any questions please contact itcregistrar@mahidol.ac.th
      </div>

      <hr className="hr" style={{ marginTop: 18 }} />

      <div className="loginFooterSmall">
        Faculty of Information and Communication Technology, Mahidol University
      </div>
    </div>
  );
}
