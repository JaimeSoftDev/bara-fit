import { useState } from "react";
import { Link } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { useAuth } from "../../store/auth";
import { useDb } from "../../store/db";
import { getActiveWorkoutPlan, getClientsOfTrainer } from "../../lib/queries";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/Field";

export default function TrainerClients() {
  const { currentUserId } = useAuth();
  const db = useDb((s) => s.db);
  const inviteClient = useDb((s) => s.inviteClient);
  const trainerId = currentUserId!;
  const clients = getClientsOfTrainer(db, trainerId);
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", goal: "", heightCm: "170" });

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    inviteClient({
      name: form.name,
      email: form.email,
      trainerId,
      goal: form.goal || "Sin objetivo definido",
      heightCm: Number(form.heightCm) || 170,
      startWeightKg: 0,
    });
    setForm({ name: "", email: "", goal: "", heightCm: "170" });
    setShowInvite(false);
  }

  return (
    <div>
      <PageHeader
        title="Clientes"
        subtitle={`${clients.length} clientes en tu cartera`}
        action={
          <Button onClick={() => setShowInvite(true)}>
            <Plus size={16} /> Invitar cliente
          </Button>
        }
      />

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
        <Search size={16} className="text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar cliente..."
          className="w-full text-sm outline-none"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((c) => {
          const plan = getActiveWorkoutPlan(db, c.id);
          return (
            <Link key={c.id} to={`/trainer/clients/${c.id}`}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardBody>
                  <div className="flex items-center gap-3">
                    <Avatar name={c.name} size={44} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{c.name}</p>
                      <p className="truncate text-xs text-slate-400">{c.email}</p>
                    </div>
                  </div>
                  <p className="mt-3 text-xs text-slate-500">{c.goal}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge tone={plan ? "green" : "slate"}>{plan ? plan.name : "Sin plan activo"}</Badge>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>

      {showInvite && (
        <Modal title="Invitar nuevo cliente" onClose={() => setShowInvite(false)}>
          <form onSubmit={handleInvite} className="space-y-3">
            <Field label="Nombre completo">
              <Input
                required
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </Field>
            <Field label="Correo electrónico">
              <Input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Objetivo">
              <Textarea
                rows={2}
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}
              />
            </Field>
            <Field label="Altura (cm)">
              <Input
                type="number"
                value={form.heightCm}
                onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
              />
            </Field>
            <Button type="submit" className="w-full">
              Enviar invitación
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
