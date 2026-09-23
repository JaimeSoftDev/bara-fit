import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Dumbbell } from "lucide-react";
import { login } from "../api/auth";
import { useSession } from "../store/session";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { ApiError } from "../lib/apiClient";

export default function Login() {
  const navigate = useNavigate();
  const setUser = useSession((s) => s.setUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const user = await login(email, password);
      setUser(user);
      const home = user.role === "trainer" ? "/trainer" : user.role === "admin" ? "/admin" : "/client";
      navigate(home, { replace: true });
    } catch (e) {
      setError(e instanceof ApiError && e.status === 422 ? "Correo o contraseña incorrectos." : "No se pudo iniciar sesión. ¿Está el servidor corriendo?");
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
          <p className="mt-1 text-sm text-white/80">
            La plataforma todo-en-uno para entrenadores personales y sus clientes.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Correo electrónico">
              <Input
                type="email"
                required
                autoComplete="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <p className="mt-4 text-center text-sm text-slate-500">
            ¿Eres entrenador y no tienes cuenta?{" "}
            <Link to="/register" className="font-medium text-brand-600 hover:underline">
              Regístrate
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
