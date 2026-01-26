import { useQuery } from "@tanstack/react-query";
import { getCourseDetail } from "../services/courses.api";

export function useCourseDetail(courseId: string) {
  return useQuery({
    queryKey: ["course", courseId],
    queryFn: () => getCourseDetail(courseId),
    enabled: !!courseId,
  });
}
