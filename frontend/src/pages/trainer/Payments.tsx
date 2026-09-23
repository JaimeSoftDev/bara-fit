import { useState } from "react";
import { useInvoices, useUpdateInvoiceStatus } from "../../hooks/useInvoices";
import { useClients } from "../../hooks/useClients";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Avatar } from "../../components/ui/Avatar";
import { cx, formatCurrency, formatDate } from "../../lib/utils";
import { Wallet, TrendingUp, AlertTriangle } from "lucide-react";
import type { InvoiceStatus } from "../../types";

const FILTERS = ["Todas", "Pagadas", "Pendientes", "Vencidas"] as const;

export default function TrainerPayments() {
  const { data: invoices = [] } = useInvoices();
  const { data: clients = [] } = useClients();
  const updateInvoiceStatus = useUpdateInvoiceStatus();
  const clientsById = new Map(clients.map((c) => [c.id, c]));
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("Todas");

  const paid = invoices.filter((i) => i.status === "paid");
  const pending = invoices.filter((i) => i.status === "pending");
  const overdue = invoices.filter((i) => i.status === "overdue");

  const filterMap: Record<(typeof FILTERS)[number], InvoiceStatus | null> = {
    Todas: null,
    Pagadas: "paid",
    Pendientes: "pending",
    Vencidas: "overdue",
  };
  const filtered = filterMap[filter] ? invoices.filter((i) => i.status === filterMap[filter]) : invoices;

  const statusTone: Record<InvoiceStatus, "green" | "amber" | "red"> = { paid: "green", pending: "amber", overdue: "red" };
  const statusLabel: Record<InvoiceStatus, string> = { paid: "Pagada", pending: "Pendiente", overdue: "Vencida" };

  return (
    <div>
      <PageHeader title="Pagos y facturación" subtitle="Controla los cobros de todos tus clientes" />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Cobrado" value={formatCurrency(paid.reduce((s, i) => s + i.amount, 0))} icon={TrendingUp} />
        <StatCard label="Pendiente" value={formatCurrency(pending.reduce((s, i) => s + i.amount, 0))} icon={Wallet} />
        <StatCard label="Vencido" value={formatCurrency(overdue.reduce((s, i) => s + i.amount, 0))} icon={AlertTriangle} />
      </div>

      <div className="my-4 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cx(
              "rounded-full px-3 py-1.5 text-xs font-medium",
              filter === f ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <Card>
        <CardBody className="space-y-2">
          {filtered.length === 0 && <p className="text-sm text-slate-400">No hay facturas en esta vista.</p>}
          {filtered.map((inv) => {
            const client = clientsById.get(inv.clientId);
            return (
              <div key={inv.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-slate-100 p-3">
                <Avatar name={client?.name ?? "?"} size={34} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{inv.concept}</p>
                  <p className="text-xs text-slate-400">
                    {client?.name} · Vence {formatDate(inv.dueDate)}
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.amount)}</span>
                <Badge tone={statusTone[inv.status]}>{statusLabel[inv.status]}</Badge>
                {inv.status !== "paid" && (
                  <Button variant="secondary" onClick={() => updateInvoiceStatus.mutate({ id: inv.id, status: "paid" })}>
                    Marcar pagada
                  </Button>
                )}
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}
