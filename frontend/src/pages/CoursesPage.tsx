import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import PageHeader from "../components/PageHeader";
import CoursesTable from "../features/courses/components/CoursesTable";
import { useCourses } from "../features/courses/hooks/useCourses";
import "../styles/page.css";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

const CAREER_FOCUS = ["Data Analyst", "Data Engineer", "Software Engineer"] as const;

// ✅ helper: "Data Engineer" -> "data-engineer"
function toCareerId(label: string) {
  return label.trim().toLowerCase().replace(/\./g, "").replace(/\s+/g, "-");
}

export default function CoursesPage() {
  useProtectedRoute();
  const navigate = useNavigate();
  const location = useLocation();

  const [careerFocus, setCareerFocus] =
    useState<(typeof CAREER_FOCUS)[number]>("Data Analyst");

  const { data, isLoading, error } = useCourses(careerFocus);

  return (
    <div className="pageContainer">
      <PageHeader
        title="My Courses"
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

      {isLoading && <div>Loading...</div>}
      {error && <div>Failed to load courses</div>}

      {data && <CoursesTable courses={data} />}
    </div>
  );
}
