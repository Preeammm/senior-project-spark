export type Course = {
  id: string;
  courseCode: string;
  courseName: string;
  competencyTags: string[];
  relevancePercent: number; // 0-100
  grade: string;
  // New fields from relevance endpoints
  skills?: string[]; // All skills from relavacne_info
  score?: number; // Normalized score from relavacne_scores
  index?: number; // Index score from relavacne_scores
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
