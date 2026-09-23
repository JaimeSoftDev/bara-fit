import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getClient, inviteClient, listClients } from "../api/clients";

export function useClients() {
  return useQuery({ queryKey: ["clients"], queryFn: listClients });
}

export function useClient(id: string | undefined) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: () => getClient(id!),
    enabled: !!id,
  });
}

export function useInviteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: inviteClient,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clients"] }),
  });
}
