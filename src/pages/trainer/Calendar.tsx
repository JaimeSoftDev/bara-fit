import { useState } from "react";
import { Plus } from "lucide-react";
import { formatISO } from "date-fns";
import { useAuth } from "../../store/auth";
import { useDb } from "../../store/db";
import { getBookingsOfTrainer, getClientsOfTrainer } from "../../lib/queries";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Field";
import { Avatar } from "../../components/ui/Avatar";
import { formatDateLong, formatTime } from "../../lib/utils";
import type { BookingType } from "../../types";

export default function TrainerCalendar() {
  const { currentUserId } = useAuth();
  const db = useDb((s) => s.db);
  const addBooking = useDb((s) => s.addBooking);
  const updateBookingStatus = useDb((s) => s.updateBookingStatus);
  const trainerId = currentUserId!;

  const bookings = getBookingsOfTrainer(db, trainerId);
  const clients = getClientsOfTrainer(db, trainerId);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    clientId: clients[0]?.id ?? "",
    title: "",
    type: "session" as BookingType,
    date: "",
    time: "10:00",
    location: "",
  });

  const grouped = bookings.reduce<Record<string, typeof bookings>>((acc, b) => {
    const key = new Date(b.startsAt).toDateString();
    acc[key] = acc[key] ? [...acc[key], b] : [b];
    return acc;
  }, {});

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.clientId || !form.title || !form.date) return;
    const start = new Date(`${form.date}T${form.time}`);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    addBooking({
      trainerId,
      clientId: form.clientId,
      title: form.title,
      type: form.type,
      startsAt: formatISO(start),
      endsAt: formatISO(end),
      status: "confirmed",
      location: form.location || "Por confirmar",
    });
    setShowModal(false);
    setForm({ clientId: clients[0]?.id ?? "", title: "", type: "session", date: "", time: "10:00", location: "" });
  }

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Sesiones individuales y clases grupales"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nueva reserva
          </Button>
        }
      />

      <div className="space-y-5">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {formatDateLong(items[0].startsAt)}
            </p>
            <div className="space-y-2">
              {items.map((b) => {
                const client = db.users[b.clientId];
                return (
                  <Card key={b.id}>
                    <CardBody className="flex flex-wrap items-center gap-3">
                      <Avatar name={client?.name ?? "?"} size={38} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">{b.title}</p>
                        <p className="text-xs text-slate-400">
                          {client?.name} · {formatTime(b.startsAt)}–{formatTime(b.endsAt)} · {b.location}
                        </p>
                      </div>
                      <Badge tone={b.type === "class" ? "brand" : "slate"}>{b.type === "class" ? "Clase" : "Sesión"}</Badge>
                      <Badge
                        tone={
                          b.status === "confirmed" ? "green" : b.status === "completed" ? "slate" : b.status === "cancelled" ? "red" : "amber"
                        }
                      >
                        {{ confirmed: "Confirmada", pending: "Pendiente", cancelled: "Cancelada", completed: "Completada" }[b.status]}
                      </Badge>
                      {b.status === "confirmed" && (
                        <Button variant="ghost" onClick={() => updateBookingStatus(b.id, "cancelled")}>
                          Cancelar
                        </Button>
                      )}
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        ))}
        {bookings.length === 0 && <p className="text-sm text-slate-400">No hay reservas todavía.</p>}
      </div>

      {showModal && (
        <Modal title="Nueva reserva" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Cliente">
              <Select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Título">
              <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            </Field>
            <Field label="Tipo">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as BookingType }))}>
                <option value="session">Sesión individual</option>
                <option value="class">Clase grupal</option>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Fecha">
                <Input required type="date" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
              </Field>
              <Field label="Hora">
                <Input required type="time" value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} />
              </Field>
            </div>
            <Field label="Ubicación">
              <Input value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
            </Field>
            <Button type="submit" className="w-full">
              Crear reserva
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
