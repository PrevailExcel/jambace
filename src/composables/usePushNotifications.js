import { ref } from 'vue'

const subscription = ref(null)
const isSubscribed = ref(false)
const permission = ref(Notification.permission)

export function usePushNotifications(vapidKey) {
  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)))
  }

  async function register() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return
    try {
      const reg = await navigator.serviceWorker.register('/push-sw.js')
      console.log('Push SW registered', reg)
      return reg
    } catch (err) {
      console.error('Push SW registration failed', err)
    }
  }

  async function requestPermission() {
    permission.value = await Notification.requestPermission()
    return permission.value
  }

  async function subscribe() {
    if (permission.value !== 'granted') await requestPermission()
    if (permission.value !== 'granted') return null

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    })
    subscription.value = sub
    isSubscribed.value = true
    return sub
  }

  async function unsubscribe() {
    if (!subscription.value) return
    await subscription.value.unsubscribe()
    subscription.value = null
    isSubscribed.value = false
  }

  return { register, requestPermission, subscribe, unsubscribe, subscription, isSubscribed, permission }
}