// CourseDetailPage.tsx  (FULL - career dropdown can change now)
// NOTE: this file assumes your PageHeader calls onCareerFocusChange(newValue)

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

type EvaluationRow = {
  label: string;
  value: string;
};

type CourseDetail = {
  id: string;
  courseCode: string;
  courseTitleEN: string;
  courseTitleTH?: string;
  credits: string;
  semester: string;
  year: number;
  session?: string;
  instructors: Instructor[];
  summary: string;
  description?: string;
  competencyTags: string[];
  finalGrade: string;
  overallCompetencyIndex: number;
  relevancePercent: number;
  learningOutcomes?: string[];
  evaluation?: EvaluationRow[];
  breakdown: {
    assessmentType: string;
    weightPercent: number;
    competencyTags: string[];
    competencyIndex: number;
  }[];
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
  const breakdown: {
    assessmentType: string;
    weightPercent: number;
    competencyTags: string[];
    competencyIndex: number;
  }[] = [
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
    description: raw?.description ?? raw?.summary ?? "Mock course detail data (replace later).",
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
    learningOutcomes: Array.isArray(raw?.learningOutcomes)
      ? raw.learningOutcomes.map((outcome: any) => String(outcome))
      : [],
    evaluation: Array.isArray(raw?.evaluation)
      ? raw.evaluation.map((item: any) => ({
          label: String(item?.label ?? ""),
          value: String(item?.value ?? ""),
        }))
      : [],
    session: raw?.session ??
      (raw?.semester ? `Semester ${raw.semester} / Year ${raw.year}` : ""),
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

  const { careerFocus, setCareerFocus, careerFocusOptions } = useCareerFocus();

  const { data, isLoading, error } = useQuery({
    queryKey: ["course-detail", courseId, careerFocus],
    enabled: !!courseId && !!careerFocus,
    queryFn: async () => normalize(await getCourseDetail(String(courseId), careerFocus)),
  });

  if (!careerFocus) {
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
        <div>Please select a career focus to view course details.</div>
      </div>
    );
  }

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
        {data.courseCode}_{data.courseTitleEN}
      </h1>

      {/* ===== Course Information ===== */}
      <div className="dataCard">
        <div className="dataCardInner">
          <strong>Course Title</strong>
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
                <br></br>

    
          <div className="courseDetailCopy">
              
              

              <div className="courseDescriptionMeta">
                <div>
                  <strong>Number of Credits</strong>
                  <div>{data.credits}</div>
                  <div className="metaHint">Credits (Lecture – Laboratory – Self-study)</div>
                </div>
                <div className="thinDivider" />
                {data.session ? (
                  <div>
                    <strong>Session</strong>
                    <div>{data.session}</div>
                  </div>
                ) : null}
              </div>

              <div className="thinDivider" />
              <div className="sectionSubtitle"><strong>Course Description</strong></div>
              <p className="summaryText">{data.description ?? data.summary}</p>
                <br></br>
              <div className="thinDivider" />
              {data.learningOutcomes && data.learningOutcomes.length > 0 ? (
                <>
                  <div className="sectionSubtitle"><strong>Course Learning Outcome (CLOs)</strong></div>
                  <ul className="learningOutcomesList">
                    {data.learningOutcomes.map((outcome, idx) => (
                      <li key={idx}>CLO{idx+1}: {outcome}</li>
                    ))}
                  </ul>
                </>
              ) : null}
              <div className="thinDivider" />
              {data.evaluation && data.evaluation.length > 0 ? (
                <>
                  <div className="sectionSubtitle"><strong>Course Evaluation</strong></div>
                  <ul className="evaluationList">
                    {data.evaluation.map((item, idx) => (
                      <li key={idx}>
                        {item.label} {item.value}
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>

          <div className="thinDivider" />
          <div className=""><strong>Competency Tags</strong></div>
          <div className="tagWrap">
            <ExpandableCompetencyTags
              tags={data.competencyTags}
              maxVisible={999}
              contextText={`${data.courseCode} ${data.courseTitleEN}`}
            />
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
