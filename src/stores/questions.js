/**
 * questions.js — Question Store
 *
 * Strategy: offline-first with online sync.
 *
 *   Online  → fetch from API → serve immediately → grow cache in background
 *   Offline → serve from cache (plain pinia persist, no encryption)
 *
 * Cache warm-up: after login, warmCache(subjects) silently pre-fetches all of
 * the user's subjects so that offline use works immediately — no manual sync.
 *
 * PracticeView reads `isSubjectAvailable(subject)` — true if online OR cached.
 * The "Not downloaded" state only shows when genuinely offline with no cache.
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useNetworkStore } from './network'
import { useUserStore } from './user'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'
const router = useRouter()

export const useQuestionsStore = defineStore('questions', () => {

  // ── State ────────────────────────────────────────────────────────────────

  /**
   * cache: { [subject]: Question[] }
   * Persisted as plain JSON. Used only when offline.
   * Updated silently after every successful online fetch.
   */
  const cache = ref({})
  const coverage = ref({})   // { [subject]: { cachedAt: ISO, count: number } }

  const loading = ref(false)
  const isWarming = ref(false)   // true while background warm-up is running
  const userStore = useUserStore()


  // ── Getters ──────────────────────────────────────────────────────────────

  const subjectsReadyOffline = computed(() =>
    Object.keys(coverage.value).filter(s => coverage.value[s]?.count > 0)
  )

  const totalCachedQuestions = computed(() =>
    Object.values(cache.value).reduce((sum, qs) => sum + (qs?.length ?? 0), 0)
  )

  /**
   * True if the subject can be started right now.
   * Online: always true — API will serve questions.
   * Offline: only true if we have cached questions.
   */
  function isSubjectAvailable(subject) {
    const networkStore = useNetworkStore()
    if (networkStore.isOnline) return true
    return (cache.value[subject]?.length ?? 0) > 0
  }

  function coverageFor(subject) {
    return coverage.value[subject] ?? null
  }

  // ── Fetch (single subject / filtered) ────────────────────────────────────

  async function fetchQuestions({ subject, year, topic, count = 40, shuffle = true }) {
    const networkStore = useNetworkStore()
    const userStore = useUserStore()

    // ── Offline: serve from cache ─────────────────────────────────────────
    if (!networkStore.isOnline) {
      const cached = cache.value[subject]
      if (!cached?.length) {
        throw Object.assign(
          new Error('No cached questions for this subject. Connect to the internet and try again.'),
          { code: 'OFFLINE_NOT_CACHED' }
        )
      }
      return filterAndReturn(cached, { year, topic, count, shuffle })
    }

    // ── Online: fetch from API ────────────────────────────────────────────
    loading.value = true
    try {
      const params = new URLSearchParams({ subject, count })
      if (year) params.set('year', year)
      if (topic) params.set('topic', topic)

      const res = await apiFetch(`/questions?${params}`, userStore.token)
      const body = await res.json()
      const questions = transformQuestions(body.questions ?? body)

      // Update cache silently for offline use later — don't await, don't block
      updateCache(subject, questions)

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

  // ── Cache management ──────────────────────────────────────────────────────

  /**
   * Merge new questions into the cache for a subject.
   * Runs synchronously — no awaiting, no encryption, no side effects.
   */
  function updateCache(subject, incoming) {
    const existing = cache.value[subject] ?? []
    const existingIds = new Set(existing.map(q => q.id))
    const merged = [...existing, ...incoming.filter(q => !existingIds.has(q.id))]

    // Replace the whole ref key — avoids partial mutation during render
    cache.value = { ...cache.value, [subject]: merged }

    coverage.value = {
      ...coverage.value,
      [subject]: { cachedAt: new Date().toISOString(), count: merged.length },
    }
  }

  function clearCache() {
    cache.value = {}
    coverage.value = {}
  }

  // ── Background cache warm-up ─────────────────────────────────────────────

  /**
   * Silently pre-fetch all of the user's subjects after login.
   * One subject at a time, 300ms apart — polite to the server.
   * Safe to call multiple times: skips subjects already cached.
   * Non-blocking — callers do NOT await this.
   */
  async function warmCache(subjects = []) {
    if (!subjects.length) {
      if (router.currentRoute.value.name !== 'setup') {
        router.replace({ name: 'setup' })
      }
      return
    }
    const networkStore = useNetworkStore()
    if (!networkStore.isOnline || isWarming.value) return
    if (!subjects.length) return

    isWarming.value = true
    try {
      for (const subject of subjects) {
        if (!networkStore.isOnline) break  // went offline mid-warm — stop

        // Skip if already cached (e.g. user came back online, cache is fresh)
        const existing = cache.value[subject]
        if (existing?.length >= 40) {
          continue
        }

        try {
          // Fetch a full page quietly — same transform pipeline
          const userStore = useUserStore()
          const params = new URLSearchParams({ subject, count: 60 })
          const res = await apiFetch(`/questions?${params}`, userStore.token)
          const body = await res.json()
          const questions = transformQuestions(body.questions ?? body)
          if (questions.length) updateCache(subject, questions)
        } catch {
          // Ignore per-subject errors — don't abort the whole warm-up
        }

        // Brief pause between subjects — avoid hammering the API
        await new Promise(r => setTimeout(r, 300))
      }
    } finally {
      isWarming.value = false
    }
  }

  // ── Flag a question ───────────────────────────────────────────────────────

  async function flagQuestion(questionId, reason, note) {
    const networkStore = useNetworkStore()
    const userStore = useUserStore()

    if (networkStore.isOnline) {
      await apiFetch(`/questions/${questionId}/flag`, userStore.token, {
        method: 'POST',
        body: JSON.stringify({ reason, note }),
      }).catch(() => { }) // fire and forget
    } else {
      const { useSyncStore } = await import('./sync')
      useSyncStore().enqueue('question_flag', { question_id: questionId, reason, note })
    }
  }

  // ── API response transformation ──────────────────────────────────────────

  /**
   * The API returns snake_case field names (correct_index, image_path).
   * The entire frontend uses camelCase. Transform once here so every
   * downstream consumer (ExamView, ResultsView, ExplanationPanel) works
   * without knowing about the API's naming convention.
   */
  function transformQuestion(q) {
    return {
      ...q,
      correctIndex: q.correct_index ?? q.correctIndex ?? 0,
      imagePath: q.image_path ?? q.imagePath ?? null,
      // Ensure options is always a plain array (API may return object or array)
      options: Array.isArray(q.options)
        ? q.options
        : Object.values(q.options ?? {}),
    }
  }

  function transformQuestions(arr) {
    return (arr ?? []).map(transformQuestion)
  }

  // ── Helpers ───────────────────────────────────────────────────────────────

  function filterAndReturn(questions, { year, topic, count, shuffle }) {
    let q = [...questions]
    if (year) q = q.filter(x => x.year === Number(year))
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

    // 🔥 Handle session expiration globally
    if (
      res.status === 401) {

      userStore.logout()
      router.replace({ name: 'auth' })

      // Prevent redirect loop
      if (router.currentRoute.value.name !== 'auth') {
        router.push({ name: 'auth' })
      }

      throw new Error('Session expired')
    }

    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      throw Object.assign(
        new Error(body.message ?? `HTTP ${res.status}`),
        { status: res.status, body }
      )
    }
    return res
  }

  return {
    cache, coverage, loading, isWarming,
    subjectsReadyOffline, totalCachedQuestions, coverageFor,
    isSubjectAvailable,
    fetchQuestions, fetchMockExam, fetchWeakAreaQuestions,
    warmCache, flagQuestion, clearCache,
  }

}, {
  persist: {
    paths: ['cache', 'coverage'],
    // Plain localStorage — no encryption, no async, no bugs
  },
})