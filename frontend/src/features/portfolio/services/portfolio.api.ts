import { http } from "../../../services/http";

export type PortfolioDocLite = {
  id: string;
  title: string;
  createdAt: string;
};

export type PortfolioDoc = PortfolioDocLite & {
  content: string;
};

// LIST
export async function getDocuments(): Promise<PortfolioDocLite[]> {
  const res = await http.get("/api/portfolio/documents");
  return res.data;
}

// CREATE
export async function createDocument(input: {
  title: string;
  content?: string;
}): Promise<PortfolioDocLite> {
  const res = await http.post("/api/portfolio/documents", input);
  return res.data;
}

// DETAIL (with content)
export async function getDocument(docId: string): Promise<PortfolioDoc> {
  const res = await http.get(`/api/portfolio/documents/${docId}`);
  return res.data;
}

// DELETE
export async function deleteDocument(docId: string): Promise<void> {
  await http.delete(`/api/portfolio/documents/${docId}`);
}

// RENAME (PATCH)
export async function renameDocument(docId: string, title: string): Promise<{ id: string; title: string }> {
  const res = await http.patch(`/api/portfolio/documents/${docId}`, { title });
  return res.data;
}
