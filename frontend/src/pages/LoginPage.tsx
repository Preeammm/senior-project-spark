import "./LoginPage.css";
import ictfullLogo from "../assets/ictfull-logo.png";

export default function LoginPage() {
  const handleLogin = () => {
    // ตอนต่อ backend จริง ให้ redirect ไป backend เช่น:
    // window.location.href = `${import.meta.env.VITE_API_BASE_URL}/auth/login`;

    // ตอนนี้ demo ก่อน: ไปหน้า Home
    window.location.href = "/home";
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
        <div className="loginCardHeader">Please Log In</div>

        <div className="loginCardBody">
          <img className="ictfullLogo" src={ictfullLogo} alt="Mahidol University" />

          <button className="loginButton" onClick={handleLogin}>
            <span style={{ fontSize: 18 }}>↪</span>
            Log in
          </button>
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
