import { useQuery } from "@tanstack/react-query";
import {
  getAdminBusiness,
  getAdminOverview,
  getAdminTrainer,
  listAdminBusinesses,
  listAdminTrainers,
} from "../api/admin";

export function useAdminOverview() {
  return useQuery({ queryKey: ["admin", "overview"], queryFn: getAdminOverview });
}

export function useAdminBusinesses() {
  return useQuery({ queryKey: ["admin", "businesses"], queryFn: listAdminBusinesses });
}

export function useAdminBusiness(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "businesses", id],
    queryFn: () => getAdminBusiness(id!),
    enabled: !!id,
  });
}

export function useAdminTrainers() {
  return useQuery({ queryKey: ["admin", "trainers"], queryFn: listAdminTrainers });
}

export function useAdminTrainer(id: string | undefined) {
  return useQuery({
    queryKey: ["admin", "trainers", id],
    queryFn: () => getAdminTrainer(id!),
    enabled: !!id,
  });
}
