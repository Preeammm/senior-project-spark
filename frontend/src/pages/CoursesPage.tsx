import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import CoursesTable from "../features/courses/components/CoursesTable";
import { useCourses } from "../features/courses/hooks/useCourses";
import { useCareerFocus } from "../features/careerFocus/useCareerFocus";
import "../styles/page.css";
import { useProtectedRoute } from "../hooks/useProtectedRoute";
import "./CoursesPage.css";

export default function CoursesPage() {
  useProtectedRoute();
  const [showGuide, setShowGuide] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const { careerFocus, setCareerFocus, careerFocusOptions } = useCareerFocus();

  const { data, isLoading, error } = useCourses(careerFocus);

  return (
    <div className="pageContainer">
      <PageHeader
        title="My Courses"
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

      <div className="coursesTopBar">
        <div className="coursesTopBarLeft">
          <div className="coursesCount">
            {isLoading ? "Loading..." : data ? `${data.length} courses` : ""}
          </div>
          <button
            type="button"
            className="coursesGuideToggle"
            onClick={() => setShowGuide((value) => !value)}
            aria-expanded={showGuide}
          >
            <span>Quick guide</span>
            <span className={`coursesGuideToggleArrow ${showGuide ? "open" : ""}`} aria-hidden="true">
              ▾
            </span>
          </button>
        </div>
        <div className="coursesHint">
          {careerFocus
            ? `Filtered for ${careerFocus} and sorted by course score`
            : "Showing all courses with no career filter"}
        </div>
      </div>

      {showGuide ? (
        <div className="coursesGuide">
          <div className="coursesGuideTitle">How this page works</div>
          <div className="coursesGuideText">
            My Courses helps you compare available courses and understand how strongly each course supports your selected career focus.
          </div>
          <div className="coursesGuideList">
            <div className="coursesGuideItem">If you have not selected a career focus, all courses are shown.</div>
            <div className="coursesGuideItem">If you select a career focus, the list is sorted by the score calculated from that course for the selected career.</div>
            <div className="coursesGuideItem">Use the course list to see which courses are most useful for building skills in your chosen career path.</div>
          </div>

          <div className="coursesGuideSection">
            <div className="coursesGuideSectionTitle">What the relevance color means</div>
            <div className="coursesGuideSectionText">
              The color in the <b>Relevance</b> column shows how strongly a course matches the skills needed for the selected career.
              A stronger match means the course can help you build more of the important skills for that career.
            </div>

            <div className="coursesColorLegend">
              <div className="coursesColorItem">
                <span className="coursesColorSwatch coursesColorVeryHigh" />
                <div className="coursesColorContent">
                  <div className="coursesColorName">Green: Very high relevance</div>
                  <div className="coursesColorDesc">Excellent match. This course supports many important skills for the selected career.</div>
                </div>
              </div>
              <div className="coursesColorItem">
                <span className="coursesColorSwatch coursesColorHigh" />
                <div className="coursesColorContent">
                  <div className="coursesColorName">Light green: High relevance</div>
                  <div className="coursesColorDesc">Good match. This course supports several useful skills for the selected career.</div>
                </div>
              </div>
              <div className="coursesColorItem">
                <span className="coursesColorSwatch coursesColorModerate" />
                <div className="coursesColorContent">
                  <div className="coursesColorName">Yellow: Moderate relevance</div>
                  <div className="coursesColorDesc">Partial match. This course supports some useful skills, but not the strongest overall fit.</div>
                </div>
              </div>
              <div className="coursesColorItem">
                <span className="coursesColorSwatch coursesColorLow" />
                <div className="coursesColorContent">
                  <div className="coursesColorName">Orange: Low relevance</div>
                  <div className="coursesColorDesc">Limited match. This course contributes a little, but it is not one of the best choices for this career.</div>
                </div>
              </div>
              <div className="coursesColorItem">
                <span className="coursesColorSwatch coursesColorNone" />
                <div className="coursesColorContent">
                  <div className="coursesColorName">Red: No relevance</div>
                  <div className="coursesColorDesc">No meaningful match for the selected career based on the current skill mapping.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="coursesGuideSection">
            <div className="coursesGuideSectionTitle">How the score is interpreted</div>
            <div className="coursesGuideSectionText">
              The system looks at the highest skill levels available in each course and compares them with the maximum skill levels required by the selected career.
              Courses that cover more important skills at higher levels will appear higher in the list and usually show a stronger color.
            </div>
            <div className="coursesGuideNote">
              Tip: If no career focus is selected, the page shows all courses and the relevance color is not used yet.
            </div>
          </div>
        </div>
      ) : null}

      {isLoading && <div className="coursesState">Loading courses...</div>}
      {error && <div className="coursesState error">Failed to load courses</div>}

      {data && <CoursesTable courses={data} showRelevance={!!careerFocus} />}
    </div>
  );
}
