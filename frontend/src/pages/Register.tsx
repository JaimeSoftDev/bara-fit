import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { register } from "../api/auth";
import { useSession } from "../store/session";
import { Button } from "../components/ui/Button";
import { Field, Input, Textarea } from "../components/ui/Field";
import { ApiError } from "../lib/apiClient";

export default function Register() {
  const navigate = useNavigate();
  const setUser = useSession((s) => s.setUser);
  const [form, setForm] = useState({ name: "", email: "", password: "", bio: "" });
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await register({ ...form, specialties: [] });
      setUser(user);
      navigate("/trainer", { replace: true });
    } catch (e) {
      if (e instanceof ApiError) {
        const first = e.errors && Object.values(e.errors)[0]?.[0];
        setError(first ?? e.message);
      } else {
        setError("No se pudo crear la cuenta.");
      }
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
          <h1 className="text-2xl font-bold">Crea tu cuenta de entrenador</h1>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Nombre completo">
              <Input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </Field>
            <Field label="Correo electrónico">
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                required
                minLength={8}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              />
            </Field>
            <Field label="Bio (opcional)">
              <Textarea rows={2} value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Creando cuenta..." : "Crear cuenta"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="font-medium text-brand-600 hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
