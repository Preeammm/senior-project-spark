import { http } from "../../../services/http";

export type CareerSection = {
  title: string;
  bullets: string[];
};

export type CareerDetail = {
  id: string;
  title: string;
  intro: string;
  sections: CareerSection[];
  group?: string; 
};

export async function getCareers(): Promise<CareerDetail[]> {
  const { data } = await http.get("/api/careers");
  return data;
}

export async function getCareerById(careerId: string): Promise<CareerDetail> {
  const { data } = await http.get(`/api/careers/${careerId}`);
  return data;
}
