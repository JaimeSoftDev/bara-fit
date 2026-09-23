import { useState } from "react";
import { Plus } from "lucide-react";
import { useSession } from "../../store/session";
import { useCreatePayrollEntry, useMyBusiness, usePayroll, useUpdatePayrollStatus } from "../../hooks/useBusiness";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Field";
import { formatCurrency } from "../../lib/utils";

export default function Payroll() {
  const user = useSession((s) => s.user);
  const { data: business } = useMyBusiness();
  const { data: entries = [] } = usePayroll(business?.id);
  const createEntry = useCreatePayrollEntry(business?.id);
  const updateStatus = useUpdatePayrollStatus(business?.id);

  const isOwner = user?.role === "trainer" && user.businessRole === "owner";
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ trainerId: "", periodLabel: "", amount: "" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.trainerId || !form.periodLabel || !form.amount) return;
    createEntry.mutate(
      { trainerId: form.trainerId, periodLabel: form.periodLabel, amount: Number(form.amount) },
      { onSuccess: () => setShowModal(false) },
    );
    setForm({ trainerId: "", periodLabel: "", amount: "" });
  }

  const staffMembers = (business?.members ?? []).filter((m) => m.role === "staff");

  return (
    <div>
      <PageHeader
        title="Nómina"
        subtitle={isOwner ? "Pagos a tu equipo" : "Tus pagos"}
        action={
          isOwner && (
            <Button onClick={() => setShowModal(true)}>
              <Plus size={16} /> Nuevo pago
            </Button>
          )
        }
      />

      <Card>
        <CardBody className="space-y-2">
          {entries.length === 0 && <p className="text-sm text-slate-400">Sin registros de nómina todavía.</p>}
          {entries.map((entry) => (
            <div key={entry.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 p-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-900">{entry.trainerName}</p>
                <p className="text-xs text-slate-400">{entry.periodLabel}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(entry.amount)}</span>
              <Badge tone={entry.status === "paid" ? "green" : "amber"}>
                {entry.status === "paid" ? "Pagado" : "Pendiente"}
              </Badge>
              {isOwner && entry.status !== "paid" && (
                <Button variant="secondary" onClick={() => updateStatus.mutate({ entryId: entry.id, status: "paid" })}>
                  Marcar pagado
                </Button>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      {showModal && (
        <Modal title="Nuevo pago de nómina" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Entrenador">
              <Select value={form.trainerId} onChange={(e) => setForm((f) => ({ ...f, trainerId: e.target.value }))}>
                <option value="">Selecciona...</option>
                {staffMembers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Periodo">
              <Input
                placeholder="Septiembre 2026"
                value={form.periodLabel}
                onChange={(e) => setForm((f) => ({ ...f, periodLabel: e.target.value }))}
              />
            </Field>
            <Field label="Importe (€)">
              <Input
                type="number"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </Field>
            <Button type="submit" className="w-full" disabled={createEntry.isPending}>
              Crear pago
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
