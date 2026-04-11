import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { http } from "../services/http";
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

type RadarAxis = string;

const RADAR_MAX_LEVEL = 4;

// Base 6 skills used for all three lines in spider chart
const BASE_AXES: RadarAxis[] = [
  "Data Analysis",
  "Data Visualization",
  "Problem Solving",
  "Programming",
  "Communication Skills",
  "Team Collaboration",
];

// Default skills for fallback
const DEFAULT_AXES: RadarAxis[] = BASE_AXES;

type EvidenceItem = {
  id: string;
  label: string;
  source: "Course" | "Assessment";
  relevancePercent: number;
};

type StudentRow = {
  student_id?: string;
  personal_email?: string;
  github_url?: string;
  linkedin_url?: string;
  githubUrl?: string;
  linkedinUrl?: string;
};

type EnrollmentInfo = {
  course_code?: string;
  semester?: number;
};

function getRelevantCoursesForSkill(axis: RadarAxis, courses: Course[]) {
  return courses
    .filter((course) => course.skills?.includes(axis))
    .sort((a, b) => (b.index ?? 0) - (a.index ?? 0));
}

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
  scores: Record<string, number>,
  axes: string[],
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

  const { data: studentRow } = useQuery<StudentRow | null>({
    queryKey: ["student"],
    queryFn: async () => {
      const res = await http.get("/api/student");
      return (res.data?.data?.[0] ?? null) as StudentRow | null;
    },
    retry: false,
  });

  const { careerFocus, setCareerFocus, careerFocusOptions } = useCareerFocus();
  const activeCareerFocus: CareerFocusOption =
    careerFocus || careerFocusOptions[0];

  // Fetch career info for gray line in spider chart
  const { data: careerInfoData = [] } = useQuery<
    Array<{ career_name: string; level_id: number; skill_title: string }>
  >({
    queryKey: ["careerInfo", careerFocus],
    queryFn: async () => {
      if (!careerFocus) return [];
      const res = await http.get("/api/career_info", { params: { careerFocus } });
      return res.data?.data ?? [];
    },
    retry: false,
    enabled: !!careerFocus,
  });

  // Fetch student assessment scores to build dynamic student scores
  const { data: assessmentData = [] } = useQuery<
    Array<{
      course_code: string;
      course_name: string;
      semester: number;
      skill_title: string;
      total_normalized_score: number;
    }>
  >({
    queryKey: ["assessments", careerFocus],
    queryFn: async () => {
      if (!careerFocus) return [];
      const res = await http.get("/api/assessments", { params: { careerFocus } });
      return res.data?.data ?? [];
    },
    retry: false,
    enabled: !!careerFocus,
  });

  // Fetch skill scores for blue line
  const { data: skillScoreData = [] } = useQuery<
    Array<{
      career_name: string;
      skill_title: string;
      level_id: number;
      performance_score: number;
    }>
  >({
    queryKey: ["skillScore", careerFocus],
    queryFn: async () => {
      if (!careerFocus) return [];
      const res = await http.get("/api/skill_score", { params: { careerFocus } });
      return res.data?.data ?? [];
    },
    retry: false,
    enabled: !!careerFocus,
  });

  // Fetch course max info for orange line
  const { data: courseMaxInfoData = [] } = useQuery<
    Array<{
      skill_title: string;
      max_lcourse: number;
    }>
  >({
    queryKey: ["courseMaxInfo", careerFocus],
    queryFn: async () => {
      if (!careerFocus) return [];
      const res = await http.get("/api/course_max_info", { params: { careerFocus } });
      return res.data?.data ?? [];
    },
    retry: false,
    enabled: !!careerFocus,
  });

  // Build fixed 6 axes from API career info; pad missing skills with "-"
  const dynamicAxes = useMemo(() => {
    if (careerInfoData.length === 0) {
      return BASE_AXES;
    }

    const skillsSet = new Set<string>();
    careerInfoData.forEach((item) => {
      skillsSet.add(item.skill_title);
    });

    const skills = Array.from(skillsSet).slice(0, 6);
    while (skills.length < 6) {
      skills.push("-");
    }
    return skills;
  }, [careerInfoData]);

  const [selectedSkill, setSelectedSkill] = useState<string>(
    dynamicAxes[0] || "Problem Solving"
  );
  const [showEnrolledCourses, setShowEnrolledCourses] = useState(false);
  const [showNotEnrolledCourses, setShowNotEnrolledCourses] = useState(false);

  // Reset selected skill when career changes
  useEffect(() => {
    if (dynamicAxes.length > 0) {
      setSelectedSkill(dynamicAxes[0]);
    }
  }, [dynamicAxes, careerFocus]);

  useEffect(() => {
    if (!careerFocus) return;

    http
      .get("/api/dacal", { params: { careerFocus } })
      .then((response) => {
        console.log("DACAL response:", response.data);
      })
      .catch((error) => {
        console.error("Failed to fetch /api/dacal", error);
      });
  }, [careerFocus]);

  // Build dynamic student scores from skill score data
  const { studentScores, shownLevels, skillMaxLevels } = useMemo(() => {
    if (skillScoreData.length === 0 || dynamicAxes.length === 0) {
      const defaultScores = Object.fromEntries(dynamicAxes.map((axis) => [axis, axis === "-" ? 0 : 2.5]));
      const defaultShownLevels = Object.fromEntries(dynamicAxes.map((axis) => [axis, 0]));
      const defaultMaxLevels = new Map<string, number>();
      return { studentScores: defaultScores, shownLevels: defaultShownLevels, skillMaxLevels: defaultMaxLevels };
    }

    const skillDataMap = new Map<string, { levels: number[]; sumScore: number }>();
    skillScoreData.forEach((item) => {
      if (!skillDataMap.has(item.skill_title)) {
        skillDataMap.set(item.skill_title, { levels: [], sumScore: 0 });
      }
      const data = skillDataMap.get(item.skill_title)!;
      data.levels.push(item.level_id);
      data.sumScore += item.performance_score;
    });

    const scores: Record<string, number> = {};
    const shownLevelsMap: Record<string, number> = {};
    const maxLevelsMap = new Map<string, number>();
    dynamicAxes.forEach((axis) => {
      if (axis === "-") {
        scores[axis] = 0;
        shownLevelsMap[axis] = 0;
        return;
      }

      const data = skillDataMap.get(axis);
      if (!data) {
        scores[axis] = 0;
        shownLevelsMap[axis] = 0;
        return;
      }

      const { levels, sumScore } = data;
      levels.sort((a, b) => a - b);
      const maxLevel = Math.max(...levels);
      maxLevelsMap.set(axis, maxLevel);
      const minLevelAboveSum = levels.find(level => level > sumScore);
      const shownLevel = minLevelAboveSum !== undefined ? minLevelAboveSum : maxLevel;
      shownLevelsMap[axis] = shownLevel;
      scores[axis] = Math.min(shownLevel, RADAR_MAX_LEVEL);
    });

    return { studentScores: scores, shownLevels: shownLevelsMap, skillMaxLevels: maxLevelsMap };
  }, [skillScoreData, dynamicAxes]);
  
  // Build career requirement scores from API - grey line
  const reqScores = useMemo(() => {
    if (!careerFocus || careerInfoData.length === 0 || dynamicAxes.length === 0) {
      return Object.fromEntries(dynamicAxes.map((axis) => [axis, 0]));
    }

    const skillLevelMap = new Map<string, number>();
    careerInfoData.forEach((item) => {
      skillLevelMap.set(item.skill_title, item.level_id);
    });

    const scores: Record<string, number> = {};
    dynamicAxes.forEach((axis) => {
      if (axis === "-") {
        scores[axis] = 0;
        return;
      }
      scores[axis] = skillLevelMap.get(axis) || 0;
    });

    return scores;
  }, [careerFocus, careerInfoData, dynamicAxes]);

  // Build course max info scores from API - orange line
  const courseMaxScores = useMemo(() => {
    if (!careerFocus || courseMaxInfoData.length === 0 || dynamicAxes.length === 0) {
      return Object.fromEntries(dynamicAxes.map((axis) => [axis, 0]));
    }

    const skillLevelMap = new Map<string, number>();
    courseMaxInfoData.forEach((item) => {
      skillLevelMap.set(item.skill_title, item.max_lcourse);
    });

    const scores: Record<string, number> = {};
    dynamicAxes.forEach((axis) => {
      if (axis === "-") {
        scores[axis] = 0;
        return;
      }
      scores[axis] = skillLevelMap.get(axis) || 0;
    });

    return scores;
  }, [careerFocus, courseMaxInfoData, dynamicAxes]);

  const { data: courses = [], isLoading: coursesLoading } = useCourses(careerFocus);
  const { data: projects = [], isLoading: projectsLoading } = useProjects(careerFocus);
  const { data: enrollmentInfo = [], isLoading: enrollmentLoading } = useQuery<
    EnrollmentInfo[]
  >({
    queryKey: ["enrollmentInfo"],
    queryFn: async () => {
      const res = await http.get("/api/enrollment_info");
      return res.data?.data ?? [];
    },
    retry: false,
  });

  const enrolledCourseCodes = useMemo(
    () =>
      new Set(
        enrollmentInfo.map((row) => String(row.course_code ?? "").trim().toUpperCase())
      ),
    [enrollmentInfo]
  );

  const relevantCourses = useMemo(
    () => getRelevantCoursesForSkill(selectedSkill, courses),
    [selectedSkill, courses]
  );

  const enrolledCourses = useMemo(
    () => relevantCourses.filter((course) =>
      enrolledCourseCodes.has(course.courseCode.trim().toUpperCase())
    ),
    [relevantCourses, enrolledCourseCodes]
  );

  const notEnrolledCourses = useMemo(
    () => relevantCourses.filter((course) =>
      !enrolledCourseCodes.has(course.courseCode.trim().toUpperCase())
    ),
    [relevantCourses, enrolledCourseCodes]
  );

  const suggestedCourse = useMemo(
    () => notEnrolledCourses[0] ?? null,
    [notEnrolledCourses]
  );

  // Radar SVG settings
  const W = 360;
  const H = 320;
  const cx = 170;
  const cy = 160;
  const r = 110;

  const studentPoly = useMemo(
    () => radarPoints(studentScores, dynamicAxes, cx, cy, r),
    [studentScores, dynamicAxes, cx, cy, r]
  );
  const reqPoly = useMemo(
    () => radarPoints(reqScores, dynamicAxes, cx, cy, r),
    [reqScores, dynamicAxes, cx, cy, r]
  );

  const courseMaxPoly = useMemo(
    () => radarPoints(courseMaxScores, dynamicAxes, cx, cy, r),
    [courseMaxScores, dynamicAxes, cx, cy, r]
  );

  function renderAxisLabel(displayAxis: string, lx: number, ly: number, isActive: boolean, axis: string) {
    const words = displayAxis.split(' ');
    const handleClick = () => setSelectedSkill(axis);
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setSelectedSkill(axis);
      }
    };

    if (words.length === 1 || displayAxis.length <= 15) {
      return (
        <text
          x={lx}
          y={ly}
          className={`mpAxisLabel ${isActive ? "active" : ""}`}
          textAnchor="middle"
          dominantBaseline="middle"
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          {displayAxis}
        </text>
      );
    } else {
      const mid = Math.ceil(words.length / 2);
      const line1 = words.slice(0, mid).join(' ');
      const line2 = words.slice(mid).join(' ');
      return (
        <text
          x={lx}
          y={ly}
          className={`mpAxisLabel ${isActive ? "active" : ""}`}
          textAnchor="middle"
          dominantBaseline="middle"
          role="button"
          tabIndex={0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
        >
          <tspan x={lx} dy="-0.5em">{line1}</tspan>
          <tspan x={lx} dy="1em">{line2}</tspan>
        </text>
      );
    }
  }

  if (isLoading) return <div className="homeLoading">Loading...</div>;
  if (error || !me) return <div className="homeLoading">Failed to load user</div>;

  const studentLinkedIn =
    studentRow?.linkedin_url || studentRow?.linkedinUrl || me.linkedinUrl || "";
  const studentGitHub =
    studentRow?.github_url || studentRow?.githubUrl || me.githubUrl || "";

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
                      {studentLinkedIn ? (
                        <a
                          className="socialBtn socialLinkedin"
                          href={studentLinkedIn}
                          target="_blank"
                          rel="noreferrer"
                        >
                          LinkedIn
                        </a>
                      ) : (
                        <span className="socialMuted">No LinkedIn</span>
                      )}

                      {studentGitHub ? (
                        <a
                          className="socialBtn socialGithub"
                          href={studentGitHub}
                          target="_blank"
                          rel="noreferrer"
                        >
                          GitHub
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
                    <div className="mpLegendItem">
                      <span className="mpDot mpDotCourseMax" />
                      <span>Course Max</span>
                    </div>
                  </div>

                  <svg width={W} height={H} className="mpRadar" viewBox={`0 0 ${W} ${H}`}>
                    {[1, 2, 3, 4].map((level) => {
                      const ringScores = Object.fromEntries(
                        dynamicAxes.map((a) => [a, level])
                      ) as Record<string, number>;
                      const ring = radarPoints(ringScores, dynamicAxes, cx, cy, r);
                      return <polygon key={level} points={ring} className="mpRing" />;
                    })}

                    {/* Axis lines */}
                    {dynamicAxes.map((axis, i) => {
                      const n = dynamicAxes.length;
                      const ang = -Math.PI / 2 + (i * (2 * Math.PI)) / n;
                      const x2 = cx + Math.cos(ang) * r;
                      const y2 = cy + Math.sin(ang) * r;

                      return (
                        <line key={`line-${axis}`} x1={cx} y1={cy} x2={x2} y2={y2} className="mpAxis" />
                      );
                    })}

                    <polygon points={reqPoly} className="mpPolyReq" />
                    <polygon points={courseMaxPoly} className="mpPolyCourseMax" />
                    {skillScoreData.length > 0 && <polygon points={studentPoly} className="mpPolyStudent" />}

                    {/* Axis labels */}
                    {dynamicAxes.map((axis, i) => {
                      const n = dynamicAxes.length;
                      const ang = -Math.PI / 2 + (i * (2 * Math.PI)) / n;
                      const lx = cx + Math.cos(ang) * (r + 26);
                      const ly = cy + Math.sin(ang) * (r + 26);

                      const maxLevel = skillMaxLevels.get(axis) || 0;
                      const shownLevel = shownLevels[axis] || 0;
                      const displayAxis = axis;

                      return renderAxisLabel(displayAxis, lx, ly, selectedSkill === axis, axis);
                    })}
                  </svg>
                </div>

                {/* Right: Evidence Breakdown */}
                <div className="mpRight">
                  <div className="mpEvidenceBox">
                    <div className="mpEvidenceTitle">{selectedSkill}</div>
                    {coursesLoading || projectsLoading || enrollmentLoading ? (
                      <div className="mpEvidenceText">Loading evidence...</div>
                    ) : (
                      <>
                        <div className="mpSectionHeader">
                          <div className="mpSectionLabel">Enrolled courses</div>
                          <button
                            type="button"
                            className="mpSectionToggle"
                            onClick={() => setShowEnrolledCourses((value) => !value)}
                          >
                            {showEnrolledCourses ? "Hide" : "Show"}
                          </button>
                        </div>
                        {showEnrolledCourses ? (
                          enrolledCourses.length > 0 ? (
                            <div className="mpEvidenceList">
                              {enrolledCourses.map((course) => (
                                <div
                                  key={course.id}
                                  className="mpEvidenceLine mpRelevantCourse"
                                >
                                  <span>
                                    {course.courseCode} - {course.courseName}
                                  </span>
                                  <span className="mpEnrollmentStatus">Enrolled</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mpEvidenceText">
                              No enrolled courses found for this skill.
                            </div>
                          )
                        ) : null}

                        <div className="mpSectionHeader">
                          <div className="mpSectionLabel">Not enrolled courses</div>
                          <button
                            type="button"
                            className="mpSectionToggle"
                            onClick={() => setShowNotEnrolledCourses((value) => !value)}
                          >
                            {showNotEnrolledCourses ? "Hide" : "Show"}
                          </button>
                        </div>
                        {showNotEnrolledCourses ? (
                          notEnrolledCourses.length > 0 ? (
                            <div className="mpEvidenceList">
                              {notEnrolledCourses.map((course) => (
                                <div
                                  key={course.id}
                                  className="mpEvidenceLine mpRelevantCourse"
                                >
                                  <span className="mpNotEnrolledCourse">
                                    {course.courseCode} - {course.courseName}
                                  </span>
                                  <span className="mpEnrollmentStatus notEnrolled">
                                    Not enrolled
                                  </span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="mpEvidenceText">
                              No not-enrolled courses found for this skill.
                            </div>
                          )
                        ) : null}

                        <div className="mpSuggestedBox">
                          <div className="mpSuggestedTitle">Course suggestion</div>
                          {suggestedCourse ? (
                            <>
                              <div className="mpEvidenceLine mpRelevantCourse">
                                <span>
                                  {suggestedCourse.courseCode} - {suggestedCourse.courseName}
                                </span>
                                <span className="mpEnrollmentStatus notEnrolled">
                                  Recommended
                                </span>
                              </div>
                              <div className="mpSuggestedMeta">
                                This course is a strong match for {selectedSkill} and not currently enrolled.
                              </div>
                            </>
                          ) : (
                            <div className="mpEvidenceText">
                              No recommended course available for this skill.
                            </div>
                          )}
                        </div>
                      </>
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
