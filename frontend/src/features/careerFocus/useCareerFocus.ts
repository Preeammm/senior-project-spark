import { useCallback, useState } from "react";

export const CAREER_FOCUS_OPTIONS = [
  "Application Support",
  "Automation Tester",
  "Business Analyst",
  "Data Analyst",
  "Data Engineer",
  "Data Scientist",
  "Database Administrator",
  "Front-end Developer",
  "Game Developer",
  "IT Auditor",
  "IT Project Manager",
  "IT Support",
  "Manual Tester",
  "Network Administrator",
  "Penetration Tester",
  "Platform Engineer",
  "Pre-sale Consultant",
  "Sales Engineer",
  "Security Engineer",
  "Software Engineer",
  "System Administrator",
  "System Analyst",
  "Technical Consultant",
  "UI Designer",
  "UX Designer"
] as const;

export type CareerFocusOption = (typeof CAREER_FOCUS_OPTIONS)[number];
export type CareerFocus = CareerFocusOption | "";

const DEFAULT_CAREER_FOCUS: CareerFocus = "";

export function useCareerFocus() {
  const [careerFocus, setCareerFocusState] = useState<CareerFocus>(DEFAULT_CAREER_FOCUS);

  const setCareerFocus = useCallback((next: CareerFocus) => {
    setCareerFocusState(next);
  }, []);

  return {
    careerFocus,
    setCareerFocus,
    careerFocusOptions: CAREER_FOCUS_OPTIONS,
  };
}
