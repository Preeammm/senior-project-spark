import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useMe } from "../features/student/hooks/useMe";
import { useCourses } from "../features/courses/hooks/useCourses";
import { useProjects } from "../features/projects/hooks/useProjects";
import type { Course } from "../features/courses/types";
import type { Project } from "../features/projects/types";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import "./HomePage.css";

type CareerFocus = "Data Analyst" | "Data Engineer" | "Software Engineer";

const CAREER_OPTIONS: CareerFocus[] = ["Data Analyst", "Data Engineer", "Software Engineer"];

type RadarAxis =
  | "Data Analysis"
  | "Data Visualization"
  | "Problem Solving"
  | "Programming"
  | "Communication Skills"
  | "Team Collaboration";

const RADAR_AXES: RadarAxis[] = [
  "Data Analysis",
  "Data Visualization",
  "Problem Solving",
  "Programming",
  "Communication Skills",
  "Team Collaboration",
];

// mock scores (0–10)
const MOCK_STUDENT: Record<CareerFocus, Record<RadarAxis, number>> = {
  "Data Analyst": {
    "Data Analysis": 8,
    "Data Visualization": 7,
    "Problem Solving": 6,
    Programming: 5,
    "Communication Skills": 6,
    "Team Collaboration": 6,
  },
  "Data Engineer": {
    "Data Analysis": 6,
    "Data Visualization": 5,
    "Problem Solving": 7,
    Programming: 8,
    "Communication Skills": 5,
    "Team Collaboration": 6,
  },
  "Software Engineer": {
    "Data Analysis": 5,
    "Data Visualization": 4,
    "Problem Solving": 8,
    Programming: 9,
    "Communication Skills": 6,
    "Team Collaboration": 7,
  },
};

const MOCK_REQUIREMENT: Record<CareerFocus, Record<RadarAxis, number>> = {
  "Data Analyst": {
    "Data Analysis": 9,
    "Data Visualization": 8,
    "Problem Solving": 8,
    Programming: 6,
    "Communication Skills": 7,
    "Team Collaboration": 7,
  },
  "Data Engineer": {
    "Data Analysis": 7,
    "Data Visualization": 6,
    "Problem Solving": 8,
    Programming: 9,
    "Communication Skills": 6,
    "Team Collaboration": 7,
  },
  "Software Engineer": {
    "Data Analysis": 6,
    "Data Visualization": 5,
    "Problem Solving": 9,
    Programming: 9,
    "Communication Skills": 7,
    "Team Collaboration": 8,
  },
};

const EVIDENCE_COPY: Record<CareerFocus, Record<RadarAxis, string>> = {
  "Data Analyst": {
    "Data Analysis":
      "For Data Analyst focus, high-relevance database and analytics work is weighted more heavily.",
    "Data Visualization":
      "Visualization evidence prioritizes work that communicates trends and insights clearly.",
    "Problem Solving":
      "Problem-solving evidence emphasizes analytical breakdown and decision support outcomes.",
    Programming:
      "Programming evidence focuses on scripting, data querying, and practical automation.",
    "Communication Skills":
      "Communication evidence prioritizes report clarity and stakeholder-ready outputs.",
    "Team Collaboration":
      "Collaboration evidence emphasizes cross-functional projects and shared deliverables.",
  },
  "Data Engineer": {
    "Data Analysis":
      "For Data Engineer focus, analysis matters most when it supports data pipeline quality.",
    "Data Visualization":
      "Visualization evidence is weighted lower than data-platform and integration work.",
    "Problem Solving":
      "Problem-solving evidence emphasizes reliability, scale, and troubleshooting in data systems.",
    Programming:
      "Programming evidence prioritizes backend, ETL, and infrastructure-heavy implementation.",
    "Communication Skills":
      "Communication evidence values clear handoffs and technical documentation quality.",
    "Team Collaboration":
      "Collaboration evidence highlights work across analytics, engineering, and platform teams.",
  },
  "Software Engineer": {
    "Data Analysis":
      "For Software Engineer focus, data analysis is supportive but not the primary weighting.",
    "Data Visualization":
      "Visualization relevance is lower unless tied directly to product or feature implementation.",
    "Problem Solving":
      "Problem-solving evidence prioritizes system design, debugging, and implementation tradeoffs.",
    Programming:
      "Programming evidence strongly weights software architecture and coding depth.",
    "Communication Skills":
      "Communication evidence favors technical clarity in requirements, reviews, and handoffs.",
    "Team Collaboration":
      "Collaboration evidence emphasizes team-based delivery, reviews, and integration work.",
  },
};

type EvidenceItem = {
  id: string;
  label: string;
  source: "Course" | "Assessment";
  relevancePercent: number;
};

function toCourseEvidence(c: Course): EvidenceItem {
  return {
    id: `course-${c.id}`,
    label: `${c.courseCode} - ${c.courseName}`,
    source: "Course",
    relevancePercent: c.relevancePercent,
  };
}

function toProjectEvidence(p: Project): EvidenceItem {
  return {
    id: `project-${p.id}`,
    label: p.projectName,
    source: "Assessment",
    relevancePercent: p.relevancePercent,
  };
}

function pickEvidence(axis: RadarAxis, courses: Course[], projects: Project[]) {
  const courseItems = courses.map(toCourseEvidence);
  const projectItems = projects.map(toProjectEvidence);

  const projectWeightedAxes: RadarAxis[] = [
    "Problem Solving",
    "Programming",
    "Team Collaboration",
  ];

  const merged = projectWeightedAxes.includes(axis)
    ? [...projectItems, ...courseItems]
    : [...courseItems, ...projectItems];

  return merged
    .sort((a, b) => b.relevancePercent - a.relevancePercent)
    .slice(0, 2);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

/**
 * Build polygon points for radar chart.
 * cx, cy center; r radius
 * score 0..10 => scale 0..1
 */
function radarPoints(
  scores: Record<RadarAxis, number>,
  axes: RadarAxis[],
  cx: number,
  cy: number,
  r: number
) {
  const n = axes.length;
  const pts: string[] = [];
  for (let i = 0; i < n; i++) {
    const axis = axes[i];
    const a = -Math.PI / 2 + (i * (2 * Math.PI)) / n; // start top
    const t = clamp01((scores[axis] ?? 0) / 10);
    const x = cx + Math.cos(a) * r * t;
    const y = cy + Math.sin(a) * r * t;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

export default function HomePage() {
  useProtectedRoute();
  const { data: me, isLoading, error } = useMe();

  const [careerFocus, setCareerFocus] = useState<CareerFocus>("Data Analyst");

  // evidence breakdown dropdowns (mock)
  const [evidence1, setEvidence1] = useState<RadarAxis>("Data Analysis");
  const [evidence2, setEvidence2] = useState<RadarAxis>("Problem Solving");

  const studentScores = useMemo(() => MOCK_STUDENT[careerFocus], [careerFocus]);
  const reqScores = useMemo(() => MOCK_REQUIREMENT[careerFocus], [careerFocus]);
  const { data: courses = [], isLoading: coursesLoading } = useCourses(careerFocus);
  const { data: projects = [], isLoading: projectsLoading } = useProjects(careerFocus);

  const evidenceItems1 = useMemo(
    () => pickEvidence(evidence1, courses, projects),
    [evidence1, courses, projects]
  );
  const evidenceItems2 = useMemo(
    () => pickEvidence(evidence2, courses, projects),
    [evidence2, courses, projects]
  );

  // Radar SVG settings
  const W = 360;
  const H = 320;
  const cx = 170;
  const cy = 160;
  const r = 110;

  const studentPoly = useMemo(
    () => radarPoints(studentScores, RADAR_AXES, cx, cy, r),
    [studentScores]
  );
  const reqPoly = useMemo(
    () => radarPoints(reqScores, RADAR_AXES, cx, cy, r),
    [reqScores]
  );

  if (isLoading) return <div className="homeLoading">Loading...</div>;
  if (error || !me) return <div className="homeLoading">Failed to load user</div>;

  // ✅ FIX: now name is first name, surname is last name
  const firstName = me.name ?? "Student";
  const fullName = `${me.name ?? ""} ${me.surname ?? ""}`.trim() || "Student";

  // ✅ FIX: initials from name + surname
  const initials =
    fullName
      .split(" ")
      .filter(Boolean)
      .map((x: string) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "U";

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
                    <span className="avatarPlaceholder">{initials}</span>
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
                  {/* ✅ FIX: show name + surname */}
                  <div className="infoValue">{fullName}</div>
                </div>

                <div className="infoRow">
                  <div className="infoLabel">Faculty</div>
                  <div className="infoValue">{me.faculty}</div>
                </div>

                <div className="infoRow">
                  <div className="infoLabel">Minor</div>
                  {/* ✅ FIX: was me.major */}
                  <div className="infoValue">{me.minor}</div>
                </div>

                <div className="infoRow">
                  <div className="infoLabel">Year</div>
                  {/* ✅ FIX: was me.classYear */}
                  <div className="infoValue">{me.year}</div>
                </div>

                {/* LinkedIn / GitHub */}
                <div className="infoRow" style={{ borderBottom: "none" }}>
                  <div className="infoLabel">Links</div>
                  <div className="infoValue">
                    <div className="socialRow">
                      {me.linkedinUrl ? (
                        <a
                          className="socialBtn socialLinkedin"
                          href={me.linkedinUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          🔗 LinkedIn
                        </a>
                      ) : (
                        <span className="socialMuted">No LinkedIn</span>
                      )}

                      {me.githubUrl ? (
                        <a
                          className="socialBtn socialGithub"
                          href={me.githubUrl}
                          target="_blank"
                          rel="noreferrer"
                        >
                          💻 GitHub
                        </a>
                      ) : (
                        <span className="socialMuted">No GitHub</span>
                      )}
                    </div>
                  </div>
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
                <div className="quickTitle">My Assessments</div>
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

        {/* My Performance */}
        <section className="sectionCard">
          <div className="sectionHeader">
            <div className="sectionTitle">My Performance</div>
          </div>

          <div className="mpTopRow">
            <div className="mpFocus">
              <div className="mpLabel">Career Focus:</div>
              <select
                className="mpSelect"
                value={careerFocus}
                onChange={(e) => setCareerFocus(e.target.value as CareerFocus)}
              >
                {CAREER_OPTIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mpCard">
            <div className="mpInner">
              {/* Left: Radar */}
              <div className="mpLeft">
                <div className="mpLegend">
                  <div className="mpLegendItem">
                    <span className="mpDot mpDotStudent" />
                    <span>Student</span>
                  </div>
                  <div className="mpLegendItem">
                    <span className="mpDot mpDotReq" />
                    <span>Career Requirement</span>
                  </div>
                </div>

                <svg width={W} height={H} className="mpRadar" viewBox={`0 0 ${W} ${H}`}>
                  {[0.2, 0.4, 0.6, 0.8, 1].map((t) => {
                    const ringScores = Object.fromEntries(
                      RADAR_AXES.map((a) => [a, 10 * t])
                    ) as Record<RadarAxis, number>;
                    const ring = radarPoints(ringScores, RADAR_AXES, cx, cy, r);
                    return <polygon key={t} points={ring} className="mpRing" />;
                  })}

                  {RADAR_AXES.map((axis, i) => {
                    const n = RADAR_AXES.length;
                    const ang = -Math.PI / 2 + (i * (2 * Math.PI)) / n;
                    const x2 = cx + Math.cos(ang) * r;
                    const y2 = cy + Math.sin(ang) * r;

                    const lx = cx + Math.cos(ang) * (r + 26);
                    const ly = cy + Math.sin(ang) * (r + 26);

                    return (
                      <g key={axis}>
                        <line x1={cx} y1={cy} x2={x2} y2={y2} className="mpAxis" />
                        <text
                          x={lx}
                          y={ly}
                          className="mpAxisLabel"
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          {axis}
                        </text>
                      </g>
                    );
                  })}

                  <polygon points={reqPoly} className="mpPolyReq" />
                  <polygon points={studentPoly} className="mpPolyStudent" />
                </svg>
              </div>

              {/* Right: Evidence Breakdown */}
              <div className="mpRight">
                <div className="mpRightTitle">Evidence Breakdown</div>

                <div className="mpField">
                  <select
                    className="mpSelectLong"
                    value={evidence1}
                    onChange={(e) => setEvidence1(e.target.value as RadarAxis)}
                  >
                    {RADAR_AXES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mpField">
                  <select
                    className="mpSelectLong"
                    value={evidence2}
                    onChange={(e) => setEvidence2(e.target.value as RadarAxis)}
                  >
                    {RADAR_AXES.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mpEvidenceBox">
                  <div className="mpEvidenceTitle">{evidence1}</div>
                  <div className="mpEvidenceText">
                    {EVIDENCE_COPY[careerFocus][evidence1]}
                  </div>
                  {coursesLoading || projectsLoading ? (
                    <div className="mpEvidenceText">Loading evidence...</div>
                  ) : evidenceItems1.length > 0 ? (
                    <div className="mpEvidenceList">
                      {evidenceItems1.map((item) => (
                        <div key={item.id} className="mpEvidenceLine">
                          {item.source}: {item.label} ({item.relevancePercent}% match)
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mpEvidenceText">No evidence available for this focus.</div>
                  )}

                  <div className="mpEvidenceTitle" style={{ marginTop: 12 }}>
                    {evidence2}
                  </div>
                  <div className="mpEvidenceText">
                    {EVIDENCE_COPY[careerFocus][evidence2]}
                  </div>
                  {coursesLoading || projectsLoading ? (
                    <div className="mpEvidenceText">Loading evidence...</div>
                  ) : evidenceItems2.length > 0 ? (
                    <div className="mpEvidenceList">
                      {evidenceItems2.map((item) => (
                        <div key={item.id} className="mpEvidenceLine">
                          {item.source}: {item.label} ({item.relevancePercent}% match)
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mpEvidenceText">No evidence available for this focus.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
