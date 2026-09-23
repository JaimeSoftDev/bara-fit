import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignForm,
  createForm,
  deleteForm,
  getFormAssignmentSubmission,
  listFormAssignments,
  listForms,
  submitFormAssignment,
  updateForm,
  type FormFieldDraft,
} from "../api/forms";
import type { FormAnswers } from "../types";

export function useForms() {
  return useQuery({ queryKey: ["forms"], queryFn: listForms });
}

export function useSaveForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { id?: string; title: string; description?: string; fields: FormFieldDraft[] }) =>
      input.id ? updateForm(input.id, input) : createForm(input),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forms"] }),
  });
}

export function useDeleteForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteForm,
    onSuccess: () => qc.invalidateQueries({ queryKey: ["forms"] }),
  });
}

export function useAssignForm() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { formId: string; clientIds: string[] }) => assignForm(input.formId, input.clientIds),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["form-assignments"] }),
  });
}

export function useFormAssignments(clientId?: string) {
  return useQuery({
    queryKey: ["form-assignments", clientId ?? "all"],
    queryFn: () => listFormAssignments(clientId),
  });
}

export function useSubmitFormAssignment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { assignmentId: string; answers: FormAnswers }) =>
      submitFormAssignment(input.assignmentId, input.answers),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["form-assignments"] }),
  });
}

export function useFormAssignmentSubmission(assignmentId: string | undefined) {
  return useQuery({
    queryKey: ["form-assignment-submission", assignmentId],
    queryFn: () => getFormAssignmentSubmission(assignmentId!),
    enabled: !!assignmentId,
  });
}
