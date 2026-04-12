import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import AssessmentsTable from "../features/assessments/components/AssessmentsTable";
import { useAssessments } from "../features/assessments/hooks/useAssessments";
import type { Assessment } from "../features/assessments/types";
import { useCareerFocus } from "../features/careerFocus/useCareerFocus";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import "../styles/page.css";
import "./ProjectsPage.css";

export default function ProjectsPage() {
  useProtectedRoute();
  const [showGuide, setShowGuide] = useState(false);
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
                const careerId = careerFocus.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
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

      <div className="assessTopBar">
        <div className="assessTopBarLeft">
          <div className="assessCount">
            {isLoading ? "Loading..." : data ? `${data.length} assessments` : ""}
          </div>
          <button
            type="button"
            className="assessGuideToggle"
            onClick={() => setShowGuide((value) => !value)}
            aria-expanded={showGuide}
          >
            <span>Quick guide</span>
            <span className={`assessGuideToggleArrow ${showGuide ? "open" : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>
        </div>
        <div className="assessHint">
          {careerFocus
            ? `Filtered by ${careerFocus} and sorted by performance`
            : "Showing all assessments sorted by performance"}
        </div>
      </div>

      {showGuide ? (
        <div className="assessGuide">
          <div className="assessGuideTitle">How this page works</div>
          <div className="assessGuideText">
            My Assessments shows your project-based assessment results and helps you compare where you are currently performing best.
          </div>
          <div className="assessGuideList">
            <div className="assessGuideItem">If you have not selected a career focus, all assessments are shown.</div>
            <div className="assessGuideItem">If you select a career focus, only assessments related to skills in that career are shown.</div>
            <div className="assessGuideItem">The table is sorted by <b>Performance %</b> from highest to lowest, so stronger results appear first.</div>
            <div className="assessGuideItem"><b>Performance %</b> shows how well you performed in that assessment based on the score achieved for the related project or CLO work.</div>
            <div className="assessGuideItem"><b>Competency Tags</b> show which skill area that assessment contributes to.</div>
            <div className="assessGuideItem">Use this page to identify your strongest assessment results and see which skills they support for your selected career path.</div>
          </div>
        </div>
      ) : null}

      {isLoading && <div className="assessState">Loading assessments...</div>}
      {error && <div className="assessState error">Failed to load assessments</div>}
      {data && <AssessmentsTable assessments={sortedAssessments} />}
    </div>
  );
}
