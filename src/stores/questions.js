import { defineStore } from 'pinia'
import { ref } from 'vue'
import { useNetworkStore } from './network'
import { useUserStore } from './user'

export const useQuestionsStore = defineStore('questions', () => {
  const cache = ref({})     // { [cacheKey]: Question[] }  — offline premium users
  const loading = ref(false)

  /*
    Question schema:
    {
      id:           string,
      subject:      'english' | 'mathematics' | 'chemistry' | 'biology' | 'physics' | 'economics' | ...,
      year:         number,
      topic:        string,
      text:         string,
      options:      string[],      // 4 options, plain text (no A/B/C prefix — handled by UI)
      correctIndex: number,        // 0-based
      explanation:  string,        // PREMIUM ONLY — why the answer is correct
      verified:     boolean,       // community-verified accuracy flag
      flagCount:    number,        // how many users reported an issue
      difficulty:   'easy' | 'medium' | 'hard',
      imagePath:    string | null  // for questions with diagrams
    }
  */

  async function fetchQuestions({ subject, year, topic, count = 40, shuffle = true }) {
    const networkStore = useNetworkStore()
    const userStore = useUserStore()
    const key = [subject, year || 'all', topic || 'all'].join('_')

    // ── Offline: serve from cache (premium only)
    if (!networkStore.isOnline) {
      if (userStore.isPremium && cache.value[key]) {
        return shuffleIfNeeded(cache.value[key].slice(0, count), shuffle)
      }
      throw new Error('OFFLINE_NOT_PREMIUM')
    }

    // ── Online: fetch from API
    loading.value = true
    try {
      const params = new URLSearchParams({
        subject,
        ...(year  && { year }),
        ...(topic && { topic }),
        count
      })
      const res = await fetch(`/api/questions?${params}`, {
        headers: { Authorization: `Bearer ${userStore.token}` }
      })
      if (!res.ok) throw new Error('FETCH_FAILED')
      const { questions } = await res.json()

      // Cache for offline if premium
      if (userStore.isPremium) cache.value[key] = questions

      return shuffleIfNeeded(questions, shuffle)
    } finally {
      loading.value = false
    }
  }

  async function fetchMockExam(subjects) {
    // Fetch ~40 questions distributed across selected subjects
    const perSubject = Math.floor(40 / subjects.length)
    const allQuestions = await Promise.all(
      subjects.map(s => fetchQuestions({ subject: s, count: perSubject, shuffle: true }))
    )
    return shuffleIfNeeded(allQuestions.flat(), true)
  }

  async function fetchWeakAreaQuestions(weakTopics) {
    // Fetch questions specifically targeting detected weak topics
    const questions = await Promise.all(
      weakTopics.slice(0, 4).map(({ subject, topic }) =>
        fetchQuestions({ subject, topic, count: 10 })
      )
    )
    return questions.flat()
  }

  async function flagQuestion(questionId, reason) {
    const userStore = useUserStore()
    await fetch(`/api/questions/${questionId}/flag`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userStore.token}`
      },
      body: JSON.stringify({ reason })
    })
  }

  function shuffleIfNeeded(arr, shuffle) {
    if (!shuffle) return arr
    return [...arr].sort(() => Math.random() - 0.5)
  }

  function clearCache() { cache.value = {} }

  return { cache, loading, fetchQuestions, fetchMockExam, fetchWeakAreaQuestions, flagQuestion, clearCache }
}, { persist: { paths: ['cache'] } })
