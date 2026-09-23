import { useMemo } from "react";
import { useSession } from "../../store/session";
import { useMyBusiness, useTeamCalendar } from "../../hooks/useBusiness";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { formatDateLong, formatTime } from "../../lib/utils";

const TRAINER_COLORS = ["brand", "green", "amber", "red"] as const;

export default function TeamCalendar() {
  const { data: business } = useMyBusiness();
  const { data: bookings = [] } = useTeamCalendar(business?.id);
  const currentUserId = useSession((s) => s.user?.id);

  const trainerColor = useMemo(() => {
    const map = new Map<string, (typeof TRAINER_COLORS)[number]>();
    (business?.members ?? []).forEach((m, i) => map.set(m.id, TRAINER_COLORS[i % TRAINER_COLORS.length]));
    return map;
  }, [business]);

  const upcoming = bookings.filter((b) => b.status !== "cancelled");
  const grouped = upcoming.reduce<Record<string, typeof upcoming>>((acc, b) => {
    const key = new Date(b.startsAt).toDateString();
    acc[key] = acc[key] ? [...acc[key], b] : [b];
    return acc;
  }, {});

  return (
    <div>
      <PageHeader title="Agenda del equipo" subtitle={business ? `Todas las sesiones de ${business.name}` : undefined} />

      <div className="mb-4 flex flex-wrap gap-2">
        {(business?.members ?? []).map((m) => (
          <Badge key={m.id} tone={trainerColor.get(m.id)}>
            {m.name}
            {m.id === currentUserId ? " (tú)" : ""}
          </Badge>
        ))}
      </div>

      <div className="space-y-5">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day}>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {formatDateLong(items[0].startsAt)}
            </p>
            <div className="space-y-2">
              {items.map((b) => (
                <Card key={b.id}>
                  <CardBody className="flex flex-wrap items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900">{b.title}</p>
                      <p className="text-xs text-slate-400">
                        {formatTime(b.startsAt)}–{formatTime(b.endsAt)} · {b.location}
                      </p>
                    </div>
                    <Badge tone={trainerColor.get(b.trainerId)}>{b.trainerName}</Badge>
                    <Badge tone={b.type === "class" ? "brand" : "slate"}>{b.type === "class" ? "Clase" : "Sesión"}</Badge>
                  </CardBody>
                </Card>
              ))}
            </div>
          </div>
        ))}
        {upcoming.length === 0 && <p className="text-sm text-slate-400">Sin reservas en el equipo todavía.</p>}
      </div>
    </div>
  );
}
