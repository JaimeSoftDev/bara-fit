import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { id } from "../../lib/id";
import type { Exercise, WorkoutDay, WorkoutItem, WorkoutPlan } from "../../types";
import { Button } from "../ui/Button";
import { Input, Select } from "../ui/Field";
import { Badge } from "../ui/Badge";

function emptyItem(exerciseId: string): WorkoutItem {
  return { id: id("it"), exerciseId, sets: 3, reps: "10", loadKg: undefined, restSeconds: 60 };
}

export function WorkoutPlanEditor({
  plan,
  exercises,
  onSave,
}: {
  plan: WorkoutPlan;
  exercises: Exercise[];
  onSave: (plan: WorkoutPlan) => void;
}) {
  const [draft, setDraft] = useState<WorkoutPlan>(plan);
  const [dirty, setDirty] = useState(false);

  function update(next: WorkoutPlan) {
    setDraft(next);
    setDirty(true);
  }

  function addDay() {
    const day: WorkoutDay = { id: id("day"), label: `Día ${draft.days.length + 1}`, items: [] };
    update({ ...draft, days: [...draft.days, day] });
  }

  function removeDay(dayId: string) {
    update({ ...draft, days: draft.days.filter((d) => d.id !== dayId) });
  }

  function updateDayLabel(dayId: string, label: string) {
    update({ ...draft, days: draft.days.map((d) => (d.id === dayId ? { ...d, label } : d)) });
  }

  function addItem(dayId: string) {
    if (exercises.length === 0) return;
    update({
      ...draft,
      days: draft.days.map((d) =>
        d.id === dayId ? { ...d, items: [...d.items, emptyItem(exercises[0].id)] } : d,
      ),
    });
  }

  function updateItem(dayId: string, itemId: string, patch: Partial<WorkoutItem>) {
    update({
      ...draft,
      days: draft.days.map((d) =>
        d.id === dayId
          ? { ...d, items: d.items.map((it) => (it.id === itemId ? { ...it, ...patch } : it)) }
          : d,
      ),
    });
  }

  function removeItem(dayId: string, itemId: string) {
    update({
      ...draft,
      days: draft.days.map((d) => (d.id === dayId ? { ...d, items: d.items.filter((it) => it.id !== itemId) } : d)),
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={draft.name}
          onChange={(e) => update({ ...draft, name: e.target.value })}
          className="max-w-xs"
        />
        <Select
          value={draft.status}
          onChange={(e) => update({ ...draft, status: e.target.value as WorkoutPlan["status"] })}
          className="w-auto"
        >
          <option value="active">Activo</option>
          <option value="draft">Borrador</option>
          <option value="completed">Completado</option>
        </Select>
        {dirty && <Badge tone="amber">Cambios sin guardar</Badge>}
      </div>

      <div className="space-y-4">
        {draft.days.map((day) => (
          <div key={day.id} className="rounded-xl border border-slate-200 p-3">
            <div className="mb-3 flex items-center gap-2">
              <Input
                value={day.label}
                onChange={(e) => updateDayLabel(day.id, e.target.value)}
                className="max-w-[220px] font-medium"
              />
              <button
                onClick={() => removeDay(day.id)}
                className="ml-auto rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                aria-label="Eliminar día"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {day.items.map((item) => {
                const exercise = exercises.find((e) => e.id === item.exerciseId);
                return (
                  <div
                    key={item.id}
                    className="grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-2.5 sm:grid-cols-6 sm:items-center"
                  >
                    <Select
                      className="sm:col-span-2"
                      value={item.exerciseId}
                      onChange={(e) => updateItem(day.id, item.id, { exerciseId: e.target.value })}
                    >
                      {exercises.map((ex) => (
                        <option key={ex.id} value={ex.id}>
                          {ex.name}
                        </option>
                      ))}
                    </Select>
                    <Input
                      type="number"
                      placeholder="Series"
                      value={item.sets}
                      onChange={(e) => updateItem(day.id, item.id, { sets: Number(e.target.value) })}
                    />
                    <Input
                      placeholder="Reps"
                      value={item.reps}
                      onChange={(e) => updateItem(day.id, item.id, { reps: e.target.value })}
                    />
                    <Input
                      type="number"
                      placeholder="Carga (kg)"
                      value={item.loadKg ?? ""}
                      onChange={(e) =>
                        updateItem(day.id, item.id, {
                          loadKg: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        placeholder="Descanso (s)"
                        value={item.restSeconds}
                        onChange={(e) => updateItem(day.id, item.id, { restSeconds: Number(e.target.value) })}
                      />
                      <button
                        onClick={() => removeItem(day.id, item.id)}
                        className="shrink-0 rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                        aria-label="Eliminar ejercicio"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {exercise?.muscleGroup && (
                      <div className="col-span-2 -mt-1 sm:col-span-6">
                        <Badge tone="slate">{exercise.muscleGroup}</Badge>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              onClick={() => addItem(day.id)}
              className="mt-2 flex items-center gap-1 text-xs font-medium text-brand-600 hover:underline"
            >
              <Plus size={14} /> Añadir ejercicio
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Button variant="secondary" onClick={addDay}>
          <Plus size={16} /> Añadir día
        </Button>
        <Button
          onClick={() => {
            onSave(draft);
            setDirty(false);
          }}
        >
          Guardar rutina
        </Button>
      </div>
    </div>
  );
}
