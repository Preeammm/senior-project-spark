export type PortfolioDocument = {
  id: string;
  title: string;
  updatedAt: string; // ISO
  downloadUrl?: string; // optional if backend provides
};

export type CreateDocumentPayload = {
  careerFocus: string;
  usePersonalInfo: boolean;
  title: string;
  shortDescription: string;
  projectIds: string[];
  experienceIds: string[];
  activityIds: string[];
};
