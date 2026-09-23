import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAdminBusiness } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { formatCurrency, formatDate } from "../../lib/utils";

export default function AdminBusinessDetail() {
  const { businessId } = useParams<{ businessId: string }>();
  const { data: business } = useAdminBusiness(businessId);

  if (!business) return null;

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/admin" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Volver a negocios
      </Link>

      <PageHeader
        title={business.name}
        subtitle={`Dueño: ${business.ownerName ?? "—"} · Alta ${formatDate(business.createdAt)}`}
      />

      <div className="grid grid-cols-3 gap-3">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-400">Entrenadores</p>
            <p className="text-lg font-semibold text-slate-900">{business.memberCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-400">Clientes</p>
            <p className="text-lg font-semibold text-slate-900">{business.clientCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-400">Ingresos registrados</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(business.revenue)}</p>
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardBody className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">Equipo</h2>
          <div className="space-y-2">
            {business.members.map((m) => (
              <div key={m.id} className="flex items-center gap-3 rounded-lg bg-slate-50 px-3 py-2.5">
                <Avatar name={m.name} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium text-slate-900">{m.name}</p>
                    <Badge tone={m.role === "owner" ? "brand" : "slate"}>{m.role === "owner" ? "Dueño" : "Staff"}</Badge>
                  </div>
                  <p className="truncate text-xs text-slate-400">{m.email}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-slate-500">
                  <p>{m.clientCount} clientes</p>
                  <p className="font-medium text-slate-700">{formatCurrency(m.revenue)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
