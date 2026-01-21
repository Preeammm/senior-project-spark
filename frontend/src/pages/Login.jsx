import "./Login.css"

function Login() {
  return (
    <div className="login-page">
      <header className="login-header">
        <h1>SPARK</h1>
        <p>Student Portfolio for Achievements,<br />Readiness, and Knowledge</p>
      </header>

      <div className="login-card">
        <h2>Please Log In</h2>

        <img
          src="/mu-logo.png"
          alt="Mahidol University"
          className="login-logo"
        />

        <button className="login-button">
          Log in
        </button>
      </div>

      <footer className="login-footer">
        <p>
          if you have any questions please contact
          <br />
          <a href="mailto:ictregistrar@mahidol.ac.th">
            ictregistrar@mahidol.ac.th
          </a>
        </p>

        <p className="faculty">
          Faculty of Information and Communication Technology,
          Mahidol University
        </p>
      </footer>
    </div>
  )
}

export default Login
