import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createWorkoutPlan,
  listWorkoutCompletions,
  listWorkoutPlans,
  setWorkoutCompletion,
  updateWorkoutPlan,
} from "../api/workoutPlans";
import type { WorkoutPlan } from "../types";

export function useWorkoutPlans(clientId: string | undefined) {
  return useQuery({
    queryKey: ["workout-plans", clientId],
    queryFn: () => listWorkoutPlans(clientId!),
    enabled: !!clientId,
  });
}

export function useSaveWorkoutPlan(clientId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string } & Omit<WorkoutPlan, "id" | "trainerId">) =>
      input.id ? updateWorkoutPlan(input.id, input) : createWorkoutPlan(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout-plans", clientId] }),
  });
}

export function useWorkoutCompletions(planId: string | undefined) {
  return useQuery({
    queryKey: ["workout-completions", planId],
    queryFn: () => listWorkoutCompletions(planId!),
    enabled: !!planId,
  });
}

export function useSetWorkoutCompletion(planId: string | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { dayId: string; date: string; completedItemIds: string[] }) =>
      setWorkoutCompletion(planId!, input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout-completions", planId] }),
  });
}
