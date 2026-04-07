import { http } from "../../../services/http";
import type { Course, CourseDetail } from "../types";

export async function listCourses(careerFocus?: string): Promise<Course[]> {
  const { data } = await http.get("/api/courses", {
    params: careerFocus ? { careerFocus } : undefined,
  });
  return data;
}

export async function getCourseDetail(
  courseId: string,
  careerFocus?: string
): Promise<CourseDetail> {
  const { data } = await http.get(`/api/courses/${courseId}`, {
    params: { careerFocus },
  });
  return data;
}

export async function getRelevanceInfo(careerFocus?: string) {
  const { data } = await http.get("/api/relavacne_info", {
    params: careerFocus ? { careerFocus } : undefined,
  });
  return data.data || [];
}

export async function getRelevanceScores(careerFocus?: string) {
  const { data } = await http.get("/api/relavacne_scores", {
    params: careerFocus ? { careerFocus } : undefined,
  });
  return data.data || [];
}
