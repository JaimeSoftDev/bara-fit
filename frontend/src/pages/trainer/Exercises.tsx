import { useState } from "react";
import { Pencil, Play, Plus, Trash2, Video } from "lucide-react";
import { useDeleteExercise, useExercises, useSaveExercise } from "../../hooks/useExercises";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { VideoModal } from "../../components/VideoModal";
import { Field, Input, Select, Textarea } from "../../components/ui/Field";
import { getYouTubeThumbnail } from "../../lib/youtube";
import type { Exercise, MuscleGroup } from "../../types";

const MUSCLE_GROUPS: MuscleGroup[] = ["Pecho", "Espalda", "Piernas", "Hombros", "Brazos", "Core", "Cardio", "Movilidad"];

const emptyForm = { name: "", muscleGroup: "Piernas" as MuscleGroup, equipment: "", videoUrl: "", notes: "" };

export default function TrainerExercises() {
  const { data: exercises = [] } = useExercises();
  const saveExercise = useSaveExercise();
  const deleteExercise = useDeleteExercise();

  const [editing, setEditing] = useState<Exercise | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<MuscleGroup | "Todos">("Todos");
  const [showModal, setShowModal] = useState(false);
  const [videoPreview, setVideoPreview] = useState<{ title: string; url: string } | null>(null);

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
    saveExercise.mutate(
      {
        id: editing?.id,
        name: form.name,
        muscleGroup: form.muscleGroup,
        equipment: form.equipment,
        videoUrl: form.videoUrl || undefined,
        notes: form.notes || undefined,
      },
      { onSuccess: closeModal },
    );
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
        {filtered.map((ex) => {
          const thumbnail = ex.videoUrl ? getYouTubeThumbnail(ex.videoUrl) : null;
          return (
            <Card key={ex.id} className="overflow-hidden">
              {ex.videoUrl && (
                <button
                  onClick={() => setVideoPreview({ title: ex.name, url: ex.videoUrl! })}
                  className="group relative block h-36 w-full bg-slate-900"
                  aria-label={`Ver vídeo de ${ex.name}`}
                >
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-slate-500">
                      <Video size={24} />
                    </div>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-brand-600 shadow-md transition-transform group-hover:scale-110">
                      <Play size={18} className="ml-0.5" fill="currentColor" />
                    </span>
                  </span>
                </button>
              )}
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
                      onClick={() => deleteExercise.mutate(ex.id)}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-500"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Badge tone="brand">{ex.muscleGroup}</Badge>
                </div>
                {ex.notes && <p className="mt-2 text-xs text-slate-500">{ex.notes}</p>}
              </CardBody>
            </Card>
          );
        })}
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

      {videoPreview && (
        <VideoModal title={videoPreview.title} url={videoPreview.url} onClose={() => setVideoPreview(null)} />
      )}
    </div>
  );
}
