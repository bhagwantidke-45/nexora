/**
 * Nexora Service Worker — Enhanced with Push Notifications
 *
 * Strategy:
 *  - App shell (HTML, CSS, JS) → Cache First with network fallback
 *  - Google Fonts → Cache First (long-lived)
 *  - Anthropic API / Firebase → Network Only (don't cache sensitive data)
 *  - Everything else → Network First with cache fallback
 */

const CACHE_NAME   = "nexora-v2";
const FONT_CACHE   = "nexora-fonts-v1";

const APP_SHELL = [
  "/",
  "/index.html",
  "/favicon.svg",
  "/manifest.json",
];

const NEVER_CACHE = [
  "api.anthropic.com",
  "firestore.googleapis.com",
  "identitytoolkit.googleapis.com",
  "securetoken.googleapis.com",
  "api.groq.com",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((k) => k !== CACHE_NAME && k !== FONT_CACHE)
            .map((k) => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch ─────────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (NEVER_CACHE.some((host) => url.hostname.includes(host))) return;

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    event.respondWith(
      caches.open(FONT_CACHE).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            cache.put(request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match("/index.html"))
    );
    return;
  }

  if (url.pathname.match(/\.(js|css|png|svg|woff2?|ico)$/)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          caches.open(CACHE_NAME).then((cache) => cache.put(request, response.clone()));
          return response;
        });
      })
    );
    return;
  }
});

// ── Push Notifications ────────────────────────────────────────────────────────
self.addEventListener("push", (event) => {
  let data = {
    title: "Nexora",
    body: "You have a new notification",
    icon: "/favicon.svg",
    badge: "/favicon.svg",
    url: "/dashboard",
    tag: "nexora-general",
    requireInteraction: false,
  };

  if (event.data) {
    try {
      const parsed = event.data.json();
      data = { ...data, ...parsed };
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon || "/favicon.svg",
    badge: data.badge || "/favicon.svg",
    tag: data.tag || "nexora-general",
    requireInteraction: data.requireInteraction || false,
    silent: false,
    vibrate: [200, 100, 200],
    data: { url: data.url || "/dashboard" },
    actions: data.actions || [
      { action: "open", title: "Open Nexora" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// ── Notification Click ────────────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const urlToOpen = event.notification.data?.url || "/dashboard";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open, focus it and navigate
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && "focus" in client) {
          client.focus();
          client.navigate(urlToOpen);
          return;
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// ── Background Sync ───────────────────────────────────────────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    console.log("[SW] Background sync: tasks");
  }
  if (event.tag === "sync-notifications") {
    console.log("[SW] Background sync: notifications");
  }
});

// ── Periodic Background Sync (for scheduled notifications) ───────────────────
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "nexora-reminders") {
    event.waitUntil(checkAndSendReminders());
  }
});

async function checkAndSendReminders() {
  // This runs in background — can check stored reminders and fire them
  const cache = await caches.open(CACHE_NAME);
  console.log("[SW] Checking reminders...");
}

// ── Message handler (from main app) ──────────────────────────────────────────
self.addEventListener("message", (event) => {
  if (event.data?.type === "SHOW_NOTIFICATION") {
    const { title, body, icon, url, tag } = event.data.payload || {};
    self.registration.showNotification(title || "Nexora", {
      body: body || "",
      icon: icon || "/favicon.svg",
      badge: "/favicon.svg",
      tag: tag || "nexora-message",
      vibrate: [200, 100, 200],
      data: { url: url || "/dashboard" },
    });
  }

  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});