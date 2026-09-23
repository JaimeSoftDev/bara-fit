import { Link } from "react-router-dom";
import { CalendarClock, Dumbbell, Users, Wallet } from "lucide-react";
import { useClients } from "../../hooks/useClients";
import { useBookings } from "../../hooks/useBookings";
import { useInvoices } from "../../hooks/useInvoices";
import { PageHeader } from "../../components/ui/PageHeader";
import { StatCard } from "../../components/ui/StatCard";
import { Card, CardBody, CardHeader } from "../../components/ui/Card";
import { Avatar } from "../../components/ui/Avatar";
import { Badge } from "../../components/ui/Badge";
import { formatCurrency, formatDateLong, formatTime } from "../../lib/utils";

export default function TrainerDashboard() {
  const { data: clients = [] } = useClients();
  const { data: bookings = [] } = useBookings();
  const { data: invoices = [] } = useInvoices();

  const now = new Date();
  const upcoming = bookings.filter((b) => new Date(b.startsAt) >= now && b.status !== "cancelled").slice(0, 4);
  const todayCount = bookings.filter((b) => {
    const d = new Date(b.startsAt);
    return d.toDateString() === now.toDateString();
  }).length;
  const pendingInvoices = invoices.filter((i) => i.status !== "paid");
  const monthRevenue = invoices
    .filter((i) => i.status === "paid")
    .reduce((sum, i) => sum + i.amount, 0);

  return (
    <div>
      <PageHeader
        title={`Hola de nuevo 👋`}
        subtitle="Aquí tienes el resumen de tu actividad como entrenador."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Clientes activos" value={String(clients.length)} icon={Users} />
        <StatCard label="Sesiones hoy" value={String(todayCount)} icon={CalendarClock} />
        <StatCard label="Ingresos cobrados" value={formatCurrency(monthRevenue)} icon={Wallet} />
        <StatCard
          label="Facturas pendientes"
          value={String(pendingInvoices.length)}
          icon={Wallet}
          hint={pendingInvoices.length ? "Requieren seguimiento" : "Todo al día"}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Próximas sesiones</h2>
            <Link to="/trainer/calendar" className="text-xs font-medium text-brand-600 hover:underline">
              Ver agenda
            </Link>
          </CardHeader>
          <CardBody className="space-y-3">
            {upcoming.length === 0 && <p className="text-sm text-slate-400">No tienes sesiones próximas.</p>}
            {upcoming.map((b) => {
              const attendeeLabel =
                b.attendees.length === 0
                  ? "Sin confirmar"
                  : b.attendees.length === 1
                    ? b.attendees[0].name
                    : `${b.attendees[0].name} +${b.attendees.length - 1}`;
              return (
                <div key={b.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3">
                  <Avatar name={b.attendees[0]?.name ?? "?"} size={36} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{b.title}</p>
                    <p className="text-xs text-slate-400">
                      {attendeeLabel} · {formatDateLong(b.startsAt)} · {formatTime(b.startsAt)}
                    </p>
                  </div>
                  <Badge tone={b.type === "class" ? "brand" : "slate"}>
                    {b.type === "class" ? "Clase" : "Sesión"}
                  </Badge>
                </div>
              );
            })}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-slate-900">Accesos rápidos</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            <Link
              to="/trainer/exercises"
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50"
            >
              <Dumbbell size={18} className="text-brand-600" />
              <span className="text-sm font-medium text-slate-700">Biblioteca de ejercicios</span>
            </Link>
            <Link
              to="/trainer/clients"
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50"
            >
              <Users size={18} className="text-brand-600" />
              <span className="text-sm font-medium text-slate-700">Gestionar clientes</span>
            </Link>
            <Link
              to="/trainer/payments"
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50"
            >
              <Wallet size={18} className="text-brand-600" />
              <span className="text-sm font-medium text-slate-700">Revisar pagos</span>
            </Link>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <h2 className="text-sm font-semibold text-slate-900">Tus clientes</h2>
          <Link to="/trainer/clients" className="text-xs font-medium text-brand-600 hover:underline">
            Ver todos
          </Link>
        </CardHeader>
        <CardBody>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {clients.map((c) => (
              <Link
                key={c.id}
                to={`/trainer/clients/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 hover:border-brand-200 hover:bg-brand-50"
              >
                <Avatar name={c.name} size={38} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                  <p className="truncate text-xs text-slate-400">{c.goal}</p>
                </div>
              </Link>
            ))}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
