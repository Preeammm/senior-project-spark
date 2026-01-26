export type Course = {
  id: string;
  courseName: string;
  competencyTags: string[];
  relevancePercent: number;
  grade: string; // "A", "B+"
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
