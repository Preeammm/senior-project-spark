// src/features/courses/components/CoursesTable.tsx
import { Link } from "react-router-dom";
import type { Course } from "../types";
import ProgressBadge from "../../../components/ProgressBadge";
import ExpandableCompetencyTags from "./ExpandableCompetencyTags";
import "./CoursesTable.css";

type Props = { courses: Course[] };

export default function CoursesTable({ courses, showRelevance = true }: Props & { showRelevance?: boolean }) {
  return (
    <div className="coursesTableWrap">
      <table className="coursesTable">
        <thead>
          <tr>
            <th>Course Name</th>
            <th>Competency Tags</th>
            <th className="relevanceCol">Relevance %</th>
            <th className="gradeCol">Grade</th>
          </tr>
        </thead>

        <tbody>
          {courses.map((c) => {
            return (
              <tr key={c.id}>
                <td>
                  {/* ✅ real navigation */}
                  <Link className="courseLink" to={`/courses/${c.id}`}>
                    {c.courseCode}_ {c.courseName}
                  </Link>
                </td>

                <td>
                  <ExpandableCompetencyTags
                    tags={c.competencyTags}
                    maxVisible={2}
                    contextText={`${c.courseCode} ${c.courseName}`}
                  />
                </td>

                <td className="relevanceCol">
                  {showRelevance ? <ProgressBadge value={c.relevancePercent} /> : "—"}
                </td>

                <td className="gradeCol">{c.grade}</td>
              </tr>
            );
          })}

          {courses.length === 0 && (
            <tr>
              <td className="emptyRow" colSpan={4}>
                No courses
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
