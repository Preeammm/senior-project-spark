export type Course = {
  id: string;
  courseCode: string;
  courseName: string;
  competencyTags: string[];
  relevancePercent: number; // 0-100
  grade: string;
};

export type CourseDetail = {
  id: string;
  courseCode: string;
  courseTitleEN: string;
  courseTitleTH?: string;
  credits: string;
  semester: string;
  year: number;
  instructors: { name: string; email?: string }[];
  summary: string;
  competencyTags: string[];
  finalGrade: string;
  overallCompetencyIndex: number;
  relevancePercent: number;
  breakdown: {
    assessmentType: string;
    weightPercent: number;
    competencyTags: string[];
    competencyIndex: number;
  }[];
};
