import { useState } from "react";
import PageHeader from "../components/PageHeader";
import ProjectsTable from "../features/projects/components/ProjectsTable";
import { useProjects } from "../features/projects/hooks/useProjects";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import "../styles/page.css";

const CAREER_FOCUS = ["Data Analyst", "Data Engineer", "Software Engineer"] as const;

export default function ProjectsPage() {
  useProtectedRoute();
  const [careerFocus, setCareerFocus] =
    useState<(typeof CAREER_FOCUS)[number]>("Data Analyst");

  const { data, isLoading, error } = useProjects(careerFocus);

  return (
    <div className="pageContainer">
      <PageHeader
        title="My Assessments"
        careerFocus={careerFocus}
        careerFocusOptions={CAREER_FOCUS}
        onCareerFocusChange={setCareerFocus}
        careerExtra={
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("TODO: Career details page");
            }}
            style={{
              display: "inline-block",
              fontSize: 13,
              color: "#2563eb",
              textDecoration: "underline",
              fontWeight: 600,
            }}
          >
            View all career details
          </a>
        }
      />

      <div className="dividerLine" />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ color: "#6b7280" }}>
          {isLoading ? "Loading..." : data ? `${data.length} assessments` : ""}
        </div>

        {/* removed Add new project button */}
      </div>

      {isLoading && <div>Loading assessments...</div>}
      {error && <div>Failed to load assessments</div>}
      {data && <ProjectsTable projects={data} />}
    </div>
  );
}
