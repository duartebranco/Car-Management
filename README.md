# Car Management

A cross-platform **Car Management** application built with **Capacitor** (Android + PWA/PC).  
The app lets you manage your vehicles, set maintenance reminders, schedule workshop appointments and chat with repair shops.

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Cross-platform wrapper** | [Capacitor 8](https://capacitorjs.com/) |
| **Android** | Capacitor Android (`@capacitor/android`) |
| **Notifications** | `@capacitor/local-notifications` (native on Android) / Web Notifications API (PWA/PC) |
| **PC / Browser** | Progressive Web App (PWA) — installable from Chrome / Edge |
| **Backend** | Firebase (Auth + Firestore) |
| **UI** | Bootstrap 5 + Font Awesome 6 (original design preserved) |
| **Maps** | Leaflet + OpenStreetMap / Overpass API |

---

## Features

- 🔐 **Authentication** — Email / password sign-up & login (Firebase Auth)
- 🚗 **Garage** — Add, edit, remove and share vehicles with other users
- ⏰ **Reminders** — Set reminders (Insurance, Inspection, Oil change, etc.) with a scheduled notification
- 🔧 **Schedule Maintenance** — Pick a nearby workshop on a map and book a date/time slot
- 💬 **Messages** — In-app chat with workshops
- 📍 **Workshops Map** — Discover repair shops within 10 km of your location
- 🔔 **Native Notifications** — Uses `@capacitor/local-notifications` on Android for OS-level alerts; falls back to the Web Notifications API when running as a PWA on PC

---

## Project Structure

```
Car-Management/
├── www/                        ← Web application (HTML + CSS + JS)
│   ├── index.html              ← Reminders / home screen
│   ├── auth.html               ← Login / Sign-up
│   ├── garage.html             ← Vehicle garage
│   ├── addcar.html             ← Add vehicle form
│   ├── editcar.html            ← Edit vehicle form
│   ├── setReminder.html        ← Set a reminder
│   ├── scheduleMaintenance.html← Choose service type
│   ├── selectShop.html         ← Pick a workshop on map
│   ├── confirmSchedule.html    ← Confirm date & time slot
│   ├── messages.html           ← Chats with workshops
│   ├── definitions.html        ← Account settings
│   ├── shops.html              ← Workshop discovery map
│   ├── manifest.json           ← PWA manifest
│   ├── sw.js                   ← Service worker (PWA offline & notifications)
│   ├── css/                    ← Stylesheets
│   ├── js/                     ← JavaScript modules
│   │   └── notifications.js    ← Cross-platform notification helper
│   ├── images/                 ← App images / icons
│   └── data/                   ← vehicles.json (brand/model data)
├── android/                    ← Capacitor-generated Android Studio project
├── capacitor.config.json       ← Capacitor configuration
├── package.json
└── README.md
```

---

## Prerequisites

### For web / PWA development
- A modern browser (Chrome, Edge, Firefox)
- A local HTTP server (e.g. `npx serve www`)

### For Android builds
| Tool | Version |
|---|---|
| Node.js | ≥ 18 |
| npm | ≥ 9 |
| Android Studio | Hedgehog (2023.1) or later |
| Android SDK | API 35 (Android 15) |
| JDK | 17 or 21 |

---

## Setup & Installation

```bash
# 1. Clone the repository
git clone https://github.com/duartebranco/Car-Management.git
cd Car-Management

# 2. Install Node dependencies
npm install

# 3. Sync Capacitor (copies web assets into android/)
npx cap sync
```

---

## Running Locally (Browser / PWA)

```bash
# Serve the www/ directory on localhost
npx serve www
# or
npx http-server www -p 8080
```

Open `http://localhost:8080` in your browser.  
To install as a desktop PWA: open Chrome/Edge → address bar → **Install Car Management** icon.

---

## Building for Android

### Debug build (for testing)

```bash
# Open the project in Android Studio
npx cap open android

# Inside Android Studio:
#   Build > Make Project
#   Run > Run 'app'  (with an emulator or USB-connected device)
```

### Release build (for Play Store)

1. **Generate a signing key** (one-time):

   ```bash
   keytool -genkey -v \
     -keystore car-management.jks \
     -alias car-management \
     -keyalg RSA \
     -keysize 2048 \
     -validity 10000
   ```

2. **Configure signing** in `android/app/build.gradle`:

   ```groovy
   android {
     signingConfigs {
       release {
         storeFile file("../car-management.jks")
         storePassword System.getenv("STORE_PASSWORD")
         keyAlias     "car-management"
         keyPassword  System.getenv("KEY_PASSWORD")
       }
     }
     buildTypes {
       release {
         signingConfig signingConfigs.release
         minifyEnabled false
       }
     }
   }
   ```

3. **Build the release bundle**:

   ```bash
   cd android
   ./gradlew bundleRelease   # produces app/build/outputs/bundle/release/app-release.aab
   ```

4. Upload `app-release.aab` to the [Google Play Console](https://play.google.com/console).

---

## Google Play Store Compliance

| Requirement | Status |
|---|---|
| Target API level ≥ 34 (Android 14) | ✅ `targetSdkVersion = 35` |
| Min SDK API 23 (Android 6.0) | ✅ Covers 99%+ of active devices |
| 64-bit support | ✅ Capacitor builds both ARMv8 and x86_64 |
| `POST_NOTIFICATIONS` permission declared | ✅ AndroidManifest.xml |
| Internet permission | ✅ AndroidManifest.xml |
| Location permission (for workshop map) | ✅ AndroidManifest.xml |
| `SCHEDULE_EXACT_ALARM` for scheduled reminders | ✅ AndroidManifest.xml |
| App bundle (AAB) support | ✅ `./gradlew bundleRelease` |
| Privacy Policy required | ⚠️ Host a privacy policy URL (Firebase collects email/UID) |
| Sensitive permissions justification | ⚠️ Declare location usage in Play Console |

> **Privacy Policy note:** Since the app collects user e-mail addresses and stores vehicle data via Firebase, a Privacy Policy is required by the Play Store. Host a policy page and add its URL in the Play Console under **App content > Privacy policy**.

---

## Notification Architecture

```
User action (save reminder / confirm maintenance)
        │
        ▼
notifications.js  ─── isNative()? ──► @capacitor/local-notifications
                                       (Android OS notification, persists across app restarts)
                  └─── browser/PWA ──► Web Notifications API + Service Worker
                                       (notification appears in OS notification centre when PWA is installed)
```

### How it works

* **Android**: `window.Capacitor.Plugins.LocalNotifications.schedule()` is called with the reminder date/time. The plugin registers a native Android alarm that fires even when the app is in the background.
* **PWA / PC**: `Notification.requestPermission()` is called, then a `setTimeout` fires a Web Notification at the scheduled time. When installed as a PWA, the registered Service Worker (`sw.js`) also handles `SHOW_NOTIFICATION` messages for more reliable delivery.

---

## Development Workflow

```bash
# After changing any file in www/:
npx cap sync android     # copies updated assets to android/

# Quick copy only (no plugin update):
npx cap copy android

# Open Android Studio:
npx cap open android
```

---

## Test Accounts

| Email | Password |
|---|---|
| `testepartilha123@gmail.com` | `teste123` |
| `defaultuser@email.com` | `password` |

---

## PC (Desktop) Support via PWA

1. Open the app in **Google Chrome** or **Microsoft Edge**.
2. Click the **install** icon in the address bar (looks like a computer screen with a plus sign).
3. The app launches in a standalone window without browser chrome.
4. Web Notifications work in the OS notification centre once permission is granted.

### Optional: Electron Desktop App

For a fully packaged Windows/macOS/Linux app, you can add the community Electron adapter:

```bash
npm install @capacitor-community/electron
npx cap add @capacitor-community/electron
npx cap open @capacitor-community/electron
```

This produces native desktop installers (`.exe`, `.dmg`, `.AppImage`) using the same web codebase in `www/`.

