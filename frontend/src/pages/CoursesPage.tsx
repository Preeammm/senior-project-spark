// src/pages/CoursesPage.tsx
import { useState } from "react";
import PageHeader from "../components/PageHeader";
import CoursesTable from "../features/courses/components/CoursesTable";
import { useCourses } from "../features/courses/hooks/useCourses";
import { useProtectedRoute } from "../hooks/useProtectedRoute";

const CAREER_FOCUS = ["Data Analyst", "Data Engineer", "Software Engineer"] as const;

export default function CoursesPage() {
  useProtectedRoute();
  const [careerFocus, setCareerFocus] =
    useState<(typeof CAREER_FOCUS)[number]>("Data Analyst");

  const { data, isLoading, error } = useCourses(careerFocus);

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "26px 16px 60px" }}>
      <PageHeader
        title="My Courses"
        titleSize={25}
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

      <div style={{ borderBottom: "1px solid #e5e7eb", margin: "18px 0 26px" }} />

      {isLoading && <div>Loading...</div>}
      {error && <div>Failed to load courses</div>}
      {data && <CoursesTable courses={data} />}
    </div>
  );
}
