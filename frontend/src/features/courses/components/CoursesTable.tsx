import type { Course } from "../types";
import TagPill from "./TagPill";
import ProgressBadge from "../../../components/ProgressBadge";

type Props = { courses: Course[] };

function toneByIndex(i: number) {
  return (["pink", "green", "blue", "sand"] as const)[i % 4];
}

export default function CoursesTable({ courses }: Props) {
  return (
    <div
      style={{
        background: "#f6f7f8",
        padding: 28,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
          }}
        >
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={th}>Course Name</th>
              <th style={th}>Competency Tags</th>
              <th style={th}>Relevance %</th>
              <th style={th}>Grade</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((c) => {
              const show = c.competencyTags.slice(0, 3);
              const more = c.competencyTags.length - show.length;

              return (
                <tr key={c.id} style={{ borderTop: "1px solid #eef2f7" }}>
                  <td style={td}>
                    <a
                      href="#"
                      style={{
                        color: "#1d4ed8",
                        textDecoration: "underline",
                        fontWeight: 600,
                      }}
                      onClick={(e) => e.preventDefault()}
                    >
                      {c.courseCode}_ {c.courseName}
                    </a>
                  </td>

                  <td style={td}>
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      {show.map((t, i) => (
                        <TagPill key={t} label={t} tone={toneByIndex(i)} />
                      ))}
                      {more > 0 && (
                        <span
                          style={{
                            color: "#6b7280",
                            fontSize: 13,
                            alignSelf: "center",
                            marginLeft: 2,
                          }}
                        >
                          + {more} more
                        </span>
                      )}
                    </div>
                  </td>

                  <td style={td}>
                    <ProgressBadge value={c.relevancePercent} />
                  </td>

                  <td style={{ ...td, fontWeight: 700, textAlign: "center" }}>
                    {c.grade}
                  </td>
                </tr>
              );
            })}

            {courses.length === 0 && (
              <tr>
                <td style={{ padding: 24 }} colSpan={4}>
                  No courses
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* ทำพื้นที่ว่างด้านล่างเหมือนภาพ */}
        <div style={{ height: 280, background: "#fff" }} />
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "18px 18px",
  textAlign: "left",
  fontWeight: 700,
  color: "#374151",
};

const td: React.CSSProperties = {
  padding: "18px 18px",
  verticalAlign: "top",
  color: "#111827",
};
