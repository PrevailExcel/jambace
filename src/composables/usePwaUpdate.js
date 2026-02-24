/**
 * usePwaUpdate.js
 *
 * Listens for a new service worker waiting to activate and surfaces a
 * non-intrusive "Update available" toast. The user taps "Update" and the
 * page reloads with the new version.
 *
 * Uses vite-plugin-pwa's virtual module `virtual:pwa-register/vue`
 * which provides reactive update state without the user needing to manage
 * the SW registration manually.
 */

import { useRegisterSW } from 'virtual:pwa-register/vue'

export function usePwaUpdate() {
  const {
    needRefresh,           // true when a new SW is waiting
    offlineReady,          // true when the app is fully cached (first install)
    updateServiceWorker,   // call this to skip waiting + reload
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      // Re-check for updates every hour while the app is open
      if (r) {
        setInterval(async () => {
          if (!(!r.installing && navigator)) return
          if ('connection' in navigator && !navigator.onLine) return
          const resp = await fetch(swUrl, {
            cache: 'no-store',
            headers: { 'cache': 'no-store', 'cache-control': 'no-cache' },
          })
          if (resp?.status === 200) await r.update()
        }, 60 * 60 * 1000)  // hourly
      }
    },
  })

  function applyUpdate() {
    updateServiceWorker(true)  // true = reload page after activation
  }

  function dismissOfflineReady() {
    offlineReady.value = false
  }

  return {
    needRefresh,
    offlineReady,
    applyUpdate,
    dismissOfflineReady,
  }
}
