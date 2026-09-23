import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../store/session";
import type { Role } from "../types";

const HOME_BY_ROLE: Record<Role, string> = {
  trainer: "/trainer",
  client: "/client",
  admin: "/admin",
};

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useSession();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={HOME_BY_ROLE[user.role]} replace />;

  return <>{children}</>;
}
