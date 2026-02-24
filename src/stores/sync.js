/**
 * sync.js — Offline Sync Store
 *
 * Responsibilities:
 *   1. Outbox  — queue actions that failed/couldn't run offline, drain on reconnect
 *   2. Token   — track expiry, silently refresh before it expires
 *   3. Bootstrap — refresh server state (user, progress) when coming back online
 *
 * Outbox item shape:
 *   {
 *     id:          string (uuid),
 *     type:        'session_submit' | 'question_flag' | 'credit_spend',
 *     payload:     object,
 *     createdAt:   ISO string,
 *     attempts:    number,
 *     lastAttempt: ISO string | null,
 *     error:       string | null,
 *   }
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useUserStore } from './user'
import { useProgressStore } from './progress'

const MAX_ATTEMPTS = 4
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const useSyncStore = defineStore('sync', () => {
  // ── State ──────────────────────────────────────────────────────────────

  const outbox        = ref([])   // pending actions waiting to sync
  const isSyncing     = ref(false)
  const lastSyncedAt  = ref(null) // ISO string — last successful server sync

  // ── Getters ─────────────────────────────────────────────────────────────

  const pendingCount = computed(() =>
    outbox.value.filter(i => i.attempts < MAX_ATTEMPTS).length
  )

  const failedCount = computed(() =>
    outbox.value.filter(i => i.attempts >= MAX_ATTEMPTS).length
  )

  const hasPending = computed(() => pendingCount.value > 0)

  // ── Outbox Management ──────────────────────────────────────────────────

  function enqueue(type, payload) {
    outbox.value.push({
      id:          crypto.randomUUID(),
      type,
      payload,
      createdAt:   new Date().toISOString(),
      attempts:    0,
      lastAttempt: null,
      error:       null,
    })
  }

  /**
   * Drain the outbox — process each pending item in order.
   * Called automatically when the network comes back online.
   * Safe to call multiple times (guarded by isSyncing).
   */
  async function drainOutbox() {
    const userStore = useUserStore()
    if (isSyncing.value || !userStore.isLoggedIn) return

    const pending = outbox.value.filter(i => i.attempts < MAX_ATTEMPTS)
    if (pending.length === 0) return

    isSyncing.value = true

    for (const item of pending) {
      try {
        await processItem(item, userStore)
        // Remove from outbox on success
        outbox.value = outbox.value.filter(i => i.id !== item.id)
      } catch (err) {
        item.attempts++
        item.lastAttempt = new Date().toISOString()
        item.error = err.message ?? 'Unknown error'
        // If we hit a network error mid-drain, stop — no point continuing
        if (err.name === 'TypeError' || err.message?.includes('fetch')) break
      }
    }

    isSyncing.value = false
  }

  async function processItem(item, userStore) {
    switch (item.type) {

      case 'exam_setup': {
        await api('POST', '/auth/setup', {
          subjects:     item.payload.subjects,
          exam_date:    item.payload.exam_date,
          target_score: item.payload.target_score,
        }, userStore.token)
        break
      }

      case 'session_submit': {
        const res = await api('POST', `/sessions/${item.payload.session_id}/submit`, {
          answers:     item.payload.answers,
          flagged_ids: item.payload.flagged_ids,
          time_used:   item.payload.time_used,
          started_at:  item.payload.started_at,   // server must accept past timestamps
          submitted_at: item.payload.submitted_at,
        }, userStore.token)

        // Update progress from server response (XP, badges etc.)
        const progressStore = useProgressStore()
        if (res.new_badges?.length) {
          res.new_badges.forEach(b => {
            if (!progressStore.badges.includes(b)) progressStore.badges.push(b)
          })
        }
        break
      }

      case 'question_flag': {
        await api('POST', `/questions/${item.payload.question_id}/flag`, {
          reason: item.payload.reason,
          note:   item.payload.note,
        }, userStore.token)
        break
      }

      case 'credit_spend': {
        // Credit was already deducted locally — tell server so it stays in sync.
        // Server is idempotent on this: same thread_id = no-op.
        await api('POST', '/ai/threads', {
          question_id:     item.payload.question_id,
          exam_session_id: item.payload.exam_session_id,
          offline_thread_id: item.payload.thread_id,  // prevent double-charge
        }, userStore.token)
        break
      }

      default:
        throw new Error(`Unknown outbox item type: ${item.type}`)
    }
  }

  // ── Token Refresh ──────────────────────────────────────────────────────

  /**
   * Check if the token is close to expiry and silently refresh it.
   * Called on every successful API response.
   */
  async function maybeRefreshToken() {
    const userStore = useUserStore()
    if (!userStore.token || !userStore.tokenExpiresAt) return

    const expiresAt   = new Date(userStore.tokenExpiresAt)
    const sevenDays   = 7 * 24 * 60 * 60 * 1000
    const shouldRefresh = (expiresAt - Date.now()) < sevenDays

    if (!shouldRefresh) return

    try {
      const res = await api('POST', '/auth/token/refresh', {}, userStore.token)
      userStore.refreshToken(res.token, res.expires_at)
    } catch {
      // Silently fail — token still works for now, will retry next time
    }
  }

  // ── Server State Bootstrap ─────────────────────────────────────────────

  /**
   * Pull fresh state from server: user profile, subscription, credits, progress.
   * Called when the app comes back online after being offline.
   */
  async function bootstrapFromServer() {
    const userStore = useUserStore()
    if (!userStore.isLoggedIn) return

    try {
      const data = await api('GET', '/sync/bootstrap', null, userStore.token)

      // Reconcile user/subscription state — server is authoritative
      userStore.reconcileFromServer(data.user)

      // Reconcile progress — server wins on streak/XP if it's ahead
      const progressStore = useProgressStore()
      progressStore.reconcileFromServer(data.progress)

      lastSyncedAt.value = new Date().toISOString()
    } catch (err) {
      // Non-fatal — user keeps working with local state
      console.warn('[sync] bootstrap failed:', err.message)
    }
  }

  /**
   * Full reconnect handler — called by networkStore when coming back online.
   * Order matters: bootstrap first, then drain outbox.
   */
  async function onReconnect() {
    await maybeRefreshToken()
    await drainOutbox()
    await bootstrapFromServer()
  }

  // ── Helpers ─────────────────────────────────────────────────────────────

  function removeFailedItems() {
    outbox.value = outbox.value.filter(i => i.attempts < MAX_ATTEMPTS)
  }

  // ── Internal fetch wrapper ─────────────────────────────────────────────

  async function api(method, path, body, token) {
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    }
    if (body && method !== 'GET') opts.body = JSON.stringify(body)

    const res = await fetch(`${API_BASE}${path}`, opts)
    if (!res.ok) {
      const err = await res.json().catch(() => ({}))
      throw new Error(err.message ?? `HTTP ${res.status}`)
    }
    return res.json()
  }

  return {
    // State
    outbox, isSyncing, lastSyncedAt,
    // Getters
    pendingCount, failedCount, hasPending,
    // Actions
    enqueue, drainOutbox, onReconnect,
    bootstrapFromServer, maybeRefreshToken,
    removeFailedItems,
  }
}, { persist: { paths: ['outbox', 'lastSyncedAt'] } })
