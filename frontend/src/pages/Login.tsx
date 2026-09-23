import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dumbbell, ShieldCheck } from "lucide-react";
import { useAuth } from "../store/auth";
import { useCurrentDb } from "../store/db";
import { Avatar } from "../components/ui/Avatar";
import { Button } from "../components/ui/Button";
import { Field, Input } from "../components/ui/Field";
import { cx } from "../lib/utils";
import { getClientsOfTrainer, getTrainer } from "../lib/queries";

export default function Login() {
  const db = useCurrentDb();
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"trainer" | "client">("trainer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const trainer = getTrainer(db, "trainer_demo");
  const clients = trainer ? getClientsOfTrainer(db, trainer.id) : [];

  function enterAs(userId: string, role: "trainer" | "client") {
    login(userId);
    navigate(role === "trainer" ? "/trainer" : "/client", { replace: true });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === "trainer" && trainer) {
      enterAs(trainer.id, "trainer");
    } else if (mode === "client" && clients[0]) {
      enterAs(clients[0].id, "client");
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
          <div className="mb-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            {(["trainer", "client"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cx(
                  "rounded-lg py-2 text-sm font-medium transition-colors",
                  mode === m ? "bg-white text-brand-700 shadow-sm" : "text-slate-500",
                )}
              >
                {m === "trainer" ? "Soy entrenador" : "Soy cliente"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Correo electrónico">
              <Input
                type="email"
                placeholder="tucorreo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Contraseña">
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>
            <Button type="submit" className="w-full">
              Entrar
            </Button>
          </form>

          <div className="mt-5 flex items-center gap-2 text-xs text-slate-400">
            <div className="h-px flex-1 bg-slate-200" />
            demo · elige una cuenta
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="mt-3 space-y-2">
            {mode === "trainer" && trainer && (
              <button
                onClick={() => enterAs(trainer.id, "trainer")}
                className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50"
              >
                <Avatar name={trainer.name} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{trainer.name}</p>
                  <p className="truncate text-xs text-slate-400">Entrenador · {trainer.specialties[0]}</p>
                </div>
                <ShieldCheck size={16} className="text-brand-500" />
              </button>
            )}
            {mode === "client" &&
              clients.map((c) => (
                <button
                  key={c.id}
                  onClick={() => enterAs(c.id, "client")}
                  className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-brand-300 hover:bg-brand-50"
                >
                  <Avatar name={c.name} size={38} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-slate-900">{c.name}</p>
                    <p className="truncate text-xs text-slate-400">{c.goal}</p>
                  </div>
                </button>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
