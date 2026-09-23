import { useCallback, useEffect, useState } from "react";
import {
  getPushSubscriptionStatus,
  isPushSupported,
  subscribeToPush,
  unsubscribeFromPush,
  type PushStatus,
} from "../lib/push";

export function usePush() {
  const [status, setStatus] = useState<PushStatus>({
    supported: isPushSupported(),
    permission: "default",
    subscribed: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const next = await getPushSubscriptionStatus();
    setStatus(next);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const subscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await subscribeToPush();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo activar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await unsubscribeFromPush();
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo desactivar las notificaciones.");
    } finally {
      setLoading(false);
    }
  }, [refresh]);

  return { status, loading, error, subscribe, unsubscribe };
}
