import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createExercise, deleteExercise, listExercises, updateExercise } from "../api/exercises";
import type { Exercise } from "../types";

export function useExercises() {
  return useQuery({ queryKey: ["exercises"], queryFn: listExercises });
}

export function useSaveExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string } & Omit<Exercise, "id" | "trainerId">) =>
      input.id ? updateExercise(input.id, input) : createExercise(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });
}

export function useDeleteExercise() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteExercise,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercises"] }),
  });
}
