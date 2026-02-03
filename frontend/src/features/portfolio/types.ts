export type PortfolioDocument = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  content?: string;
};

export type CreateDocumentPayload = {
  title: string;
  content?: string;

  // optional for future use
  careerFocus?: string;
  usePersonalInfo?: boolean;
  shortDescription?: string;
  projectIds?: string[];
  experienceIds?: string[];
  activityIds?: string[];
};
