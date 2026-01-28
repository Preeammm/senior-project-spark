import type { Project } from "../types";
import TagPill from "./TagPill";
import MaterialsLinks from "./MaterialsLinks";
import ProgressBadge from "../../../components/ProgressBadge";
import "./ProjectsTable.css";

export default function ProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <div className="projectsTableWrap">
      <table className="projectsTable">
        <thead>
          <tr>
            <th className="thLeft">Project Name</th>
            <th className="thLeft">Course</th>
            <th className="thLeft">Year/Semester</th>
            <th className="thLeft">Type</th>
            <th className="thLeft">Competency Tags</th>
            <th className="relevanceCell">Relevance %</th>
            <th className="thLeft materialsCell">Materials</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((p) => (
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
                <a
                  className="courseLink"
                  href="#"
                  onClick={(e) => e.preventDefault()}
                >
                  {p.courseName}
                </a>
              </td>

              <td>{p.yearSemester}</td>
              <td>{p.type}</td>

              <td>
                <div className="tagsWrap">
                  {p.competencyTags.map((t, i) => (
                    <TagPill key={`${p.id}-${t}-${i}`} label={t} />
                  ))}
                  <span className="tagEdit" onClick={() => alert("TODO: Edit tags")}>
                    Edit
                  </span>
                </div>
              </td>

              {/* ✅ ครอบ badge ด้วย div เพื่อจัดกลาง */}
              <td className="relevanceCell">
                <div className="relevanceInner">
                  <ProgressBadge value={p.relevancePercent} />
                </div>
              </td>

              <td className="materialsCell">
                <MaterialsLinks materials={p.materials} />
              </td>
            </tr>
          ))}

          {projects.length === 0 && (
            <tr>
              <td className="emptyRow" colSpan={7}>
                No projects
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
