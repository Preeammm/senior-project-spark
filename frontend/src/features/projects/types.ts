export type ProjectMaterial = { name: string; url: string };

export type Project = {
  id: string;
  projectName: string;
  courseName: string;
  yearSemester: string; // "Year 4 Semester 1"
  type: "Group" | "Individual";
  competencyTags: string[];
  relevancePercent: number; // 0-100
  materials: ProjectMaterial[];
};
