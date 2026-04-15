import { http } from "../../../services/http";
import type { Assessment } from "../types";

type RawAssessment = {
  course_code?: string;
  course_name?: string;
  semester?: string | number;
  total_normalized_score?: string | number;
  clo_code?: string;
  skill_title?: string;
  enrollment_type?: string;
  student_score_clo?: string | number;
  full_score_clo?: string | number;
  project_id?: number;
  project_name?: string;
};

export async function listAssessments(careerFocus?: string): Promise<Assessment[]> {
  const { data } = await http.get("/api/assessments", {
    params: careerFocus ? { careerFocus } : undefined,
  });

  const rows = Array.isArray(data?.data) ? data.data : [];

  return rows.map((row: RawAssessment, index: number) => {
    const courseCode = String(row.course_code ?? "");
    const semesterValue = row.semester ?? "";
    const normalizedScore = Number(row.total_normalized_score ?? row.student_score_clo ?? 0);
    const id = `${courseCode}-${String(row.clo_code ?? "").trim()}-${index}`;

    return {
      id,
      projectId: row.project_id || 0,
      projectName: String(row.project_name ?? ""),
      courseCode,
      courseName: String(row.course_name ?? courseCode),
      semester: String(semesterValue),
      cloCode: String(row.clo_code ?? ""),
      skillTitle: String(row.skill_title ?? ""),
      enrollmentType: String(row.enrollment_type ?? ""),
      studentScoreClo: normalizedScore,
      fullScoreClo: row.total_normalized_score != null ? 100 : Number(row.full_score_clo ?? 0),
    };
  });
}
