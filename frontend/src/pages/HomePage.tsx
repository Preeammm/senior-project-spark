import { Link } from "react-router-dom";
import { useMe } from "../features/student/hooks/useMe";
import "./HomePage.css";

export default function HomePage() {
  const { data: me, isLoading, error } = useMe();

  if (isLoading) return <div className="homeLoading">Loading...</div>;
  if (error || !me) return <div className="homeLoading">Failed to load user</div>;

  const firstName = me.name?.split(" ")?.[0] ?? "Student";

  return (
    <div className="homePage">
      <div className="homeContainer">
        <div className="homeHeader">
          <h1 className="hiTitle">Hi, {firstName}</h1>
          <p className="hiSub">Welcome back to SPARK. Here’s a quick overview.</p>
        </div>

        {/* Student Info */}
        <section className="sectionCard">
          <div className="sectionHeader">
            <div className="sectionTitle">Student Information</div>
          </div>

          <div className="sectionBody">
            <div className="studentGrid">
              <div className="avatarCol">
                <div className="avatarCircle">
                  {me.avatarUrl ? (
                    <img className="avatarImg" src={me.avatarUrl} alt="avatar" />
                  ) : (
                    <span className="avatarPlaceholder">YS</span>
                  )}
                </div>
              </div>

              <div className="infoRows">
                <div className="infoRow">
                  <div className="infoLabel">Student ID</div>
                  <div className="infoValue">{me.studentId}</div>
                </div>

                <div className="infoRow">
                  <div className="infoLabel">Name</div>
                  <div className="infoValue">{me.name}</div>
                </div>

                <div className="infoRow">
                  <div className="infoLabel">Faculty</div>
                  <div className="infoValue">{me.faculty}</div>
                </div>

                <div className="infoRow">
                  <div className="infoLabel">Major</div>
                  <div className="infoValue">{me.major}</div>
                </div>

                <div className="infoRow" style={{ borderBottom: "none" }}>
                  <div className="infoLabel">Class</div>
                  <div className="infoValue">{me.classYear}</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Look */}
        <section className="sectionCard">
          <div className="sectionHeader">
            <div className="sectionTitle">Quick Look</div>
          </div>

          <div className="quickGrid">
            <Link className="quickCard" to="/projects">
              <div className="quickTop quickTop1" />
              <div className="quickBody">
                <div className="quickTitle">My Projects</div>
                <div className="quickDesc">View your projects & materials</div>
              </div>
            </Link>

            <Link className="quickCard" to="/courses">
              <div className="quickTop quickTop2" />
              <div className="quickBody">
                <div className="quickTitle">My Courses</div>
                <div className="quickDesc">Track courses & competencies</div>
              </div>
            </Link>

            <Link className="quickCard" to="/portfolio">
              <div className="quickTop quickTop3" />
              <div className="quickBody">
                <div className="quickTitle">My Portfolios</div>
                <div className="quickDesc">Generate & manage documents</div>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
