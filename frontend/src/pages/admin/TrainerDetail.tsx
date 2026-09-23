import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAdminTrainer } from "../../hooks/useAdmin";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Avatar } from "../../components/ui/Avatar";
import { formatCurrency, formatDate } from "../../lib/utils";

export default function AdminTrainerDetail() {
  const { trainerId } = useParams<{ trainerId: string }>();
  const { data: trainer } = useAdminTrainer(trainerId);

  if (!trainer) return null;

  return (
    <div className="max-w-2xl space-y-4">
      <Link to="/admin/trainers" className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
        <ArrowLeft size={16} /> Volver a entrenadores
      </Link>

      <div className="flex items-center gap-3">
        <Avatar name={trainer.name} size={48} />
        <div>
          <h1 className="text-xl font-bold text-slate-900">{trainer.name}</h1>
          <p className="text-sm text-slate-500">
            {trainer.email} · Alta {formatDate(trainer.createdAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardBody>
            <p className="text-xs text-slate-400">Clientes</p>
            <p className="text-lg font-semibold text-slate-900">{trainer.clientCount}</p>
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <p className="text-xs text-slate-400">Ingresos registrados</p>
            <p className="text-lg font-semibold text-slate-900">{formatCurrency(trainer.revenue)}</p>
          </CardBody>
        </Card>
      </div>

      {(trainer.bio || trainer.specialties.length > 0) && (
        <Card>
          <CardBody className="space-y-3">
            {trainer.bio && (
              <div>
                <p className="mb-1 text-xs font-medium text-slate-500">Bio</p>
                <p className="text-sm text-slate-700">{trainer.bio}</p>
              </div>
            )}
            {trainer.specialties.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium text-slate-500">Especialidades</p>
                <div className="flex flex-wrap gap-1.5">
                  {trainer.specialties.map((s) => (
                    <Badge key={s} tone="slate">
                      {s}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  );
}
