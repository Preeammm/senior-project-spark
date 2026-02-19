import { Link } from "react-router-dom";
import { useMemo, useState } from "react";
import { useMe } from "../features/student/hooks/useMe";
import { useCourses } from "../features/courses/hooks/useCourses";
import { useProjects } from "../features/projects/hooks/useProjects";
import {
  useCareerFocus,
  type CareerFocus,
  type CareerFocusOption,
} from "../features/careerFocus/useCareerFocus";
import type { Course } from "../features/courses/types";
import type { Project } from "../features/projects/types";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import "./HomePage.css";

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

const RADAR_MAX_LEVEL = 4;
const MOCK_STUDENT: Record<RadarAxis, number> = {
  "Data Analysis": 3.2,
  "Data Visualization": 2.8,
  "Problem Solving": 3.4,
  Programming: 3.1,
  "Communication Skills": 2.9,
  "Team Collaboration": 3.0,
};

const MOCK_REQUIREMENT: Record<CareerFocusOption, Record<RadarAxis, number>> = {
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

type EvidenceItem = {
  id: string;
  label: string;
  source: "Course" | "Assessment";
  relevancePercent: number;
};

type SuggestedCourse = {
  id: string;
  courseCode: string;
  courseName: string;
  supports: RadarAxis[];
  enrollmentPlan: string;
};

const SUGGESTED_COURSE_CATALOG: SuggestedCourse[] = [
  {
    id: "ITCS326",
    courseCode: "ITCS326",
    courseName: "Data Mining",
    supports: ["Data Analysis", "Problem Solving"],
    enrollmentPlan: "Year 3, Semester 2",
  },
  {
    id: "ITCS321",
    courseCode: "ITCS321",
    courseName: "Business Intelligence and Visualization",
    supports: ["Data Analysis", "Data Visualization", "Communication Skills"],
    enrollmentPlan: "Year 4, Semester 1",
  },
  {
    id: "ITCS314",
    courseCode: "ITCS314",
    courseName: "Statistics for Computing",
    supports: ["Data Analysis", "Problem Solving"],
    enrollmentPlan: "Year 2, Semester 2",
  },
  {
    id: "ITCS225",
    courseCode: "ITCS225",
    courseName: "Human-Computer Interaction",
    supports: ["Data Visualization", "Communication Skills"],
    enrollmentPlan: "Year 3, Semester 1",
  },
  {
    id: "ITCS316",
    courseCode: "ITCS316",
    courseName: "Software Engineering",
    supports: ["Programming", "Team Collaboration", "Communication Skills"],
    enrollmentPlan: "Year 3, Semester 2",
  },
  {
    id: "ITCS339",
    courseCode: "ITCS339",
    courseName: "DevOps and Cloud Infrastructure",
    supports: ["Programming", "Problem Solving", "Team Collaboration"],
    enrollmentPlan: "Year 4, Semester 1",
  },
  {
    id: "ITCS332",
    courseCode: "ITCS332",
    courseName: "Project Management for IT",
    supports: ["Team Collaboration", "Communication Skills"],
    enrollmentPlan: "Year 3, Semester 1",
  },
];

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

function pickSuggestedCourses(
  axis: RadarAxis,
  takenCourses: Course[],
  maxItems = 2
) {
  const takenCourseCodes = new Set(
    takenCourses.map((course) => course.courseCode.trim().toUpperCase())
  );

  return SUGGESTED_COURSE_CATALOG.filter((course) =>
    course.supports.includes(axis)
  )
    .filter((course) => !takenCourseCodes.has(course.courseCode.toUpperCase()))
    .slice(0, maxItems);
}

function clamp01(n: number) {
  return Math.max(0, Math.min(1, n));
}

function toRadarLevel(score: number) {
  // Support both legacy 0..10 and new 0..4 inputs.
  const normalized = score > RADAR_MAX_LEVEL ? (score / 10) * RADAR_MAX_LEVEL : score;
  return Math.max(0, Math.min(RADAR_MAX_LEVEL, normalized));
}

/**
 * Build polygon points for radar chart.
 * cx, cy center; r radius
 * score 0..4 => scale 0..1
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
    const t = clamp01(toRadarLevel(scores[axis] ?? 0) / RADAR_MAX_LEVEL);
    const x = cx + Math.cos(a) * r * t;
    const y = cy + Math.sin(a) * r * t;
    pts.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return pts.join(" ");
}

export default function HomePage() {
  useProtectedRoute();
  const { data: me, isLoading, error } = useMe();

  const { careerFocus, setCareerFocus, careerFocusOptions } = useCareerFocus();
  const activeCareerFocus: CareerFocusOption =
    careerFocus || careerFocusOptions[0];

  const [selectedSkill, setSelectedSkill] = useState<RadarAxis>("Problem Solving");

  const studentScores = useMemo(() => MOCK_STUDENT, []);
  const reqScores = useMemo(
    () => MOCK_REQUIREMENT[activeCareerFocus],
    [activeCareerFocus]
  );
  const { data: courses = [], isLoading: coursesLoading } = useCourses(careerFocus);
  const { data: projects = [], isLoading: projectsLoading } = useProjects(careerFocus);

  const evidenceItems = useMemo(
    () => pickEvidence(selectedSkill, courses, projects),
    [selectedSkill, courses, projects]
  );
  const suggestedCourses = useMemo(
    () => pickSuggestedCourses(selectedSkill, courses),
    [selectedSkill, courses]
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
                <option value="">Select career focus</option>
                {careerFocusOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mpCard">
            {careerFocus ? (
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
                    {[1, 2, 3, 4].map((level) => {
                      const ringScores = Object.fromEntries(
                        RADAR_AXES.map((a) => [a, level])
                      ) as Record<RadarAxis, number>;
                      const ring = radarPoints(ringScores, RADAR_AXES, cx, cy, r);
                      return <polygon key={level} points={ring} className="mpRing" />;
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
                            className={`mpAxisLabel ${selectedSkill === axis ? "active" : ""}`}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            role="button"
                            tabIndex={0}
                            onClick={() => setSelectedSkill(axis)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setSelectedSkill(axis);
                              }
                            }}
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
                  <div className="mpEvidenceHint">
                    Click a skill on the radar chart to view evidence.
                  </div>

                  <div className="mpEvidenceBox">
                    <div className="mpEvidenceTitle">{selectedSkill}</div>
                    {coursesLoading || projectsLoading ? (
                      <div className="mpEvidenceText">Loading evidence...</div>
                    ) : evidenceItems.length > 0 ? (
                      <>
                        <div className="mpSectionLabel">Top evidence</div>
                        <div className="mpEvidenceList">
                          {evidenceItems.map((item) => (
                            <div key={item.id} className="mpEvidenceLine">
                              {item.source}: {item.label} ({item.relevancePercent}% match)
                            </div>
                          ))}
                        </div>
                        {suggestedCourses.length > 0 ? (
                          <div className="mpSuggestedBox">
                            <div className="mpSuggestedTitle">Course related to skill</div>
                            <div className="mpSuggestedNote">
                              These are courses you have not achieved yet.
                            </div>
                            <div className="mpEvidenceList">
                              {suggestedCourses.map((course) => (
                                <div key={course.id} className="mpSuggestedItem">
                                  <div className="mpEvidenceLine mpSuggestedLine">
                                    Course: {course.courseCode} - {course.courseName}
                                  </div>
                                  <div className="mpSuggestedMeta">
                                    Eligible enrollment period: {course.enrollmentPlan}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </>
                    ) : (
                      <div className="mpEvidenceText">No evidence available for this focus.</div>
                    )}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
}
