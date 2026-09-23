import { useState } from "react";
import { ArrowLeft, CheckCircle2, ClipboardList } from "lucide-react";
import { useSession } from "../../store/session";
import {
  useFormAssignments,
  useFormAssignmentSubmission,
  useSubmitFormAssignment,
} from "../../hooks/useForms";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { formatDate } from "../../lib/utils";
import { cx } from "../../lib/utils";
import type { FormAnswers, FormAssignment, FormField } from "../../types";

function initialAnswers(fields: FormField[]): FormAnswers {
  const answers: FormAnswers = {};
  for (const field of fields) {
    answers[field.id] = field.type === "checkbox" ? [] : "";
  }
  return answers;
}

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: FormField;
  value: FormAnswers[string];
  onChange: (value: FormAnswers[string]) => void;
}) {
  if (field.type === "textarea") {
    return <Textarea rows={3} value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "number") {
    return (
      <Input
        type="number"
        value={(value as string) ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
      />
    );
  }
  if (field.type === "date") {
    return <Input type="date" value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
  }
  if (field.type === "yesno") {
    return (
      <div className="flex gap-2">
        {(["yes", "no"] as const).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cx(
              "flex-1 rounded-lg border px-3 py-2 text-sm font-medium",
              value === opt ? "border-brand-500 bg-brand-50 text-brand-700" : "border-slate-300 text-slate-600",
            )}
          >
            {opt === "yes" ? "Sí" : "No"}
          </button>
        ))}
      </div>
    );
  }
  if (field.type === "select") {
    return (
      <Select value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)}>
        <option value="" disabled>
          Selecciona una opción
        </option>
        {field.options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </Select>
    );
  }
  if (field.type === "checkbox") {
    const selected = Array.isArray(value) ? (value as string[]) : [];
    return (
      <div className="space-y-1.5">
        {field.options.map((opt) => (
          <label key={opt} className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="rounded border-slate-300"
              checked={selected.includes(opt)}
              onChange={(e) =>
                onChange(e.target.checked ? [...selected, opt] : selected.filter((o) => o !== opt))
              }
            />
            {opt}
          </label>
        ))}
      </div>
    );
  }
  return <Input value={(value as string) ?? ""} onChange={(e) => onChange(e.target.value)} />;
}

function FillForm({ assignment, onDone }: { assignment: FormAssignment; onDone: () => void }) {
  const fields = assignment.form?.fields ?? [];
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers(fields));
  const submit = useSubmitFormAssignment();

  const missingRequired = fields.some((f) => {
    if (!f.required) return false;
    const v = answers[f.id];
    return v === "" || v === undefined || v === null || (Array.isArray(v) && v.length === 0);
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (missingRequired) return;
    submit.mutate({ assignmentId: assignment.id, answers }, { onSuccess: onDone });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map((field) => (
        <Field key={field.id} label={field.required ? `${field.label} *` : field.label}>
          <FieldInput
            field={field}
            value={answers[field.id]}
            onChange={(value) => setAnswers((a) => ({ ...a, [field.id]: value }))}
          />
        </Field>
      ))}
      <Button type="submit" className="w-full" disabled={submit.isPending || missingRequired}>
        Enviar respuestas
      </Button>
    </form>
  );
}

function SubmittedAnswers({ assignmentId }: { assignmentId: string }) {
  const { data: submission } = useFormAssignmentSubmission(assignmentId);

  if (!submission) return <p className="text-sm text-slate-400">Cargando respuestas…</p>;

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-400">Enviado el {formatDate(submission.submittedAt)}</p>
      {submission.answerDetails.map((answer) => (
        <div key={answer.fieldId} className="rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-medium text-slate-500">{answer.label}</p>
          <p className="text-sm text-slate-900">
            {answer.value === null || answer.value === "" || answer.value === undefined
              ? "—"
              : answer.type === "yesno"
                ? answer.value === "yes"
                  ? "Sí"
                  : "No"
                : Array.isArray(answer.value)
                  ? answer.value.join(", ") || "—"
                  : String(answer.value)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function ClientForms() {
  const clientId = useSession((s) => s.user!.id);
  const { data: assignments = [] } = useFormAssignments(clientId);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = assignments.find((a) => a.id === selectedId) ?? null;
  const pending = assignments.filter((a) => a.status === "pending");
  const completed = assignments.filter((a) => a.status === "completed");

  if (selected) {
    return (
      <div>
        <button
          onClick={() => setSelectedId(null)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700"
        >
          <ArrowLeft size={16} /> Volver a formularios
        </button>
        <PageHeader title={selected.form?.title ?? "Formulario"} subtitle={selected.form?.description} />
        <Card>
          <CardBody>
            {selected.status === "completed" ? (
              <SubmittedAnswers assignmentId={selected.id} />
            ) : (
              <FillForm assignment={selected} onDone={() => setSelectedId(null)} />
            )}
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Formularios" subtitle="Cuestionarios asignados por tu entrenador" />

      {pending.length > 0 && (
        <div className="mb-5">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Pendientes</h3>
          <div className="space-y-2">
            {pending.map((a) => (
              <button key={a.id} onClick={() => setSelectedId(a.id)} className="block w-full text-left">
                <Card className="border-amber-200 bg-amber-50/40">
                  <CardBody className="flex items-center gap-3">
                    <ClipboardList size={18} className="shrink-0 text-amber-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{a.form?.title}</p>
                      <p className="text-xs text-slate-500">Asignado {formatDate(a.assignedAt)}</p>
                    </div>
                    <Badge tone="amber">Pendiente</Badge>
                  </CardBody>
                </Card>
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Completados</h3>
        <div className="space-y-2">
          {completed.length === 0 && <p className="text-sm text-slate-400">Sin formularios completados todavía.</p>}
          {completed.map((a) => (
            <button key={a.id} onClick={() => setSelectedId(a.id)} className="block w-full text-left">
              <Card>
                <CardBody className="flex items-center gap-3">
                  <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{a.form?.title}</p>
                    <p className="text-xs text-slate-500">Completado {a.completedAt ? formatDate(a.completedAt) : ""}</p>
                  </div>
                  <Badge tone="green">Completado</Badge>
                </CardBody>
              </Card>
            </button>
          ))}
        </div>
      </div>

      {assignments.length === 0 && (
        <p className="py-10 text-center text-sm text-slate-400">Tu entrenador todavía no te ha asignado ningún formulario.</p>
      )}
    </div>
  );
}
