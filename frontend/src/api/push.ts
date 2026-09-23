import { api } from "../lib/apiClient";

export interface VapidPublicKeyResponse {
  publicKey: string;
}

export interface PushSubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export function getVapidPublicKey(): Promise<VapidPublicKeyResponse> {
  return api.public.get<VapidPublicKeyResponse>("/push/vapid-public-key");
}

export function subscribePush(subscription: PushSubscriptionPayload): Promise<void> {
  return api.post<void>("/push-subscriptions", subscription);
}

export function unsubscribePush(endpoint: string): Promise<void> {
  return api.delete<void>("/push-subscriptions", { endpoint });
}
