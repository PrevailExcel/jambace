<template>
  <div class="plan-view">

    <!-- ── COUNTDOWN HEADER ── -->
    <div class="plan-header">
      <h1 class="page-title">Study Plan</h1>
      <div class="countdown-strip" v-if="userStore.daysToExam !== null">
        <div class="cs-item">
          <span class="cs-val">{{ userStore.daysToExam }}</span>
          <span class="cs-lbl">Days Left</span>
        </div>
        <div class="cs-bar">
          <div class="cs-fill" :style="{ width: examProgress + '%' }"></div>
        </div>
        <div class="cs-item right">
          <span class="cs-val green">{{ Math.round(examProgress) }}%</span>
          <span class="cs-lbl">Prep Done</span>
        </div>
      </div>
    </div>

    <!-- ── NO EXAM DATE ── -->
    <div v-if="userStore.daysToExam === null" class="no-date-card">
      <PhCalendar :size="32" weight="fill" class="nd-icon" />
      <strong>Set your exam date</strong>
      <p>We need your JAMB exam date to build your personalised daily plan.</p>
      <RouterLink to="/setup" class="btn-set-date">Set Exam Date</RouterLink>
    </div>

    <template v-else>

      <!-- ── TODAY'S PLAN ── -->
      <div class="today-section">
        <div class="today-header">
          <div>
            <div class="today-label">Today · {{ todayDate }}</div>
            <div class="today-xp">{{ todayXp }} XP available today</div>
          </div>
          <div class="today-progress-ring" :style="{ '--p': todayPct }">
            <span class="ring-val">{{ completedToday }}/{{ todayTasks.length }}</span>
          </div>
        </div>

        <div class="task-list">
          <div
            v-for="task in todayTasks"
            :key="task.id"
            class="task-item"
            :class="{ done: task.done }"
            @click="toggleTask(task)"
          >
            <div class="task-check" :style="task.done ? { background: task.color, borderColor: task.color } : { borderColor: task.color }">
              <PhCheck v-if="task.done" :size="13" weight="bold" />
            </div>
            <div class="task-body">
              <div class="task-name">{{ task.name }}</div>
              <div class="task-meta">
                <span class="task-subject" :style="{ color: task.color }">{{ task.subject }}</span>
                <span class="task-time">
                  <PhClock :size="11" weight="fill" /> {{ task.mins }} min
                </span>
              </div>
            </div>
            <div class="task-xp">+{{ task.xp }} XP</div>
            <component :is="task.icon" :size="18" weight="fill" class="task-type-icon" :style="{ color: task.color }" />
          </div>
        </div>
      </div>

      <!-- ── WEAK AREAS ALERT ── -->
      <div v-if="progressStore.weakTopics.length" class="weak-alert">
        <div class="wa-icon"><PhWarning :size="18" weight="fill" /></div>
        <div class="wa-text">
          <strong>{{ progressStore.weakTopics.length }} weak area{{ progressStore.weakTopics.length !== 1 ? 's' : '' }} detected</strong>
          <span>Your plan has been adjusted to focus on these topics first.</span>
        </div>
        <RouterLink to="/practice" class="wa-link"><PhArrowRight :size="14" weight="bold" /></RouterLink>
      </div>

      <!-- ── WEEKLY VIEW ── -->
      <div class="week-section">
        <div class="week-header">
          <h3 class="section-title">This Week</h3>
          <span class="week-range">{{ weekRange }}</span>
        </div>
        <div class="week-grid">
          <div
            v-for="day in weekDays"
            :key="day.label"
            class="week-day"
            :class="{
              today:   day.isToday,
              past:    day.isPast,
              future:  day.isFuture,
              done:    day.done
            }"
          >
            <span class="wd-label">{{ day.label }}</span>
            <div class="wd-dot">
              <PhCheckCircle v-if="day.done"    :size="18" weight="fill" class="wd-done" />
              <PhCircle      v-else-if="day.isToday" :size="18" weight="fill" class="wd-today" />
              <PhCircle      v-else              :size="18" weight="regular" class="wd-empty" />
            </div>
            <span class="wd-xp">{{ day.done || day.isPast ? day.xp + 'xp' : '' }}</span>
          </div>
        </div>
      </div>

      <!-- ── SUBJECT ALLOCATION ── -->
      <div class="section-card">
        <h3 class="section-title">Daily Subject Split</h3>
        <p class="section-sub">Based on your weak areas and target score of {{ userStore.targetScore }}.</p>
        <div class="subject-alloc-list">
          <div
            v-for="alloc in subjectAllocation"
            :key="alloc.id"
            class="alloc-item"
          >
            <div class="alloc-color" :style="{ background: alloc.color }"></div>
            <span class="alloc-name">{{ alloc.label }}</span>
            <div class="alloc-bar-track">
              <div class="alloc-bar-fill" :style="{ width: alloc.pct + '%', background: alloc.color }"></div>
            </div>
            <span class="alloc-mins">{{ alloc.mins }}min</span>
          </div>
        </div>
      </div>

      <!-- ── XP STREAK ── -->
      <div class="xp-card">
        <div class="xp-card-top">
          <div class="xp-icon"><PhStar :size="22" weight="fill" /></div>
          <div class="xp-info">
            <strong>Level {{ progressStore.level }}</strong>
            <span>{{ progressStore.xp }} XP total · {{ progressStore.xpToNextLevel }} XP to Level {{ progressStore.level + 1 }}</span>
          </div>
          <div class="streak-badge" v-if="progressStore.streak > 0">
            🔥 {{ progressStore.streak }}
          </div>
        </div>
        <div class="xp-level-bar">
          <div class="xp-level-fill" :style="{ width: xpLevelPct + '%' }"></div>
        </div>
      </div>

    </template>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  PhCalendar, PhCheck, PhCheckCircle, PhCircle,
  PhClock, PhWarning, PhArrowRight, PhStar,
  PhBooks, PhLightning, PhTarget
} from '@phosphor-icons/vue'
import { useUserStore }     from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { SUBJECT_CONFIG }   from '@/data/questions'
import dayjs from 'dayjs'

const userStore     = useUserStore()
const progressStore = useProgressStore()

// ── Exam progress %
const examProgress = computed(() => {
  if (!userStore.daysToExam || !userStore.examDate) return 0
  const total = dayjs(userStore.examDate).diff(userStore.trialStartDate || dayjs().subtract(14, 'day'), 'day')
  const done  = total - userStore.daysToExam
  return Math.min(100, Math.max(0, (done / total) * 100))
})

const todayDate = dayjs().format('dddd, D MMMM')
const weekRange = `${dayjs().startOf('week').format('D MMM')} – ${dayjs().endOf('week').format('D MMM')}`

// ── Generate today's tasks based on subjects + weak areas
const todayTasks = computed(() => {
  const subjects = userStore.subjects.length ? userStore.subjects : ['english', 'mathematics']
  const weakTopics = progressStore.weakTopics

  const tasks = []

  // Always: a mock/practice warm-up
  tasks.push({
    id:      'warmup',
    name:    '10-Question Warm-Up',
    subject: 'All Subjects',
    color:   'var(--navy)',
    icon:    PhLightning,
    mins:    15,
    xp:      30,
    done:    false
  })

  // Weak area drill (if any)
  if (weakTopics.length > 0) {
    const w = weakTopics[0]
    tasks.push({
      id:      'weak-' + w.topic,
      name:    `Drill: ${w.topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}`,
      subject: SUBJECT_CONFIG[w.subject]?.label || w.subject,
      color:   SUBJECT_CONFIG[w.subject]?.color || 'var(--red)',
      icon:    PhTarget,
      mins:    20,
      xp:      50,
      done:    false
    })
  }

  // Subject revision tasks
  subjects.slice(0, 3).forEach((subj, i) => {
    const cfg = SUBJECT_CONFIG[subj]
    tasks.push({
      id:      `subj-${subj}`,
      name:    `${cfg?.label || subj} Past Questions`,
      subject: cfg?.label || subj,
      color:   cfg?.color || 'var(--green)',
      icon:    PhBooks,
      mins:    25,
      xp:      40,
      done:    false
    })
  })

  return tasks.map((t, i) => ({ ...t, done: i === 0 && progressStore.streak > 0 }))
})

const completedToday = computed(() => todayTasks.value.filter(t => t.done).length)
const todayPct       = computed(() => todayTasks.value.length > 0 ? (completedToday.value / todayTasks.value.length) * 100 : 0)
const todayXp        = computed(() => todayTasks.value.reduce((s, t) => s + t.xp, 0))

// Task toggle (local state only — no backend yet)
const completedIds = ref(new Set(todayTasks.value.filter(t => t.done).map(t => t.id)))
function toggleTask(task) {
  if (completedIds.value.has(task.id)) completedIds.value.delete(task.id)
  else completedIds.value.add(task.id)
  task.done = completedIds.value.has(task.id)
}

// ── Week grid
const weekDays = computed(() => {
  const start = dayjs().startOf('week')
  return Array.from({ length: 7 }, (_, i) => {
    const d = start.add(i, 'day')
    const isPast    = d.isBefore(dayjs(), 'day')
    const isToday   = d.isSame(dayjs(), 'day')
    const isFuture  = d.isAfter(dayjs(), 'day')
    return {
      label:    d.format('ddd'),
      isToday, isPast, isFuture,
      done:     isPast, // TODO: use progressStore.dailyLog
      xp:       isPast ? Math.floor(Math.random() * 80) + 40 : 0
    }
  })
})

// ── Subject allocation — emphasise weak subjects
const subjectAllocation = computed(() => {
  const subjects = userStore.subjects.length ? userStore.subjects : ['english', 'mathematics']
  const totalMins = 90
  const weakSubjects = new Set(progressStore.weakTopics.map(w => w.subject))

  return subjects.map(id => {
    const cfg     = SUBJECT_CONFIG[id] || {}
    const isWeak  = weakSubjects.has(id)
    const weight  = isWeak ? 1.6 : 1
    const totalWeight = subjects.reduce((s, sid) => s + (weakSubjects.has(sid) ? 1.6 : 1), 0)
    const mins    = Math.round((weight / totalWeight) * totalMins)
    const pct     = Math.round((mins / totalMins) * 100)
    return { id, label: cfg.label || id, color: cfg.color || '#00C853', mins, pct }
  })
})

// ── XP progress
const xpLevelPct = computed(() => {
  const xpInLevel = progressStore.xp % 500
  return (xpInLevel / 500) * 100
})
</script>

<style scoped>
.plan-view { padding: 0 16px 32px; }

/* ── HEADER ── */
.plan-header { padding-top: 16px; margin-bottom: 16px; }
.page-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 14px; }

.countdown-strip {
  background: var(--navy);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.cs-item { display: flex; flex-direction: column; align-items: center; flex-shrink: 0; }
.cs-item.right { align-items: flex-end; }
.cs-val { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: white; }
.cs-val.green { color: var(--green); }
.cs-lbl { font-size: 10.5px; color: rgba(255,255,255,0.45); font-weight: 500; margin-top: 2px; }
.cs-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.cs-fill { height: 100%; background: var(--green); border-radius: 3px; transition: width 1s ease; }

/* ── NO DATE ── */
.no-date-card {
  background: white;
  border-radius: 18px;
  padding: 32px 20px;
  text-align: center;
  box-shadow: var(--shadow);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}
.nd-icon { color: var(--gold-dark); }
.no-date-card strong { font-family: var(--font-display); font-size: 18px; font-weight: 700; }
.no-date-card p { font-size: 14px; color: var(--muted); line-height: 1.55; }
.btn-set-date {
  margin-top: 8px;
  padding: 12px 28px;
  background: var(--navy);
  color: white;
  border-radius: 12px;
  text-decoration: none;
  font-weight: 700;
  font-size: 14px;
}

/* ── TODAY ── */
.today-section {
  background: white;
  border-radius: 18px;
  padding: 18px;
  box-shadow: var(--shadow-md);
  margin-bottom: 12px;
}

.today-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.today-label { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); }
.today-xp    { font-size: 12px; color: var(--muted); margin-top: 3px; }

/* Progress ring via CSS custom property */
.today-progress-ring {
  width: 52px; height: 52px;
  border-radius: 50%;
  background: conic-gradient(var(--green) calc(var(--p) * 1%), var(--border) 0);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  position: relative;
}
.today-progress-ring::before {
  content: '';
  position: absolute;
  inset: 6px;
  background: white;
  border-radius: 50%;
}
.ring-val {
  position: relative; z-index: 1;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  color: var(--text);
}

/* ── TASKS ── */
.task-list { display: flex; flex-direction: column; gap: 10px; }
.task-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--grey);
  border-radius: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.task-item:hover { background: var(--border); }
.task-item.done { opacity: 0.6; }
.task-item.done .task-name { text-decoration: line-through; }

.task-check {
  width: 26px; height: 26px;
  border-radius: 8px;
  border: 2px solid;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
  color: white;
  transition: all 0.2s;
}

.task-body { flex: 1; }
.task-name { font-size: 13.5px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.task-meta { display: flex; align-items: center; gap: 10px; }
.task-subject { font-size: 11.5px; font-weight: 600; }
.task-time {
  display: flex; align-items: center; gap: 3px;
  font-size: 11.5px; color: var(--muted);
}

.task-xp {
  font-family: var(--font-display);
  font-size: 12px;
  font-weight: 700;
  color: var(--gold-dark);
  white-space: nowrap;
}

.task-type-icon { flex-shrink: 0; }

/* ── WEAK ALERT ── */
.weak-alert {
  display: flex;
  align-items: center;
  gap: 12px;
  background: var(--gold-soft);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 12px;
}
.wa-icon {
  width: 38px; height: 38px;
  border-radius: 11px;
  background: var(--gold);
  color: white;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.wa-text { flex: 1; }
.wa-text strong { display: block; font-size: 13.5px; color: var(--gold-dark); margin-bottom: 3px; }
.wa-text span   { font-size: 12px; color: var(--muted); }
.wa-link {
  width: 32px; height: 32px;
  border-radius: 9px;
  background: white;
  display: flex; align-items: center; justify-content: center;
  color: var(--gold-dark);
  box-shadow: var(--shadow);
}

/* ── WEEK GRID ── */
.week-section { background: white; border-radius: 16px; padding: 16px; box-shadow: var(--shadow); margin-bottom: 12px; }
.week-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.week-range { font-size: 12px; color: var(--muted); }
.section-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); }
.section-sub   { font-size: 13px; color: var(--muted); margin-top: 10px; margin-bottom: 14px; }

.week-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 4px; }
.week-day {
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  padding: 6px 2px;
  border-radius: 10px;
  transition: background 0.2s;
}
.week-day.today { background: var(--green-soft); }

.wd-label { font-size: 10px; font-weight: 600; color: var(--muted); }
.wd-done  { color: var(--green); }
.wd-today { color: var(--navy); }
.wd-empty { color: var(--border); }
.wd-xp    { font-size: 9px; color: var(--muted); }

/* ── SUBJECT ALLOCATION ── */
.section-card { background: white; border-radius: 16px; padding: 16px; box-shadow: var(--shadow); margin-bottom: 12px; }
.subject-alloc-list { display: flex; flex-direction: column; gap: 10px; }
.alloc-item { display: flex; align-items: center; gap: 10px; }
.alloc-color { width: 12px; height: 12px; border-radius: 3px; flex-shrink: 0; }
.alloc-name  { font-size: 13px; font-weight: 500; color: var(--text); width: 100px; flex-shrink: 0; }
.alloc-bar-track { flex: 1; height: 7px; background: var(--border); border-radius: 4px; overflow: hidden; }
.alloc-bar-fill  { height: 100%; border-radius: 4px; transition: width 1s ease; }
.alloc-mins { font-size: 12px; font-weight: 600; color: var(--muted); width: 40px; text-align: right; flex-shrink: 0; }

/* ── XP CARD ── */
.xp-card { background: var(--navy); border-radius: 16px; padding: 16px; position: relative; overflow: hidden; }
.xp-card-top { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.xp-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  background: rgba(255,184,0,0.15);
  color: var(--gold);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.xp-info { flex: 1; }
.xp-info strong { display: block; color: white; font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.xp-info span   { color: rgba(255,255,255,0.45); font-size: 11.5px; }
.streak-badge {
  background: rgba(255,107,0,0.2);
  color: var(--gold);
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  padding: 6px 12px;
  border-radius: 20px;
}
.xp-level-bar { height: 5px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
.xp-level-fill { height: 100%; background: var(--gold); border-radius: 3px; transition: width 1s ease; }
</style>
