import { Link } from "react-router-dom";
import { Apple, CalendarDays, Dumbbell, Wallet } from "lucide-react";
import { useAuth } from "../../store/auth";
import { useCurrentDb } from "../../store/db";
import {
  getActiveWorkoutPlan,
  getBookingsOfClient,
  getInvoicesOfClient,
  getNutritionPlanOfClient,
  getProgressOfClient,
} from "../../lib/queries";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDateLong, formatTime } from "../../lib/utils";

export default function ClientDashboard() {
  const { currentUserId } = useAuth();
  const db = useCurrentDb();
  const clientId = currentUserId!;

  const plan = getActiveWorkoutPlan(db, clientId);
  const nutrition = getNutritionPlanOfClient(db, clientId);
  const bookings = getBookingsOfClient(db, clientId);
  const progress = getProgressOfClient(db, clientId);
  const invoices = getInvoicesOfClient(db, clientId);

  const now = new Date();
  const nextBooking = bookings.find((b) => new Date(b.startsAt) >= now && b.status === "confirmed");
  const lastWeight = progress[progress.length - 1];
  const pendingInvoices = invoices.filter((i) => i.status !== "paid");

  const todayDay = plan?.days[now.getDay() % (plan.days.length || 1)];

  return (
    <div>
      <PageHeader title="Tu día" subtitle="Esto es lo que toca hoy" />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Dumbbell size={16} className="text-brand-600" /> Entrenamiento de hoy
            </h2>
            <Link to="/client/workout" className="text-xs font-medium text-brand-600 hover:underline">
              Ver rutina
            </Link>
          </CardHeader>
          <CardBody>
            {!plan ? (
              <p className="text-sm text-slate-400">Tu entrenador aún no te ha asignado un plan.</p>
            ) : (
              <div>
                <p className="text-sm font-medium text-slate-900">{plan.name}</p>
                {todayDay && (
                  <div className="mt-2 space-y-1.5">
                    <p className="text-xs font-semibold text-slate-500">{todayDay.label}</p>
                    {todayDay.items.slice(0, 4).map((it) => {
                      const ex = db.exercises[it.exerciseId];
                      return (
                        <p key={it.id} className="text-xs text-slate-500">
                          {ex?.name} · {it.sets}x{it.reps}
                        </p>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <CalendarDays size={16} className="text-brand-600" /> Próxima sesión
            </h2>
            <Link to="/client/calendar" className="text-xs font-medium text-brand-600 hover:underline">
              Ver agenda
            </Link>
          </CardHeader>
          <CardBody>
            {nextBooking ? (
              <div>
                <p className="text-sm font-medium text-slate-900">{nextBooking.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDateLong(nextBooking.startsAt)} · {formatTime(nextBooking.startsAt)}
                </p>
                <p className="text-xs text-slate-400">{nextBooking.location}</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No tienes sesiones próximas.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Apple size={16} className="text-brand-600" /> Nutrición
            </h2>
            <Link to="/client/nutrition" className="text-xs font-medium text-brand-600 hover:underline">
              Ver plan
            </Link>
          </CardHeader>
          <CardBody>
            {nutrition ? (
              <div>
                <p className="text-sm font-medium text-slate-900">{nutrition.name}</p>
                <p className="text-xs text-slate-400">{nutrition.dailyCalories} kcal / día</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">Aún sin plan nutricional.</p>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
              <Wallet size={16} className="text-brand-600" /> Pagos
            </h2>
            <Link to="/client/payments" className="text-xs font-medium text-brand-600 hover:underline">
              Ver todo
            </Link>
          </CardHeader>
          <CardBody>
            {pendingInvoices.length > 0 ? (
              <Badge tone="amber">{pendingInvoices.length} factura(s) pendiente(s)</Badge>
            ) : (
              <Badge tone="green">Estás al día</Badge>
            )}
            {lastWeight && <p className="mt-2 text-xs text-slate-400">Último peso registrado: {lastWeight.weightKg} kg</p>}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
