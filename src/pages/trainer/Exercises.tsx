import { useState } from "react";
import { Pencil, Plus, Trash2, Video } from "lucide-react";
import { useAuth } from "../../store/auth";
import { useDb } from "../../store/db";
import { getExercisesOfTrainer } from "../../lib/queries";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { id } from "../../lib/id";
import type { Exercise, MuscleGroup } from "../../types";

const MUSCLE_GROUPS: MuscleGroup[] = ["Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Core", "Cardio", "Movilidad"];

const emptyForm = { name: "", muscleGroup: "Piernas" as MuscleGroup, equipment: "", videoUrl: "", notes: "" };

export default function TrainerExercises() {
  const { currentUserId } = useAuth();
  const db = useDb((s) => s.db);
  const upsertExercise = useDb((s) => s.upsertExercise);
  const deleteExercise = useDb((s) => s.deleteExercise);
  const trainerId = currentUserId!;
  const exercises = getExercisesOfTrainer(db, trainerId);

  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<MuscleGroup | "Todos">("Todos");
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === "Todos" ? exercises : exercises.filter((e) => e.muscleGroup === filter);

  function openNew() {
    setEditing(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEdit(ex: Exercise) {
    setEditing(ex);
    setForm({ name: ex.name, muscleGroup: ex.muscleGroup, equipment: ex.equipment, videoUrl: ex.videoUrl ?? "", notes: ex.notes ?? "" });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditing(null);
    setForm(emptyForm);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name) return;
    upsertExercise({
      id: editing?.id ?? id("ex"),
      trainerId,
      name: form.name,
      muscleGroup: form.muscleGroup,
      equipment: form.equipment,
      videoUrl: form.videoUrl || undefined,
      notes: form.notes || undefined,
    });
    closeModal();
  }

  return (
    <div>
      <PageHeader
        title="Biblioteca de ejercicios"
        subtitle={`${exercises.length} ejercicios disponibles`}
        action={
          <Button onClick={openNew}>
            <Plus size={16} /> Nuevo ejercicio
          </Button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {(["Todos", ...MUSCLE_GROUPS] as const).map((g) => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium ${
              filter === g ? "bg-brand-600 text-white" : "bg-slate-100 text-slate-600"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((ex) => (
          <Card key={ex.id}>
            <CardBody>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-slate-900">{ex.name}</p>
                  <p className="text-xs text-slate-400">{ex.equipment || "Sin equipo"}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => openEdit(ex)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteExercise(ex.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <Badge tone="brand">{ex.muscleGroup}</Badge>
                {ex.videoUrl && (
                  <span className="flex items-center gap-1 text-xs text-slate-400">
                    <Video size={12} /> Video
                  </span>
                )}
              </div>
              {ex.notes && <p className="mt-2 text-xs text-slate-500">{ex.notes}</p>}
            </CardBody>
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-slate-400">No hay ejercicios en esta categoría.</p>
        )}
      </div>

      {showModal && (
        <Modal title={editing ? "Editar ejercicio" : "Nuevo ejercicio"} onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Nombre">
              <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Grupo muscular">
              <Select
                value={form.muscleGroup}
                onChange={(e) => setForm((f) => ({ ...f, muscleGroup: e.target.value as MuscleGroup }))}
              >
                {MUSCLE_GROUPS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Equipo">
              <Input value={form.equipment} onChange={(e) => setForm((f) => ({ ...f, equipment: e.target.value }))} />
            </Field>
            <Field label="URL del vídeo (opcional)">
              <Input value={form.videoUrl} onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))} />
            </Field>
            <Field label="Notas">
              <Textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
            </Field>
            <Button type="submit" className="w-full">
              Guardar ejercicio
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
