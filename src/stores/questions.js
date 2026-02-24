/**
 * questions.js — Question Store
 *
 * Offline strategy:
 *   - Premium/trial users: proactive bulk download of all their subjects via
 *     GET /api/sync/questions. Stored per-subject in `cache`.
 *   - On fetch: serve from cache if offline, fetch from API if online (and merge).
 *   - Coverage map tracks which subjects are downloaded so the UI can show
 *     "English — 847 questions, last synced 2h ago".
 *
 * Persistence:
 *   `coverage` (metadata only) → pinia persist → plain localStorage. Safe.
 *   `cache`    (question data) → manual async   → AES-256-GCM encrypted localStorage.
 *
 *   WHY MANUAL?
 *   pinia-plugin-persistedstate v3 does not support async storage — it calls
 *   getItem/setItem synchronously and ignores returned Promises. An async
 *   storage shim silently breaks hydration: cache always comes back {}.
 *   So we manage cache persistence ourselves: loadCacheFromDisk() on first
 *   access, saveCacheToDisk() after every write.
 */

import { defineStore }      from 'pinia'
import { ref, computed }    from 'vue'
import { useNetworkStore }  from './network'
import { useUserStore }     from './user'
import { saveCache, loadCache } from '@/lib/secureStorage'
import { initEncryption, hasEncryptionKey } from '@/lib/crypto'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export const useQuestionsStore = defineStore('questions', () => {
  // ── State ────────────────────────────────────────────────────────────────

  /** { [subject]: Question[] } — in memory; persisted manually via saveCache/loadCache */
  const cache = ref({})

  /** { [subject]: { downloadedAt: ISO, count: number } } — persisted by pinia (plain) */
  const coverage = ref({})

  const loading          = ref(false)
  const downloadProgress = ref(0)
  const isDownloading    = ref(false)

  // Guard: have we loaded the encrypted cache from disk this session?
  let _diskLoadPromise = null

  // ── Getters ──────────────────────────────────────────────────────────────

  const subjectsReadyOffline = computed(() =>
    Object.keys(coverage.value).filter(s => coverage.value[s]?.count > 0)
  )

  const totalCachedQuestions = computed(() =>
    Object.values(cache.value).reduce((sum, qs) => sum + (qs?.length ?? 0), 0)
  )

  function coverageFor(subject) {
    return coverage.value[subject] ?? null
  }

  // ── Disk I/O ─────────────────────────────────────────────────────────────

  /**
   * Ensure the encryption key is ready, then load the encrypted cache from
   * localStorage into `cache`. Idempotent — only runs once per session.
   */
  async function ensureCacheLoaded() {
    if (_diskLoadPromise) return _diskLoadPromise

    _diskLoadPromise = (async () => {
      const userStore = useUserStore()
      if (!userStore.token) return   // not logged in — nothing to load

      // Derive AES key if it hasn't been derived yet (e.g. very fast page load)
      if (!hasEncryptionKey()) {
        await initEncryption(userStore.token)
      }

      const loaded = await loadCache()
      if (loaded && Object.keys(loaded).length > 0) {
        cache.value = loaded
      }
    })()

    return _diskLoadPromise
  }

  /** Encrypt and persist the current cache to localStorage. */
  async function persistCache() {
    await saveCache(cache.value)
  }

  // ── Fetch (single subject / filtered) ────────────────────────────────────

  async function fetchQuestions({ subject, year, topic, count = 40, shuffle = true }) {
    const networkStore = useNetworkStore()
    const userStore    = useUserStore()

    // Always ensure the encrypted cache is loaded before serving from it
    await ensureCacheLoaded()

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

      // Merge into in-memory cache (premium users only)
      if (userStore.isPremium) {
        mergeIntoCache(subject, questions)
        // Persist the updated cache — non-blocking
        persistCache()
      }

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

  // ── Bulk Download (proactive offline prep) ────────────────────────────────

  async function syncAllSubjects(subjects) {
    const networkStore = useNetworkStore()
    const userStore    = useUserStore()

    if (!networkStore.isOnline) return { ok: false, reason: 'offline' }
    if (!userStore.isPremium)   return { ok: false, reason: 'not_premium' }
    if (isDownloading.value)    return { ok: false, reason: 'already_downloading' }

    // Make sure the encryption key is ready before we write to disk
    if (!hasEncryptionKey() && userStore.token) {
      await initEncryption(userStore.token)
    }

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

        cache.value[subject] = questions
        coverage.value[subject] = {
          downloadedAt: new Date().toISOString(),
          count: questions.length,
        }

        done++
        downloadProgress.value = Math.round((done / total) * 100)
      }

      // Persist the complete cache to encrypted localStorage once all subjects done
      await persistCache()

      return { ok: true, total: totalCachedQuestions.value }
    } catch (err) {
      // Save whatever we downloaded before the error hit
      if (done > 0) await persistCache()

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

  // ── Flag a question ───────────────────────────────────────────────────────

  async function flagQuestion(questionId, reason, note) {
    const networkStore = useNetworkStore()
    const userStore    = useUserStore()

    if (networkStore.isOnline) {
      await apiFetch(`/questions/${questionId}/flag`, userStore.token, {
        method: 'POST',
        body:   JSON.stringify({ reason, note }),
      })
    } else {
      const { useSyncStore } = await import('./sync')
      useSyncStore().enqueue('question_flag', { question_id: questionId, reason, note })
    }
  }

  // ── Cache helpers ─────────────────────────────────────────────────────────

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

  async function clearCache() {
    cache.value    = {}
    coverage.value = {}
    _diskLoadPromise = null
    // The encrypted blob on disk will be wiped by clearSecureCache() on logout
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
    ensureCacheLoaded,   // exposed so main.js can warm it on boot
  }
}, {
  // Only persist coverage (metadata) — cache is persisted manually via saveCache/loadCache
  persist: { paths: ['coverage'] },
})