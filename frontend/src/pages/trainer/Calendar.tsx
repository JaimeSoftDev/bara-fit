import { useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Plus, Repeat, UserPlus, Users, X } from "lucide-react";
import { formatISO } from "date-fns";
import { useClients } from "../../hooks/useClients";
import {
  useCheckInAttendee,
  useCreateBooking,
  useDeleteBookingSeries,
  useJoinBooking,
  useLeaveBooking,
  useUpdateBookingStatus,
  useBookings,
} from "../../hooks/useBookings";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Select } from "../../components/ui/Field";
import { cx, formatTime } from "../../lib/utils";
import { WEEKDAY_LABELS, addDays, startOfWeek, weekDays } from "../../lib/week";
import type { Booking, BookingType } from "../../types";

const STATUS_TONE: Record<Booking["status"], "green" | "slate" | "red" | "amber"> = {
  confirmed: "green",
  completed: "slate",
  cancelled: "red",
  pending: "amber",
};
const STATUS_LABEL: Record<Booking["status"], string> = {
  confirmed: "Confirmada",
  pending: "Pendiente",
  cancelled: "Cancelada",
  completed: "Completada",
};

export default function TrainerCalendar() {
  const { data: bookings = [] } = useBookings();
  const { data: clients = [] } = useClients();
  const createBooking = useCreateBooking();
  const updateStatus = useUpdateBookingStatus();
  const deleteSeries = useDeleteBookingSeries();
  const joinBooking = useJoinBooking();
  const leaveBooking = useLeaveBooking();
  const checkIn = useCheckInAttendee();

  const [anchor, setAnchor] = useState(() => new Date());
  const [showModal, setShowModal] = useState(false);
  const [attendeePickerId, setAttendeePickerId] = useState<string | null>(null);
  const attendeePicker = bookings.find((b) => b.id === attendeePickerId) ?? null;
  const [form, setForm] = useState({
    clientId: "",
    title: "",
    type: "session" as BookingType,
    date: "",
    time: "10:00",
    location: "",
    capacity: "6",
    repeat: false,
    until: "",
  });

  const days = useMemo(() => weekDays(anchor), [anchor]);
  const weekStart = startOfWeek(anchor);

  const byDay = useMemo(() => {
    const map = new Map<string, Booking[]>();
    for (const day of days) map.set(day.toDateString(), []);
    for (const b of bookings) {
      const key = new Date(b.startsAt).toDateString();
      if (map.has(key)) map.get(key)!.push(b);
    }
    for (const list of map.values()) list.sort((a, b) => (a.startsAt < b.startsAt ? -1 : 1));
    return map;
  }, [bookings, days]);

  function resetForm() {
    setForm({
      clientId: clients[0]?.id ?? "",
      title: "",
      type: "session",
      date: "",
      time: "10:00",
      location: "",
      capacity: "6",
      repeat: false,
      until: "",
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date) return;
    if (form.type === "session" && !form.clientId) return;
    const start = new Date(`${form.date}T${form.time}`);
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 60);
    createBooking.mutate(
      {
        title: form.title,
        type: form.type,
        startsAt: formatISO(start),
        endsAt: formatISO(end),
        location: form.location || "Por confirmar",
        clientId: form.type === "session" ? form.clientId : undefined,
        capacity: form.type === "class" ? Number(form.capacity) || undefined : null,
        recurrence: form.repeat && form.until ? { freq: "weekly", until: form.until } : undefined,
      },
      {
        onSuccess: () => {
          setShowModal(false);
          resetForm();
        },
      },
    );
  }

  const nonAttendingClients = attendeePicker
    ? clients.filter((c) => !attendeePicker.attendees.some((a) => a.id === c.id))
    : [];

  return (
    <div>
      <PageHeader
        title="Agenda"
        subtitle="Sesiones individuales y clases grupales"
        action={
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
          >
            <Plus size={16} /> Nueva reserva
          </Button>
        }
      />

      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAnchor((a) => addDays(a, -7))}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Semana anterior"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setAnchor((a) => addDays(a, 7))}
            className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"
            aria-label="Semana siguiente"
          >
            <ChevronRight size={16} />
          </button>
          <button onClick={() => setAnchor(new Date())} className="text-xs font-medium text-brand-600 hover:underline">
            Hoy
          </button>
        </div>
        <p className="text-sm font-medium text-slate-700">
          {weekStart.toLocaleDateString("es-ES", { day: "2-digit", month: "short" })} –{" "}
          {addDays(weekStart, 6).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day) => {
          const items = byDay.get(day.toDateString()) ?? [];
          const isToday = day.toDateString() === new Date().toDateString();
          return (
            <div key={day.toISOString()} className="min-w-0">
              <p
                className={cx(
                  "mb-2 text-xs font-semibold uppercase tracking-wide",
                  isToday ? "text-brand-600" : "text-slate-400",
                )}
              >
                {WEEKDAY_LABELS[(day.getDay() + 6) % 7]} {day.getDate()}
              </p>
              <div className="space-y-2">
                {items.map((b) => (
                  <Card key={b.id} className={cx(b.status === "cancelled" && "opacity-50")}>
                    <CardBody className="space-y-1.5 p-2.5">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-slate-900">{formatTime(b.startsAt)}</span>
                        {b.seriesId && <Repeat size={12} className="text-slate-400" />}
                      </div>
                      <p className="truncate text-xs font-medium text-slate-800">{b.title}</p>
                      <div className="flex flex-wrap items-center gap-1">
                        <Badge tone={b.type === "class" ? "brand" : "slate"}>{b.type === "class" ? "Clase" : "Sesión"}</Badge>
                        <Badge tone={STATUS_TONE[b.status]}>{STATUS_LABEL[b.status]}</Badge>
                      </div>
                      {b.type === "class" && (
                        <div className="flex items-center gap-1 text-[11px] text-slate-500">
                          <Users size={12} /> {b.attendeeCount}/{b.capacity ?? "∞"}
                          <button
                            onClick={() => setAttendeePickerId(b.id)}
                            className="ml-auto text-brand-600 hover:underline"
                            aria-label="Añadir asistente"
                          >
                            <UserPlus size={13} />
                          </button>
                        </div>
                      )}
                      {b.type === "session" && b.attendees[0] && (
                        <button
                          onClick={() =>
                            checkIn.mutate({
                              id: b.id,
                              clientId: b.attendees[0].id,
                              checkedIn: !b.attendees[0].checkedInAt,
                            })
                          }
                          className={cx(
                            "flex items-center gap-1 truncate text-[11px]",
                            b.attendees[0].checkedInAt ? "text-emerald-600" : "text-slate-500 hover:text-brand-600",
                          )}
                          title={b.attendees[0].checkedInAt ? "Asistió — click para desmarcar" : "Marcar asistencia"}
                        >
                          <Check size={11} className={cx(!b.attendees[0].checkedInAt && "opacity-30")} />
                          {b.attendees[0].name}
                        </button>
                      )}
                      {b.status === "confirmed" && (
                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => updateStatus.mutate({ id: b.id, status: "cancelled" })}
                            className="text-[11px] text-red-500 hover:underline"
                          >
                            Cancelar
                          </button>
                          {b.seriesId && (
                            <button
                              onClick={() => deleteSeries.mutate(b.seriesId!)}
                              className="text-[11px] text-slate-400 hover:underline"
                            >
                              Cancelar serie
                            </button>
                          )}
                        </div>
                      )}
                    </CardBody>
                  </Card>
                ))}
                {items.length === 0 && <p className="text-[11px] text-slate-300">Sin reservas</p>}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title="Nueva reserva" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Tipo">
              <Select value={form.type} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as BookingType }))}>
                <option value="session">Sesión individual</option>
                <option value="class">Clase grupal</option>
              </Select>
            </Field>
            {form.type === "session" ? (
              <Field label="Cliente">
                <Select value={form.clientId} onChange={(e) => setForm((f) => ({ ...f, clientId: e.target.value }))}>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            ) : (
              <Field label="Cupo máximo">
                <Input
                  type="number"
                  min={1}
                  value={form.capacity}
                  onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))}
                />
              </Field>
            )}
            <Field label="Título">
              <Input required value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
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
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.repeat}
                onChange={(e) => setForm((f) => ({ ...f, repeat: e.target.checked }))}
              />
              Repetir cada semana
            </label>
            {form.repeat && (
              <Field label="Repetir hasta">
                <Input
                  required
                  type="date"
                  value={form.until}
                  onChange={(e) => setForm((f) => ({ ...f, until: e.target.value }))}
                />
              </Field>
            )}
            <Button type="submit" className="w-full" disabled={createBooking.isPending}>
              Crear reserva
            </Button>
          </form>
        </Modal>
      )}

      {attendeePicker && (
        <Modal title={`Añadir asistente — ${attendeePicker.title}`} onClose={() => setAttendeePickerId(null)}>
          <div className="space-y-2">
            {attendeePicker.attendees.length > 0 && (
              <div className="mb-3 space-y-1.5">
                {attendeePicker.attendees.map((a) => (
                  <div key={a.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          checkIn.mutate({ id: attendeePicker.id, clientId: a.id, checkedIn: !a.checkedInAt })
                        }
                        className={cx(
                          "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                          a.checkedInAt
                            ? "border-emerald-500 bg-emerald-500 text-white"
                            : "border-slate-300 text-transparent",
                        )}
                        aria-label={a.checkedInAt ? "Quitar asistencia" : "Marcar asistencia"}
                        title={a.checkedInAt ? "Asistió" : "Marcar como asistido"}
                      >
                        <Check size={12} />
                      </button>
                      {a.name}
                    </div>
                    <button
                      onClick={() => leaveBooking.mutate({ id: attendeePicker.id, clientId: a.id })}
                      className="text-slate-400 hover:text-red-500"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {nonAttendingClients.length === 0 ? (
              <p className="text-sm text-slate-400">No hay más clientes disponibles para añadir.</p>
            ) : (
              nonAttendingClients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => joinBooking.mutate({ id: attendeePicker.id, clientId: c.id })}
                  disabled={attendeePicker.capacity !== null && attendeePicker.attendeeCount >= attendeePicker.capacity}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm hover:border-brand-300 hover:bg-brand-50 disabled:opacity-40"
                >
                  {c.name}
                  <UserPlus size={14} className="text-brand-600" />
                </button>
              ))
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
