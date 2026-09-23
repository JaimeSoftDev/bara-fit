import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { id } from "../../lib/id";
import type { FormFieldType } from "../../types";
import { Button } from "../ui/Button";
import { Field, Input, Select, Textarea } from "../ui/Field";
import { Badge } from "../ui/Badge";

export interface DraftField {
  key: string; // local key for React + reordering, not sent to the backend
  label: string;
  type: FormFieldType;
  required: boolean;
  options: string[];
}

export interface FormDraft {
  title: string;
  description: string;
  fields: DraftField[];
}

const FIELD_TYPES: { value: FormFieldType; label: string }[] = [
  { value: "text", label: "Texto corto" },
  { value: "textarea", label: "Texto largo" },
  { value: "number", label: "Número" },
  { value: "date", label: "Fecha" },
  { value: "yesno", label: "Sí / No" },
  { value: "select", label: "Selección única" },
  { value: "checkbox", label: "Selección múltiple" },
];

const OPTIONS_TYPES: FormFieldType[] = ["select", "checkbox"];

function emptyField(): DraftField {
  return { key: id("field"), label: "", type: "text", required: false, options: [] };
}

export function newFormDraft(): FormDraft {
  return { title: "", description: "", fields: [emptyField()] };
}

export function FormEditor({ draft, onChange }: { draft: FormDraft; onChange: (draft: FormDraft) => void }) {
  function addField() {
    onChange({ ...draft, fields: [...draft.fields, emptyField()] });
  }

  function updateField(key: string, patch: Partial<DraftField>) {
    onChange({
      ...draft,
      fields: draft.fields.map((f) => (f.key === key ? { ...f, ...patch } : f)),
    });
  }

  function removeField(key: string) {
    onChange({ ...draft, fields: draft.fields.filter((f) => f.key !== key) });
  }

  function moveField(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= draft.fields.length) return;
    const next = [...draft.fields];
    [next[index], next[target]] = [next[target], next[index]];
    onChange({ ...draft, fields: next });
  }

  function addOption(key: string) {
    const field = draft.fields.find((f) => f.key === key);
    if (!field) return;
    updateField(key, { options: [...field.options, ""] });
  }

  function updateOption(key: string, index: number, value: string) {
    const field = draft.fields.find((f) => f.key === key);
    if (!field) return;
    const options = field.options.map((o, i) => (i === index ? value : o));
    updateField(key, { options });
  }

  function removeOption(key: string, index: number) {
    const field = draft.fields.find((f) => f.key === key);
    if (!field) return;
    updateField(key, { options: field.options.filter((_, i) => i !== index) });
  }

  return (
    <div className="space-y-4">
      <Field label="Título">
        <Input
          required
          value={draft.title}
          onChange={(e) => onChange({ ...draft, title: e.target.value })}
          placeholder="Cuestionario PAR-Q inicial"
        />
      </Field>
      <Field label="Descripción (opcional)">
        <Textarea
          rows={2}
          value={draft.description}
          onChange={(e) => onChange({ ...draft, description: e.target.value })}
        />
      </Field>

      <div className="space-y-3">
        {draft.fields.map((field, index) => (
          <div key={field.key} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-2 flex items-center gap-2">
              <Badge tone="slate">Pregunta {index + 1}</Badge>
              <div className="ml-auto flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveField(index, -1)}
                  disabled={index === 0}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                  aria-label="Subir pregunta"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 1)}
                  disabled={index === draft.fields.length - 1}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-30"
                  aria-label="Bajar pregunta"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeField(field.key)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  aria-label="Eliminar pregunta"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <Field label="Etiqueta">
                <Input
                  required
                  value={field.label}
                  onChange={(e) => updateField(field.key, { label: e.target.value })}
                  placeholder="¿Cómo te sientes?"
                />
              </Field>
              <Field label="Tipo de respuesta">
                <Select
                  value={field.type}
                  onChange={(e) =>
                    updateField(field.key, {
                      type: e.target.value as FormFieldType,
                      options: OPTIONS_TYPES.includes(e.target.value as FormFieldType) ? field.options : [],
                    })
                  }
                >
                  {FIELD_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>

            <label className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-600">
              <input
                type="checkbox"
                checked={field.required}
                onChange={(e) => updateField(field.key, { required: e.target.checked })}
                className="rounded border-slate-300"
              />
              Obligatoria
            </label>

            {OPTIONS_TYPES.includes(field.type) && (
              <div className="mt-3 space-y-2 rounded-lg bg-slate-50 p-2.5">
                <p className="text-xs font-medium text-slate-500">Opciones</p>
                {field.options.map((opt, optIndex) => (
                  <div key={optIndex} className="flex items-center gap-1.5">
                    <Input
                      value={opt}
                      onChange={(e) => updateOption(field.key, optIndex, e.target.value)}
                      placeholder={`Opción ${optIndex + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(field.key, optIndex)}
                      className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                      aria-label="Eliminar opción"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(field.key)}
                  className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
                >
                  <Plus size={12} /> Añadir opción
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      <Button type="button" variant="secondary" onClick={addField}>
        <Plus size={16} /> Añadir pregunta
      </Button>
    </div>
  );
}
