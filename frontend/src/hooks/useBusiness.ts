import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createBusiness,
  createPayrollEntry,
  getMyBusiness,
  getTeamCalendar,
  inviteToBusiness,
  listPayroll,
  updateBusiness,
  updatePayrollStatus,
} from "../api/business";
import { me } from "../api/auth";
import { useSession } from "../store/session";

export function useMyBusiness() {
  return useQuery({ queryKey: ["business", "me"], queryFn: getMyBusiness });
}

function useInvalidateBusiness() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["business"] });
}

export function useCreateBusiness() {
  const invalidate = useInvalidateBusiness();
  const setUser = useSession((s) => s.setUser);
  return useMutation({
    mutationFn: createBusiness,
    onSuccess: async () => {
      invalidate();
      setUser(await me());
    },
  });
}

export function useUpdateBusiness() {
  const invalidate = useInvalidateBusiness();
  const setUser = useSession((s) => s.setUser);
  return useMutation({
    mutationFn: (input: { id: string; name?: string; brandColor?: string | null; logoUrl?: string | null }) =>
      updateBusiness(input.id, input),
    onSuccess: async () => {
      invalidate();
      setUser(await me());
    },
  });
}

export function useInviteToBusiness() {
  return useMutation({
    mutationFn: (input: { businessId: string; name: string; email: string }) =>
      inviteToBusiness(input.businessId, { name: input.name, email: input.email }),
  });
}

export function useTeamCalendar(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business", businessId, "calendar"],
    queryFn: () => getTeamCalendar(businessId!),
    enabled: !!businessId,
  });
}

export function usePayroll(businessId: string | undefined) {
  return useQuery({
    queryKey: ["business", businessId, "payroll"],
    queryFn: () => listPayroll(businessId!),
    enabled: !!businessId,
  });
}

export function useCreatePayrollEntry(businessId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { trainerId: string; periodLabel: string; amount: number }) =>
      createPayrollEntry(businessId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business", businessId, "payroll"] }),
  });
}

export function useUpdatePayrollStatus(businessId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { entryId: string; status: "pending" | "paid" }) =>
      updatePayrollStatus(businessId!, input.entryId, input.status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["business", businessId, "payroll"] }),
  });
}
