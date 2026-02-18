import { http } from "../../../services/http";
import type { Project } from "../types";

export async function listProjects(careerFocus?: string): Promise<Project[]> {
  const { data } = await http.get("/api/projects", {
    params: careerFocus ? { careerFocus } : undefined,
  });
  return data;
}
