import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Dumbbell, LogOut } from "lucide-react";
import { logout as apiLogout } from "../api/auth";
import { useSession } from "../store/session";
import { cx } from "../lib/utils";

const navItems = [
  { to: "/admin", label: "Negocios" },
  { to: "/admin/trainers", label: "Entrenadores independientes" },
];

export default function AdminLayout() {
  const { user, setUser } = useSession();
  const navigate = useNavigate();

  async function handleLogout() {
    await apiLogout().catch(() => {});
    setUser(null);
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white">
              <Dumbbell size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">BaraFit Admin</p>
              <p className="text-xs text-slate-400">Panel de la plataforma</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-slate-500 sm:inline">{user?.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100"
            >
              <LogOut size={15} /> Salir
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4 sm:px-6">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end
              className={({ isActive }) =>
                cx(
                  "border-b-2 px-3 py-2 text-sm font-medium",
                  isActive ? "border-slate-900 text-slate-900" : "border-transparent text-slate-500 hover:text-slate-700",
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <Outlet />
      </main>
    </div>
  );
}
