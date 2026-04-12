import { useCallback, useEffect, useState } from "react";

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
const STORAGE_KEY = "spark_career_focus";

export function useCareerFocus() {
  const [careerFocus, setCareerFocusState] = useState<CareerFocus>(DEFAULT_CAREER_FOCUS);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (saved === "" || CAREER_FOCUS_OPTIONS.includes(saved as CareerFocusOption))) {
        setCareerFocusState(saved as CareerFocus);
      }
    } catch (error) {
      console.error("Failed to load career focus from localStorage:", error);
    }
    setIsHydrated(true);
  }, []);

  const setCareerFocus = useCallback((next: CareerFocus) => {
    setCareerFocusState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch (error) {
      console.error("Failed to save career focus to localStorage:", error);
    }
  }, []);

  return {
    careerFocus,
    setCareerFocus,
    careerFocusOptions: CAREER_FOCUS_OPTIONS,
    isHydrated,
  };
}
