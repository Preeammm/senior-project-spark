import { useQuery } from "@tanstack/react-query";
import { getMe } from "../services/student.api";
import type { Student } from "../types";

export function useMe() {
  return useQuery<Student>({
    queryKey: ["me"],
    queryFn: getMe,
    staleTime: 1000 * 60 * 5,
  });
}
