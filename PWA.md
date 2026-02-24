# 2Wise PWA — Implementation Guide

## What's implemented

### Icons & Assets
| File | Purpose |
|------|---------|
| `public/icons/icon-{72..512}.png` | Standard PWA icons (all required sizes) |
| `public/icons/icon-maskable-512.png` | Android adaptive icon (safe-zone padding) |
| `public/icons/apple-touch-icon.png` | iOS home screen icon (180×180) |
| `public/icons/splash/splash-*.png` | iOS launch splash screens (7 device sizes) |
| `public/favicon.ico` | Browser tab favicon (16+32px multi-size ICO) |
| `public/og-image.png` | OpenGraph / social share image (1200×630) |

### Manifest (`vite.config.js` → `manifest:`)
- `display: standalone` — hides browser chrome when installed
- `start_url: /home` — opens to dashboard, not splash
- `orientation: portrait-primary` — locks to portrait
- `shortcuts` — 3 home screen shortcuts (Mock Exam, Practice, Profile)
- `categories: ["education", "productivity"]`
- `id: ng.2Wise.app` — stable identity for update matching

### Service Worker Strategy (Workbox)
| Pattern | Handler | Notes |
|---------|---------|-------|
| Build artefacts (JS/CSS/HTML) | CacheFirst (pre-cached) | Content-hashed, safe forever |
| `GET /api/*` | NetworkFirst (8s timeout) | Falls back to cache if offline |
| Navigation (page loads) | NetworkFirst (5s timeout) | Ensures fresh HTML shell |
| Google Fonts | StaleWhileRevalidate | Serves from cache, updates background |
| CDN assets | StaleWhileRevalidate | — |

**Important:** Only GET requests are cached. POST/PUT/DELETE bypass the cache entirely — they go through the outbox queue system in `stores/sync.js`.

### Install Prompt (`useInstallPrompt.js`)
- Captures `beforeinstallprompt` event before any component mounts
- Shows after 2+ visits (not on first load)
- 7-day snooze on dismiss; permanently hidden after 3 dismissals
- iOS: detects Safari on iOS and shows "tap Share → Add to Home Screen" instructions
- Exposed via "Install App" in Profile settings when not yet installed

### Update Notification (`usePwaUpdate.js` + `InstallBanner.vue`)
- `vite-plugin-pwa` sets `registerType: 'prompt'` — new SW waits, doesn't auto-apply
- Hourly background check while app is open
- Non-intrusive toast: "New version available → Update now"
- Tapping Update calls `skipWaiting()` then reloads

### Safe-area Insets (`App.vue` + `main.css`)
- `viewport-fit=cover` in `index.html` allows content behind notch/Dynamic Island
- `env(safe-area-inset-*)` CSS variables exposed as `--safe-top`, `--safe-bottom`
- `#2Wise-app` has `padding-top: var(--safe-top)` so content clears the status bar
- Bottom nav gets `padding-bottom: max(env(safe-area-inset-bottom), 12px)` in standalone mode

---

## Deployment requirements

### HTTPS (mandatory)
Service workers **only work on HTTPS**. HTTP is blocked by every browser.  
Localhost is exempt for development.

### Headers your server must send

```nginx
# Nginx example
location /sw.js {
    add_header Cache-Control "no-cache, no-store, must-revalidate";
    add_header Service-Worker-Allowed "/";
}

location /manifest.webmanifest {
    add_header Content-Type "application/manifest+json";
    add_header Cache-Control "no-cache";
}
```

### Build output
```bash
npm run build
# dist/ contains:
#   sw.js          ← generated service worker
#   workbox-*.js   ← workbox runtime
#   manifest.webmanifest ← generated from vite.config.js manifest:{}
#   registerSW.js  ← tiny SW registration script
```

---

## Testing the PWA locally

```bash
npm run build && npm run preview
# Then open http://localhost:4173 in Chrome
# DevTools → Application → Service Workers → check "Update on reload"
# DevTools → Application → Manifest → verify icons and theme
# DevTools → Lighthouse → PWA audit → should pass all checks
```

To test the install prompt:
- Chrome DevTools → Application → Manifest → "Add to homescreen" button

To test offline:
- DevTools → Network → Offline
- Reload — app should load from cache
- Navigate to /exam/mock — should load if subjects are downloaded

---

## iOS-specific notes

Safari on iOS **does not support `beforeinstallprompt`**. The install path is manual:
> Share button → Add to Home Screen

The app detects iOS Safari and shows a banner with these exact instructions.

iOS standalone mode quirks handled:
- No back gesture — use router's back button
- Status bar is translucent — `viewport-fit=cover` + `apple-mobile-web-app-status-bar-style: black-translucent`
- No automatic updates — user must delete and re-add, OR you show the update toast manually when the app loads online

---

## Capacitor (native app wrapping)

The project already includes Capacitor config for wrapping as a native Android/iOS app:

```bash
npm run build
npx cap add android   # or ios
npx cap sync
npx cap open android  # opens Android Studio
```

Capacitor uses the `dist/` output and wraps it in a WebView. The PWA service worker is **disabled** inside Capacitor (Capacitor manages its own update lifecycle). Everything else (offline stores, outbox sync, AI tutor) works identically.

---

## Installability checklist

- [x] HTTPS served (required)
- [x] `manifest.webmanifest` with name, icons, start_url, display
- [x] Icons: 192×192 and 512×512 minimum (both present)
- [x] Maskable icon present (Android adaptive icons)
- [x] Service worker registered
- [x] App works offline after first load
- [x] `theme-color` meta tag matches manifest
- [x] `apple-mobile-web-app-capable` for iOS
- [x] `apple-touch-icon` for iOS home screen
- [x] Splash screens for iOS
- [x] Safe-area insets handled
- [x] Install prompt UX
- [x] Update notification UX
