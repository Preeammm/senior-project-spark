import { Link } from "react-router-dom";
import { useMe } from "../features/student/hooks/useMe";
import "./HomePage.css"; // ใช้ CSS ที่คุณทำไว้แล้ว

export default function HomePage() {
  const { data: me, isLoading, error } = useMe();

  if (isLoading) return <div>Loading...</div>;
  if (error || !me) return <div>Failed to load user</div>;

  return (
    <div className="homeContainer">
      <h1 className="hiTitle">Hi, {me.name.split(" ")[0]}</h1>

      <div className="sectionCard">
        <div className="sectionHeader">👤 Student Information</div>
        <div className="sectionBody">
          <div className="studentGrid">
            <div>
              <div className="avatarBox">{me.avatarUrl ? <img src={me.avatarUrl} /> : "👤"}</div>
            </div>

            <div className="infoRows">
              <div className="infoRow"><div className="infoLabel">Student ID:</div><div className="infoValue">{me.studentId}</div></div>
              <div className="infoRow"><div className="infoLabel">Name:</div><div className="infoValue">{me.name}</div></div>
              <div className="infoRow"><div className="infoLabel">Faculty:</div><div className="infoValue">{me.faculty}</div></div>
              <div className="infoRow"><div className="infoLabel">Major:</div><div className="infoValue">{me.major}</div></div>
              <div className="infoRow" style={{ borderBottom: "none" }}><div className="infoLabel">Class:</div><div className="infoValue">{me.classYear}</div></div>
            </div>
          </div>
        </div>
      </div>

      <div className="sectionCard">
        <div className="sectionHeader" style={{ fontSize: 22, fontWeight: 500 }}>Quick Look</div>
        <div className="quickGrid">
          <div className="quickCard">
            <div className="quickTop" style={{ background: "#d5d1b8" }} />
            <Link className="quickLink" to="/projects">My Projects</Link>
          </div>
          <div className="quickCard">
            <div className="quickTop" style={{ background: "#b9a99f" }} />
            <Link className="quickLink" to="/courses">My Courses</Link>
          </div>
          <div className="quickCard">
            <div className="quickTop" style={{ background: "#a7b3a2" }} />
            <Link className="quickLink" to="/portfolio">My Portfolios</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
