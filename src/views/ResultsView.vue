<template>
  <div class="results-view" v-if="session">

    <!-- ── HERO ── -->
    <div class="results-hero">
      <div class="hero-glow"></div>

      <button class="results-back" @click="router.replace({ name: 'dashboard' })">
        <PhHouse :size="18" weight="fill" />
      </button>

      <div class="hero-body">
        <div class="result-emoji">{{ emoji }}</div>
        <div class="result-score">{{ result.correct }}</div>
        <div class="result-total">out of {{ result.total }}</div>
        <div class="result-msg">{{ message }}</div>
        <div class="result-pct-chip">
          <PhTrendUp :size="14" weight="fill" />
          {{ pct }}% correct — better than {{ betterThan }}% of students this week
        </div>
      </div>
    </div>

    <div class="results-body">

      <!-- ── STAT TILES ── -->
      <div class="stat-tiles">
        <div class="stat-tile">
          <div class="stat-icon green"><PhCheckCircle :size="20" weight="fill" /></div>
          <span class="stat-val">{{ result.correct }}</span>
          <span class="stat-lbl">Correct</span>
        </div>
        <div class="stat-tile">
          <div class="stat-icon red"><PhXCircle :size="20" weight="fill" /></div>
          <span class="stat-val">{{ result.wrong }}</span>
          <span class="stat-lbl">Wrong</span>
        </div>
        <div class="stat-tile">
          <div class="stat-icon muted"><PhMinusCircle :size="20" weight="fill" /></div>
          <span class="stat-val">{{ result.unanswered }}</span>
          <span class="stat-lbl">Skipped</span>
        </div>
        <div class="stat-tile">
          <div class="stat-icon gold"><PhTimer :size="20" weight="fill" /></div>
          <span class="stat-val">{{ timeTaken }}</span>
          <span class="stat-lbl">Time Used</span>
        </div>
      </div>

      <!-- ── SUBJECT BREAKDOWN ── -->
      <div class="section-card">
        <h3 class="card-title">Subject Breakdown</h3>
        <div class="subject-breakdown">
          <div
            v-for="[subject, data] in subjectBreakdown"
            :key="subject"
            class="sb-row"
          >
            <div class="sb-info">
              <span class="sb-name">{{ subjectConfig[subject]?.label || subject }}</span>
              <span class="sb-score" :style="{ color: subjectConfig[subject]?.color }">
                {{ data.correct }}/{{ data.total }}
              </span>
            </div>
            <div class="sb-bar-track">
              <div
                class="sb-bar-fill"
                :style="{
                  width: (data.correct / data.total * 100) + '%',
                  background: subjectConfig[subject]?.color
                }"
              ></div>
            </div>
            <span class="sb-pct">{{ Math.round(data.correct / data.total * 100) }}%</span>
          </div>
        </div>
      </div>

      <!-- ── XP EARNED ── -->
      <div class="xp-banner">
        <div class="xp-icon"><PhStar :size="22" weight="fill" /></div>
        <div class="xp-text">
          <strong>+{{ xpEarned }} XP earned</strong>
          <span>Level {{ progressStore.level }} · {{ progressStore.xpToNextLevel }} XP to next level</span>
        </div>
        <div class="xp-bar-wrap">
          <div class="xp-bar-fill" :style="{ width: xpProgress + '%' }"></div>
        </div>
      </div>

      <!-- ── WEAK AREAS DETECTED ── -->
      <div v-if="progressStore.weakTopics.length" class="section-card">
        <h3 class="card-title">
          <PhWarning :size="16" weight="fill" class="warn-icon" /> Areas to Work On
        </h3>
        <div class="weak-list">
          <div
            v-for="w in progressStore.weakTopics.slice(0, 3)"
            :key="w.topic"
            class="weak-item"
          >
            <div class="weak-info">
              <span class="weak-name">{{ formatTopic(w.topic) }}</span>
              <span class="weak-subject">{{ subjectConfig[w.subject]?.label }}</span>
            </div>
            <div class="weak-pct-wrap">
              <div class="weak-bar">
                <div class="weak-fill" :style="{ width: w.pct + '%' }"></div>
              </div>
              <span class="weak-pct">{{ w.pct }}%</span>
            </div>
          </div>
        </div>
        <RouterLink to="/exam/weak-areas" class="drill-btn">
          <PhLightning :size="15" weight="fill" />
          Drill These Topics Now
        </RouterLink>
      </div>

      <!-- ── REVIEW QUESTIONS ── -->
      <div class="section-card">
        <h3 class="card-title">Question Review</h3>
        <p class="card-sub">Tap any question to see the explanation and ask the AI Tutor.</p>

        <div class="review-list">
          <div
            v-for="(q, i) in session.questions"
            :key="q.id"
            class="review-item"
            :class="{
              correct:    session.answers[q.id] === q.correctIndex,
              wrong:      session.answers[q.id] !== undefined && session.answers[q.id] !== q.correctIndex,
              unanswered: session.answers[q.id] === undefined
            }"
            @click="openReview(q, i)"
          >
            <div class="review-num">{{ i + 1 }}</div>
            <div class="review-info">
              <span class="review-subj">{{ subjectConfig[q.subject]?.label }}</span>
              <span class="review-topic">{{ formatTopic(q.topic) }}</span>
            </div>
            <div class="review-status">
              <PhCheckCircle v-if="session.answers[q.id] === q.correctIndex"  :size="20" weight="fill" class="status-correct" />
              <PhXCircle     v-else-if="session.answers[q.id] !== undefined"   :size="20" weight="fill" class="status-wrong" />
              <PhMinusCircle v-else                                             :size="20" weight="fill" class="status-skip" />
            </div>
          </div>
        </div>
      </div>

      <!-- ── ACTIONS ── -->
      <div class="results-actions">
        <RouterLink to="/exam/mock" class="btn-retry">
          <PhArrowsClockwise :size="16" weight="bold" />
          New Mock Exam
        </RouterLink>
        <RouterLink to="/plan" class="btn-plan">
          <PhCalendarCheck :size="16" weight="fill" />
          Study Plan
        </RouterLink>
      </div>

    </div>

    <!-- ── REVIEW PANEL (explanation + AI tutor) ── -->
    <Transition name="fade">
      <div v-if="reviewQuestion" class="panel-overlay" @click="reviewQuestion = null"></div>
    </Transition>

    <ExplanationPanel
      v-if="reviewQuestion"
      :visible="true"
      :explanation="reviewQuestion.explanation"
      :correctIndex="reviewQuestion.correctIndex"
      :correctOption="reviewQuestion.options[reviewQuestion.correctIndex]"
      :locked="!userStore.isPremium"
      :questionText="reviewQuestion.text"
      :subject="reviewQuestion.subject"
      :topic="reviewQuestion.topic"
      :year="reviewQuestion.year"
      :options="reviewQuestion.options"
      @close="reviewQuestion = null"
    />

  </div>

  <!-- No session fallback -->
  <div v-else class="no-session">
    <p>No exam results found.</p>
    <RouterLink to="/practice" class="btn-primary">Start a Practice</RouterLink>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhHouse, PhCheckCircle, PhXCircle, PhMinusCircle,
  PhTimer, PhTrendUp, PhStar, PhWarning, PhLightning,
  PhArrowsClockwise, PhCalendarCheck
} from '@phosphor-icons/vue'
import { useExamStore }     from '@/stores/exam'
import { useUserStore }     from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { SUBJECT_CONFIG }   from '@/data/questions'
import ExplanationPanel     from '@/components/exam/ExplanationPanel.vue'
import dayjs from 'dayjs'

const route         = useRoute()
const router        = useRouter()
const examStore     = useExamStore()
const userStore     = useUserStore()
const progressStore = useProgressStore()
const subjectConfig = SUBJECT_CONFIG

const reviewQuestion = ref(null)

// ── Find the session from history
const session = computed(() => {
  const id = route.params.sessionId
  return examStore.history.find(h => h.id === id) || examStore.history[0] || null
})

const result = computed(() => session.value?.result || { correct: 0, wrong: 0, unanswered: 0, total: 0, bySubject: {} })

const pct = computed(() => result.value.total > 0
  ? Math.round((result.value.correct / result.value.total) * 100)
  : 0
)

// ── Emoji & message based on score
const emoji = computed(() => {
  if (pct.value >= 80) return '🏆'
  if (pct.value >= 65) return '🎉'
  if (pct.value >= 50) return '👍'
  return '💪'
})

const message = computed(() => {
  if (pct.value >= 80) return 'Outstanding Performance!'
  if (pct.value >= 65) return 'Excellent Work!'
  if (pct.value >= 50) return 'Good Effort!'
  return 'Keep Pushing — You\'re Improving!'
})

const betterThan = computed(() => {
  // Simulated percentile
  if (pct.value >= 80) return 92
  if (pct.value >= 65) return 73
  if (pct.value >= 50) return 51
  return 28
})

// ── Time taken
const timeTaken = computed(() => {
  if (!session.value) return '--'
  const secs = Math.round((session.value.submittedAt - session.value.startedAt) / 1000)
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `${m}m ${s}s`
})

// ── Subject breakdown
const subjectBreakdown = computed(() => Object.entries(result.value.bySubject || {}))

// ── XP
const xpEarned = computed(() => 50 + result.value.correct * 2)
const xpProgress = computed(() => {
  const xpInLevel = progressStore.xp % 500
  return (xpInLevel / 500) * 100
})

function formatTopic(t) {
  return (t || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

function openReview(q, i) {
  reviewQuestion.value = q
}
</script>

<style scoped>
.results-view {
  min-height: 100vh;
  background: var(--bg);
  max-width: 480px;
  margin: 0 auto;
}

/* ── HERO ── */
.results-hero {
  background: var(--navy);
  padding: 56px 20px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(0,200,83,0.2) 0%, transparent 70%);
  top: -80px; left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}
.results-back {
  position: absolute;
  top: 16px; left: 16px;
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  color: white;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer;
  transition: background 0.2s;
}
.results-back:hover { background: rgba(255,255,255,0.2); }

.hero-body { position: relative; z-index: 1; }
.result-emoji { font-size: 52px; margin-bottom: 8px; }
.result-score {
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 800;
  color: var(--green);
  line-height: 1;
  margin-bottom: 4px;
}
.result-total  { color: rgba(255,255,255,0.4); font-size: 16px; margin-bottom: 10px; }
.result-msg {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 700;
  color: white;
  margin-bottom: 12px;
}
.result-pct-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(0,200,83,0.15);
  color: var(--green);
  padding: 7px 16px;
  border-radius: 20px;
  font-size: 12.5px;
  font-weight: 600;
}

/* ── BODY ── */
.results-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* ── STAT TILES ── */
.stat-tiles {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}
.stat-tile {
  background: white;
  border-radius: 14px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  box-shadow: var(--shadow);
}
.stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-icon.green { background: var(--green-soft); color: var(--green); }
.stat-icon.red   { background: var(--red-soft); color: var(--red); }
.stat-icon.gold  { background: var(--gold-soft); color: var(--gold-dark); }
.stat-icon.muted { background: var(--grey); color: var(--muted); }
.stat-val { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text); }
.stat-lbl { font-size: 10px; color: var(--muted); font-weight: 500; }

/* ── SECTION CARD ── */
.section-card {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--shadow);
}
.card-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin-bottom: 14px;
  display: flex;
  align-items: center;
  gap: 7px;
}
.warn-icon { color: var(--gold-dark); }
.card-sub { font-size: 13px; color: var(--muted); margin-top: -8px; margin-bottom: 14px; }

/* ── SUBJECT BREAKDOWN ── */
.subject-breakdown { display: flex; flex-direction: column; gap: 12px; }
.sb-row { display: flex; align-items: center; gap: 10px; }
.sb-info { width: 130px; flex-shrink: 0; display: flex; flex-direction: column; gap: 2px; }
.sb-name { font-size: 13px; font-weight: 500; color: var(--text); }
.sb-score { font-family: var(--font-display); font-size: 11px; font-weight: 700; }
.sb-bar-track { flex: 1; height: 7px; background: var(--border); border-radius: 4px; overflow: hidden; }
.sb-bar-fill  { height: 100%; border-radius: 4px; transition: width 1s ease; }
.sb-pct { font-size: 12px; font-weight: 600; color: var(--muted); width: 34px; text-align: right; }

/* ── XP BANNER ── */
.xp-banner {
  background: linear-gradient(135deg, var(--navy-mid), var(--navy-light));
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  overflow: hidden;
}
.xp-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  background: rgba(255,184,0,0.15);
  color: var(--gold);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.xp-text { flex: 1; }
.xp-text strong { display: block; color: white; font-size: 14px; margin-bottom: 3px; }
.xp-text span   { color: rgba(255,255,255,0.45); font-size: 12px; }
.xp-bar-wrap {
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: rgba(255,255,255,0.1);
}
.xp-bar-fill { height: 100%; background: var(--gold); border-radius: 0 2px 2px 0; }

/* ── WEAK AREAS ── */
.weak-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.weak-item { display: flex; align-items: center; gap: 12px; }
.weak-info { flex: 1; }
.weak-name    { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
.weak-subject { font-size: 11.5px; color: var(--muted); }
.weak-pct-wrap { display: flex; align-items: center; gap: 8px; }
.weak-bar  { width: 80px; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.weak-fill { height: 100%; background: var(--red); border-radius: 3px; }
.weak-pct  { font-size: 12px; font-weight: 700; color: var(--red); width: 30px; text-align: right; }

.drill-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: 100%;
  padding: 12px;
  background: var(--green-soft);
  color: var(--green-dark);
  border-radius: 12px;
  font-size: 13.5px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}
.drill-btn:hover { background: var(--green); color: white; }

/* ── REVIEW LIST ── */
.review-list { display: flex; flex-direction: column; gap: 8px; }
.review-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}
.review-item:hover { border-color: var(--green); transform: translateX(4px); }
.review-item.correct   { border-color: rgba(0,200,83,0.25); background: rgba(0,200,83,0.04); }
.review-item.wrong     { border-color: rgba(255,68,68,0.25); background: rgba(255,68,68,0.04); }
.review-item.unanswered{ opacity: 0.6; }

.review-num {
  width: 28px; height: 28px;
  border-radius: 8px;
  background: var(--grey);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--muted);
  flex-shrink: 0;
}
.review-info { flex: 1; }
.review-subj  { display: block; font-size: 13px; font-weight: 600; color: var(--text); }
.review-topic { font-size: 11.5px; color: var(--muted); }
.status-correct { color: var(--green); }
.status-wrong   { color: var(--red); }
.status-skip    { color: var(--muted); }

/* ── ACTIONS ── */
.results-actions { display: flex; gap: 10px; }
.btn-retry, .btn-plan {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 14px;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s;
}
.btn-retry { background: var(--navy); color: white; }
.btn-plan  { background: var(--green); color: white; box-shadow: 0 4px 16px rgba(0,200,83,0.3); }
.btn-retry:hover { opacity: 0.9; }
.btn-plan:hover  { transform: translateY(-2px); }

/* Panel overlay */
.panel-overlay {
  position: fixed; inset: 0;
  background: rgba(10,15,44,0.5);
  backdrop-filter: blur(3px);
  z-index: 190;
}

/* No session */
.no-session {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 24px;
}
.btn-primary {
  padding: 14px 28px;
  background: var(--green);
  color: white;
  border-radius: 14px;
  text-decoration: none;
  font-weight: 700;
}

.fade-enter-active { transition: opacity 0.2s; }
.fade-enter-from   { opacity: 0; }
</style>
