import { useQuery } from "@tanstack/react-query";
import { getMe } from "../services/student.api";

export function useMe() {
  return useQuery({ queryKey: ["me"], queryFn: getMe });
}
