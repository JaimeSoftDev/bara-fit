import { useState } from "react";
import { formatISO } from "date-fns";
import { Camera, Plus } from "lucide-react";
import { useSession } from "../../store/session";
import { useCreateProgressEntry, useProgressEntries } from "../../hooks/useProgress";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { ProgressChart } from "../../components/ProgressChart";
import { formatDate } from "../../lib/utils";

export default function ClientProgress() {
  const clientId = useSession((s) => s.user!.id);
  const { data: entries = [] } = useProgressEntries(clientId);
  const createEntry = useCreateProgressEntry(clientId);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ weightKg: "", bodyFatPct: "", waistCm: "", note: "" });
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  function closeModal() {
    setShowModal(false);
    setForm({ weightKg: "", bodyFatPct: "", waistCm: "", note: "" });
    setPhoto(null);
    setPhotoPreview(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.weightKg) return;
    createEntry.mutate(
      {
        date: formatISO(new Date(), { representation: "date" }),
        weightKg: Number(form.weightKg),
        bodyFatPct: form.bodyFatPct ? Number(form.bodyFatPct) : undefined,
        waistCm: form.waistCm ? Number(form.waistCm) : undefined,
        note: form.note || undefined,
        photo: photo ?? undefined,
      },
      { onSuccess: closeModal },
    );
  }

  return (
    <div>
      <PageHeader
        title="Mi progreso"
        subtitle="Registra tu evolución física"
        action={
          <Button onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nuevo registro
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardBody>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Peso (kg)</h3>
            <ProgressChart entries={entries} dataKey="weightKg" unit="kg" />
          </CardBody>
        </Card>
        <Card>
          <CardBody>
            <h3 className="mb-3 text-sm font-semibold text-slate-900">% Grasa corporal</h3>
            <ProgressChart entries={entries} dataKey="bodyFatPct" unit="%" />
          </CardBody>
        </Card>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[...entries].reverse().map((entry) => (
          <Card key={entry.id}>
            {entry.photoUrl && (
              <img src={entry.photoUrl} alt="Foto de progreso" className="h-40 w-full rounded-t-2xl object-cover" />
            )}
            <CardBody>
              <p className="text-sm font-semibold text-slate-900">{formatDate(entry.date)}</p>
              <p className="text-xs text-slate-500">
                {entry.weightKg} kg {entry.bodyFatPct ? `· ${entry.bodyFatPct}% grasa` : ""}
              </p>
              {entry.note && <p className="mt-1 text-xs text-slate-400">{entry.note}</p>}
            </CardBody>
          </Card>
        ))}
      </div>

      {showModal && (
        <Modal title="Nuevo registro de progreso" onClose={closeModal}>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Peso (kg)">
                <Input
                  required
                  type="number"
                  step="0.1"
                  value={form.weightKg}
                  onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
                />
              </Field>
              <Field label="% Grasa corporal">
                <Input
                  type="number"
                  step="0.1"
                  value={form.bodyFatPct}
                  onChange={(e) => setForm((f) => ({ ...f, bodyFatPct: e.target.value }))}
                />
              </Field>
            </div>
            <Field label="Cintura (cm)">
              <Input type="number" value={form.waistCm} onChange={(e) => setForm((f) => ({ ...f, waistCm: e.target.value }))} />
            </Field>
            <Field label="Nota">
              <Textarea rows={2} value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
            </Field>
            <Field label="Foto de progreso">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 py-2.5 text-sm text-slate-500 hover:border-brand-400">
                <Camera size={16} />
                {photo ? "Foto seleccionada" : "Subir foto"}
                <input type="file" accept="image/*" className="hidden" onChange={handlePhoto} />
              </label>
              {photoPreview && <img src={photoPreview} alt="preview" className="mt-2 h-24 rounded-lg object-cover" />}
            </Field>
            <Button type="submit" className="w-full" disabled={createEntry.isPending}>
              {createEntry.isPending ? "Guardando..." : "Guardar registro"}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
