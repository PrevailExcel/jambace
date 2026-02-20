<template>
  <div class="dashboard">

    <!-- ── HEADER CARD ── -->
    <div class="dash-header">
      <div class="dash-header-top">
        <div>
          <p class="greeting">{{ greeting }} 👋</p>
          <h1 class="user-name">{{ firstName }} <span class="name-accent">{{ lastName }}</span></h1>
        </div>
        <RouterLink to="/profile" class="avatar-btn">
          <span class="avatar-initials">{{ initials }}</span>
        </RouterLink>
      </div>

      <!-- Exam countdown -->
      <div v-if="userStore.daysToExam !== null" class="exam-countdown">
        <div class="countdown-item">
          <span class="c-val">{{ userStore.daysToExam }}</span>
          <span class="c-lbl">Days to Exam</span>
        </div>
        <div class="c-divider"></div>
        <div class="countdown-item">
          <span class="c-val">{{ userStore.targetScore }}</span>
          <span class="c-lbl">Target Score</span>
        </div>
        <div class="c-divider"></div>
        <div class="countdown-item">
          <span class="c-val green">{{ progressStore.streak }}</span>
          <span class="c-lbl">Day Streak 🔥</span>
        </div>
      </div>
    </div>

    <!-- ── TRIAL BANNER ── -->
    <Transition name="fade">
      <div v-if="userStore.isInTrial && !userStore.isFullPremium" class="trial-banner">
        <PhClock :size="16" weight="fill" />
        <span><strong>{{ userStore.trialDaysLeft }} days</strong> of free trial remaining</span>
        <RouterLink to="/upgrade" class="trial-upgrade">Upgrade →</RouterLink>
      </div>
    </Transition>

    <!-- ── STREAK BANNER ── -->
    <div v-if="progressStore.streak >= 2" class="streak-banner">
      <div class="streak-fire">🔥</div>
      <div class="streak-text">
        <strong>{{ progressStore.streak }}-Day Streak!</strong>
        <span>Keep it up — practice today to protect your streak</span>
      </div>
      <PhCaretRight :size="18" weight="bold" class="streak-arrow" />
    </div>

    <!-- ── QUICK ACTIONS ── -->
    <div class="section-label">Quick Practice</div>
    <div class="quick-grid">
      <RouterLink
        v-for="action in quickActions"
        :key="action.label"
        :to="action.to"
        class="quick-card"
        :style="{ background: action.bg }"
      >
        <div class="quick-icon">
          <component :is="action.icon" :size="28" weight="fill" />
        </div>
        <div class="quick-title">{{ action.label }}</div>
        <div class="quick-sub">{{ action.sub }}</div>
      </RouterLink>
    </div>

    <!-- ── SUBJECT PROGRESS ── -->
    <div class="section-label">Subject Progress</div>
    <div class="subject-list">
      <div
        v-for="subj in subjectProgress"
        :key="subj.id"
        class="subject-card"
      >
        <div class="subj-icon" :style="{ background: subj.bg }">
          <component :is="subj.icon" :size="20" weight="fill" :style="{ color: subj.color }" />
        </div>
        <div class="subj-info">
          <div class="subj-name">{{ subj.label }}</div>
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: subj.pct + '%', background: subj.color }"
            ></div>
          </div>
        </div>
        <span class="subj-pct" :style="{ color: subj.color }">{{ subj.pct }}%</span>
      </div>
    </div>

    <!-- ── WEEKLY SCORE TREND ── -->
    <div v-if="weeklyData.length > 1" class="section-label">Score Trend</div>
    <div v-if="weeklyData.length > 1" class="score-chart-card">
      <div class="chart-header">
        <span class="chart-title">Last {{ weeklyData.length }} Sessions</span>
        <span class="chart-avg">Avg: <strong>{{ avgScore }}</strong></span>
      </div>
      <div class="mini-chart">
        <div
          v-for="(d, i) in weeklyData"
          :key="i"
          class="chart-bar-wrap"
          :title="`Session ${i + 1}: ${d.score}/${d.total}`"
        >
          <div
            class="chart-bar"
            :style="{
              height: `${(d.score / d.total) * 100}%`,
              background: d.score / d.total >= 0.7 ? 'var(--green)' : d.score / d.total >= 0.5 ? 'var(--gold)' : 'var(--red)'
            }"
          ></div>
        </div>
      </div>
    </div>

    <!-- ── LEADERBOARD ── -->
    <div class="section-label">Your Ranking</div>
    <div class="leaderboard-card">
      <div v-for="(entry, i) in leaderboard" :key="entry.name" class="lb-row" :class="{ me: entry.isMe }">
        <span class="lb-rank" :class="['gold', 'silver', 'bronze'][i] || ''">{{ i + 1 }}</span>
        <div class="lb-avatar">{{ entry.avatar }}</div>
        <span class="lb-name">{{ entry.name }}</span>
        <span class="lb-score">{{ entry.score }}</span>
      </div>
      <RouterLink to="/community" class="lb-see-all">
        See full leaderboard <PhArrowRight :size="13" weight="bold" />
      </RouterLink>
    </div>

    <!-- ── AI TUTOR PROMO (non-premium) ── -->
    <RouterLink
      v-if="!userStore.isFullPremium"
      to="/upgrade"
      class="promo-card"
    >
      <div class="promo-icon"><PhRobot :size="22" weight="fill" /></div>
      <div class="promo-text">
        <strong>AI Tutor available</strong>
        <span>Ask follow-up questions after any explanation</span>
      </div>
      <PhCaretRight :size="16" weight="bold" />
    </RouterLink>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhLightning, PhBooks, PhTarget, PhUsers,
  PhCaretRight, PhArrowRight, PhClock, PhRobot,
  PhCalculator, PhAtom, PhDna, PhBookOpen
} from '@phosphor-icons/vue'
import { useUserStore }     from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { SUBJECT_CONFIG }   from '@/data/questions'
import dayjs from 'dayjs'

const userStore     = useUserStore()
const progressStore = useProgressStore()

// ── Greeting
const greeting = computed(() => {
  const h = dayjs().hour()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
})

const nameParts = computed(() => (userStore.profile?.name || 'Student').split(' '))
const firstName  = computed(() => nameParts.value[0])
const lastName   = computed(() => nameParts.value.slice(1).join(' '))
const initials   = computed(() => nameParts.value.map(n => n[0]).join('').slice(0, 2).toUpperCase())

// ── Quick actions
const quickActions = [
  { label: 'Mock Exam',      sub: '60-min simulation', to: '/exam/mock',       icon: PhLightning, bg: 'linear-gradient(135deg, #00952E, #00C853)' },
  { label: 'Past Questions', sub: '1985–2024 archive', to: '/practice',        icon: PhBooks,     bg: 'linear-gradient(135deg, #131A45, #1E2B6B)' },
  { label: 'Weak Areas',     sub: 'Drill your gaps',   to: '/exam/weak-areas', icon: PhTarget,    bg: 'linear-gradient(135deg, #E65100, #FFB800)' },
  { label: 'Challenge',      sub: 'Battle a friend',   to: '/community',       icon: PhUsers,     bg: 'linear-gradient(135deg, #4A148C, #7B1FA2)' },
]

// ── Subject progress
const subjectIcons = { english: PhBookOpen, mathematics: PhCalculator, chemistry: PhAtom, biology: PhDna, physics: PhAtom }

const subjectProgress = computed(() =>
  (userStore.subjects || []).map(id => {
    const cfg   = SUBJECT_CONFIG[id] || {}
    const stats = progressStore.subjectStats[id]
    const pct   = stats?.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100) : 0
    return {
      id,
      label: cfg.label || id,
      color: cfg.color || 'var(--green)',
      bg:    cfg.bg    || 'var(--grey)',
      icon:  subjectIcons[id] || PhBookOpen,
      pct
    }
  })
)

// ── Weekly scores
const weeklyData = computed(() => progressStore.weeklyScores.slice(-7))
const avgScore   = computed(() => {
  if (!weeklyData.value.length) return 0
  const avg = weeklyData.value.reduce((s, d) => s + (d.score / d.total) * 100, 0) / weeklyData.value.length
  return Math.round(avg) + '%'
})

// ── Mock leaderboard
const leaderboard = computed(() => [
  { name: 'Adaeze O.',  score: 289, avatar: '👦🏾', isMe: false },
  { name: 'Tunde B.',   score: 274, avatar: '👧🏿', isMe: false },
  { name: 'Ngozi A.',   score: 261, avatar: '👦🏽', isMe: false },
  { name: userStore.profile?.name?.split(' ')[0] + ' (You)', score: progressStore.weakTopics.length ? 240 : 247, avatar: '😊', isMe: true },
].slice(0, 4))
</script>

<style scoped>
.dashboard {
  padding: 0 16px 24px;
}

/* ── HEADER ── */
.dash-header {
  background: var(--navy);
  border-radius: 22px;
  padding: 22px 20px 20px;
  margin: 16px 0 14px;
  position: relative;
  overflow: hidden;
}
.dash-header::after {
  content: '';
  position: absolute;
  width: 200px; height: 200px;
  background: radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%);
  bottom: -60px; right: -40px;
  pointer-events: none;
}

.dash-header-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 18px;
}

.greeting { color: rgba(255,255,255,0.5); font-size: 13px; margin-bottom: 4px; }
.user-name { font-family: var(--font-display); font-size: 22px; font-weight: 700; color: white; }
.name-accent { color: var(--green); }

.avatar-btn {
  width: 42px; height: 42px;
  border-radius: 12px;
  background: rgba(255,255,255,0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  flex-shrink: 0;
}
.avatar-initials {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: white;
}

.exam-countdown {
  display: flex;
  align-items: center;
  justify-content: space-around;
  background: rgba(255,255,255,0.07);
  border-radius: 12px;
  padding: 12px;
}

.countdown-item { display: flex; flex-direction: column; align-items: center; gap: 3px; }
.c-val { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: white; }
.c-val.green { color: var(--green); }
.c-lbl { font-size: 11px; color: rgba(255,255,255,0.45); font-weight: 500; }
.c-divider { width: 1px; height: 32px; background: rgba(255,255,255,0.1); }

/* ── TRIAL BANNER ── */
.trial-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--gold-soft);
  border: 1px solid rgba(255,184,0,0.3);
  border-radius: 12px;
  padding: 11px 14px;
  font-size: 13px;
  color: var(--gold-dark);
  margin-bottom: 12px;
}
.trial-upgrade { margin-left: auto; font-weight: 700; color: var(--gold-dark); }

/* ── STREAK ── */
.streak-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: linear-gradient(120deg, #FF6B00, var(--gold));
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 12px;
  cursor: pointer;
}
.streak-fire { font-size: 30px; flex-shrink: 0; }
.streak-text { flex: 1; }
.streak-text strong { display: block; color: white; font-family: var(--font-display); font-size: 15px; }
.streak-text span   { color: rgba(255,255,255,0.75); font-size: 12px; }
.streak-arrow { color: rgba(255,255,255,0.6); flex-shrink: 0; }

/* ── SECTION LABEL ── */
.section-label {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: var(--text);
  margin: 16px 0 10px;
}

/* ── QUICK GRID ── */
.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 4px;
}

.quick-card {
  border-radius: 16px;
  padding: 18px 14px;
  text-decoration: none;
  display: flex;
  flex-direction: column;
  gap: 8px;
  transition: all 0.2s;
  position: relative;
  overflow: hidden;
}
.quick-card:hover { transform: translateY(-3px); }

.quick-icon { color: rgba(255,255,255,0.9); }
.quick-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: white; }
.quick-sub   { font-size: 11.5px; color: rgba(255,255,255,0.6); }

/* ── SUBJECTS ── */
.subject-list { display: flex; flex-direction: column; gap: 10px; }
.subject-card {
  background: white;
  border-radius: 12px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  box-shadow: var(--shadow);
}
.subj-icon {
  width: 40px; height: 40px;
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.subj-info { flex: 1; }
.subj-name { font-weight: 600; font-size: 13.5px; color: var(--text); margin-bottom: 7px; }
.progress-bar { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; }
.progress-fill { height: 100%; border-radius: 3px; transition: width 1s ease; }
.subj-pct { font-family: var(--font-display); font-size: 14px; font-weight: 700; }

/* ── SCORE CHART ── */
.score-chart-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
  margin-bottom: 4px;
}
.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.chart-title { font-size: 13px; font-weight: 600; color: var(--muted); }
.chart-avg   { font-size: 13px; color: var(--text); }
.chart-avg strong { color: var(--green); }
.mini-chart {
  height: 60px;
  display: flex;
  align-items: flex-end;
  gap: 5px;
}
.chart-bar-wrap { flex: 1; height: 100%; display: flex; align-items: flex-end; }
.chart-bar {
  width: 100%;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
  transition: height 0.5s ease;
}

/* ── LEADERBOARD ── */
.leaderboard-card {
  background: white;
  border-radius: 16px;
  padding: 16px;
  box-shadow: var(--shadow);
}
.lb-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 10px;
  margin-bottom: 4px;
  transition: background 0.2s;
}
.lb-row.me { background: var(--green-soft); }
.lb-rank { font-family: var(--font-display); font-size: 15px; font-weight: 800; width: 20px; text-align: center; }
.lb-rank.gold   { color: #FFB800; }
.lb-rank.silver { color: #A0A0A0; }
.lb-rank.bronze { color: #CD7F32; }
.lb-avatar { font-size: 22px; }
.lb-name { flex: 1; font-size: 13.5px; font-weight: 500; color: var(--text); }
.lb-score { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--navy); }
.lb-see-all {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding-top: 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--green-dark);
  text-decoration: none;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}

/* ── PROMO ── */
.promo-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--navy);
  border-radius: 16px;
  padding: 16px;
  margin-top: 14px;
  text-decoration: none;
  transition: opacity 0.2s;
}
.promo-card:hover { opacity: 0.9; }
.promo-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  background: rgba(0,200,83,0.15);
  color: var(--green);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.promo-text { flex: 1; }
.promo-text strong { display: block; color: white; font-size: 14px; margin-bottom: 3px; }
.promo-text span   { color: rgba(255,255,255,0.45); font-size: 12px; }
.promo-card > svg  { color: rgba(255,255,255,0.35); flex-shrink: 0; }

.fade-enter-active { transition: opacity 0.3s; }
.fade-enter-from   { opacity: 0; }
</style>
