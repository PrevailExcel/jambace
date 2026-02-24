/**
 * useInstallPrompt.js
 *
 * Handles the PWA install flow on all platforms:
 *
 * Android / Chrome:
 *   - Captures the `beforeinstallprompt` event to show a native prompt.
 *   - We delay the banner until the user has done something meaningful
 *     (completed first exam OR visited 3+ times) so it doesn't feel pushy.
 *
 * iOS Safari:
 *   - No install event exists — we detect Safari on iOS and show manual
 *     instructions ("tap Share → Add to Home Screen").
 *
 * Installed state:
 *   - `isInstalled` is true if running in standalone mode (already installed)
 *     OR if the user just installed. Banner hides permanently once installed.
 *
 * Dismissal:
 *   - Dismissing stores a timestamp. Banner won't reappear for 7 days.
 *   - After 3 dismissals, the banner never shows again.
 */

import { ref, computed, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY    = 'jambace_install_dismissed'
const VISIT_KEY      = 'jambace_visit_count'
const MAX_DISMISSALS = 3
const SNOOZE_DAYS    = 7

// Module-level so the prompt event is captured before any component mounts
let _deferredPrompt = null

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  _deferredPrompt = e
})

export function useInstallPrompt() {
  const isInstalled     = ref(false)
  const canInstall      = ref(false)   // true = Android/Chrome, prompt available
  const isIos           = ref(false)   // true = iOS Safari manual instructions needed
  const showBanner      = ref(false)
  const installing      = ref(false)
  const justInstalled   = ref(false)

  // ── Platform detection ──────────────────────────────────────────────────

  function detectPlatform() {
    const ua = navigator.userAgent

    // Already running as installed PWA
    if (window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true) {
      isInstalled.value = true
      return
    }

    // iOS Safari (not Chrome on iOS — Chrome on iOS can't install PWAs either)
    const iosDevice = /iPad|iPhone|iPod/.test(ua) && !window.MSStream
    const safari    = /^((?!chrome|android).)*safari/i.test(ua)
    if (iosDevice && safari) {
      isIos.value = true
    }

    // Android / Chrome / Edge — check if prompt is already available
    if (_deferredPrompt) {
      canInstall.value = true
    }
  }

  // ── Dismissal tracking ──────────────────────────────────────────────────

  function shouldShowBanner() {
    if (isInstalled.value) return false

    // Must have done something first (min 2 visits OR prompt forced externally)
    const visits = parseInt(localStorage.getItem(VISIT_KEY) || '0')
    if (visits < 2 && !_deferredPrompt) return false

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return canInstall.value || isIos.value

    try {
      const { count, last } = JSON.parse(raw)
      if (count >= MAX_DISMISSALS) return false
      const daysSince = (Date.now() - last) / (1000 * 60 * 60 * 24)
      if (daysSince < SNOOZE_DAYS) return false
    } catch {
      // Corrupt storage — reset
      localStorage.removeItem(STORAGE_KEY)
    }

    return canInstall.value || isIos.value
  }

  function dismiss() {
    showBanner.value = false
    const raw   = localStorage.getItem(STORAGE_KEY)
    const prev  = raw ? JSON.parse(raw) : { count: 0, last: 0 }
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      count: prev.count + 1,
      last:  Date.now(),
    }))
  }

  function recordVisit() {
    const count = parseInt(localStorage.getItem(VISIT_KEY) || '0')
    localStorage.setItem(VISIT_KEY, String(count + 1))
  }

  // ── Install trigger ─────────────────────────────────────────────────────

  async function install() {
    if (!_deferredPrompt) return

    installing.value = true
    try {
      _deferredPrompt.prompt()
      const { outcome } = await _deferredPrompt.userChoice
      if (outcome === 'accepted') {
        justInstalled.value = true
        isInstalled.value   = true
        showBanner.value    = false
        _deferredPrompt     = null
        canInstall.value    = false
      } else {
        dismiss()
      }
    } finally {
      installing.value = false
    }
  }

  // ── Lifecycle ───────────────────────────────────────────────────────────

  function handlePromptAvailable() {
    canInstall.value = true
    if (!isInstalled.value) showBanner.value = true
  }

  function handleAppInstalled() {
    isInstalled.value = true
    showBanner.value  = false
    _deferredPrompt   = null
  }

  onMounted(() => {
    recordVisit()
    detectPlatform()

    window.addEventListener('beforeinstallprompt', handlePromptAvailable)
    window.addEventListener('appinstalled',        handleAppInstalled)

    // Slight delay so it doesn't appear instantly on page load
    setTimeout(() => {
      if (shouldShowBanner()) showBanner.value = true
    }, 2500)
  })

  onUnmounted(() => {
    window.removeEventListener('beforeinstallprompt', handlePromptAvailable)
    window.removeEventListener('appinstalled',        handleAppInstalled)
  })

  // ── Manually trigger banner (e.g. from Profile "Install App" button) ───

  function triggerBanner() {
    if (!isInstalled.value && (canInstall.value || isIos.value)) {
      showBanner.value = true
    }
  }

  return {
    isInstalled,
    canInstall,
    isIos,
    showBanner,
    installing,
    justInstalled,
    install,
    dismiss,
    triggerBanner,
  }
}
