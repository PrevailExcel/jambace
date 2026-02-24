import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useProgressStore = defineStore('progress', () => {
  // ── State ──────────────────────────────────────────────────────────────
  const streak        = ref(0)
  const lastStudyDate = ref(null)
  const streakShields = ref(0)
  const xp            = ref(0)
  const badges        = ref([])
  const subjectStats  = ref({})
  const weeklyScores  = ref([])
  const totalSessionsCompleted = ref(0)

  // ── Getters ───────────────────────────────────────────────────────────
  const level          = computed(() => Math.floor(xp.value / 500) + 1)
  const xpToNextLevel  = computed(() => 500 - (xp.value % 500))

  const subjectAccuracy = computed(() => {
    const result = {}
    Object.entries(subjectStats.value).forEach(([subject, data]) => {
      result[subject] = data.attempted > 0
        ? Math.round((data.correct / data.attempted) * 100) : 0
    })
    return result
  })

  const weakTopics = computed(() => {
    const weak = []
    Object.entries(subjectStats.value).forEach(([subject, data]) => {
      Object.entries(data.topicStats ?? {}).forEach(([topic, stats]) => {
        const pct = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0
        if (stats.attempted >= 5 && pct < 55)
          weak.push({ subject, topic, pct: Math.round(pct), attempts: stats.attempted })
      })
    })
    return weak.sort((a, b) => a.pct - b.pct).slice(0, 6)
  })

  const strongTopics = computed(() => {
    const strong = []
    Object.entries(subjectStats.value).forEach(([subject, data]) => {
      Object.entries(data.topicStats ?? {}).forEach(([topic, stats]) => {
        const pct = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0
        if (stats.attempted >= 5 && pct >= 80)
          strong.push({ subject, topic, pct: Math.round(pct) })
      })
    })
    return strong.sort((a, b) => b.pct - a.pct).slice(0, 4)
  })

  // Total questions across all subjects
  const totalAttempted = computed(() =>
    Object.values(subjectStats.value).reduce((s, d) => s + (d.attempted ?? 0), 0)
  )
  const totalCorrect = computed(() =>
    Object.values(subjectStats.value).reduce((s, d) => s + (d.correct ?? 0), 0)
  )

  // ── Actions ───────────────────────────────────────────────────────────

  function recordStudy() {
    const today     = dayjs().format('YYYY-MM-DD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')
    if (lastStudyDate.value === today) return

    if (lastStudyDate.value === yesterday) {
      streak.value++
    } else if (lastStudyDate.value !== null) {
      if (streakShields.value > 0) streakShields.value--
      else streak.value = 1
    } else {
      streak.value = 1
    }

    lastStudyDate.value = today
    addXP(20, 'daily-study')
  }

  function addXP(amount) {
    xp.value += amount
    return checkBadges()
  }

  function checkBadges() {
    const earned = []
    const checks = [
      { id: 'first-exam',     condition: totalSessionsCompleted.value >= 1 },
      { id: 'streak-3',       condition: streak.value >= 3 },
      { id: 'week-warrior',   condition: streak.value >= 7 },
      { id: 'fortnight',      condition: streak.value >= 14 },
      { id: 'monthly-master', condition: streak.value >= 30 },
      { id: 'xp-500',         condition: xp.value >= 500 },
      { id: 'xp-1000',        condition: xp.value >= 1000 },
      { id: 'xp-5000',        condition: xp.value >= 5000 },
      { id: '10-exams',       condition: totalSessionsCompleted.value >= 10 },
      { id: '50-exams',       condition: totalSessionsCompleted.value >= 50 },
    ]
    checks.forEach(({ id, condition }) => {
      if (condition && !badges.value.includes(id)) {
        badges.value.push(id)
        earned.push(id)
      }
    })
    return earned
  }

  function recordSession(sessionResult) {
    totalSessionsCompleted.value++
    weeklyScores.value.push({
      date:      dayjs().format('YYYY-MM-DD'),
      score:     sessionResult.score,
      total:     sessionResult.total,
      sessionId: sessionResult.id,
    })
    if (weeklyScores.value.length > 30)
      weeklyScores.value = weeklyScores.value.slice(-30)

    recordStudy()
    addXP(50)
  }

  function updateSubjectStat(subject, topic, correct, total) {
    if (!subjectStats.value[subject])
      subjectStats.value[subject] = { attempted: 0, correct: 0, topicStats: {} }

    subjectStats.value[subject].attempted += total
    subjectStats.value[subject].correct   += correct

    if (!subjectStats.value[subject].topicStats[topic])
      subjectStats.value[subject].topicStats[topic] = { attempted: 0, correct: 0 }

    subjectStats.value[subject].topicStats[topic].attempted += total
    subjectStats.value[subject].topicStats[topic].correct   += correct
  }

  function grantStreakShield() { streakShields.value = Math.min(streakShields.value + 1, 3) }

  /**
   * Reconcile local progress with server state.
   * Server wins on streak (it has the full picture), but we never
   * roll XP backwards — take whichever is higher.
   */
  function reconcileFromServer(serverProgress) {
    if (!serverProgress) return

    // Streak: server is authoritative (it sees all devices)
    if (typeof serverProgress.streak === 'number')
      streak.value = serverProgress.streak

    // XP: take the max — never penalise offline work
    if (typeof serverProgress.xp === 'number')
      xp.value = Math.max(xp.value, serverProgress.xp)

    // Badges: merge (never remove a badge the client thinks it earned)
    if (Array.isArray(serverProgress.badges)) {
      serverProgress.badges.forEach(b => {
        if (!badges.value.includes(b)) badges.value.push(b)
      })
    }

    // Sessions total: take the max
    if (typeof serverProgress.sessions_total === 'number')
      totalSessionsCompleted.value = Math.max(
        totalSessionsCompleted.value, serverProgress.sessions_total
      )
  }

  return {
    streak, lastStudyDate, streakShields, xp, badges,
    subjectStats, weeklyScores, totalSessionsCompleted,
    level, xpToNextLevel, subjectAccuracy,
    weakTopics, strongTopics, totalAttempted, totalCorrect,
    recordStudy, addXP, checkBadges, recordSession,
    updateSubjectStat, grantStreakShield, reconcileFromServer,
  }
}, { persist: true })