import { useEffect } from "react";
import type { ReactNode } from "react";
import { me } from "../api/auth";
import { getToken } from "../lib/apiClient";
import { useSession } from "../store/session";

export function SessionBoot({ children }: { children: ReactNode }) {
  const { status, setUser, setStatus } = useSession();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setStatus("guest");
      return;
    }
    me()
      .then(setUser)
      .catch(() => setStatus("guest"));
  }, [setUser, setStatus]);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-brand-600" />
      </div>
    );
  }

  return <>{children}</>;
}
