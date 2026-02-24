/**
 * questions.js — Question Store
 *
 * Offline strategy:
 *   - Premium/trial users: proactive bulk download of all their subjects via
 *     GET /api/sync/questions. Stored per-subject in `cache`.
 *   - On fetch: serve from cache if offline, fetch from API if online (and re-cache).
 *   - Coverage map tracks which subjects are fully downloaded so the UI can
 *     show "ready for offline" per subject.
 *   - Free users who go offline see a clear "go premium for offline access" message.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useNetworkStore } from './network'
import { useUserStore }    from './user'
import { secureStorage }   from '@/lib/secureStorage'
import { initEncryption, hasEncryptionKey } from '@/lib/crypto'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const useQuestionsStore = defineStore('questions', () => {
  // ── State ───────────────────────────────────────────────────────────────

  /**
   * cache: { [subject]: Question[] }
   * Persisted. Premium users get explanations included.
   */
  const cache = ref({})

  /**
   * coverage: { [subject]: { downloadedAt: ISO, count: number } }
   * Lets us show "English — 847 questions, last synced 2h ago"
   */
  const coverage = ref({})

  const loading          = ref(false)
  const downloadProgress = ref(0)   // 0–100 during bulk download
  const isDownloading    = ref(false)

  // ── Getters ─────────────────────────────────────────────────────────────

  const subjectsReadyOffline = computed(() =>
    Object.keys(coverage.value).filter(s => coverage.value[s]?.count > 0)
  )

  const totalCachedQuestions = computed(() =>
    Object.values(cache.value).reduce((sum, qs) => sum + (qs?.length ?? 0), 0)
  )

  function coverageFor(subject) {
    return coverage.value[subject] ?? null
  }

  // ── Fetch (single subject / filtered) ──────────────────────────────────

  async function fetchQuestions({ subject, year, topic, count = 40, shuffle = true }) {
    const networkStore = useNetworkStore()
    const userStore    = useUserStore()

    // Ensure the AES key is derived before we try to read from the encrypted cache.
    // On cold boot the key is initialised in main.js but is async — we wait for it.
    if (!hasEncryptionKey() && userStore.token) {
      await initEncryption(userStore.token)
    }

    // ── Offline path ──────────────────────────────────────────────────────
    if (!networkStore.isOnline) {
      if (!userStore.isPremium) {
        throw Object.assign(new Error('OFFLINE_NOT_PREMIUM'), { code: 'OFFLINE_NOT_PREMIUM' })
      }
      const cached = cache.value[subject]
      if (!cached?.length) {
        throw Object.assign(new Error('OFFLINE_NOT_CACHED'), { code: 'OFFLINE_NOT_CACHED' })
      }
      return filterAndReturn(cached, { year, topic, count, shuffle })
    }

    // ── Online path ───────────────────────────────────────────────────────
    loading.value = true
    try {
      const params = new URLSearchParams({ subject, count })
      if (year)  params.set('year',  year)
      if (topic) params.set('topic', topic)

      const res = await apiFetch(`/questions?${params}`, userStore.token)
      const { questions } = await res.json()

      // Merge new questions into subject cache (premium users only)
      if (userStore.isPremium) mergeIntoCache(subject, questions)

      return shuffleIfNeeded(questions, shuffle)
    } finally {
      loading.value = false
    }
  }

  async function fetchMockExam(subjects) {
    const perSubject = Math.max(10, Math.floor(40 / subjects.length))
    const all = await Promise.all(
      subjects.map(s => fetchQuestions({ subject: s, count: perSubject, shuffle: true }))
    )
    return shuffleIfNeeded(all.flat(), true)
  }

  async function fetchWeakAreaQuestions(weakTopics) {
    const all = await Promise.all(
      weakTopics.slice(0, 4).map(({ subject, topic }) =>
        fetchQuestions({ subject, topic, count: 10 })
      )
    )
    return all.flat()
  }

  // ── Bulk Download (proactive offline prep) ─────────────────────────────

  /**
   * Download ALL questions for the user's subjects in one request per subject.
   * Called after setup, on "Sync Now" tap, or on login if coverage is empty.
   */
  async function syncAllSubjects(subjects) {
    const networkStore = useNetworkStore()
    const userStore    = useUserStore()

    if (!networkStore.isOnline) return { ok: false, reason: 'offline' }
    if (!userStore.isPremium)   return { ok: false, reason: 'not_premium' }
    if (isDownloading.value)    return { ok: false, reason: 'already_downloading' }

    isDownloading.value    = true
    downloadProgress.value = 0

    const total = subjects.length
    let done    = 0

    try {
      for (const subject of subjects) {
        const res = await apiFetch(
          `/sync/questions?subject=${subject}`,
          userStore.token
        )
        const { questions } = await res.json()

        // Full replace for this subject — this is the authoritative copy
        cache.value[subject] = questions
        coverage.value[subject] = {
          downloadedAt: new Date().toISOString(),
          count: questions.length,
        }

        done++
        downloadProgress.value = Math.round((done / total) * 100)
      }

      return { ok: true, total: totalCachedQuestions.value }
    } catch (err) {
      // 429 — rate limit hit mid-sync. Save progress so far and tell the UI
      // clearly — no point retrying, the limit resets at midnight.
      if (err.status === 429) {
        return {
          ok:            false,
          reason:        'rate_limited',
          message:       err.message ?? 'Daily download limit reached. Try again tomorrow.',
          savedSubjects: done,
        }
      }
      return { ok: false, reason: err.message }
    } finally {
      isDownloading.value    = false
      downloadProgress.value = 0
    }
  }

  // ── Flag a question ────────────────────────────────────────────────────

  async function flagQuestion(questionId, reason, note) {
    const networkStore = useNetworkStore()
    const userStore    = useUserStore()

    if (networkStore.isOnline) {
      await apiFetch(`/questions/${questionId}/flag`, userStore.token, {
        method: 'POST',
        body:   JSON.stringify({ reason, note }),
      })
    } else {
      // Enqueue for when we're back online
      const { useSyncStore } = await import('./sync')
      useSyncStore().enqueue('question_flag', { question_id: questionId, reason, note })
    }
  }

  // ── Cache helpers ──────────────────────────────────────────────────────

  function mergeIntoCache(subject, incoming) {
    const existing    = cache.value[subject] ?? []
    const existingIds = new Set(existing.map(q => q.id))
    const merged      = [...existing, ...incoming.filter(q => !existingIds.has(q.id))]
    cache.value[subject] = merged
    coverage.value[subject] = {
      downloadedAt: new Date().toISOString(),
      count: merged.length,
    }
  }

  function clearCache() {
    cache.value    = {}
    coverage.value = {}
  }

  function filterAndReturn(questions, { year, topic, count, shuffle }) {
    let q = [...questions]
    if (year)  q = q.filter(x => x.year  === Number(year))
    if (topic) q = q.filter(x => x.topic === topic)
    return shuffleIfNeeded(q.slice(0, count), shuffle)
  }

  function shuffleIfNeeded(arr, doShuffle) {
    if (!doShuffle) return arr
    return [...arr].sort(() => Math.random() - 0.5)
  }

  async function apiFetch(path, token, opts = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
      method: 'GET',
      ...opts,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers ?? {}),
      },
    })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      const err  = Object.assign(
        new Error(body.message ?? `HTTP ${res.status}`),
        { status: res.status, body }
      )
      throw err
    }
    return res
  }

  return {
    cache, coverage, loading, downloadProgress, isDownloading,
    subjectsReadyOffline, totalCachedQuestions, coverageFor,
    fetchQuestions, fetchMockExam, fetchWeakAreaQuestions,
    syncAllSubjects, flagQuestion, clearCache,
  }
}, {
  persist: {
    paths:   ['cache', 'coverage'],
    storage: secureStorage,
  },
})
