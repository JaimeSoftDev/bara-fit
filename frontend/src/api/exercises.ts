import { api } from "../lib/apiClient";
import type { Exercise } from "../types";

export function listExercises(): Promise<Exercise[]> {
  return api.get<Exercise[]>("/exercises");
}

export function createExercise(input: Omit<Exercise, "id" | "trainerId">): Promise<Exercise> {
  return api.post<Exercise>("/exercises", input);
}

export function updateExercise(id: string, input: Omit<Exercise, "id" | "trainerId">): Promise<Exercise> {
  return api.put<Exercise>(`/exercises/${id}`, input);
}

export function deleteExercise(id: string): Promise<void> {
  return api.delete(`/exercises/${id}`);
}
