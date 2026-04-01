import { Link } from "react-router-dom";
import type { Assessment } from "../types";
import ExpandableCompetencyTags from "../../courses/components/ExpandableCompetencyTags";
import ProgressBadge from "../../../components/ProgressBadge";
import "../../projects/components/ProjectsTable.css";

function formatSemester(value: string) {
  const raw = String(value ?? "").trim();
  if (!raw) return "-";

  const parts = raw.split(/[-\/]/).map((part) => part.trim());
  if (parts.length === 2 && parts[0] && parts[1]) {
    const year = parts[0].length === 2 ? `25${parts[0]}` : parts[0];
    const sem = parts[1];
    return `${year}/${sem}`;
  }

  return raw;
}

export default function AssessmentsTable({
  assessments,
}: {
  assessments: Assessment[];
}) {
  return (
    <div className="projectsTableWrap">
      <table className="projectsTable">
        <thead>
          <tr>
            <th className="thLeft">Assessment</th>
            <th className="thLeft">Course</th>
            <th className="thLeft">Year/Semester</th>
            <th className="thLeft">Competency Tags</th>
            <th className="relevanceCell">Performance %</th>
          </tr>
        </thead>
        <tbody>
          {assessments.map((assessment) => {
            const scorePercent = assessment.fullScoreClo
              ? Math.round((assessment.studentScoreClo / assessment.fullScoreClo) * 100)
              : 0;
            const tags = assessment.skillTitle ? [assessment.skillTitle] : [];

            return (
              <tr key={assessment.id}>
                <td>
                  <div className="projectNameCell">
                    <span className="projectIcon" aria-hidden>
                      📄
                    </span>
                    <span className="projectName">
                      {assessment.courseName
                        ? `${assessment.courseName} project`
                        : assessment.skillTitle || assessment.cloCode || "Assessment"}
                    </span>
                  </div>
                </td>
                <td className="courseCell">
                  <Link className="courseLink" to={`/courses/${encodeURIComponent(assessment.courseCode)}`}>
                    {assessment.courseCode && assessment.courseName
                      ? `${assessment.courseCode} - ${assessment.courseName}`
                      : assessment.courseName || assessment.courseCode || "-"}
                  </Link>
                </td>
                <td>{formatSemester(assessment.semester)}</td>
                <td>
                  <div className="tagsWrap">
                    <ExpandableCompetencyTags
                      tags={tags}
                      maxVisible={2}
                      contextText={`${assessment.courseName} ${assessment.skillTitle}`}
                    />
                  </div>
                </td>
                <td className="relevanceCell">
                  <div className="relevanceInner">
                    <ProgressBadge value={scorePercent} />
                  </div>
                </td>
              </tr>
            );
          })}
          {assessments.length === 0 && (
            <tr>
              <td className="emptyRow" colSpan={5}>
                No assessments
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
