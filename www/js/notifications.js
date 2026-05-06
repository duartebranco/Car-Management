/**
 * notifications.js
 * Cross-platform notification helper for Car Management.
 *
 * On Android (inside Capacitor WebView) it uses @capacitor/local-notifications
 * to deliver native OS-level alerts.
 *
 * On PC / browser (PWA) it falls back to the standard Web Notifications API.
 * Notifications scheduled far in the future are kept via setTimeout so they
 * fire within the same session; a Service Worker is registered for persistent
 * background delivery when the app is installed as a PWA.
 */

(function () {
  "use strict";

  /**
   * Request notification permissions from the platform.
   * Returns true if permission was granted.
   */
  async function requestPermission() {
    // Native (Capacitor)
    if (isNative()) {
      try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        const result = await LocalNotifications.requestPermissions();
        return result && result.display === "granted";
      } catch (e) {
        console.warn("[notifications] Capacitor permission request failed:", e);
        return false;
      }
    }

    // Web Notifications API
    if ("Notification" in window) {
      const perm = await Notification.requestPermission();
      return perm === "granted";
    }

    return false;
  }

  /**
   * Schedule a local notification.
   *
   * @param {string} title   - Notification title.
   * @param {string} body    - Notification body text.
   * @param {Date}   at      - Date/time when the notification should fire.
   *                           Pass a Date in the past (or null) to fire immediately.
   * @param {number} [id]    - Optional unique integer ID (auto-generated if omitted).
   */
  async function scheduleNotification(title, body, at, id) {
    const fireAt = at instanceof Date ? at : at ? new Date(at) : new Date();
    const notifId =
      typeof id === "number"
        ? id
        : Math.floor(Math.random() * 2147483647);

    // ------------------------------------------------------------------
    // Native path (Android / any Capacitor-wrapped platform)
    // ------------------------------------------------------------------
    if (isNative()) {
      try {
        const { LocalNotifications } = window.Capacitor.Plugins;
        const permGranted = await requestPermission();
        if (!permGranted) {
          console.warn("[notifications] Permission not granted.");
          return;
        }
        await LocalNotifications.schedule({
          notifications: [
            {
              id: notifId,
              title: title,
              body: body,
              schedule: { at: fireAt, allowWhileIdle: true },
              sound: "default",
              smallIcon: "ic_stat_icon_config_sample",
              channelId: "car_management_reminders",
            },
          ],
        });
        console.log("[notifications] Native notification scheduled:", title, "at", fireAt);
      } catch (e) {
        console.error("[notifications] Failed to schedule native notification:", e);
      }
      return;
    }

    // ------------------------------------------------------------------
    // Web path (PWA / browser)
    // ------------------------------------------------------------------
    if (!("Notification" in window)) {
      console.warn("[notifications] Notifications not supported in this browser.");
      return;
    }

    let permission = Notification.permission;
    if (permission === "default") {
      permission = await Notification.requestPermission();
    }
    if (permission !== "granted") {
      console.warn("[notifications] Web notification permission denied.");
      return;
    }

    const delay = fireAt.getTime() - Date.now();

    const fire = () => {
      // Prefer Service Worker notification for better reliability
      if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: "SHOW_NOTIFICATION",
          title: title,
          body: body,
        });
      } else {
        new Notification(title, { body: body, icon: "images/logo2.png" });
      }
    };

    if (delay <= 0) {
      fire();
    } else {
      console.log(
        "[notifications] Web notification scheduled in",
        Math.round(delay / 1000),
        "s"
      );
      setTimeout(fire, delay);
    }
  }

  /**
   * Create the notification channel required on Android 8+ (Oreo).
   * Safe to call on other platforms – the plugin ignores it silently.
   */
  async function createChannel() {
    if (!isNative()) return;
    try {
      const { LocalNotifications } = window.Capacitor.Plugins;
      if (typeof LocalNotifications.createChannel === "function") {
        await LocalNotifications.createChannel({
          id: "car_management_reminders",
          name: "Car Reminders",
          description: "Notifications for upcoming car maintenance and reminders",
          importance: 4, // IMPORTANCE_HIGH
          visibility: 1, // VISIBILITY_PUBLIC
          sound: "default",
          vibration: true,
        });
      }
    } catch (e) {
      console.warn("[notifications] createChannel failed (non-fatal):", e);
    }
  }

  /** Returns true when running inside a Capacitor native app. */
  function isNative() {
    return (
      window.Capacitor !== undefined &&
      window.Capacitor.isNativePlatform &&
      window.Capacitor.isNativePlatform()
    );
  }

  // Initialise the notification channel when the script loads.
  createChannel();

  // Expose the public API globally.
  window.CarNotifications = {
    schedule: scheduleNotification,
    requestPermission: requestPermission,
    isNative: isNative,
  };
})();
