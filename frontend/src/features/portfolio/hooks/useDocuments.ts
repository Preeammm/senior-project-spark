import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteDocument,
  getDocuments,
  PORTFOLIO_DOCS_QUERY_KEY,
  renameDocument,
} from "../services/portfolio.api";

export function useDocuments() {
  return useQuery({
    queryKey: PORTFOLIO_DOCS_QUERY_KEY,
    queryFn: getDocuments,
  });
}

export function useDeleteDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (docId: string) => deleteDocument(docId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PORTFOLIO_DOCS_QUERY_KEY });
    },
  });
}

export function useRenameDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (args: { docId: string; title: string }) =>
      renameDocument(args.docId, args.title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PORTFOLIO_DOCS_QUERY_KEY });
    },
  });
}
