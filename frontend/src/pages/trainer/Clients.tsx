import { useState } from "react";
import { Link } from "react-router-dom";
import { Check, Copy, Plus, Search } from "lucide-react";
import { useClients, useInviteClient } from "../../hooks/useClients";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/Field";
import type { InviteResponse } from "../../api/clients";

export default function TrainerClients() {
  const { data: clients = [] } = useClients();
  const inviteClient = useInviteClient();
  const [query, setQuery] = useState("");
  const [showInvite, setShowInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", goal: "", heightCm: "170" });
  const [createdInvite, setCreatedInvite] = useState<InviteResponse | null>(null);
  const [copied, setCopied] = useState(false);

  const filtered = clients.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()));

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.email) return;
    inviteClient.mutate(
      {
        name: form.name,
        email: form.email,
        goal: form.goal || undefined,
        heightCm: form.heightCm ? Number(form.heightCm) : undefined,
      },
      {
        onSuccess: (invite) => {
          setForm({ name: "", email: "", goal: "", heightCm: "170" });
          setCreatedInvite(invite);
        },
      },
    );
  }

  function closeInviteModal() {
    setShowInvite(false);
    setCreatedInvite(null);
    setCopied(false);
  }

  async function copyLink() {
    if (!createdInvite) return;
    await navigator.clipboard.writeText(createdInvite.acceptUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        {filtered.map((c) => (
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
              </CardBody>
            </Card>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">No tienes clientes todavía.</p>
        )}
      </div>

      {showInvite && (
        <Modal title="Invitar nuevo cliente" onClose={closeInviteModal}>
          {!createdInvite ? (
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
              {inviteClient.isError && (
                <p className="text-sm text-red-600">No se pudo crear la invitación. Inténtalo de nuevo.</p>
              )}
              <Button type="submit" className="w-full" disabled={inviteClient.isPending}>
                {inviteClient.isPending ? "Creando invitación..." : "Generar invitación"}
              </Button>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-slate-600">
                Se envió un correo a <b>{createdInvite.email}</b>. Si prefieres, comparte este link
                directamente con tu cliente:
              </p>
              <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{createdInvite.acceptUrl}</span>
                <Button variant="secondary" onClick={copyLink} type="button">
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copiado" : "Copiar"}
                </Button>
              </div>
              <Button onClick={closeInviteModal} className="w-full">
                Listo
              </Button>
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}
