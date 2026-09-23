/// <reference lib="webworker" />
import { precacheAndRoute, createHandlerBoundToURL, type PrecacheEntry } from "workbox-precaching";
import { registerRoute, NavigationRoute } from "workbox-routing";
import { CacheFirst } from "workbox-strategies";
import { ExpirationPlugin } from "workbox-expiration";

declare const self: ServiceWorkerGlobalScope & {
  __WB_MANIFEST: Array<PrecacheEntry | string>;
};

// Precache the build output (same file set the previous generateSW config globbed).
precacheAndRoute(self.__WB_MANIFEST);

// SPA navigation fallback to the shell, skipping API calls (mirrors the
// previous generateSW navigateFallback + navigateFallbackDenylist).
registerRoute(
  new NavigationRoute(createHandlerBoundToURL("index.html"), {
    denylist: [/^\/api\//],
  }),
);

// Cache images/fonts the same way the previous generateSW runtimeCaching did.
registerRoute(
  ({ request }) => ["image", "font"].includes(request.destination),
  new CacheFirst({
    cacheName: "assets-cache",
    plugins: [new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 30 })],
  }),
);

interface PushPayload {
  title: string;
  body?: string;
  icon?: string;
  data?: { url?: string };
}

self.addEventListener("push", (event: PushEvent) => {
  if (!event.data) return;

  let payload: PushPayload;
  try {
    payload = event.data.json() as PushPayload;
  } catch {
    payload = { title: "BaraFit", body: event.data.text() };
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: payload.icon ?? "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: payload.data,
    }),
  );
});

self.addEventListener("notificationclick", (event: NotificationEvent) => {
  event.notification.close();

  const url = (event.notification.data as { url?: string } | undefined)?.url ?? "/";

  event.waitUntil(
    (async () => {
      const allClients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
      const existing = allClients.find((client) => client.url.endsWith(url));
      if (existing) {
        await existing.focus();
        return;
      }
      await self.clients.openWindow(url);
    })(),
  );
});
