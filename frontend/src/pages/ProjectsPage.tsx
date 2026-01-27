// src/pages/ProjectsPage.tsx
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import ProjectsTable from "../features/projects/components/ProjectsTable";
import { useProjects } from "../features/projects/hooks/useProjects";

const CAREER_FOCUS = ["Data Analyst", "Data Engineer", "Software Engineer"] as const;

export default function ProjectsPage() {
  const [careerFocus, setCareerFocus] =
    useState<(typeof CAREER_FOCUS)[number]>("Data Analyst");

  const { data, isLoading, error } = useProjects(careerFocus);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 16px 60px" }}>
      <PageHeader
        title="My Projects"
        titleSize={25}
        careerFocus={careerFocus}
        careerFocusOptions={CAREER_FOCUS} // ✅ สำคัญ ไม่งั้นหาย
        onCareerFocusChange={setCareerFocus}
        careerExtra={
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("TODO: Career details page");
            }}
            style={{
              fontSize: 12,
              color: "#2563eb",
              textDecoration: "underline",
              fontWeight: 700,
            }}
          >
            View all career details
          </a>
        }
      />

      <div style={{ borderBottom: "1px solid #e5e7eb", margin: "18px 0 22px" }} />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ color: "#6b7280" }}>
          {isLoading ? "Loading..." : data ? `${data.length} projects` : ""}
        </div>

        <button
          onClick={() => alert("TODO: Add project modal/page")}
          style={{
            height: 40,
            padding: "0 14px",
            borderRadius: 10,
            border: "1px solid #d1d5db",
            background: "#fff",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Add new project
        </button>
      </div>

      {isLoading && <div>Loading projects...</div>}
      {error && <div>Failed to load projects</div>}
      {data && <ProjectsTable projects={data} />}
    </div>
  );
}
