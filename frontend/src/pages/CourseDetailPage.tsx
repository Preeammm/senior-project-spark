// CourseDetailPage.tsx  (FULL - career dropdown can change now)
// NOTE: this file assumes your PageHeader calls onCareerFocusChange(newValue)

import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import PageHeader from "../components/PageHeader";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import { getCourseDetail } from "../features/courses/services/courses.api";
import { useCareerFocus } from "../features/careerFocus/useCareerFocus";
import { normalizeCompetencyTags } from "../features/courses/utils/competencyTags";

import ExpandableCompetencyTags from "../features/courses/components/ExpandableCompetencyTags";

import "../styles/page.css";
import "./CourseDetailPage.css";

type Instructor = { name: string; email?: string };

type BreakdownRow = {
  assessmentType: string;
  weightPercent: number;
  competencyTags: string[];
  competencyIndex: number;
};

type CourseDetail = {
  id: string;
  courseCode: string;
  courseTitleEN: string;
  courseTitleTH?: string;
  credits: string;
  semester: string;
  year: number;
  instructors: Instructor[];
  summary: string;
  competencyTags: string[];
  finalGrade: string;
  overallCompetencyIndex: number;
  relevancePercent: number;
  breakdown: BreakdownRow[];
};

function pctTone(v: number) {
  if (v < 70) return "orange";
  if (v < 80) return "yellow";
  return "green";
}

function indexColorClass(v: number) {
  if (v < 70) return "idxSquare orange";
  if (v < 80) return "idxSquare yellow";
  return "idxSquare green";
}

function normalize(raw: any): CourseDetail {
  const breakdown: BreakdownRow[] = [
    {
      assessmentType: "Midterm Exam",
      weightPercent: 25,
      competencyTags: ["Web Programming", "Database Design", "Problem Solving", "Software Architecture"],
      competencyIndex: 68,
    },
    {
      assessmentType: "Final Exam",
      weightPercent: 25,
      competencyTags: ["Algorithm Design", "Data Structures", "API Development", "Software Testing"],
      competencyIndex: 68,
    },
    {
      assessmentType: "Lab",
      weightPercent: 20,
      competencyTags: ["Web Programming", "Debugging", "Version Control (Git)", "Technical Documentation"],
      competencyIndex: 75,
    },
    {
      assessmentType: "Final Project",
      weightPercent: 30,
      competencyTags: ["UI/UX Design", "API Development", "Database Design", "Team Collaboration"],
      competencyIndex: 92,
    },
  ];

  return {
    id: raw?.id ?? "",
    courseCode: raw?.courseCode ?? "—",
    courseTitleEN: raw?.courseTitleEN ?? raw?.courseName ?? "—",
    courseTitleTH: raw?.courseTitleTH ?? "—",
    credits: raw?.credits ?? "3 (3–0–6)",
    semester: String(raw?.semester ?? "1"),
    year: Number(raw?.year ?? 4),
    instructors:
      raw?.instructors ?? [
        {
          name: "Asst. Prof. Dr. (Mock Instructor)",
          email: "instructor@mahidol.ac.th",
        },
      ],
    summary: raw?.summary ?? raw?.description ?? "Mock course detail data (replace later).",
    competencyTags: normalizeCompetencyTags(
      raw?.competencyTags ?? [
        "Web Programming",
        "Database Design",
        "API Development",
        "Software Testing",
        "UI/UX Design",
        "Version Control (Git)",
      ],
      `${raw?.courseCode ?? ""} ${raw?.courseTitleEN ?? raw?.courseName ?? ""}`
    ),
    finalGrade: raw?.finalGrade ?? raw?.grade ?? "A",
    overallCompetencyIndex: 82, // mock
    relevancePercent: raw?.relevancePercent ?? 90,
    breakdown: breakdown.map((row) => ({
      ...row,
      competencyTags: normalizeCompetencyTags(
        row.competencyTags,
        `${raw?.courseCode ?? ""} ${raw?.courseTitleEN ?? raw?.courseName ?? ""} ${row.assessmentType}`
      ),
    })),
  };
}

export default function CourseDetailPage() {
  useProtectedRoute();
  const { courseId } = useParams();

  // ✅ requested defaults:
  // - Course Information: hidden by default
  // - Competency Breakdown: shown by default
  const [courseInfoOpen, setCourseInfoOpen] = useState(false);
  const [breakdownOpen, setBreakdownOpen] = useState(true);

  const { careerFocus, setCareerFocus, careerFocusOptions } = useCareerFocus();

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-detail", courseId, careerFocus],
    enabled: !!courseId,
    queryFn: async () => normalize(await getCourseDetail(String(courseId), careerFocus)),
  });

  const breakdownRows = useMemo(() => data?.breakdown ?? [], [data]);

  if (isLoading) return <div className="pageContainer">Loading...</div>;
  if (error || !data) return <div className="pageContainer">Course not found.</div>;

  return (
    <div className="pageContainer">
      <PageHeader
        title="My Courses"
        careerFocus={careerFocus}
        careerFocusOptions={careerFocusOptions}
        onCareerFocusChange={setCareerFocus}
        careerExtra={
          <Link className="backLink" to="/courses">
            ← Back to My Courses
          </Link>
        }
      />

      <div className="dividerLine" />

      <h1 className="detailTitle">
        {data.courseCode} • {data.courseTitleEN}
      </h1>

      {/* ===== Course Information (Collapsible, default hidden) ===== */}
      <div className="dataCard">
        <div className="dataCardInner">
          <button
            type="button"
            className="cardTitleRow"
            onClick={() => setCourseInfoOpen((v) => !v)}
            aria-expanded={courseInfoOpen}
            aria-controls="course-info-panel"
          >
            <span className="cardTitleText">Course Information</span>
            <span className={`chev ${courseInfoOpen ? "open" : ""}`}>›</span>
          </button>

          <div
            id="course-info-panel"
            className={`collapse ${courseInfoOpen ? "open" : ""}`}
          >
            <div className="infoList">
              <InfoRow label="Course Code:" value={data.courseCode} />
              <InfoRow label="Course Title (EN):" value={data.courseTitleEN} />
              <InfoRow label="Course Title (TH):" value={data.courseTitleTH ?? "—"} />
              <InfoRow label="Credits:" value={data.credits} />
              <InfoRow label="Semester:" value={data.semester} />
              <InfoRow label="Year:" value={String(data.year)} />

              <div className="infoRow">
                <div className="infoLabel">Instructors:</div>
                <div className="infoValue">
                  {data.instructors.map((ins, idx) => (
                    <div key={`${ins.name}-${idx}`} className="instructorLine">
                      {ins.name}{" "}
                      {ins.email && (
                        <a className="emailLink" href={`mailto:${ins.email}`}>
                          [{ins.email}]
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="thinDivider" />

            <div className="sectionTitle">Course Summary</div>
            <p className="summaryText">{data.summary}</p>

            <div className="tagsTitle">Competency Tags:</div>
            <div className="tagWrap">
              <ExpandableCompetencyTags
                tags={data.competencyTags}
                maxVisible={999}
                contextText={`${data.courseCode} ${data.courseTitleEN}`}
              />
            </div>

            <div className="thinDivider" />

            <div className="statsRow">
              <div className="statItem">
                <div className="statLabel">Final Grade:</div>
                <div className="statValue">{data.finalGrade}</div>
              </div>

              <div className="statItem">
                <div className="statLabel">Overall Competency Index:</div>
                <div className="statValueInline">
                  <span className={`pctBox ${pctTone(data.overallCompetencyIndex)}`} />
                  <span className="pctText">{data.overallCompetencyIndex}%</span>
                </div>
              </div>

              <div className="statItem">
                <div className="statLabel">Relevance to career:</div>
                <div className="statValueInline">
                  <span className={`pctBox ${pctTone(data.relevancePercent)}`} />
                  <span className="pctText">{data.relevancePercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Competency Index Breakdown (Collapsible, default shown) ===== */}
      <div className="dataCard breakdownCard">
        <div className="dataCardInner">
          <button
            type="button"
            className="cardTitleRow"
            onClick={() => setBreakdownOpen((v) => !v)}
            aria-expanded={breakdownOpen}
            aria-controls="breakdown-panel"
          >
            <span className="cardTitleText">
              Competency Index Breakdown <span className="mockNote">(Mock)</span>
            </span>
            <span className={`chev ${breakdownOpen ? "open" : ""}`}>›</span>
          </button>

          <div id="breakdown-panel" className={`collapse ${breakdownOpen ? "open" : ""}`}>
            <div className="breakDivider" />

            <div className="breakTableWrap">
              <table className="breakTable">
                <thead>
                  <tr>
                    <th>Assessment Type</th>
                    <th className="wWeight">Weight</th>
                    <th>Competency Type</th>
                    <th className="wIndex">Competency Index</th>
                  </tr>
                </thead>

                <tbody>
                  {breakdownRows.map((r, i) => (
                    <tr key={i}>
                      <td className="assessCell">{r.assessmentType}</td>
                      <td className="center">{r.weightPercent}%</td>
                      <td>
                        <div className="tagWrap">
                          <ExpandableCompetencyTags
                            tags={r.competencyTags}
                            maxVisible={2}
                            contextText={`${data.courseCode} ${data.courseTitleEN} ${r.assessmentType}`}
                          />
                        </div>
                      </td>
                      <td>
                        <div className="indexCell">
                          <span className={indexColorClass(r.competencyIndex)} />
                          <span className="idxText">{r.competencyIndex}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="overallRow">
                <div className="overallLabel">Overall Competency Index:</div>
                <div className="overallRight">
                  <span className={`pctBox ${pctTone(data.overallCompetencyIndex)}`} />
                  <span className="pctText">{data.overallCompetencyIndex}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="infoRow">
      <div className="infoLabel">{label}</div>
      <div className="infoValue">{value}</div>
    </div>
  );
}
