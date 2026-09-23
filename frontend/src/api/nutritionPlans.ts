import { api } from "../lib/apiClient";
import type { NutritionPlan } from "../types";

export function listNutritionPlans(clientId: string): Promise<NutritionPlan[]> {
  return api.get<NutritionPlan[]>(`/nutrition-plans?clientId=${clientId}`);
}

export function createNutritionPlan(
  input: Omit<NutritionPlan, "id" | "trainerId">,
): Promise<NutritionPlan> {
  return api.post<NutritionPlan>("/nutrition-plans", input);
}

export function updateNutritionPlan(
  id: string,
  input: Omit<NutritionPlan, "id" | "trainerId">,
): Promise<NutritionPlan> {
  return api.put<NutritionPlan>(`/nutrition-plans/${id}`, input);
}
