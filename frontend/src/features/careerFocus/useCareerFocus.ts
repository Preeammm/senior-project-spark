import { useCallback, useState } from "react";

export const CAREER_FOCUS_OPTIONS = [
  "Data Analyst",
  "Data Engineer",
  "Software Engineer",
] as const;

export type CareerFocus = (typeof CAREER_FOCUS_OPTIONS)[number];

const DEFAULT_CAREER_FOCUS: CareerFocus = "Data Analyst";
const CAREER_FOCUS_STORAGE_KEY = "spark.careerFocus";

function isCareerFocus(value: string): value is CareerFocus {
  return CAREER_FOCUS_OPTIONS.includes(value as CareerFocus);
}

function getStoredCareerFocus(): CareerFocus {
  if (typeof window === "undefined") return DEFAULT_CAREER_FOCUS;
  const raw = window.localStorage.getItem(CAREER_FOCUS_STORAGE_KEY);
  return raw && isCareerFocus(raw) ? raw : DEFAULT_CAREER_FOCUS;
}

export function useCareerFocus() {
  const [careerFocus, setCareerFocusState] = useState<CareerFocus>(getStoredCareerFocus);

  const setCareerFocus = useCallback((next: CareerFocus) => {
    setCareerFocusState(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(CAREER_FOCUS_STORAGE_KEY, next);
    }
  }, []);

  return {
    careerFocus,
    setCareerFocus,
    careerFocusOptions: CAREER_FOCUS_OPTIONS,
  };
}
