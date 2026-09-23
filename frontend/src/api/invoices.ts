import { api } from "../lib/apiClient";
import type { Invoice, InvoiceStatus } from "../types";

export function listInvoices(clientId?: string): Promise<Invoice[]> {
  return api.get<Invoice[]>(clientId ? `/invoices?clientId=${clientId}` : "/invoices");
}

export function createInvoice(
  input: Omit<Invoice, "id" | "trainerId" | "status" | "issuedAt" | "paidAt">,
): Promise<Invoice> {
  return api.post<Invoice>("/invoices", input);
}

export function updateInvoiceStatus(id: string, status: InvoiceStatus): Promise<Invoice> {
  return api.patch<Invoice>(`/invoices/${id}`, { status });
}
