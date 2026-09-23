import { Link } from "react-router-dom";
import { ChevronRight, Users } from "lucide-react";
import { useAdminTrainers } from "../../hooks/useAdmin";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { formatCurrency, formatDate } from "../../lib/utils";

export default function AdminTrainers() {
  const { data: trainers = [] } = useAdminTrainers();

  return (
    <div className="space-y-5">
      <PageHeader
        title="Entrenadores independientes"
        subtitle={`${trainers.length} entrenadores sin equipo en la plataforma`}
      />

      <div className="space-y-2">
        {trainers.map((t) => (
          <Link key={t.id} to={`/admin/trainers/${t.id}`}>
            <Card>
              <CardBody className="flex items-center gap-3">
                <Avatar name={t.name} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                  <p className="truncate text-xs text-slate-400">
                    {t.email} · Alta {formatDate(t.createdAt)}
                  </p>
                </div>
                <div className="hidden items-center gap-4 text-sm text-slate-500 sm:flex">
                  <span>{t.clientCount} clientes</span>
                  <span className="font-medium text-slate-700">{formatCurrency(t.revenue)}</span>
                </div>
                <ChevronRight size={18} className="shrink-0 text-slate-300" />
              </CardBody>
            </Card>
          </Link>
        ))}
        {trainers.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-400">
            <Users size={18} className="mx-auto mb-2 text-slate-300" />
            No hay entrenadores independientes todavía.
          </p>
        )}
      </div>
    </div>
  );
}
