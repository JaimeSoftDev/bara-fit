import { useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Bell, BellOff, BellRing, LogOut } from "lucide-react";
import { logout as apiLogout } from "../../api/auth";
import { useSession } from "../../store/session";
import { usePush } from "../../hooks/usePush";
import { Avatar } from "../ui/Avatar";
import { cx } from "../../lib/utils";
import { applyBrandColor } from "../../lib/brandTheme";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

function BrandBadge({ logoUrl, size }: { logoUrl?: string; size: number }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Logo"
        className="shrink-0 rounded-xl object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-accent-500 font-bold text-white"
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      BF
    </div>
  );
}

export function AppShell({ navItems, brand }: { navItems: NavItem[]; brand: string }) {
  const { user, setUser } = useSession();
  const navigate = useNavigate();
  const push = usePush();

  useEffect(() => {
    applyBrandColor(user?.brandColor);
    return () => applyBrandColor(undefined);
  }, [user]);

  const handleLogout = async () => {
    await apiLogout().catch(() => {});
    setUser(null);
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-slate-200 bg-white lg:flex">
        <div className="flex items-center gap-2 px-5 py-5">
          <BrandBadge logoUrl={user?.logoUrl} size={36} />
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {(user?.role === "trainer" && user.businessName) || "BaraFit"}
            </p>
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
            {push.status.supported && (
              <div className="mb-2">
                {push.status.permission === "denied" ? (
                  <button
                    disabled
                    title="Activa las notificaciones desde los ajustes del navegador para este sitio."
                    className="flex w-full cursor-not-allowed items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300"
                  >
                    <BellOff size={16} /> Notificaciones bloqueadas
                  </button>
                ) : push.status.subscribed ? (
                  <button
                    onClick={() => push.unsubscribe()}
                    disabled={push.loading}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-brand-700 hover:bg-brand-50 disabled:opacity-60"
                  >
                    <BellRing size={16} /> {push.loading ? "Desactivando…" : "Notificaciones activadas"}
                  </button>
                ) : (
                  <button
                    onClick={() => push.subscribe()}
                    disabled={push.loading}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100 disabled:opacity-60"
                  >
                    <Bell size={16} /> {push.loading ? "Activando…" : "Activar notificaciones"}
                  </button>
                )}
                {push.error && <p className="px-3 pt-1 text-xs text-red-500">{push.error}</p>}
              </div>
            )}
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
            <BrandBadge logoUrl={user?.logoUrl} size={32} />
            <span className="text-sm font-semibold text-slate-900">
              {(user?.role === "trainer" && user.businessName) || "BaraFit"}
            </span>
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
