/**
 * Service Worker for Car Management PWA.
 * Handles offline caching and fires web notifications for the browser/PC path.
 */

const CACHE_NAME = "car-management-v1";

// Assets to pre-cache for offline use
const PRECACHE_ASSETS = [
  "./",
  "./index.html",
  "./auth.html",
  "./garage.html",
  "./addcar.html",
  "./editcar.html",
  "./setReminder.html",
  "./scheduleMaintenance.html",
  "./selectShop.html",
  "./confirmSchedule.html",
  "./messages.html",
  "./definitions.html",
  "./css/myCSS.css",
  "./css/garage.css",
  "./css/editcar.css",
  "./js/firebase.js",
  "./js/auth.js",
  "./js/checkAuth.js",
  "./js/notifications.js",
  "./js/plusbtn.js",
  "./js/reminders.js",
  "./js/garage.js",
  "./js/addcar.js",
  "./js/editcar.js",
  "./js/setReminder.js",
  "./js/definitions.js",
  "./data/vehicles.json",
  "./images/logo2.png",
  "./images/car.png",
  "./images/motorbike.png",
  "./images/truck.png",
  "./manifest.json",
];

// ── Install ──────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// ── Activate ─────────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

// ── Fetch (cache-first, fall back to network) ────────────────────────────────
self.addEventListener("fetch", (event) => {
  // Only cache same-origin GET requests; skip Firebase/CDN calls.
  if (
    event.request.method !== "GET" ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => {
      return (
        cached ||
        fetch(event.request).then((response) => {
          if (!response || response.status !== 200 || response.type !== "basic") {
            return response;
          }
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      );
    })
  );
});

// ── Show notification (called from the page via postMessage) ─────────────────
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SHOW_NOTIFICATION") {
    const { title, body } = event.data;
    event.waitUntil(
      self.registration.showNotification(title, {
        body: body,
        icon: "./images/logo2.png",
        badge: "./images/logo2.png",
        tag: "car-management-reminder",
      })
    );
  }
});

// ── Handle notification click ─────────────────────────────────────────────────
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) return client.focus();
        }
        if (clients.openWindow) return clients.openWindow("./index.html");
      })
  );
});
