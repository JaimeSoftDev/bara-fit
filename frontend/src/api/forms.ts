import { api } from "../lib/apiClient";
import type { Form, FormAnswers, FormAssignment, FormField, FormSubmission } from "../types";

export type FormFieldDraft = Omit<FormField, "id" | "position"> & { id?: string };

export function listForms(): Promise<Form[]> {
  return api.get<Form[]>("/forms");
}

export function createForm(input: { title: string; description?: string; fields: FormFieldDraft[] }): Promise<Form> {
  return api.post<Form>("/forms", input);
}

export function updateForm(
  id: string,
  input: { title: string; description?: string; fields: FormFieldDraft[] },
): Promise<Form> {
  return api.put<Form>(`/forms/${id}`, input);
}

export function deleteForm(id: string): Promise<void> {
  return api.delete(`/forms/${id}`);
}

export function assignForm(formId: string, clientIds: string[]): Promise<FormAssignment[]> {
  return api.post<FormAssignment[]>(`/forms/${formId}/assign`, { clientIds });
}

export function listFormAssignments(clientId?: string): Promise<FormAssignment[]> {
  return api.get<FormAssignment[]>(clientId ? `/form-assignments?clientId=${clientId}` : "/form-assignments");
}

export function submitFormAssignment(assignmentId: string, answers: FormAnswers): Promise<FormSubmission> {
  return api.post<FormSubmission>(`/form-assignments/${assignmentId}/submit`, { answers });
}

export function getFormAssignmentSubmission(assignmentId: string): Promise<FormSubmission> {
  return api.get<FormSubmission>(`/form-assignments/${assignmentId}/submission`);
}
