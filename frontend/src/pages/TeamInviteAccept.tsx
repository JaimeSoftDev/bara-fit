import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { acceptTeamInvite, getTeamInvite, type TeamInvite } from "../api/businessInvites";
import { useSession } from "../store/session";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { ApiError } from "../lib/apiClient";

export default function TeamInviteAccept() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const setUser = useSession((s) => s.setUser);

  const [invite, setInvite] = useState<TeamInvite | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) return;
    getTeamInvite(token)
      .then(setInvite)
      .catch((e) => setLoadError(e instanceof ApiError ? e.message : "No se pudo cargar la invitación."));
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!token) return;
    if (password.length < 8) {
      setSubmitError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setSubmitError("Las contraseñas no coinciden.");
      return;
    }
    setSubmitting(true);
    setSubmitError(null);
    try {
      const user = await acceptTeamInvite(token, password);
      setUser(user);
      navigate("/trainer", { replace: true });
    } catch (e) {
      setSubmitError(e instanceof ApiError ? e.message : "No se pudo completar el registro.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-700 via-brand-600 to-accent-600 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center text-white">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
            <Dumbbell size={28} />
          </div>
          <h1 className="text-2xl font-bold">BaraFit</h1>
          <p className="mt-1 text-sm text-white/80">Únete a un equipo de entrenadores.</p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          {loadError && <p className="text-sm text-red-600">{loadError}</p>}

          {!loadError && !invite && <p className="text-sm text-slate-400">Cargando invitación...</p>}

          {invite && invite.status !== "pending" && (
            <p className="text-sm text-red-600">
              Esta invitación ya {invite.status === "accepted" ? "fue utilizada" : "ha expirado"}.
            </p>
          )}

          {invite && invite.status === "pending" && (
            <>
              <p className="mb-4 text-sm text-slate-600">
                <span className="font-medium text-slate-900">{invite.inviterName}</span> te invitó a unirte al
                equipo <b>{invite.businessName}</b> como entrenador. Crea una contraseña para <b>{invite.email}</b>.
              </p>
              <form onSubmit={handleSubmit} className="space-y-3">
                <Field label="Contraseña">
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </Field>
                <Field label="Confirmar contraseña">
                  <Input
                    type="password"
                    required
                    minLength={8}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                  />
                </Field>
                {submitError && <p className="text-sm text-red-600">{submitError}</p>}
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Creando cuenta..." : "Unirme al equipo"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
