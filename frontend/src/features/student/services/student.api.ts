import { http } from "../../../services/http";
import type { Student } from "../types";

export async function getMe(): Promise<Student> {
  const { data } = await http.get("/api/me");
  return data;
}
