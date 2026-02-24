import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useExamStore = defineStore('exam', () => {
  // ── Active session
  const session = ref(null)
  /*
    session = {
      id:           string (uuid),
      type:         'mock' | 'practice' | 'challenge' | 'weak-areas',
      subjects:     string[],
      questions:    Question[],
      answers:      { [questionId]: number },   // selected option index
      flagged:      string[],                   // questionIds
      currentIndex: number,
      startedAt:    number (timestamp),
      timeLimit:    number (seconds),
      status:       'active' | 'submitted'
    }
  */

  // ── Completed sessions (for history/review)
  const history = ref([])  // last 50 sessions stored locally

  // ── Getters
  const currentQuestion = computed(() =>
    session.value?.questions[session.value.currentIndex] ?? null
  )

  const totalQuestions = computed(() =>
    session.value?.questions.length ?? 0
  )

  const answeredCount = computed(() =>
    session.value ? Object.keys(session.value.answers).length : 0
  )

  const flaggedCount = computed(() =>
    session.value?.flagged.length ?? 0
  )

  const progress = computed(() => {
    if (!session.value || !totalQuestions.value) return 0
    return (session.value.currentIndex + 1) / totalQuestions.value
  })

  const isAnswered = computed(() => (questionId) =>
    questionId in (session.value?.answers ?? {})
  )

  const isFlagged = computed(() => (questionId) =>
    session.value?.flagged.includes(questionId) ?? false
  )

  const sessionScore = computed(() => {
    if (!session.value) return { correct: 0, wrong: 0, unanswered: 0, total: 0, bySubject: {} }
    const bySubject = {}
    let correct = 0, wrong = 0

    session.value.questions.forEach(q => {
      if (!bySubject[q.subject]) bySubject[q.subject] = { correct: 0, total: 0 }
      bySubject[q.subject].total++
      const ans = session.value.answers[q.id]
      if (ans === undefined) return
      if (ans === q.correctIndex) { correct++; bySubject[q.subject].correct++ }
      else wrong++
    })

    const unanswered = totalQuestions.value - correct - wrong
    // JAMB scoring: 1 mark per correct, no negative marking
    const score = correct
    return { correct, wrong, unanswered, total: totalQuestions.value, score, bySubject }
  })

  // ── Actions
  function startSession({ type, subjects, questions, timeLimit }) {
    session.value = {
      id: crypto.randomUUID(),
      type,
      subjects,
      questions,
      answers: {},
      flagged: [],
      currentIndex: 0,
      startedAt: Date.now(),
      timeLimit,
      status: 'active'
    }
  }

  function answer(questionId, optionIndex) {
    if (!session.value || session.value.status !== 'active') return
    session.value.answers[questionId] = optionIndex
  }

  function toggleFlag(questionId) {
    if (!session.value) return
    const idx = session.value.flagged.indexOf(questionId)
    if (idx > -1) session.value.flagged.splice(idx, 1)
    else session.value.flagged.push(questionId)
  }

  function goTo(index) {
    if (!session.value) return
    session.value.currentIndex = Math.max(0, Math.min(index, totalQuestions.value - 1))
  }

  function next() { goTo((session.value?.currentIndex ?? 0) + 1) }
  function prev() { goTo((session.value?.currentIndex ?? 0) - 1) }

  async function submit() {
    if (!session.value) return

    session.value.status = 'submitted'
    const submittedAt    = Date.now()

    const completed = {
      ...session.value,
      submittedAt,
      result: sessionScore.value,
    }
    history.value.unshift(completed)
    if (history.value.length > 50) history.value = history.value.slice(0, 50)

    // ── Enqueue to server sync (works online and offline)
    const { useSyncStore }    = await import('./sync')
    const { useNetworkStore } = await import('./network')
    const syncStore = useSyncStore()

    syncStore.enqueue('session_submit', {
      session_id:   completed.id,
      answers:      completed.answers,
      flagged_ids:  completed.flagged,
      time_used:    completed.timeLimit
        ? Math.round((submittedAt - completed.startedAt) / 1000)
        : null,
      started_at:   new Date(completed.startedAt).toISOString(),
      submitted_at: new Date(submittedAt).toISOString(),
    })

    if (useNetworkStore().isOnline) {
      syncStore.drainOutbox() // non-blocking — fire and forget
    }

    return completed
  }

  function clearSession() { session.value = null }

  return {
    // State
    session, history,
    // Getters
    currentQuestion, totalQuestions, answeredCount, flaggedCount,
    progress, isAnswered, isFlagged, sessionScore,
    // Actions
    startSession, answer, toggleFlag, goTo, next, prev, submit, clearSession
  }
}, { persist: { paths: ['history'] } })