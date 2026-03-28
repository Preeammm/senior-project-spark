export type PortfolioDocument = {
  id: string;
  title: string;
  createdAt?: string;
  updatedAt?: string;
  content?: string;
  data?: PortfolioDraftData | null;
};

export type CreateDocumentPayload = {
  title: string;
  content?: string;
  data?: PortfolioDraftData;
};

export type PortfolioDraftData = {
  careerFocus: string;
  occupation: string;
  aboutMe: string;
  selectedProjectIds: string[];
};
