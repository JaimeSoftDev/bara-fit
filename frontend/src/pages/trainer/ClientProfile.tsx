import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Plus } from "lucide-react";
import { formatISO } from "date-fns";
import { useClient } from "../../hooks/useClients";
import { useExercises } from "../../hooks/useExercises";
import { useProgressEntries } from "../../hooks/useProgress";
import { useInvoices, useCreateInvoice, useUpdateInvoiceStatus } from "../../hooks/useInvoices";
import { useNutritionPlans, useSaveNutritionPlan } from "../../hooks/useNutritionPlans";
import { useWorkoutPlans, useSaveWorkoutPlan } from "../../hooks/useWorkoutPlans";
import {
  useAssignForm,
  useFormAssignments,
  useFormAssignmentSubmission,
  useForms,
} from "../../hooks/useForms";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Field";
import { cx, formatCurrency, formatDate } from "../../lib/utils";
import { ProgressChart } from "../../components/ProgressChart";
import { WorkoutPlanEditor } from "../../components/trainer/WorkoutPlanEditor";
import { NutritionPlanEditor } from "../../components/trainer/NutritionPlanEditor";
import type { FormAnswerDetail, InvoiceStatus } from "../../types";

const TABS = ["Resumen", "Rutina", "Nutrición", "Pagos", "Formularios"] as const;

function formatAnswerValue(answer: FormAnswerDetail): string {
  if (answer.value === null || answer.value === undefined || answer.value === "") return "—";
  if (answer.type === "yesno") return answer.value === "yes" || answer.value === "Sí" ? "Sí" : "No";
  if (Array.isArray(answer.value)) return answer.value.length ? answer.value.join(", ") : "—";
  return String(answer.value);
}

export default function TrainerClientProfile() {
  const { clientId } = useParams<{ clientId: string }>();
  const { data: client } = useClient(clientId);
  const { data: exercises = [] } = useExercises();
  const { data: progress = [] } = useProgressEntries(clientId);
  const { data: invoices = [] } = useInvoices(clientId);
  const { data: nutritionPlans = [] } = useNutritionPlans(clientId);
  const { data: workoutPlans = [] } = useWorkoutPlans(clientId);
  const saveWorkoutPlan = useSaveWorkoutPlan(clientId);
  const saveNutritionPlan = useSaveNutritionPlan(clientId);
  const createInvoice = useCreateInvoice();
  const updateInvoiceStatus = useUpdateInvoiceStatus();
  const { data: forms = [] } = useForms();
  const { data: formAssignments = [] } = useFormAssignments(clientId);
  const assignForm = useAssignForm();

  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumen");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ concept: "", amount: "50", dueDate: "" });
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assignFormId, setAssignFormId] = useState("");
  const [viewingAssignmentId, setViewingAssignmentId] = useState<string | null>(null);
  const { data: submission } = useFormAssignmentSubmission(viewingAssignmentId ?? undefined);

  const nutritionPlan = nutritionPlans[0];
  const activePlan = useMemo(
    () => workoutPlans.find((p) => p.status === "active") ?? workoutPlans[0],
    [workoutPlans],
  );

  if (!client) {
    return <p className="text-sm text-slate-500">Cliente no encontrado.</p>;
  }

  function createWorkoutPlan() {
    saveWorkoutPlan.mutate({
      clientId: clientId!,
      name: "Nuevo plan de entrenamiento",
      startDate: formatISO(new Date(), { representation: "date" }),
      status: "active",
      days: [],
    });
  }

  function createNutritionPlan() {
    saveNutritionPlan.mutate({
      clientId: clientId!,
      name: "Nuevo plan nutricional",
      dailyCalories: 2000,
      proteinG: 140,
      carbsG: 200,
      fatG: 60,
      meals: [],
    });
  }

  function handleAssignForm(e: React.FormEvent) {
    e.preventDefault();
    if (!assignFormId) return;
    assignForm.mutate(
      { formId: assignFormId, clientIds: [clientId!] },
      {
        onSuccess: () => {
          setAssignFormId("");
          setShowAssignModal(false);
        },
      },
    );
  }

  function handleAddInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceForm.concept || !invoiceForm.dueDate) return;
    createInvoice.mutate(
      {
        clientId: clientId!,
        concept: invoiceForm.concept,
        amount: Number(invoiceForm.amount) || 0,
        dueDate: invoiceForm.dueDate,
      },
      {
        onSuccess: () => {
          setInvoiceForm({ concept: "", amount: "50", dueDate: "" });
          setShowInvoiceModal(false);
        },
      },
    );
  }

  const statusTone: Record<InvoiceStatus, "green" | "amber" | "red"> = {
    paid: "green",
    pending: "amber",
    overdue: "red",
  };

  return (
    <div>
      <Link to="/trainer/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Volver a clientes
      </Link>

      <div className="mb-5 flex flex-wrap items-center gap-4">
        <Avatar name={client.name} size={56} />
        <div>
          <h1 className="text-lg font-bold text-slate-900">{client.name}</h1>
          <p className="text-sm text-slate-500">{client.email}</p>
          <p className="mt-1 text-sm text-slate-600">{client.goal}</p>
        </div>
      </div>

      <div className="mb-5 flex gap-1 overflow-x-auto rounded-xl bg-slate-100 p-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cx(
              "whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              tab === t ? "bg-white text-brand-700 shadow-sm" : "text-slate-500",
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Resumen" && (
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Evolución del peso (kg)</h3>
              <ProgressChart entries={progress} dataKey="weightKg" unit="kg" />
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">% Grasa corporal</h3>
              <ProgressChart entries={progress} dataKey="bodyFatPct" unit="%" />
            </CardBody>
          </Card>
          <Card className="lg:col-span-2">
            <CardBody>
              <h3 className="mb-3 text-sm font-semibold text-slate-900">Registros de progreso</h3>
              <div className="space-y-2">
                {progress.length === 0 && <p className="text-sm text-slate-400">Sin registros todavía.</p>}
                {[...progress].reverse().slice(0, 6).map((p) => (
                  <div key={p.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-500">{formatDate(p.date)}</span>
                    <span className="font-medium text-slate-900">{p.weightKg} kg</span>
                    {p.bodyFatPct && <span className="text-slate-500">{p.bodyFatPct}% grasa</span>}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {tab === "Rutina" && (
        <Card>
          <CardBody>
            {!activePlan ? (
              <div className="py-8 text-center">
                <p className="mb-3 text-sm text-slate-500">Este cliente todavía no tiene un plan de entrenamiento.</p>
                <Button onClick={createWorkoutPlan} disabled={saveWorkoutPlan.isPending}>
                  <Plus size={16} /> Crear plan de entrenamiento
                </Button>
              </div>
            ) : exercises.length === 0 ? (
              <p className="text-sm text-slate-500">
                Primero añade ejercicios a tu{" "}
                <Link to="/trainer/exercises" className="text-brand-600 hover:underline">
                  biblioteca de ejercicios
                </Link>
                .
              </p>
            ) : (
              <WorkoutPlanEditor plan={activePlan} exercises={exercises} onSave={(plan) => saveWorkoutPlan.mutate(plan)} />
            )}
          </CardBody>
        </Card>
      )}

      {tab === "Nutrición" && (
        <Card>
          <CardBody>
            {!nutritionPlan ? (
              <div className="py-8 text-center">
                <p className="mb-3 text-sm text-slate-500">Este cliente todavía no tiene un plan nutricional.</p>
                <Button onClick={createNutritionPlan} disabled={saveNutritionPlan.isPending}>
                  <Plus size={16} /> Crear plan nutricional
                </Button>
              </div>
            ) : (
              <NutritionPlanEditor plan={nutritionPlan} onSave={(plan) => saveNutritionPlan.mutate(plan)} />
            )}
          </CardBody>
        </Card>
      )}

      {tab === "Pagos" && (
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Facturas</h3>
              <Button variant="secondary" onClick={() => setShowInvoiceModal(true)}>
                <Plus size={16} /> Nueva factura
              </Button>
            </div>
            <div className="space-y-2">
              {invoices.length === 0 && <p className="text-sm text-slate-400">Sin facturas registradas.</p>}
              {invoices.map((inv) => (
                <div key={inv.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{inv.concept}</p>
                    <p className="text-xs text-slate-400">Vence {formatDate(inv.dueDate)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.amount)}</span>
                    <Badge tone={statusTone[inv.status]}>{inv.status === "paid" ? "Pagada" : inv.status === "pending" ? "Pendiente" : "Vencida"}</Badge>
                    {inv.status !== "paid" && (
                      <Button variant="ghost" onClick={() => updateInvoiceStatus.mutate({ id: inv.id, status: "paid" })}>
                        Marcar pagada
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {tab === "Formularios" && (
        <Card>
          <CardBody>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Formularios asignados</h3>
              <Button variant="secondary" onClick={() => setShowAssignModal(true)} disabled={forms.length === 0}>
                <Plus size={16} /> Asignar formulario
              </Button>
            </div>
            {forms.length === 0 && (
              <p className="mb-3 text-xs text-slate-400">
                Todavía no has creado ningún formulario. Crea uno en la sección{" "}
                <Link to="/trainer/forms" className="text-brand-600 hover:underline">
                  Formularios
                </Link>
                .
              </p>
            )}
            <div className="space-y-2">
              {formAssignments.length === 0 && (
                <p className="text-sm text-slate-400">Sin formularios asignados todavía.</p>
              )}
              {formAssignments.map((a) => (
                <div
                  key={a.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-100 p-3"
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList size={16} className="shrink-0 text-brand-600" />
                    <div>
                      <p className="text-sm font-medium text-slate-900">{a.form?.title}</p>
                      <p className="text-xs text-slate-400">Asignado {formatDate(a.assignedAt)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={a.status === "completed" ? "green" : "amber"}>
                      {a.status === "completed" ? "Completado" : "Pendiente"}
                    </Badge>
                    {a.status === "completed" && (
                      <Button variant="ghost" onClick={() => setViewingAssignmentId(a.id)}>
                        Ver respuestas
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardBody>
        </Card>
      )}

      {showAssignModal && (
        <Modal title="Asignar formulario" onClose={() => setShowAssignModal(false)}>
          <form onSubmit={handleAssignForm} className="space-y-3">
            <Field label="Formulario">
              <Select required value={assignFormId} onChange={(e) => setAssignFormId(e.target.value)}>
                <option value="" disabled>
                  Selecciona un formulario
                </option>
                {forms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.title}
                  </option>
                ))}
              </Select>
            </Field>
            <Button type="submit" className="w-full" disabled={assignForm.isPending}>
              Asignar a {client.name}
            </Button>
          </form>
        </Modal>
      )}

      {viewingAssignmentId && (
        <Modal title="Respuestas del formulario" onClose={() => setViewingAssignmentId(null)} wide>
          {!submission ? (
            <p className="text-sm text-slate-400">Cargando respuestas…</p>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Enviado el {formatDate(submission.submittedAt)}</p>
              {submission.answerDetails.map((answer) => (
                <div key={answer.fieldId} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-xs font-medium text-slate-500">{answer.label}</p>
                  <p className="text-sm text-slate-900">{formatAnswerValue(answer)}</p>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {showInvoiceModal && (
        <Modal title="Nueva factura" onClose={() => setShowInvoiceModal(false)}>
          <form onSubmit={handleAddInvoice} className="space-y-3">
            <Field label="Concepto">
              <Input
                required
                value={invoiceForm.concept}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, concept: e.target.value }))}
              />
            </Field>
            <Field label="Importe (€)">
              <Input
                type="number"
                value={invoiceForm.amount}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </Field>
            <Field label="Fecha de vencimiento">
              <Input
                type="date"
                required
                value={invoiceForm.dueDate}
                onChange={(e) => setInvoiceForm((f) => ({ ...f, dueDate: e.target.value }))}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={createInvoice.isPending}>
              Crear factura
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
