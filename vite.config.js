import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [
    vue(),

    VitePWA({
      // ── Registration ──────────────────────────────────────────────
      registerType: 'prompt',        // 'prompt' so we control the update UX
      injectRegister: 'auto',

      // ── Dev: enable SW in development for testing
      devOptions: {
        enabled: false,              // flip to true to test SW locally
        type: 'module',
      },

      // ── Web App Manifest ─────────────────────────────────────────
      manifest: {
        name: "2Wise — JAMB Prep",
        short_name: '2Wise',
        description: "The smartest JAMB prep app in Nigeria. Study smarter, score higher.",
        theme_color: '#0A0F2C',
        background_color: '#0A0F2C',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/home',
        scope: '/',
        lang: 'en-NG',
        dir: 'ltr',
        categories: ['education', 'productivity'],
        id: 'ng.2Wise.app',

        icons: [
          { src: '/icons/icon-72.png',  sizes: '72x72',  type: 'image/png' },
          { src: '/icons/icon-96.png',  sizes: '96x96',  type: 'image/png' },
          { src: '/icons/icon-128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],

        // Home screen shortcuts (long-press on Android)
        shortcuts: [
          {
            name: 'Start Mock Exam',
            short_name: 'Mock Exam',
            description: 'Jump straight into a full 40-question mock',
            url: '/exam/mock',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'Practice Questions',
            short_name: 'Practice',
            description: 'Pick a subject and practice by topic',
            url: '/practice',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
          {
            name: 'My Profile',
            short_name: 'Profile',
            description: 'View your progress and streak',
            url: '/profile',
            icons: [{ src: '/icons/icon-96.png', sizes: '96x96' }],
          },
        ],

        // Screenshots for the enhanced install sheet on Chrome Android
        screenshots: [
          {
            src: '/og-image.png',
            sizes: '1200x630',
            type: 'image/png',
            form_factor: 'wide',
            label: '2Wise — JAMB Prep Dashboard',
          },
        ],
      },

      // ── Service Worker / Workbox ──────────────────────────────────
      workbox: {
        // Cache all build artefacts — Vite content-hashes them so safe forever
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2,webp}'],
        globIgnores: ['**/node_modules/**', '**/sw.js'],

        // Bump this if you need to force-clear old caches on deploy
        // cacheId: '2Wise-v1',

        // Skip waiting so update activates immediately after the user approves
        skipWaiting: false,    // we call skipWaiting manually from the update toast
        clientsClaim: true,

        // ── Runtime caching strategies ──────────────────────────────
        runtimeCaching: [

          // ── API GET calls: NetworkFirst with generous offline fallback
          // POST/PUT/DELETE are NOT cached — they go through our outbox system
          {
            urlPattern: ({ request, url }) =>
              (url.pathname.startsWith('/api/') || url.hostname === 'api.2wise.com.ng') &&
              request.method === 'GET',
            handler: 'NetworkFirst',
            options: {
              cacheName: '2Wise-api-get',
              networkTimeoutSeconds: 8,
              expiration: {
                maxEntries: 500,          // plenty of room for question caches
                maxAgeSeconds: 60 * 60 * 24 * 7,  // 7 days
              },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── App navigation (HTML shell): NetworkFirst so updates land
          {
            urlPattern: ({ request }) => request.mode === 'navigate',
            handler: 'NetworkFirst',
            options: {
              cacheName: '2Wise-shell',
              networkTimeoutSeconds: 5,
              expiration: { maxEntries: 5, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },

          // ── Google Fonts: StaleWhileRevalidate (rarely change)
          {
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'google-fonts',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },

          // ── CDN assets (Phosphor icons etc.)
          {
            urlPattern: /^https:\/\/cdn\..*/i,
            handler: 'StaleWhileRevalidate',
            options: {
              cacheName: 'cdn-assets',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
    }),
  ],

  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },

  build: {
    // Slightly larger chunk warning threshold — question caches are big
    chunkSizeWarningLimit: 800,
  },
})