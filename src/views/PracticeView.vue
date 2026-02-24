<template>
  <div class="practice-view">

    <!-- ── HEADER ── -->
    <div class="practice-header">
      <h1 class="page-title">Practice</h1>
      <div class="header-tabs">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          class="htab"
          :class="{ active: activeTab === tab.id }"
          @click="activeTab = tab.id"
        >
          <component :is="tab.icon" :size="15" weight="fill" />
          {{ tab.label }}
        </button>
      </div>
    </div>

    <!-- ══ TAB: BY SUBJECT ══ -->
    <Transition name="tab-slide" mode="out-in">
      <div v-if="activeTab === 'subject'" key="subject" class="tab-content">

        <p class="tab-desc">Choose a subject and topic to drill specific areas.</p>

        <!-- Offline / no-cache note -->
        <div v-if="!networkStore.isOnline && !hasAnyCached" class="offline-note">
          <PhWifiSlash :size="14" weight="fill" />
          You're offline. Download questions while online to practise offline.
        </div>

        <div class="subject-grid">
          <div
            v-for="subj in availableSubjects"
            :key="subj.id"
            class="subj-card"
            :class="{ selected: selectedSubject === subj.id, disabled: subj.count === 0 }"
            :style="selectedSubject === subj.id ? { borderColor: subj.color, background: subj.bg } : {}"
            @click="subj.count > 0 && selectSubject(subj.id)"
          >
            <div class="subj-icon" :style="{ background: subj.bg }">
              <component :is="subj.icon" :size="24" weight="fill" :style="{ color: subj.color }" />
            </div>
            <span class="subj-name">{{ subj.label }}</span>
            <span class="subj-count" :class="{ zero: subj.count === 0 }">
              {{ subj.count > 0 ? subj.count + ' Qs' : 'Not downloaded' }}
            </span>
          </div>
        </div>

        <!-- Topic list -->
        <Transition name="fade-drop">
          <div v-if="selectedSubject && topicsForSubject.length" class="topic-section">
            <div class="topic-section-header">
              <span class="ts-title">Topics in {{ currentSubjectLabel }}</span>
              <button class="clear-btn" @click="selectedSubject = null; selectedTopic = null">Clear</button>
            </div>
            <div class="topic-list">
              <button
                v-for="topic in topicsForSubject"
                :key="topic.id"
                class="topic-chip"
                :class="{ selected: selectedTopic === topic.id }"
                @click="selectedTopic = selectedTopic === topic.id ? null : topic.id"
              >
                {{ topic.label }}
                <span class="topic-count">{{ topic.count }}</span>
              </button>
            </div>
          </div>
        </Transition>

        <!-- Year filter -->
        <div class="filter-row">
          <label class="filter-label">Year</label>
          <select v-model="selectedYear" class="filter-select">
            <option value="">All Years</option>
            <option v-for="y in yearsForSubject" :key="y" :value="y">{{ y }}</option>
          </select>
        </div>

        <!-- Difficulty filter -->
        <div class="filter-row">
          <label class="filter-label">Difficulty</label>
          <div class="difficulty-pills">
            <button
              v-for="d in difficulties"
              :key="d.id"
              class="d-pill"
              :class="{ selected: selectedDifficulty === d.id }"
              @click="selectedDifficulty = selectedDifficulty === d.id ? null : d.id"
            >{{ d.label }}</button>
          </div>
        </div>

        <div class="questions-preview" v-if="filteredCount > 0">
          <PhListNumbers :size="16" weight="fill" class="preview-icon" />
          <span><strong>{{ filteredCount }}</strong> questions match your filters</span>
        </div>

        <button class="btn-start" :disabled="!selectedSubject || filteredCount === 0" @click="startPractice">
          <PhPlay :size="16" weight="fill" />
          Start Practice Session
        </button>
      </div>

      <!-- ══ TAB: MOCK EXAM ══ -->
      <div v-else-if="activeTab === 'mock'" key="mock" class="tab-content">
        <div class="mock-card">
          <div class="mock-hero">
            <div class="mock-icon"><PhLightning :size="32" weight="fill" /></div>
            <h2 class="mock-title">UTME Full Mock</h2>
            <p class="mock-desc">Simulates the real JAMB CBT exam — 60 minutes, all 4 subjects, timed countdown. No pausing.</p>
          </div>
          <div class="mock-specs">
            <div class="spec-item">
              <PhClock :size="16" weight="fill" />
              60 minutes
            </div>
            <div class="spec-item">
              <PhListNumbers :size="16" weight="fill" />
              {{ totalMockQuestions }} questions
            </div>
            <div class="spec-item">
              <PhBooks :size="16" weight="fill" />
              {{ userStore.subjects.length || 4 }} subjects
            </div>
          </div>
          <div class="mock-rules">
            <div v-for="r in mockRules" :key="r" class="mock-rule">
              <PhInfo :size="13" weight="fill" />
              <span>{{ r }}</span>
            </div>
          </div>

          <!-- Offline: show which subjects are ready -->
          <div v-if="!networkStore.isOnline" class="offline-subjects-note">
            <PhWifiSlash :size="13" weight="fill" />
            Offline — using downloaded questions.
            <span v-if="subjectsReadyCount < (userStore.subjects.length || 4)" class="warn-text">
              Only {{ subjectsReadyCount }}/{{ userStore.subjects.length || 4 }} subjects downloaded.
            </span>
          </div>

          <button class="btn-start" :disabled="totalMockQuestions === 0" @click="startMock">
            <PhRocketLaunch :size="16" weight="fill" />
            Begin Mock Exam
          </button>

          <div v-if="!userStore.isFullPremium" class="mock-limit-note">
            <PhWarning :size="13" weight="fill" />
            Free users get 3 mock exams per week.
            <RouterLink to="/upgrade" class="limit-link">Upgrade for unlimited</RouterLink>
          </div>
        </div>

        <!-- Recent mock history -->
        <div v-if="recentMocks.length" class="recent-section">
          <h3 class="recent-title">Recent Mocks</h3>
          <div class="recent-list">
            <div v-for="m in recentMocks" :key="m.id" class="recent-item">
              <div class="recent-score" :class="scoreClass(m.result.correct / m.result.total)">
                {{ m.result.correct }}/{{ m.result.total }}
              </div>
              <div class="recent-info">
                <span class="recent-date">{{ formatDate(m.submittedAt) }}</span>
                <span class="recent-pct">{{ Math.round(m.result.correct / m.result.total * 100) }}% correct</span>
              </div>
              <RouterLink :to="`/exam/results/${m.id}`" class="recent-review">
                Review <PhArrowRight :size="12" weight="bold" />
              </RouterLink>
            </div>
          </div>
        </div>
      </div>

      <!-- ══ TAB: WEAK AREAS ══ -->
      <div v-else-if="activeTab === 'weak'" key="weak" class="tab-content">
        <div v-if="progressStore.weakTopics.length === 0" class="empty-weak">
          <div class="empty-icon">🎯</div>
          <h3>No weak areas detected yet</h3>
          <p>Complete at least 5 practice questions per topic — we'll automatically identify where you need more work.</p>
          <button class="btn-start" @click="activeTab = 'subject'">Start Practising</button>
        </div>

        <template v-else>
          <p class="tab-desc">These topics need the most attention based on your performance.</p>
          <div class="weak-list">
            <div v-for="w in progressStore.weakTopics" :key="w.topic" class="weak-card">
              <div class="weak-card-header">
                <div class="weak-subject-chip" :style="{ background: subjectConfig[w.subject]?.bg, color: subjectConfig[w.subject]?.color }">
                  {{ subjectConfig[w.subject]?.label }}
                </div>
                <span class="weak-pct-badge" :class="w.pct < 40 ? 'critical' : 'low'">{{ w.pct }}%</span>
              </div>
              <div class="weak-topic-name">{{ formatTopic(w.topic) }}</div>
              <div class="weak-bar">
                <div class="weak-bar-fill" :style="{ width: w.pct + '%' }"></div>
              </div>
              <span class="weak-attempts">{{ w.attempts }} attempts</span>
            </div>
          </div>
          <button class="btn-start" @click="startWeakDrill">
            <PhTarget :size="16" weight="fill" />
            Drill All Weak Areas
          </button>
        </template>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhBooks, PhLightning, PhTarget, PhPlay, PhRocketLaunch,
  PhListNumbers, PhClock, PhInfo, PhArrowRight, PhWarning, PhWifiSlash,
  PhCalculator, PhAtom, PhDna, PhBookOpen, PhGlobe, PhBank
} from '@phosphor-icons/vue'
import { useExamStore }      from '@/stores/exam'
import { useUserStore }      from '@/stores/user'
import { useProgressStore }  from '@/stores/progress'
import { useQuestionsStore } from '@/stores/questions'
import { useNetworkStore }   from '@/stores/network'
import { SUBJECT_CONFIG, EXAM_CONFIGS } from '@/data/questions'
import dayjs from 'dayjs'

const router          = useRouter()
const examStore       = useExamStore()
const userStore       = useUserStore()
const progressStore   = useProgressStore()
const questionsStore  = useQuestionsStore()
const networkStore    = useNetworkStore()
const subjectConfig   = SUBJECT_CONFIG

// ── Tabs
const tabs = [
  { id: 'subject', label: 'By Subject', icon: PhBooks },
  { id: 'mock',    label: 'Mock Exam',  icon: PhLightning },
  { id: 'weak',    label: 'Weak Areas', icon: PhTarget },
]
const activeTab = ref('subject')

// ── Filters
const selectedSubject    = ref(null)
const selectedTopic      = ref(null)
const selectedYear       = ref('')
const selectedDifficulty = ref(null)

const subjectIcons = {
  english: PhBookOpen, mathematics: PhCalculator,
  chemistry: PhAtom, biology: PhDna, physics: PhAtom,
  economics: PhBank, government: PhGlobe
}

// ── Subjects — count from cache, not SAMPLE_QUESTIONS
const availableSubjects = computed(() =>
  (userStore.subjects || []).map(id => {
    const cached = questionsStore.cache[id] ?? []
    return {
      id,
      ...SUBJECT_CONFIG[id],
      icon:  subjectIcons[id] || PhBooks,
      count: cached.length,
    }
  })
)

const currentSubjectLabel = computed(() =>
  availableSubjects.value.find(s => s.id === selectedSubject.value)?.label || ''
)

// ── Topics from cache for selected subject
const topicsForSubject = computed(() => {
  if (!selectedSubject.value) return []
  const qs = questionsStore.cache[selectedSubject.value] ?? []
  const map = {}
  qs.forEach(q => {
    if (!q.topic) return
    map[q.topic] = (map[q.topic] ?? 0) + 1
  })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({
      id,
      label: id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      count,
    }))
})

// ── Years from cache for selected subject
const yearsForSubject = computed(() => {
  const qs = selectedSubject.value
    ? (questionsStore.cache[selectedSubject.value] ?? [])
    : Object.values(questionsStore.cache).flat()
  return [...new Set(qs.map(q => q.year).filter(Boolean))].sort((a, b) => b - a)
})

const difficulties = [
  { id: 'easy',   label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard',   label: 'Hard' },
]

// ── Filtered count (from cache — preview only, actual fetch happens in ExamView)
const filteredCount = computed(() => {
  const qs = questionsStore.cache[selectedSubject.value] ?? []
  return qs.filter(q => {
    if (selectedTopic.value && q.topic !== selectedTopic.value)                     return false
    if (selectedYear.value  && q.year  !== parseInt(selectedYear.value))            return false
    if (selectedDifficulty.value && q.difficulty !== selectedDifficulty.value)      return false
    return true
  }).length || (selectedSubject.value ? 40 : 0) // fall back to 40 if online (API will filter)
})

// ── Mock totals
const QUESTIONS_PER_SUBJECT = EXAM_CONFIGS.mock?.questionsPerSubject ?? 10
const totalMockQuestions = computed(() =>
  (userStore.subjects || []).length * QUESTIONS_PER_SUBJECT
)

const subjectsReadyCount = computed(() =>
  (userStore.subjects || []).filter(s => (questionsStore.cache[s]?.length ?? 0) > 0).length
)

const hasAnyCached = computed(() => questionsStore.totalCachedQuestions > 0)

const mockRules = [
  'Answers cannot be changed after submission',
  'The timer runs continuously — no pausing',
  'Each correct answer scores 1 mark',
  'No penalty for wrong answers (no negative marking)',
]

const recentMocks = computed(() =>
  examStore.history.filter(h => h.type === 'mock').slice(0, 3)
)

// ── Actions — just navigate; ExamView does the fetching via questionsStore

function selectSubject(id) {
  selectedSubject.value = selectedSubject.value === id ? null : id
  selectedTopic.value   = null
  selectedYear.value    = ''
  selectedDifficulty.value = null
}

function startPractice() {
  if (!selectedSubject.value) return
  const query = { subject: selectedSubject.value }
  if (selectedTopic.value)      query.topic = selectedTopic.value
  if (selectedYear.value)       query.year  = selectedYear.value
  // ExamView will call questionsStore.fetchQuestions() with these params
  router.push({ name: 'exam', params: { type: 'practice' }, query })
}

function startMock() {
  // ExamView handles fetching for mock type automatically
  router.push({ name: 'exam', params: { type: 'mock' } })
}

function startWeakDrill() {
  const topics = progressStore.weakTopics.slice(0, 6)
  const query  = topics.length
    ? { topics: encodeURIComponent(JSON.stringify(topics)) }
    : {}
  router.push({ name: 'exam', params: { type: 'weak-areas' }, query })
}

function formatDate(ts) { return dayjs(ts).format('DD MMM') }

function scoreClass(ratio) {
  if (ratio >= 0.7) return 'score-high'
  if (ratio >= 0.5) return 'score-mid'
  return 'score-low'
}

function formatTopic(t) {
  return (t || '').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
</script>

<style scoped>
.practice-view { padding: 0 16px 24px; }

/* ── HEADER ── */
.practice-header { padding-top: 16px; margin-bottom: 16px; }
.page-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 12px; }

.header-tabs { display: flex; gap: 6px; }
.htab {
  display: flex; align-items: center; gap: 6px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.htab.active { background: var(--navy); color: white; border-color: var(--navy); }

/* ── TAB CONTENT ── */
.tab-content { display: flex; flex-direction: column; gap: 14px; }
.tab-desc { font-size: 14px; color: var(--muted); line-height: 1.55; }

/* ── OFFLINE NOTE ── */
.offline-note, .offline-subjects-note {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: var(--muted);
  background: var(--grey);
  padding: 10px 14px;
  border-radius: 10px;
}
.warn-text { color: var(--gold-dark); font-weight: 600; }

/* ── SUBJECT GRID ── */
.subject-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.subj-card {
  background: white;
  border: 2px solid var(--border);
  border-radius: 14px;
  padding: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow);
}
.subj-card:hover:not(.disabled) { border-color: var(--green); transform: translateY(-2px); }
.subj-card.disabled { opacity: 0.5; cursor: not-allowed; }
.subj-icon { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
.subj-name { font-size: 13px; font-weight: 700; color: var(--text); }
.subj-count { font-size: 11px; color: var(--muted); }
.subj-count.zero { color: var(--red); font-style: italic; }

/* ── TOPIC SECTION ── */
.topic-section { background: white; border-radius: 14px; padding: 14px; box-shadow: var(--shadow); }
.topic-section-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; }
.ts-title { font-size: 13px; font-weight: 700; color: var(--text); }
.clear-btn { font-size: 12.5px; color: var(--muted); background: none; border: none; cursor: pointer; }

.topic-list { display: flex; flex-wrap: wrap; gap: 7px; }
.topic-chip {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all 0.18s;
  display: flex; align-items: center; gap: 6px;
}
.topic-chip:hover { border-color: var(--green); }
.topic-chip.selected { background: var(--green); border-color: var(--green); color: white; }
.topic-count { font-size: 10.5px; opacity: 0.65; }

/* ── FILTERS ── */
.filter-row { display: flex; align-items: center; gap: 12px; }
.filter-label { font-size: 13px; font-weight: 600; color: var(--text); width: 70px; flex-shrink: 0; }
.filter-select {
  flex: 1;
  padding: 10px 14px;
  border: 1.5px solid var(--border);
  border-radius: 10px;
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--text);
  background: white;
  outline: none;
  cursor: pointer;
}
.difficulty-pills { display: flex; gap: 7px; }
.d-pill {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 13px;
  font-weight: 500;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.18s;
}
.d-pill.selected { background: var(--navy); color: white; border-color: var(--navy); }

/* ── PREVIEW ── */
.questions-preview {
  display: flex; align-items: center; gap: 8px;
  font-size: 13.5px; color: var(--text);
  background: var(--green-soft);
  padding: 10px 14px;
  border-radius: 10px;
}
.preview-icon { color: var(--green); flex-shrink: 0; }

/* ── BTN START ── */
.btn-start {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 15px;
  background: var(--navy);
  color: white;
  border: none;
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(10,15,44,0.2);
}
.btn-start:hover:not(:disabled) { transform: translateY(-2px); }
.btn-start:disabled { opacity: 0.4; cursor: not-allowed; }

/* ── MOCK CARD ── */
.mock-card {
  background: white;
  border-radius: 18px;
  padding: 20px;
  box-shadow: var(--shadow-md);
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.mock-hero { text-align: center; }
.mock-icon {
  width: 64px; height: 64px;
  border-radius: 20px;
  background: linear-gradient(135deg, #00952E, #00C853);
  color: white;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
}
.mock-title { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); margin-bottom: 6px; }
.mock-desc  { font-size: 13.5px; color: var(--muted); line-height: 1.55; }
.mock-specs { display: flex; justify-content: space-around; background: var(--grey); border-radius: 12px; padding: 12px; }
.spec-item  { display: flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; color: var(--text); }
.mock-rules { display: flex; flex-direction: column; gap: 8px; }
.mock-rule  { display: flex; align-items: center; gap: 8px; font-size: 12.5px; color: var(--muted); }

.mock-limit-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 12px; color: var(--muted);
  background: var(--gold-soft);
  padding: 8px 12px; border-radius: 10px;
}
.limit-link { color: var(--gold-dark); font-weight: 600; margin-left: auto; }

/* ── RECENT ── */
.recent-section { background: white; border-radius: 16px; padding: 16px; box-shadow: var(--shadow); }
.recent-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
.recent-list { display: flex; flex-direction: column; gap: 8px; }
.recent-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--grey); border-radius: 12px; }
.recent-score { font-family: var(--font-display); font-size: 16px; font-weight: 800; padding: 6px 10px; border-radius: 9px; }
.score-high { background: var(--green-soft); color: var(--green-dark); }
.score-mid  { background: var(--gold-soft);  color: var(--gold-dark); }
.score-low  { background: var(--red-soft);   color: var(--red); }
.recent-info { flex: 1; }
.recent-date { display: block; font-size: 12.5px; font-weight: 600; color: var(--text); }
.recent-pct  { font-size: 11.5px; color: var(--muted); }
.recent-review { display: flex; align-items: center; gap: 4px; font-size: 12px; font-weight: 600; color: var(--green-dark); text-decoration: none; }

/* ── WEAK AREAS ── */
.empty-weak { text-align: center; padding: 24px 0; display: flex; flex-direction: column; align-items: center; gap: 12px; }
.empty-icon { font-size: 48px; }
.empty-weak h3 { font-family: var(--font-display); font-size: 18px; font-weight: 700; color: var(--text); }
.empty-weak p  { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 280px; }

.weak-list { display: flex; flex-direction: column; gap: 10px; }
.weak-card { background: white; border-radius: 14px; padding: 14px; box-shadow: var(--shadow); }
.weak-card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.weak-subject-chip { font-size: 11px; font-weight: 700; padding: 3px 10px; border-radius: 20px; }
.weak-pct-badge { font-family: var(--font-display); font-size: 15px; font-weight: 800; }
.weak-pct-badge.critical { color: var(--red); }
.weak-pct-badge.low      { color: var(--gold-dark); }
.weak-topic-name { font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 10px; }
.weak-bar  { height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; margin-bottom: 6px; }
.weak-bar-fill { height: 100%; background: var(--red); border-radius: 3px; }
.weak-attempts { font-size: 11.5px; color: var(--muted); }

/* Transitions */
.tab-slide-enter-active { transition: all 0.25s ease; }
.tab-slide-leave-active { transition: all 0.18s ease; }
.tab-slide-enter-from   { opacity: 0; transform: translateY(8px); }
.tab-slide-leave-to     { opacity: 0; transform: translateY(-8px); }

.fade-drop-enter-active { transition: all 0.3s ease; }
.fade-drop-enter-from   { opacity: 0; transform: translateY(-10px); }
</style>
