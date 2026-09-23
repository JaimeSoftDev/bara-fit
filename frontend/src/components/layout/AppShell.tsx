import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { LogOut } from "lucide-react";
import { logout as apiLogout } from "../../api/auth";
import { useSession } from "../../store/session";
import { Avatar } from "../ui/Avatar";
import { cx } from "../../lib/utils";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

export function AppShell({ navItems, brand }: { navItems: NavItem[]; brand: string }) {
  const { user, setUser } = useSession();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await apiLogout().catch(() => {});
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 text-sm font-bold text-white">
            BF
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">BaraFit</p>
            <p className="text-xs text-slate-400">{brand}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                cx(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive ? "bg-brand-50 text-brand-700" : "text-slate-600 hover:bg-slate-100",
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>
        {user && (
          <div className="border-t border-slate-200 p-4">
            <div className="mb-3 flex items-center gap-3">
              <Avatar name={user.name} size={36} />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
            >
              <LogOut size={16} /> Cerrar sesión
            </button>
          </div>
        )}
      </aside>

      <div className="flex min-h-screen w-full flex-col lg:pl-64">
        <header className="safe-top sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-600 to-accent-500 text-xs font-bold text-white">
              BF
            </div>
            <span className="text-sm font-semibold text-slate-900">BaraFit</span>
          </div>
          {user && <Avatar name={user.name} size={32} />}
        </header>

        <main className="flex-1 px-4 pb-24 pt-4 lg:px-8 lg:pb-8 lg:pt-6">
          <Outlet />
        </main>

        <nav className="safe-bottom fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-slate-200 bg-white/95 py-1.5 backdrop-blur lg:hidden">
          {navItems.slice(0, 5).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to.split("/").length <= 2}
              className={({ isActive }) =>
                cx(
                  "flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[11px] font-medium",
                  isActive ? "text-brand-600" : "text-slate-400",
                )
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}
