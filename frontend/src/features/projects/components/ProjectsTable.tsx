import { Link } from "react-router-dom";
import type { Project } from "../types";
import MaterialsLinks from "./MaterialsLinks";
import ProgressBadge from "../../../components/ProgressBadge";
import ExpandableCompetencyTags from "../../courses/components/ExpandableCompetencyTags";
import "./ProjectsTable.css";

function getCourseCodeFromCourseName(courseName: string) {
  if (!courseName) return "";

  // "ITCS495 - Something..." -> "ITCS495"
  const match = courseName.trim().match(/^([A-Za-z]{2,10}\d{2,6})\b/);
  if (match?.[1]) return match[1];

  const parts = courseName.split(" - ");
  if (parts[0]?.trim()) return parts[0].trim();

  return courseName.trim();
}

export default function ProjectsTable({
  projects,
  showRelevance = true,
}: {
  projects: Project[];
  showRelevance?: boolean;
}) {
  return (
    <div className="projectsTableWrap">
      <table className="projectsTable">
        <thead>
          <tr>
            <th className="thLeft">Assessment Name</th>
            <th className="thLeft">Course</th>
            <th className="thLeft">Year/Semester</th>
            <th className="thLeft">Type</th>
            <th className="thLeft">Competency Tags</th>
            <th className="relevanceCell">Relevance %</th>
            <th className="thLeft materialsCell">Materials</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((p) => {
            const courseCode = getCourseCodeFromCourseName(p.courseName);

            return (
              <tr key={p.id}>
                <td>
                  <div className="projectNameCell">
                    <span className="projectIcon" aria-hidden>
                      📄
                    </span>
                    <span className="projectName">{p.projectName}</span>
                  </div>
                </td>

                <td className="courseCell">
                  <Link
                    className="courseLink"
                    to={`/courses/${encodeURIComponent(courseCode)}`}
                  >
                    {p.courseName}
                  </Link>
                </td>

                <td>{p.yearSemester}</td>
                <td>{p.type}</td>

                <td>
                  <div className="tagsWrap">
                    <ExpandableCompetencyTags
                      tags={p.competencyTags}
                      maxVisible={2}
                      contextText={`${p.projectName} ${p.courseName} ${p.type}`}
                    />
                  </div>
                </td>

                <td className="relevanceCell">
                  <div className="relevanceInner">
                    {showRelevance ? <ProgressBadge value={p.relevancePercent} /> : "—"}
                  </div>
                </td>

                <td className="materialsCell">
                  <MaterialsLinks materials={p.materials} />
                </td>
              </tr>
            );
          })}

          {projects.length === 0 && (
            <tr>
              <td className="emptyRow" colSpan={7}>
                No assessments
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
