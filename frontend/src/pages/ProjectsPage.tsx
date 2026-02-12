import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import ProjectsTable from "../features/projects/components/ProjectsTable";
import { useProjects } from "../features/projects/hooks/useProjects";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import "../styles/page.css";
import "./ProjectsPage.css";

const CAREER_FOCUS = ["Data Analyst", "Data Engineer", "Software Engineer"] as const;

function toCareerId(label: string) {
  return label.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

export default function ProjectsPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const location = useLocation();

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
              const careerId = toCareerId(careerFocus);
              const from = location.pathname + location.search;

              navigate(
                `/careers?careerId=${encodeURIComponent(careerId)}&from=${encodeURIComponent(from)}`
              );
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

      <div className="assessTopBar">
        <div className="assessCount">
          {isLoading ? "Loading..." : data ? `${data.length} assessments` : ""}
        </div>
        <div className="assessHint">Sorted by relevance for {careerFocus}</div>
      </div>

      {isLoading && <div className="assessState">Loading assessments...</div>}
      {error && <div className="assessState error">Failed to load assessments</div>}
      {data && <ProjectsTable projects={data} />}
    </div>
  );
}
