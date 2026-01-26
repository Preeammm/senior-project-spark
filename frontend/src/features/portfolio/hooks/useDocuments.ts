import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createDocument, listDocuments } from "../services/portfolio.api";

export function useDocuments() {
  return useQuery({ queryKey: ["portfolioDocs"], queryFn: listDocuments });
}

export function useCreateDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDocument,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["portfolioDocs"] }),
  });
}
