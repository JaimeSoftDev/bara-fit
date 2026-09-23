import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createProgressEntry, listProgressEntries } from "../api/progress";

export function useProgressEntries(clientId: string | undefined) {
  return useQuery({
    queryKey: ["progress-entries", clientId],
    queryFn: () => listProgressEntries(clientId!),
    enabled: !!clientId,
  });
}

export function useCreateProgressEntry(clientId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createProgressEntry,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["progress-entries", clientId] }),
  });
}
