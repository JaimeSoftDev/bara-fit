import { useState } from "react";
import { Link } from "react-router-dom";
import { Building2, Calendar, Camera, Check, Copy, Users, Wallet } from "lucide-react";
import { useSession } from "../../store/session";
import { useUpdateProfile, useUploadLogo } from "../../hooks/useProfile";
import { useCreateBusiness, useInviteToBusiness, useMyBusiness, useUpdateBusiness } from "../../hooks/useBusiness";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card, CardBody } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Field, Input, Textarea } from "../../components/ui/Field";
import { Badge } from "../../components/ui/Badge";
import { DEFAULT_BRAND_COLOR } from "../../lib/brandTheme";
import type { BusinessInvite } from "../../api/business";

export default function TrainerSettings() {
  const user = useSession((s) => s.user);
  const updateProfile = useUpdateProfile();
  const uploadLogo = useUploadLogo();
  const { data: business, isLoading: loadingBusiness } = useMyBusiness();
  const createBusiness = useCreateBusiness();
  const updateBusiness = useUpdateBusiness();
  const inviteToBusiness = useInviteToBusiness();

  const isOwner = user?.role === "trainer" && user.businessRole === "owner";
  const isTrainer = user?.role === "trainer";

  const [bio, setBio] = useState(isTrainer ? user.bio : "");
  const [color, setColor] = useState(user?.brandColor ?? DEFAULT_BRAND_COLOR);
  const [businessName, setBusinessName] = useState("");
  const [inviteForm, setInviteForm] = useState({ name: "", email: "" });
  const [createdInvite, setCreatedInvite] = useState<BusinessInvite | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isTrainer) return null;

  function saveBio(e: React.FormEvent) {
    e.preventDefault();
    updateProfile.mutate({ bio });
  }

  function saveColor() {
    if (business && isOwner) {
      updateBusiness.mutate({ id: business.id, brandColor: color });
    } else {
      updateProfile.mutate({ brandColor: color });
    }
  }

  function handleLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadLogo.mutate(file);
  }

  function handleCreateBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) return;
    createBusiness.mutate(businessName.trim());
  }

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!business || !inviteForm.name || !inviteForm.email) return;
    inviteToBusiness.mutate(
      { businessId: business.id, ...inviteForm },
      {
        onSuccess: (invite) => {
          setCreatedInvite(invite);
          setInviteForm({ name: "", email: "" });
        },
      },
    );
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const effectiveLogo = user.logoUrl;

  return (
    <div className="max-w-2xl space-y-4">
      <PageHeader title="Ajustes" subtitle="Tu perfil y la marca que ven tus clientes" />

      <Card>
        <CardBody className="space-y-4">
          <h2 className="text-sm font-semibold text-slate-900">Perfil</h2>
          <form onSubmit={saveBio} className="space-y-3">
            <Field label="Bio">
              <Textarea rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
            </Field>
            <Button type="submit" variant="secondary" disabled={updateProfile.isPending}>
              Guardar bio
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Marca blanca</h2>
            <p className="text-xs text-slate-400">
              {business
                ? isOwner
                  ? "Se aplica a ti y a todo tu equipo."
                  : "La define el dueño de tu equipo."
                : "Tu color y logo se muestran en toda tu app y en la de tus clientes."}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label
              className={
                "flex h-16 w-16 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 text-slate-400 hover:border-brand-400" +
                (!isOwner && business ? " pointer-events-none opacity-50" : "")
              }
            >
              {effectiveLogo ? (
                <img src={effectiveLogo} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                <Camera size={20} />
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} disabled={!isOwner && !!business} />
            </label>
            <div className="flex-1">
              <Field label="Color de marca">
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    disabled={!isOwner && !!business}
                    className="h-9 w-14 cursor-pointer rounded-lg border border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                  <Input value={color} onChange={(e) => setColor(e.target.value)} disabled={!isOwner && !!business} />
                </div>
              </Field>
            </div>
          </div>
          {(isOwner || !business) && (
            <Button variant="secondary" onClick={saveColor} disabled={updateProfile.isPending || updateBusiness.isPending}>
              Guardar color
            </Button>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardBody className="space-y-4">
          <div className="flex items-center gap-2">
            <Building2 size={16} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-slate-900">Equipo</h2>
          </div>

          {loadingBusiness ? (
            <p className="text-sm text-slate-400">Cargando...</p>
          ) : !business ? (
            <>
              <p className="text-sm text-slate-500">
                Aún trabajas de forma independiente. Crea un equipo para gestionar varios entrenadores en un
                mismo negocio, con agenda y nómina compartidas.
              </p>
              <form onSubmit={handleCreateBusiness} className="flex flex-wrap gap-2">
                <Input
                  placeholder="Nombre del negocio"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="max-w-xs"
                />
                <Button type="submit" disabled={createBusiness.isPending}>
                  Crear equipo
                </Button>
              </form>
            </>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-medium text-slate-900">{business.name}</p>
                <Badge tone="brand">{isOwner ? "Dueño" : "Entrenador"}</Badge>
              </div>

              <div className="space-y-1.5">
                {business.members.map((m) => (
                  <div key={m.id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm">
                    <span className="text-slate-700">{m.name}</span>
                    <Badge tone={m.role === "owner" ? "brand" : "slate"}>{m.role === "owner" ? "Dueño" : "Staff"}</Badge>
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link to="/trainer/team/calendar">
                  <Button variant="secondary">
                    <Calendar size={16} /> Agenda del equipo
                  </Button>
                </Link>
                <Link to="/trainer/team/payroll">
                  <Button variant="secondary">
                    <Wallet size={16} /> Nómina
                  </Button>
                </Link>
              </div>

              {isOwner && (
                <div className="border-t border-slate-100 pt-4">
                  {!createdInvite ? (
                    <form onSubmit={handleInvite} className="space-y-2">
                      <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-slate-500">
                        <Users size={13} /> Invitar entrenador al equipo
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Input
                          placeholder="Nombre"
                          value={inviteForm.name}
                          onChange={(e) => setInviteForm((f) => ({ ...f, name: e.target.value }))}
                          className="max-w-[160px]"
                        />
                        <Input
                          type="email"
                          placeholder="Correo"
                          value={inviteForm.email}
                          onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
                          className="max-w-[200px]"
                        />
                        <Button type="submit" variant="secondary" disabled={inviteToBusiness.isPending}>
                          Invitar
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm text-slate-600">
                        Invitación creada para <b>{createdInvite.email}</b>:
                      </p>
                      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2.5">
                        <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{createdInvite.acceptUrl}</span>
                        <Button variant="secondary" type="button" onClick={() => copyLink(createdInvite.acceptUrl)}>
                          {copied ? <Check size={14} /> : <Copy size={14} />}
                          {copied ? "Copiado" : "Copiar"}
                        </Button>
                      </div>
                      <Button variant="ghost" onClick={() => setCreatedInvite(null)}>
                        Invitar a otro
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
