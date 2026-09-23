import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useSession } from "../store/session";
import type { Role } from "../types";

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { user } = useSession();

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === "trainer" ? "/trainer" : "/client"} replace />;

  return <>{children}</>;
}
