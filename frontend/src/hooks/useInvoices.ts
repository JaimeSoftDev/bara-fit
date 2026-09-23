import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createInvoice, listInvoices, updateInvoiceStatus } from "../api/invoices";

export function useInvoices(clientId?: string) {
  return useQuery({ queryKey: ["invoices", clientId ?? "all"], queryFn: () => listInvoices(clientId) });
}

export function useCreateInvoice() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createInvoice,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}

export function useUpdateInvoiceStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id: string; status: Parameters<typeof updateInvoiceStatus>[1] }) =>
      updateInvoiceStatus(input.id, input.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["invoices"] }),
  });
}
