import type { Project } from "../types";
import TagPill from "./TagPill";
import MaterialsLinks from "./MaterialsLinks";
import ProgressBadge from "../../../components/ProgressBadge";
import "./ProjectsTable.css";

export default function ProjectsTable({ projects }: { projects: Project[] }) {
  return (
    <div className="projects-table-wrapper">
      <table className="projects-table">
        <thead>
          <tr>
            <th>Project Name</th>
            <th>Course</th>
            <th>Year/Semester</th>
            <th>Type</th>
            <th>Competency Tags</th>
            <th>Relevance %</th>
            <th>Materials</th>
          </tr>
        </thead>

        <tbody>
          {projects.map((p) => (
            <tr key={p.id}>
              <td className="project-name">📄 {p.projectName}</td>

              <td>
                <a className="course-link" href="#">
                  {p.courseName}
                </a>
              </td>

              <td>{p.yearSemester}</td>
              <td>{p.type}</td>

              <td>
                <div className="tag-group">
                  {p.competencyTags.map((t) => (
                    <TagPill key={t} label={t} />
                  ))}
                  <span className="tag-edit">Edit</span>
                </div>
              </td>

              <td>
                <ProgressBadge value={p.relevancePercent} />
              </td>

              <td className="materials">
                <MaterialsLinks materials={p.materials} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
