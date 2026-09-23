import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createNutritionPlan, listNutritionPlans, updateNutritionPlan } from "../api/nutritionPlans";
import type { NutritionPlan } from "../types";

export function useNutritionPlans(clientId: string | undefined) {
  return useQuery({
    queryKey: ["nutrition-plans", clientId],
    queryFn: () => listNutritionPlans(clientId!),
    enabled: !!clientId,
  });
}

export function useSaveNutritionPlan(clientId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string } & Omit<NutritionPlan, "id" | "trainerId">) =>
      input.id ? updateNutritionPlan(input.id, input) : createNutritionPlan(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["nutrition-plans", clientId] }),
  });
}
