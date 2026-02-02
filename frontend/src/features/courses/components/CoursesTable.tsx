// src/features/courses/components/CoursesTable.tsx
import { Link } from "react-router-dom";
import type { Course } from "../types";
import TagPill from "./TagPill";
import ProgressBadge from "../../../components/ProgressBadge";
import "./CoursesTable.css";

type Props = { courses: Course[] };

function toneByIndex(i: number) {
  return (["pink", "green", "blue", "sand"] as const)[i % 4];
}

export default function CoursesTable({ courses }: Props) {
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
            const show = c.competencyTags.slice(0, 3);
            const more = c.competencyTags.length - show.length;

            const topRow = show.slice(0, 2);
            const bottomRow = show.slice(2, 3);

            return (
              <tr key={c.id}>
                <td>
                  {/* ✅ real navigation */}
                  <Link className="courseLink" to={`/courses/${c.id}`}>
                    {c.courseCode}_ {c.courseName}
                  </Link>
                </td>

                <td>
                  <div className="tagsBlock">
                    <div className="tagsRow">
                      {topRow.map((t, i) => (
                        <TagPill
                          key={`${c.id}-${t}-${i}`}
                          label={t}
                          tone={toneByIndex(i)}
                        />
                      ))}
                    </div>

                    <div className="tagsRow">
                      {bottomRow.map((t, i) => (
                        <TagPill
                          key={`${c.id}-${t}-${i + 2}`}
                          label={t}
                          tone={toneByIndex(i + 2)}
                        />
                      ))}
                      {more > 0 && <span className="moreText">+ {more} more</span>}
                    </div>
                  </div>
                </td>

                <td className="relevanceCol">
                  <ProgressBadge value={c.relevancePercent} />
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
