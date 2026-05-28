/**
 * Nexora Service Worker
 *
 * Strategy:
 *  - App shell (HTML, CSS, JS) → Cache First with network fallback
 *  - Google Fonts → Cache First (long-lived)
 *  - Anthropic API / Firebase → Network Only (don't cache sensitive data)
 *  - Everything else → Network First with cache fallback
 */

const CACHE_NAME   = "nexora-v1";
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

  // Never cache sensitive API calls
  if (NEVER_CACHE.some((host) => url.hostname.includes(host))) {
    return; // browser handles normally
  }

  // Google Fonts → Cache First
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

  // App shell (HTML navigation) → Network First, fallback to cache
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

  // Static assets (.js, .css, images) → Cache First
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

// ── Background sync (future: queue writes when offline) ───────────────────────
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-tasks") {
    // Future: replay queued task mutations
    console.log("[SW] Background sync: tasks");
  }
});

// ── Push notifications (future) ───────────────────────────────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Nexora", {
      body:  data.body  || "",
      icon:  "/favicon.svg",
      badge: "/favicon.svg",
      data:  { url: data.url || "/dashboard" },
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || "/dashboard")
  );
});