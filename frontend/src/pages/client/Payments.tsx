import { useSession } from "../../store/session";
import { useInvoices, useUpdateInvoiceStatus } from "../../hooks/useInvoices";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { formatCurrency, formatDate } from "../../lib/utils";
import type { InvoiceStatus } from "../../types";

export default function ClientPayments() {
  const clientId = useSession((s) => s.user!.id);
  const { data: invoices = [] } = useInvoices(clientId);
  const updateInvoiceStatus = useUpdateInvoiceStatus();

  const statusTone: Record<InvoiceStatus, "green" | "amber" | "red"> = { paid: "green", pending: "amber", overdue: "red" };
  const statusLabel: Record<InvoiceStatus, string> = { paid: "Pagada", pending: "Pendiente", overdue: "Vencida" };

  return (
    <div>
      <PageHeader title="Pagos" subtitle="Historial de facturas con tu entrenador" />
      <div className="space-y-2">
        {invoices.length === 0 && <p className="text-sm text-slate-400">No tienes facturas todavía.</p>}
        {invoices.map((inv) => (
          <Card key={inv.id}>
            <CardBody className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{inv.concept}</p>
                <p className="text-xs text-slate-400">Vence {formatDate(inv.dueDate)}</p>
              </div>
              <span className="text-sm font-semibold text-slate-900">{formatCurrency(inv.amount)}</span>
              <Badge tone={statusTone[inv.status]}>{statusLabel[inv.status]}</Badge>
              {inv.status !== "paid" && (
                <Button onClick={() => updateInvoiceStatus.mutate({ id: inv.id, status: "paid" })}>Pagar ahora</Button>
              )}
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
