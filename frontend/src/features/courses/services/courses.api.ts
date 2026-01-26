import { http } from "../../../services/http";
import type { Course, CourseDetail } from "../types";

export async function listCourses(careerFocus: string): Promise<Course[]> {
  const { data } = await http.get("/api/courses", { params: { careerFocus } });
  return data;
}

export async function getCourseDetail(courseId: string): Promise<CourseDetail> {
  const { data } = await http.get(`/api/courses/${courseId}`);
  return data;
}
