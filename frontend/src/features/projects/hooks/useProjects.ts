import { useQuery } from "@tanstack/react-query";
import { listProjects } from "../services/projects.api";

export function useProjects(careerFocus: string) {
  return useQuery({
    queryKey: ["projects", careerFocus],
    queryFn: () => listProjects(careerFocus),
  });
}
