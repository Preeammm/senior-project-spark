import { useQuery } from "@tanstack/react-query";
import { listCourses } from "../services/courses.api";

export function useCourses(careerFocus: string) {
  return useQuery({
    queryKey: ["courses", careerFocus],
    queryFn: () => listCourses(careerFocus),
  });
}
