import { useState } from "react";
import { ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { useDeleteForm, useForms, useSaveForm } from "../../hooks/useForms";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { FormEditor, newFormDraft, type DraftField, type FormDraft } from "../../components/trainer/FormEditor";
import type { Form } from "../../types";

function formToDraft(form: Form): FormDraft {
  return {
    title: form.title,
    description: form.description ?? "",
    fields: form.fields.map((f) => ({
      key: f.id,
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.options ?? [],
    })),
  };
}

function draftFieldsToPayload(fields: DraftField[]) {
  return fields
    .filter((f) => f.label.trim().length > 0)
    .map((f) => ({
      label: f.label,
      type: f.type,
      required: f.required,
      options: f.options.filter((o) => o.trim().length > 0),
    }));
}

export default function TrainerForms() {
  const { data: forms = [] } = useForms();
  const saveForm = useSaveForm();
  const deleteForm = useDeleteForm();

  const [editing, setEditing] = useState<Form | null>(null);
  const [draft, setDraft] = useState<FormDraft>(newFormDraft());
  const [showModal, setShowModal] = useState(false);

  function openNew() {
    setEditing(null);
    setDraft(newFormDraft());
    setShowModal(true);
  }

  function openEdit(form: Form) {
    setEditing(form);
    setDraft(formToDraft(form));
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setDraft(newFormDraft());
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.title.trim()) return;
    saveForm.mutate(
      {
        id: editing?.id,
        title: draft.title,
        description: draft.description || undefined,
        fields: draftFieldsToPayload(draft.fields),
      },
      { onSuccess: closeModal },
    );
  }

  return (
    <div>
      <PageHeader
        title="Formularios"
        subtitle={`${forms.length} formularios creados`}
        action={
          <Button onClick={openNew}>
            <Plus size={16} /> Nuevo formulario
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {forms.map((form) => (
          <Card key={form.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-900">
                    <ClipboardList size={15} className="shrink-0 text-brand-600" />
                    {form.title}
                  </p>
                  {form.description && <p className="mt-1 text-xs text-slate-500">{form.description}</p>}
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(form)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteForm.mutate(form.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <Badge tone="brand">{form.fields.length} preguntas</Badge>
              </div>
            </CardBody>
          </Card>
        ))}
        {forms.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">
            Todavía no has creado ningún formulario.
          </p>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? "Editar formulario" : "Nuevo formulario"} onClose={closeModal} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormEditor draft={draft} onChange={setDraft} />
            <Button type="submit" className="w-full" disabled={saveForm.isPending}>
              Guardar formulario
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
