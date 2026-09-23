import { api } from "../lib/apiClient";
import type { ProgressEntry } from "../types";

export function listProgressEntries(clientId: string): Promise<ProgressEntry[]> {
  return api.get<ProgressEntry[]>(`/progress-entries?clientId=${clientId}`);
}

export function createProgressEntry(input: {
  date: string;
  weightKg: number;
  bodyFatPct?: number;
  waistCm?: number;
  note?: string;
  photo?: File;
}): Promise<ProgressEntry> {
  const form = new FormData();
  form.append("date", input.date);
  form.append("weightKg", String(input.weightKg));
  if (input.bodyFatPct !== undefined) form.append("bodyFatPct", String(input.bodyFatPct));
  if (input.waistCm !== undefined) form.append("waistCm", String(input.waistCm));
  if (input.note) form.append("note", input.note);
  if (input.photo) form.append("photo", input.photo);
  return api.postForm<ProgressEntry>("/progress-entries", form);
}
