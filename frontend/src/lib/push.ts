import { getVapidPublicKey, subscribePush, unsubscribePush } from "../api/push";

export type PushPermission = NotificationPermission | "unsupported";

export interface PushStatus {
  supported: boolean;
  permission: PushPermission;
  subscribed: boolean;
}

/** Whether this browser/context can do web push at all (HTTPS or localhost, SW + Push API present). */
export function isPushSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/** Reads current permission/subscription state without prompting the user. */
export async function getPushSubscriptionStatus(): Promise<PushStatus> {
  if (!isPushSupported()) {
    return { supported: false, permission: "unsupported", subscribed: false };
  }

  const permission = Notification.permission;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return { supported: true, permission, subscribed: !!subscription };
  } catch {
    return { supported: true, permission, subscribed: false };
  }
}

/**
 * Requests notification permission, subscribes to push via the service
 * worker's PushManager, and registers the subscription with the backend.
 */
export async function subscribeToPush(): Promise<void> {
  if (!isPushSupported()) {
    throw new Error("Las notificaciones push no están disponibles en este navegador.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    throw new Error("Permiso de notificaciones denegado.");
  }

  const { publicKey } = await getVapidPublicKey();
  const registration = await navigator.serviceWorker.ready;

  const subscription =
    (await registration.pushManager.getSubscription()) ??
    (await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey) as BufferSource,
    }));

  await subscribePush(subscription.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } });
}

/** Unsubscribes the current push subscription, locally and on the backend. */
export async function unsubscribeFromPush(): Promise<void> {
  if (!isPushSupported()) return;

  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (!subscription) return;

  const endpoint = subscription.endpoint;
  await subscription.unsubscribe();
  await unsubscribePush(endpoint);
}
