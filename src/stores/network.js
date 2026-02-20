import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useNetworkStore = defineStore('network', () => {
  const isOnline = ref(navigator.onLine)

  function init() {
    window.addEventListener('online',  () => { isOnline.value = true })
    window.addEventListener('offline', () => { isOnline.value = false })
  }

  return { isOnline, init }
})
