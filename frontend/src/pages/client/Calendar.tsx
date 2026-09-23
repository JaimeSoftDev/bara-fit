import { useState } from "react";
import { formatISO } from "date-fns";
import { Plus, Users } from "lucide-react";
import { useSession } from "../../store/session";
import { useAvailableClasses, useBookings, useCreateBooking, useJoinBooking } from "../../hooks/useBookings";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input } from "../../components/ui/Field";
import { formatDateLong, formatTime } from "../../lib/utils";

const STATUS_LABEL = { confirmed: "Confirmada", pending: "Pendiente", cancelled: "Cancelada", completed: "Completada" } as const;
const STATUS_TONE = { confirmed: "green", pending: "amber", cancelled: "red", completed: "slate" } as const;

export default function ClientCalendar() {
  const clientId = useSession((s) => s.user!.id);
  const { data: bookings = [] } = useBookings();
  const { data: availableClasses = [] } = useAvailableClasses();
  const createBooking = useCreateBooking();
  const joinBooking = useJoinBooking();

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "Sesión solicitada", date: "", time: "10:00" });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date) return;
    const start = new Date(`${form.date}T${form.time}`);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    createBooking.mutate(
      {
        title: form.title,
        type: "session",
        startsAt: formatISO(start),
        endsAt: formatISO(end),
        location: "Por confirmar",
        clientId,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          setForm({ title: "Sesión solicitada", date: "", time: "10:00" });
        },
      },
    );
  }

  return (
    <div>
      <PageHeader
        title="Mi agenda"
        subtitle="Tus próximas sesiones y clases"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Reservar sesión
          </Button>
        }
      />

      {availableClasses.length > 0 && (
        <div className="mb-6">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">Clases disponibles</h2>
          <div className="space-y-2">
            {availableClasses.map((c) => (
              <Card key={c.id}>
                <CardBody className="flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{c.title}</p>
                    <p className="text-xs text-slate-400">
                      {formatDateLong(c.startsAt)} · {formatTime(c.startsAt)} · {c.location}
                    </p>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Users size={13} /> {c.attendeeCount}/{c.capacity}
                  </span>
                  <Button variant="secondary" onClick={() => joinBooking.mutate({ id: c.id })}>
                    Unirme
                  </Button>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      )}

      <h2 className="mb-2 text-sm font-semibold text-slate-900">Mis reservas</h2>
      <div className="space-y-2">
        {bookings.length === 0 && <p className="text-sm text-slate-400">No tienes reservas todavía.</p>}
        {bookings.map((b) => (
          <Card key={b.id}>
            <CardBody className="flex flex-wrap items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{b.title}</p>
                <p className="text-xs text-slate-400">
                  {formatDateLong(b.startsAt)} · {formatTime(b.startsAt)} · {b.location}
                </p>
              </div>
              <Badge tone={b.type === "class" ? "brand" : "slate"}>{b.type === "class" ? "Clase" : "Sesión"}</Badge>
              <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
            </CardBody>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal title="Reservar sesión" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Motivo / título">
              <Input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha">
                <Input required type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </Field>
              <Field label="Hora">
                <Input required type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </Field>
            </div>
            <p className="text-xs text-slate-400">Tu entrenador confirmará la disponibilidad.</p>
            <Button type="submit" className="w-full" disabled={createBooking.isPending}>
              Enviar solicitud
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
