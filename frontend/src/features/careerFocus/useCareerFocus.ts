import { useCallback, useState } from "react";

export const CAREER_FOCUS_OPTIONS = [
  "Data Analyst",
  "Data Engineer",
  "Software Engineer",
] as const;

export type CareerFocusOption = (typeof CAREER_FOCUS_OPTIONS)[number];
export type CareerFocus = CareerFocusOption | "";

const DEFAULT_CAREER_FOCUS: CareerFocus = "";
const CAREER_FOCUS_STORAGE_KEY = "spark.careerFocus";

function isCareerFocus(value: string): value is CareerFocusOption {
  return CAREER_FOCUS_OPTIONS.includes(value as CareerFocusOption);
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
      if (next) {
        window.localStorage.setItem(CAREER_FOCUS_STORAGE_KEY, next);
      } else {
        window.localStorage.removeItem(CAREER_FOCUS_STORAGE_KEY);
      }
    }
  }, []);

  return {
    careerFocus,
    setCareerFocus,
    careerFocusOptions: CAREER_FOCUS_OPTIONS,
  };
}
