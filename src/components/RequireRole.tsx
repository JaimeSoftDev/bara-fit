import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../store/auth";
import { useCurrentDb } from "../store/db";
import type { Role } from "../types";

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const { currentUserId } = useAuth();
  const db = useCurrentDb();
  const user = currentUserId ? db.users[currentUserId] : undefined;

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={user.role === "trainer" ? "/trainer" : "/client"} replace />;

  return <>{children}</>;
}
