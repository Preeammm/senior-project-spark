import { http } from "../../../services/http";
import type { Course, CourseDetail } from "../types";

export async function listCourses(careerFocus?: string): Promise<Course[]> {
  const { data } = await http.get("/api/courses", {
    params: careerFocus ? { careerFocus } : undefined,
  });
  return data;
}

export async function listMyCourses(): Promise<Course[]> {
  const { data } = await http.get("/api/my-courses");
  const rows = Array.isArray(data?.data) ? data.data : [];

  return rows.map((row: any) => ({
    id: String(row.course_code ?? ""),
    courseCode: String(row.course_code ?? ""),
    courseName: String(row.course_name ?? row.course_code ?? ""),
    competencyTags: Array.isArray(row.competency_tags)
      ? row.competency_tags.map((tag: any) => String(tag))
      : [],
    relevancePercent: 0,
    grade: "",
    skills: Array.isArray(row.competency_tags)
      ? row.competency_tags.map((tag: any) => String(tag))
      : [],
  }));
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
