import { api } from "../lib/apiClient";
import type { Booking } from "../types";

export interface BusinessMember {
  id: string;
  name: string;
  email: string;
  role: "owner" | "staff";
}

export interface Business {
  id: string;
  name: string;
  brandColor?: string;
  logoUrl?: string;
  ownerId: string;
  members: BusinessMember[];
}

export interface BusinessInvite {
  id: string;
  businessId: string;
  name: string;
  email: string;
  status: "pending" | "accepted" | "expired";
  expiresAt: string;
  acceptUrl: string;
}

export interface PayrollEntry {
  id: string;
  businessId: string;
  trainerId: string;
  trainerName: string;
  periodLabel: string;
  amount: number;
  status: "pending" | "paid";
  paidAt?: string;
}

export function getMyBusiness(): Promise<Business | null> {
  return api.get<Business | null>("/businesses/me");
}

export function createBusiness(name: string): Promise<Business> {
  return api.post<Business>("/businesses", { name });
}

export function updateBusiness(
  id: string,
  input: { name?: string; brandColor?: string | null; logoUrl?: string | null },
): Promise<Business> {
  return api.patch<Business>(`/businesses/${id}`, input);
}

export function inviteToBusiness(id: string, input: { name: string; email: string }): Promise<BusinessInvite> {
  return api.post<BusinessInvite>(`/businesses/${id}/invite`, input);
}

export function getTeamCalendar(businessId: string): Promise<Booking[]> {
  return api.get<Booking[]>(`/businesses/${businessId}/calendar`);
}

export function listPayroll(businessId: string): Promise<PayrollEntry[]> {
  return api.get<PayrollEntry[]>(`/businesses/${businessId}/payroll`);
}

export function createPayrollEntry(
  businessId: string,
  input: { trainerId: string; periodLabel: string; amount: number },
): Promise<PayrollEntry> {
  return api.post<PayrollEntry>(`/businesses/${businessId}/payroll`, input);
}

export function updatePayrollStatus(
  businessId: string,
  entryId: string,
  status: "pending" | "paid",
): Promise<PayrollEntry> {
  return api.patch<PayrollEntry>(`/businesses/${businessId}/payroll/${entryId}`, { status });
}
