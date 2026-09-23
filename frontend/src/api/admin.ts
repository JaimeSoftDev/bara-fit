import { api } from "../lib/apiClient";
import type { AdminBusiness, AdminOverview, AdminTrainer } from "../types";

export function getAdminOverview(): Promise<AdminOverview> {
  return api.get<AdminOverview>("/admin/overview");
}

export function listAdminBusinesses(): Promise<AdminBusiness[]> {
  return api.get<AdminBusiness[]>("/admin/businesses");
}

export function getAdminBusiness(id: string): Promise<AdminBusiness> {
  return api.get<AdminBusiness>(`/admin/businesses/${id}`);
}

export function listAdminTrainers(): Promise<AdminTrainer[]> {
  return api.get<AdminTrainer[]>("/admin/trainers");
}

export function getAdminTrainer(id: string): Promise<AdminTrainer> {
  return api.get<AdminTrainer>(`/admin/trainers/${id}`);
}
