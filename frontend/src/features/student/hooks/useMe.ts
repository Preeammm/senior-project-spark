import { useQuery } from "@tanstack/react-query";
import { http } from "../../../services/http";
import type { Me } from "../types";

export function useMe() {
  return useQuery<Me>({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await http.get("/api/me");
      return res.data;
    },
  });
}
