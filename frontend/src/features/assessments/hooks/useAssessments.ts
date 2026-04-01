import { useQuery } from "@tanstack/react-query";
import { listAssessments } from "../services/assessments.api";
import type { Assessment } from "../types";

export function useAssessments(careerFocus?: string) {
  return useQuery<Assessment[], Error>({
    queryKey: ["assessments", careerFocus],
    queryFn: () => listAssessments(careerFocus),
    enabled: Boolean(careerFocus),
  });
}
