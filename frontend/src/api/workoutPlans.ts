import { api } from "../lib/apiClient";
import type { WorkoutCompletion, WorkoutPlan } from "../types";

export function listWorkoutPlans(clientId: string): Promise<WorkoutPlan[]> {
  return api.get<WorkoutPlan[]>(`/workout-plans?clientId=${clientId}`);
}

export function createWorkoutPlan(
  input: Omit<WorkoutPlan, "id" | "trainerId">,
): Promise<WorkoutPlan> {
  return api.post<WorkoutPlan>("/workout-plans", input);
}

export function updateWorkoutPlan(
  id: string,
  input: Omit<WorkoutPlan, "id" | "trainerId">,
): Promise<WorkoutPlan> {
  return api.put<WorkoutPlan>(`/workout-plans/${id}`, input);
}

export function setWorkoutCompletion(
  planId: string,
  input: { dayId: string; date: string; completedItemIds: string[] },
): Promise<WorkoutCompletion> {
  return api.post<WorkoutCompletion>(`/workout-plans/${planId}/completions`, input);
}

export function listWorkoutCompletions(planId: string): Promise<WorkoutCompletion[]> {
  return api.get<WorkoutCompletion[]>(`/workout-plans/${planId}/completions`);
}
