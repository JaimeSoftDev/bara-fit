import { useState } from "react";
import { formatISO } from "date-fns";
import { Check, Video } from "lucide-react";
import { useSession } from "../../store/session";
import { useWorkoutCompletions, useSetWorkoutCompletion, useWorkoutPlans } from "../../hooks/useWorkoutPlans";
import { useExercises } from "../../hooks/useExercises";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { VideoModal } from "../../components/VideoModal";
import { cx } from "../../lib/utils";

export default function ClientWorkout() {
  const clientId = useSession((s) => s.user!.id);
  const { data: plans = [] } = useWorkoutPlans(clientId);
  const { data: exercises = [] } = useExercises();
  const exercisesById = new Map(exercises.map((e) => [e.id, e]));

  const plan = plans.find((p) => p.status === "active") ?? plans[0];
  const [activeDayId, setActiveDayId] = useState<string | undefined>(undefined);
  const [videoPreview, setVideoPreview] = useState<{ title: string; url: string } | null>(null);
  const today = formatISO(new Date(), { representation: "date" });

  const { data: completions = [] } = useWorkoutCompletions(plan?.id);
  const setCompletion = useSetWorkoutCompletion(plan?.id);

  if (!plan) {
    return (
      <div>
        <PageHeader title="Mi rutina" />
        <p className="text-sm text-slate-400">Tu entrenador aún no te ha asignado un plan de entrenamiento.</p>
      </div>
    );
  }

  const day = plan.days.find((d) => d.id === activeDayId) ?? plan.days[0];
  const completion = completions.find((w) => w.dayId === day?.id && w.date === today);
  const completedIds = new Set(completion?.completedItemIds ?? []);

  function toggleItem(itemId: string) {
    if (!day) return;
    const next = new Set(completedIds);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);
    setCompletion.mutate({ dayId: day.id, date: today, completedItemIds: Array.from(next) });
  }

  return (
    <div>
      <PageHeader title={plan.name} subtitle="Marca tus series a medida que las completas" />

      <div className="mb-4 flex gap-2 overflow-x-auto pb-1">
        {plan.days.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDayId(d.id)}
            className={cx(
              "whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium",
              d.id === day?.id ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600",
            )}
          >
            {d.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {day?.items.map((item) => {
          const exercise = exercisesById.get(item.exerciseId);
          const done = completedIds.has(item.id);
          return (
            <Card key={item.id} className={cx(done && "border-emerald-200 bg-emerald-50/50")}>
              <CardBody className="flex items-center gap-3">
                <button
                  onClick={() => toggleItem(item.id)}
                  className={cx(
                    "flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                    done ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300 text-transparent",
                  )}
                  aria-label="Marcar como completado"
                >
                  <Check size={16} />
                </button>
                <div className="min-w-0 flex-1">
                  <p className={cx("truncate text-sm font-medium", done ? "text-emerald-700 line-through" : "text-slate-900")}>
                    {exercise?.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {item.sets} series x {item.reps} {item.loadKg ? `· ${item.loadKg} kg` : ""} · descanso {item.restSeconds}s
                  </p>
                  {item.notes && <p className="text-xs text-slate-400">{item.notes}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {exercise?.muscleGroup && <Badge tone="slate">{exercise.muscleGroup}</Badge>}
                  {exercise?.videoUrl && (
                    <button
                      onClick={() => setVideoPreview({ title: exercise.name, url: exercise.videoUrl! })}
                      className="text-slate-400 hover:text-brand-600"
                      aria-label="Ver vídeo"
                    >
                      <Video size={16} />
                    </button>
                  )}
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>

      {videoPreview && (
        <VideoModal title={videoPreview.title} url={videoPreview.url} onClose={() => setVideoPreview(null)} />
      )}
    </div>
  );
}
