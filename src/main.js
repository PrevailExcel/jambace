import { createApp }   from 'vue'
import { createPinia } from 'pinia'
import piniaPersistedstate from 'pinia-plugin-persistedstate'
import router  from '@/router'
import App     from '@/App.vue'
import '@/assets/main.css'

import { initEncryption } from '@/lib/crypto'
import { useUserStore }   from '@/stores/user'

// ── Pinia ──────────────────────────────────────────────────────────────────
const pinia = createPinia()
pinia.use(piniaPersistedstate)

// ── App ────────────────────────────────────────────────────────────────────
const app = createApp(App)
app.use(pinia)
app.use(router)
app.mount('#app')

// ── Encryption boot ────────────────────────────────────────────────────────
// Derive the AES key from whatever token is already in the user store
// (persisted from the last session). This must happen AFTER pinia is
// installed so the store is hydrated from localStorage first.
const userStore = useUserStore()
if (userStore.token) {
  // Non-blocking — the key will be ready before any questions are read
  // because the router guard awaits auth before showing protected routes.
  initEncryption(userStore.token).catch(err => {
    console.error('[crypto] Failed to initialise encryption key on boot:', err)
  })
}
