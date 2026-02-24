import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNetworkStore = defineStore('network', () => {
  const isOnline       = ref(navigator.onLine)
  const wasOffline     = ref(false)   // true after at least one offline period
  const reconnectedAt  = ref(null)    // timestamp of last reconnection

  function init() {
    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)
  }

  function handleOffline() {
    if (isOnline.value) wasOffline.value = true
    isOnline.value = false
  }

  async function handleOnline() {
    isOnline.value      = true
    reconnectedAt.value = Date.now()

    // Dynamic import avoids circular dependency at module load time
    const { useSyncStore } = await import('./sync')
    const syncStore = useSyncStore()
    await syncStore.onReconnect()
  }

  function destroy() {
    window.removeEventListener('online',  handleOnline)
    window.removeEventListener('offline', handleOffline)
  }

  return { isOnline, wasOffline, reconnectedAt, init, destroy }
})