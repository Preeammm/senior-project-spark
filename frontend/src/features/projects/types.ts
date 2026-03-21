export type ProjectMaterial = { name: string; url: string };

export type Project = {
  id: string;
  projectName: string;
  courseName: string;
  yearSemester: string; // "Year 4 Semester 1"
  type: "Group" | "Individual";
  competencyTags: string[];
  performancePercent: number; // 0-100
  relevancePercent: number; // 0-100
  courseImportancePercent?: number; // 0-100
  materials: ProjectMaterial[];
};
