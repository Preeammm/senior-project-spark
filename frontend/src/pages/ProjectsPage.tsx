import { useNavigate, useLocation } from "react-router-dom";
import { useMemo } from "react";

import PageHeader from "../components/PageHeader";
import AssessmentsTable from "../features/assessments/components/AssessmentsTable";
import { useAssessments } from "../features/assessments/hooks/useAssessments";
import type { Assessment } from "../features/assessments/types";
import { useCareerFocus } from "../features/careerFocus/useCareerFocus";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import "../styles/page.css";
import "./ProjectsPage.css";

function toCareerId(label: string) {
  return label.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

export default function ProjectsPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const location = useLocation();

  const { careerFocus, setCareerFocus, careerFocusOptions } = useCareerFocus();

  const assessmentsQuery = useAssessments(careerFocus);
  const data = assessmentsQuery.data as Assessment[] | undefined;
  const { isLoading, error } = assessmentsQuery;
  const sortedAssessments = useMemo(() => {
    if (!data) return [];

    return [...data].sort((a, b) => {
      const aScore = a.fullScoreClo ? a.studentScoreClo / a.fullScoreClo : 0;
      const bScore = b.fullScoreClo ? b.studentScoreClo / b.fullScoreClo : 0;
      return bScore - aScore;
    });
  }, [data]);

  return (
    <div className="pageContainer">
      <PageHeader
        title="My Assessments"
        careerFocus={careerFocus}
        careerFocusOptions={careerFocusOptions}
        onCareerFocusChange={setCareerFocus}
        careerExtra={
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              const from = location.pathname + location.search;
              if (careerFocus) {
                const careerId = toCareerId(careerFocus);
                navigate(
                  `/careers?careerId=${encodeURIComponent(careerId)}&from=${encodeURIComponent(from)}`
                );
                return;
              }
              navigate(`/careers?from=${encodeURIComponent(from)}`);
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

      {careerFocus ? (
        <>
          <div className="assessTopBar">
            <div className="assessCount">
              {isLoading ? "Loading..." : data ? `${data.length} assessments` : ""}
            </div>
            <div className="assessHint">
              {`Sorted by relevance for ${careerFocus}`}
            </div>
          </div>

          {isLoading && <div className="assessState">Loading assessments...</div>}
          {error && <div className="assessState error">Failed to load assessments</div>}
          {data && <AssessmentsTable assessments={sortedAssessments} />}
        </>
      ) : null}
    </div>
  );
}
