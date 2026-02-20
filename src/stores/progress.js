import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const useProgressStore = defineStore('progress', () => {
  // ── State
  const streak = ref(0)
  const lastStudyDate = ref(null)     // 'YYYY-MM-DD'
  const streakShields = ref(0)        // PREMIUM: protect streak for missed days (max 1/week)
  const xp = ref(0)
  const badges = ref([])              // string[]  e.g. ['week-warrior', 'first-exam']
  const subjectStats = ref({})
  /*
    subjectStats = {
      english: {
        attempted: 120,
        correct: 89,
        topicStats: {
          'comprehension': { attempted: 30, correct: 24 },
          'lexis-structure': { attempted: 20, correct: 14 }
        }
      },
      mathematics: { ... }
    }
  */
  const weeklyScores = ref([])        // [{ date, score, subject, sessionId }]
  const totalSessionsCompleted = ref(0)

  // ── Getters
  const level = computed(() => Math.floor(xp.value / 500) + 1)
  const xpToNextLevel = computed(() => 500 - (xp.value % 500))

  const subjectAccuracy = computed(() => {
    const result = {}
    Object.entries(subjectStats.value).forEach(([subject, data]) => {
      result[subject] = data.attempted > 0
        ? Math.round((data.correct / data.attempted) * 100)
        : 0
    })
    return result
  })

  const weakTopics = computed(() => {
    const weak = []
    Object.entries(subjectStats.value).forEach(([subject, data]) => {
      if (!data.topicStats) return
      Object.entries(data.topicStats).forEach(([topic, stats]) => {
        const pct = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0
        if (stats.attempted >= 5 && pct < 55) {
          weak.push({ subject, topic, pct: Math.round(pct), attempted: stats.attempted })
        }
      })
    })
    return weak.sort((a, b) => a.pct - b.pct).slice(0, 6)
  })

  const strongTopics = computed(() => {
    const strong = []
    Object.entries(subjectStats.value).forEach(([subject, data]) => {
      if (!data.topicStats) return
      Object.entries(data.topicStats).forEach(([topic, stats]) => {
        const pct = stats.attempted > 0 ? (stats.correct / stats.attempted) * 100 : 0
        if (stats.attempted >= 5 && pct >= 80) {
          strong.push({ subject, topic, pct: Math.round(pct) })
        }
      })
    })
    return strong.sort((a, b) => b.pct - a.pct).slice(0, 4)
  })

  // ── Actions
  function recordStudy() {
    const today = dayjs().format('YYYY-MM-DD')
    const yesterday = dayjs().subtract(1, 'day').format('YYYY-MM-DD')

    if (lastStudyDate.value === today) return // already studied today

    if (lastStudyDate.value === yesterday) {
      streak.value++ // continue streak
    } else if (lastStudyDate.value !== today) {
      // Missed a day — check for shield
      if (streakShields.value > 0) {
        streakShields.value--
        // Keep streak, just decrement shield
      } else {
        streak.value = 1 // reset
      }
    }

    lastStudyDate.value = today
    addXP(20, 'daily-study')
  }

  function addXP(amount, reason) {
    xp.value += amount
    return checkBadges() // returns newly earned badges
  }

  function checkBadges() {
    const earned = []
    const checks = [
      { id: 'first-exam',      condition: totalSessionsCompleted.value >= 1 },
      { id: 'week-warrior',    condition: streak.value >= 7 },
      { id: 'fortnight',       condition: streak.value >= 14 },
      { id: 'monthly-master',  condition: streak.value >= 30 },
      { id: 'xp-500',          condition: xp.value >= 500 },
      { id: 'xp-1000',         condition: xp.value >= 1000 },
      { id: 'xp-5000',         condition: xp.value >= 5000 },
      { id: '10-exams',        condition: totalSessionsCompleted.value >= 10 },
      { id: '50-exams',        condition: totalSessionsCompleted.value >= 50 },
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
      date: dayjs().format('YYYY-MM-DD'),
      score: sessionResult.score,
      total: sessionResult.total,
      sessionId: sessionResult.id
    })
    // Keep only last 30 sessions in chart data
    if (weeklyScores.value.length > 30) {
      weeklyScores.value = weeklyScores.value.slice(-30)
    }
    recordStudy()
    addXP(50, 'completed-session')
  }

  function updateSubjectStat(subject, topic, correct, total) {
    if (!subjectStats.value[subject]) {
      subjectStats.value[subject] = { attempted: 0, correct: 0, topicStats: {} }
    }
    subjectStats.value[subject].attempted += total
    subjectStats.value[subject].correct += correct

    if (!subjectStats.value[subject].topicStats[topic]) {
      subjectStats.value[subject].topicStats[topic] = { attempted: 0, correct: 0 }
    }
    subjectStats.value[subject].topicStats[topic].attempted += total
    subjectStats.value[subject].topicStats[topic].correct += correct
  }

  function grantStreakShield() { streakShields.value = Math.min(streakShields.value + 1, 3) }

  return {
    // State
    streak, lastStudyDate, streakShields, xp, badges,
    subjectStats, weeklyScores, totalSessionsCompleted,
    // Getters
    level, xpToNextLevel, subjectAccuracy, weakTopics, strongTopics,
    // Actions
    recordStudy, addXP, checkBadges, recordSession,
    updateSubjectStat, grantStreakShield
  }
}, { persist: true })
