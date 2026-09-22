import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Plus } from "lucide-react";
import { useAuth } from "../../store/auth";
import { useDb } from "../../store/db";
import {
  getExercisesOfTrainer,
  getInvoicesOfClient,
  getProgressOfClient,
  getWorkoutPlansOfClient,
  getNutritionPlanOfClient,
} from "../../lib/queries";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/Field";
import { formatISO } from "date-fns";
import { cx, formatCurrency, formatDate } from "../../lib/utils";
import { ProgressChart } from "../../components/ProgressChart";
import { WorkoutPlanEditor } from "../../components/trainer/WorkoutPlanEditor";
import { NutritionPlanEditor } from "../../components/trainer/NutritionPlanEditor";
import { id } from "../../lib/id";
import type { InvoiceStatus, WorkoutPlan, NutritionPlan } from "../../types";

const TABS = ["Resumen", "Rutina", "Nutrición", "Pagos"] as const;

export default function TrainerClientProfile() {
  const { clientId } = useParams<{ clientId: string }>();
  const { currentUserId } = useAuth();
  const db = useDb((s) => s.db);
  const upsertWorkoutPlan = useDb((s) => s.upsertWorkoutPlan);
  const upsertNutritionPlan = useDb((s) => s.upsertNutritionPlan);
  const markInvoiceStatus = useDb((s) => s.markInvoiceStatus);
  const addInvoice = useDb((s) => s.addInvoice);
  const trainerId = currentUserId!;

  const [tab, setTab] = useState<(typeof TABS)[number]>("Resumen");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceForm, setInvoiceForm] = useState({ concept: "", amount: "50", dueDate: "" });

  const client = clientId ? db.users[clientId] : undefined;
  const exercises = getExercisesOfTrainer(db, trainerId);
  const progress = clientId ? getProgressOfClient(db, clientId) : [];
  const invoices = clientId ? getInvoicesOfClient(db, clientId) : [];
  const nutritionPlan = clientId ? getNutritionPlanOfClient(db, clientId) : undefined;
  const workoutPlans = clientId ? getWorkoutPlansOfClient(db, clientId) : [];
  const activePlan = useMemo(
    () => workoutPlans.find((p) => p.status === "active") ?? workoutPlans[0],
    [workoutPlans],
  );

  if (!client || client.role !== "client") {
    return <p className="text-sm text-slate-500">Cliente no encontrado.</p>;
  }

  function createWorkoutPlan() {
    const plan: WorkoutPlan = {
      id: id("wp"),
      trainerId,
      clientId: clientId!,
      name: "Nuevo plan de entrenamiento",
      startDate: formatISO(new Date(), { representation: "date" }),
      status: "active",
      days: [],
    };
    upsertWorkoutPlan(plan);
  }

  function createNutritionPlan() {
    const plan: NutritionPlan = {
      id: id("np"),
      trainerId,
      clientId: clientId!,
      name: "Nuevo plan nutricional",
      dailyCalories: 2000,
      proteinG: 140,
      carbsG: 200,
      fatG: 60,
      meals: [],
    };
    upsertNutritionPlan(plan);
  }

  function handleAddInvoice(e: React.FormEvent) {
    e.preventDefault();
    if (!invoiceForm.concept || !invoiceForm.dueDate) return;
    addInvoice({
      trainerId,
      clientId: clientId!,
      concept: invoiceForm.concept,
      amount: Number(invoiceForm.amount) || 0,
      status: "pending",
      issuedAt: formatISO(new Date(), { representation: "date" }),
      dueDate: invoiceForm.dueDate,
    });
    setInvoiceForm({ concept: "", amount: "50", dueDate: "" });
    setShowInvoiceModal(false);
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
                <Button onClick={createWorkoutPlan}>
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
              <WorkoutPlanEditor plan={activePlan} exercises={exercises} onSave={upsertWorkoutPlan} />
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
                <Button onClick={createNutritionPlan}>
                  <Plus size={16} /> Crear plan nutricional
                </Button>
              </div>
            ) : (
              <NutritionPlanEditor plan={nutritionPlan} onSave={upsertNutritionPlan} />
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
                      <Button variant="ghost" onClick={() => markInvoiceStatus(inv.id, "paid")}>
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
            <Button type="submit" className="w-full">
              Crear factura
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
