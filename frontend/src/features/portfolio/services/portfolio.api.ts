import { http } from "../../../services/http";
import type { CreateDocumentPayload, PortfolioDocument } from "../types";

export async function listDocuments(): Promise<PortfolioDocument[]> {
  const { data } = await http.get("/api/portfolio/documents");
  return data;
}

export async function createDocument(payload: CreateDocumentPayload): Promise<PortfolioDocument> {
  const { data } = await http.post("/api/portfolio/documents", payload);
  return data;
}

export function downloadDocument(docId: string) {
  // เปิดแท็บใหม่ให้ backend stream file
  window.open(`${import.meta.env.VITE_API_BASE_URL}/api/portfolio/documents/${docId}/download`, "_blank");
}
