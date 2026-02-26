<template>
  <div class="navigator">
    <div class="nav-header">
      <span class="nav-title">Questions</span>
      <div class="nav-legend">
        <span class="legend-item"><span class="leg-dot answered"></span>Answered</span>
        <span class="legend-item"><span class="leg-dot flagged"></span>Flagged</span>
        <span class="legend-item"><span class="leg-dot pending"></span>Skipped</span>
      </div>
    </div>

    <!-- Subject tabs (mock exam only) -->
    <div v-if="subjects.length > 1" class="subject-tabs">
      <button
        v-for="subj in subjects"
        :key="subj"
        class="subj-tab"
        :class="{ active: activeSubject === subj }"
        :style="activeSubject === subj ? { background: subjectConfig[subj]?.color } : {}"
        @click="activeSubject = subj"
      >
        {{ subjectConfig[subj]?.label?.split(' ')[0] }}
      </button>
    </div>

    <!-- Bubble grid -->
    <div class="bubble-grid">
      <button
        v-for="(q, i) in filteredQuestions"
        :key="q.id"
        class="bubble"
        :class="getBubbleClass(q, i)"
        @click="emit('goto', getActualIndex(q))"
        :title="`Question ${getActualIndex(q) + 1}`"
      >
        {{ getActualIndex(q) + 1 }}
      </button>
    </div>

    <!-- Summary row -->
    <div class="nav-summary">
      <div class="sum-item">
        <span class="sum-val green">{{ answeredCount }}</span>
        <span class="sum-lbl">Answered</span>
      </div>
      <div class="sum-divider"></div>
      <div class="sum-item">
        <span class="sum-val gold">{{ flaggedCount }}</span>
        <span class="sum-lbl">Flagged</span>
      </div>
      <div class="sum-divider"></div>
      <div class="sum-item">
        <span class="sum-val muted">{{ totalQuestions - answeredCount }}</span>
        <span class="sum-lbl">Remaining</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { SUBJECT_CONFIG } from '@/data/questions'

const props = defineProps({
  questions:    { type: Array,  required: true },
  answers:      { type: Object, default: () => ({}) },
  flagged:      { type: Array,  default: () => [] },
  currentIndex: { type: Number, default: 0 },
  subjects:     { type: Array,  default: () => [] }
})

const emit = defineEmits(['goto'])

const subjectConfig = SUBJECT_CONFIG

const activeSubject = ref(null)

// 1️⃣ Sync with current question automatically
watch(
  () => props.currentIndex,
  () => {
    const current = props.questions[props.currentIndex]
    if (current) {
      activeSubject.value = current.subject
    }
  },
  { immediate: true }
)

const filteredQuestions = computed(() => {
  if (!activeSubject.value || props.subjects.length <= 1) return props.questions
  return props.questions.filter(q => q.subject === activeSubject.value)
})

const answeredCount = computed(() => Object.keys(props.answers).length)
const flaggedCount  = computed(() => props.flagged.length)
const totalQuestions = computed(() => props.questions.length)

function getActualIndex(q) {
  return props.questions.findIndex(pq => pq.id === q.id)
}

function getBubbleClass(q, i) {
  const actual = getActualIndex(q)
  const isAnswered = q.id in props.answers
  const isFlagged  = props.flagged.includes(q.id)
  const isCurrent  = actual === props.currentIndex

  if (isCurrent)  return 'current'
  if (isFlagged)  return 'flagged'
  if (isAnswered) return 'answered'
  return 'pending'
}
</script>

<style scoped>
.navigator {
  background: white;
  border-radius: var(--radius);
  padding: 16px;
  box-shadow: var(--shadow);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.nav-title {
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  color: var(--text);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.nav-legend {
  display: flex;
  gap: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
}

.leg-dot {
  width: 8px; height: 8px;
  border-radius: 3px;
}
.leg-dot.answered { background: var(--green); }
.leg-dot.flagged  { background: var(--gold); }
.leg-dot.pending  { background: var(--border); }

/* ── Subject tabs ── */
.subject-tabs {
  display: flex;
  gap: 6px;
  margin-bottom: 12px;
  overflow-x: auto;
  padding-bottom: 2px;
}
.subject-tabs::-webkit-scrollbar { display: none; }

.subj-tab {
  flex-shrink: 0;
  padding: 5px 12px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: transparent;
  color: var(--muted);
  font-size: 11.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.subj-tab.active { color: white; border-color: transparent; }

/* ── Bubble grid ── */
.bubble-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-bottom: 14px;
}

.bubble {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  border: none;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--font-display);
  cursor: pointer;
  transition: all 0.18s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bubble:hover { transform: scale(1.1); }

.bubble.pending  { background: var(--grey);    color: var(--muted); }
.bubble.answered { background: var(--green);   color: white; }
.bubble.flagged  { background: var(--gold);    color: white; }
.bubble.current  { background: var(--navy);    color: white; box-shadow: 0 3px 12px rgba(10,15,44,0.35); }

/* ── Summary ── */
.nav-summary {
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding-top: 12px;
  border-top: 1px solid var(--border);
}

.sum-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.sum-val {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
}
.sum-val.green  { color: var(--green); }
.sum-val.gold   { color: var(--gold); }
.sum-val.muted  { color: var(--muted); }

.sum-lbl { font-size: 10.5px; color: var(--muted); font-weight: 500; }

.sum-divider { width: 1px; height: 28px; background: var(--border); }
</style>
