import { Link } from "react-router-dom";
import { Building2, ChevronRight, Users, Wallet } from "lucide-react";
import { useAdminBusinesses, useAdminOverview } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDate } from "../../lib/utils";

function StatCard({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Users }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
          <Icon size={18} />
        </div>
        <div>
          <p className="text-xs text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-900">{value}</p>
        </div>
      </CardBody>
    </Card>
  );
}

export default function AdminOverview() {
  const { data: overview } = useAdminOverview();
  const { data: businesses = [] } = useAdminBusinesses();

  return (
    <div className="space-y-5">
      <PageHeader title="Negocios" subtitle="Equipos multi-entrenador registrados en la plataforma" />

      {overview && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Negocios" value={String(overview.businessCount)} icon={Building2} />
          <StatCard label="Entrenadores" value={String(overview.trainerCount)} icon={Users} />
          <StatCard label="Clientes" value={String(overview.clientCount)} icon={Users} />
          <StatCard label="Ingresos registrados" value={formatCurrency(overview.totalRevenue)} icon={Wallet} />
        </div>
      )}

      <div className="space-y-2">
        {businesses.map((b) => (
          <Link key={b.id} to={`/admin/businesses/${b.id}`}>
            <Card>
              <CardBody className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <Building2 size={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{b.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {b.ownerName} · Alta {formatDate(b.createdAt)}
                  </p>
                </div>
                <div className="hidden items-center gap-4 text-sm text-slate-500 sm:flex">
                  <span>
                    <Badge tone="brand">{b.memberCount} entrenadores</Badge>
                  </span>
                  <span>{b.clientCount} clientes</span>
                  <span className="font-medium text-slate-700">{formatCurrency(b.revenue)}</span>
                </div>
                <ChevronRight size={18} className="shrink-0 text-slate-300" />
              </CardBody>
            </Card>
          </Link>
        ))}
        {businesses.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">Todavía no hay ningún negocio/equipo registrado.</p>
        )}
      </div>
    </div>
  );
}
