<template>
  <div class="setup-view">
    <div class="setup-header">
      <div class="setup-logo">
        <div class="logo-icon"><PhTarget :size="18" weight="fill" /></div>
        <span class="logo-text">2W<span>ise</span></span>
      </div>
      <div class="step-dots">
        <div v-for="i in 3" :key="i" class="step-dot" :class="{ active: step >= i, done: step > i }">
          <PhCheck v-if="step > i" :size="10" weight="bold" />
          <span v-else>{{ i }}</span>
        </div>
      </div>
    </div>

    <div class="setup-body">
      <!-- STEP 1: Subjects -->
      <Transition name="step-slide" mode="out-in">
        <div v-if="step === 1" key="1" class="step">
          <div class="step-icon" style="background: #E8FFF1; color: var(--green-dark)">
            <PhBooks :size="28" weight="fill" />
          </div>
          <h2 class="step-title">Pick Your Subjects</h2>
          <p class="step-desc">English is compulsory. Select 3 more subjects for your course.</p>

          <div class="subjects-grid">
            <div
              v-for="s in allSubjects"
              :key="s.id"
              class="subject-tile"
              :class="{
                selected: selectedSubjects.includes(s.id),
                compulsory: s.compulsory,
                disabled: !s.compulsory && !selectedSubjects.includes(s.id) && selectedSubjects.length >= 4
              }"
              @click="toggleSubject(s)"
            >
              <div class="subj-tile-icon" :style="{ background: s.bg, color: s.color }">
                <component :is="s.icon" :size="22" weight="fill" />
              </div>
              <span class="subj-tile-name">{{ s.label }}</span>
              <div class="subj-selected-check" v-if="selectedSubjects.includes(s.id)">
                <PhCheckCircle :size="16" weight="fill" />
              </div>
              <div class="subj-compulsory" v-if="s.compulsory">
                <PhLock :size="10" weight="fill" /> Required
              </div>
            </div>
          </div>

          <p class="selection-count" :class="{ valid: selectedSubjects.length === 4 }">
            {{ selectedSubjects.length }} / 4 subjects selected
            <PhCheckCircle v-if="selectedSubjects.length === 4" :size="14" weight="fill" />
          </p>
        </div>

        <!-- STEP 2: Exam Date -->
        <div v-else-if="step === 2" key="2" class="step">
          <div class="step-icon" style="background: #FFF8E1; color: var(--gold-dark)">
            <PhCalendar :size="28" weight="fill" />
          </div>
          <h2 class="step-title">When's Your Exam?</h2>
          <p class="step-desc">We'll build your daily study plan around your exam date.</p>

          <div class="date-input-wrap">
            <input
              v-model="examDate"
              type="date"
              class="date-input"
              :min="minDate"
            />
          </div>

          <div v-if="daysLeft !== null" class="countdown-chip" :class="{ urgent: daysLeft < 30 }">
            <PhTimer :size="16" weight="fill" />
            {{ daysLeft }} days until your exam
          </div>
        </div>

        <!-- STEP 3: Target Score -->
        <div v-else-if="step === 3" key="3" class="step">
          <div class="step-icon" style="background: #EDE7F6; color: var(--purple)">
            <PhTrophy :size="28" weight="fill" />
          </div>
          <h2 class="step-title">Set Your Target</h2>
          <p class="step-desc">What score are you aiming for? Be ambitious — we'll push you there.</p>

          <div class="score-display">
            <span class="score-val">{{ targetScore }}</span>
            <span class="score-max">/ 400</span>
          </div>

          <input
            v-model="targetScore"
            type="range"
            min="180"
            max="400"
            step="5"
            class="score-slider"
          />

          <div class="score-range-labels">
            <span>180</span>
            <span>400</span>
          </div>

          <div class="score-bands">
            <div
              v-for="band in scoreBands"
              :key="band.label"
              class="score-band"
              :class="{ active: targetScore >= band.min && targetScore <= band.max }"
              :style="{ borderColor: band.color, background: targetScore >= band.min && targetScore <= band.max ? band.bg : 'transparent' }"
            >
              <span class="band-range" :style="{ color: targetScore >= band.min && targetScore <= band.max ? band.color : 'var(--muted)' }">
                {{ band.min }}–{{ band.max }}
              </span>
              <span class="band-label">{{ band.label }}</span>
            </div>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Actions -->
    <div class="setup-actions">
      <button v-if="step > 1" class="btn-back" @click="step--">
        <PhArrowLeft :size="17" weight="bold" /> Back
      </button>
      <button
        class="btn-next"
        :disabled="!canProceed"
        @click="advance"
      >
        {{ step < 3 ? 'Continue' : 'Start Preparing' }}
        <PhArrowRight v-if="step < 3" :size="17" weight="bold" />
        <PhRocketLaunch v-else :size="17" weight="fill" />
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhTarget, PhCheck, PhCheckCircle, PhArrowLeft, PhArrowRight,
  PhBooks, PhCalendar, PhTrophy, PhLock, PhTimer, PhRocketLaunch,
  PhAtom, PhDna, PhCalculator, PhGlobe, PhBank, PhBookOpen, PhMegaphone
} from '@phosphor-icons/vue'
import { useUserStore }      from '@/stores/user'
import { useSyncStore }      from '@/stores/sync'
import { useNetworkStore }   from '@/stores/network'
import dayjs from 'dayjs'

const API = import.meta.env.VITE_API_BASE_URL ?? '/api'

const router          = useRouter()
const userStore       = useUserStore()
const syncStore       = useSyncStore()
const networkStore    = useNetworkStore()

const step              = ref(1)
const selectedSubjects  = ref(['english'])
const examDate          = ref('')
const targetScore       = ref(280)

const minDate = dayjs().add(1, 'day').format('YYYY-MM-DD')

const daysLeft = computed(() => {
  if (!examDate.value) return null
  return Math.max(0, dayjs(examDate.value).diff(dayjs(), 'day'))
})

const allSubjects = [
  { id: 'english',     label: 'English',     icon: PhBookOpen,   color: '#00952E', bg: '#E8FFF1', compulsory: true },
  { id: 'mathematics', label: 'Mathematics', icon: PhCalculator, color: '#E65100', bg: '#FFF3E0', compulsory: false },
  { id: 'chemistry',   label: 'Chemistry',   icon: PhAtom,       color: '#7B1FA2', bg: '#F3E5F5', compulsory: false },
  { id: 'biology',     label: 'Biology',     icon: PhDna,        color: '#2196F3', bg: '#E3F2FD', compulsory: false },
  { id: 'physics',     label: 'Physics',     icon: PhAtom,       color: '#FF5722', bg: '#FBE9E7', compulsory: false },
  { id: 'economics',   label: 'Economics',   icon: PhBank,       color: '#009688', bg: '#E0F2F1', compulsory: false },
  { id: 'government',  label: 'Government',  icon: PhGlobe,      color: '#E91E63', bg: '#FCE4EC', compulsory: false },
  { id: 'literature',  label: 'Literature',  icon: PhMegaphone,  color: '#795548', bg: '#EFEBE9', compulsory: false },
]

const scoreBands = [
  { min: 180, max: 219, label: 'Getting Started', color: '#FF4444', bg: '#FFF0F0' },
  { min: 220, max: 259, label: 'Average',          color: '#FFB800', bg: '#FFF8E1' },
  { min: 260, max: 299, label: 'Good',             color: '#00C853', bg: '#E8FFF1' },
  { min: 300, max: 349, label: 'Excellent',        color: '#2196F3', bg: '#E3F2FD' },
  { min: 350, max: 400, label: 'Outstanding',      color: '#7B1FA2', bg: '#F3E5F5' },
]

const canProceed = computed(() => {
  if (step.value === 1) return selectedSubjects.value.length === 4
  if (step.value === 2) return !!examDate.value
  return true
})

function toggleSubject(s) {
  if (s.compulsory) return
  if (selectedSubjects.value.includes(s.id)) {
    selectedSubjects.value = selectedSubjects.value.filter(id => id !== s.id)
  } else {
    if (selectedSubjects.value.length >= 4) return
    selectedSubjects.value.push(s.id)
  }
}

async function advance() {
  if (!canProceed.value) return
  if (step.value < 3) {
    step.value++
    return
  }

  // Save locally immediately
  userStore.updateExamSetup({
    date:  examDate.value,
    score: parseInt(targetScore.value),
    subs:  selectedSubjects.value,
  })

  // Persist to server (non-blocking — don't block navigation on network failure)
  if (networkStore.isOnline && userStore.token) {
    fetch(`${API}/auth/setup`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        subjects:     selectedSubjects.value,
        exam_date:    examDate.value,
        target_score: parseInt(targetScore.value),
      }),
    }).catch(() => {
      // Queue for later — setup data is already saved locally
      syncStore.enqueue('exam_setup', {
        subjects:     selectedSubjects.value,
        exam_date:    examDate.value,
        target_score: parseInt(targetScore.value),
      })
    })

  }

  // Start background cache warm-up for the subjects just selected
  const { useQuestionsStore } = await import('@/stores/questions')
  useQuestionsStore().warmCache(selectedSubjects.value)
  router.replace({ name: 'dashboard' })
}
</script>

<style scoped>
.setup-view {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.setup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 56px;
  margin-bottom: 32px;
}

.setup-logo { display: flex; align-items: center; gap: 8px; }
.logo-icon {
  width: 36px; height: 36px;
  background: var(--navy);
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  color: var(--green);
}
.logo-text { font-family: var(--font-display); font-size: 20px; font-weight: 800; color: var(--text); }
.logo-text span { color: var(--green); }

.step-dots {
  display: flex;
  gap: 8px;
  align-items: center;
}

.step-dot {
  width: 26px; height: 26px;
  border-radius: 8px;
  background: var(--border);
  color: var(--muted);
  display: flex; align-items: center; justify-content: center;
  font-size: 11px;
  font-weight: 700;
  transition: all 0.25s;
}
.step-dot.active { background: var(--navy); color: white; }
.step-dot.done   { background: var(--green); color: white; }

.setup-body { flex: 1; }

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.step-icon {
  width: 68px; height: 68px;
  border-radius: 22px;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}

.step-title {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 8px;
}

.step-desc {
  color: var(--muted);
  font-size: 14px;
  line-height: 1.6;
  margin-bottom: 24px;
  max-width: 280px;
}

/* Subjects Grid */
.subjects-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  width: 100%;
  margin-bottom: 14px;
}

.subject-tile {
  position: relative;
  background: white;
  border: 2px solid var(--border);
  border-radius: 14px;
  padding: 14px 12px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  box-shadow: var(--shadow);
}

.subject-tile:hover:not(.disabled) { border-color: var(--green); transform: translateY(-2px); }
.subject-tile.selected { border-color: var(--green); background: var(--green-soft); }
.subject-tile.disabled { opacity: 0.4; cursor: not-allowed; }

.subj-tile-icon {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
}

.subj-tile-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

.subj-selected-check {
  position: absolute;
  top: 8px; right: 8px;
  color: var(--green);
}

.subj-compulsory {
  position: absolute;
  top: 6px; right: 6px;
  background: var(--navy);
  color: rgba(255,255,255,0.6);
  font-size: 9px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 3px;
}

.selection-count {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: var(--muted);
  font-weight: 500;
  transition: color 0.2s;
}
.selection-count.valid { color: var(--green-dark); }

/* Date */
.date-input-wrap {
  width: 100%;
  margin-bottom: 16px;
}

.date-input {
  width: 100%;
  padding: 16px;
  border: 2px solid var(--border);
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 16px;
  color: var(--text);
  background: white;
  outline: none;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: border-color 0.2s;
}
.date-input:focus { border-color: var(--navy); }

.countdown-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--green-soft);
  color: var(--green-dark);
  font-size: 14px;
  font-weight: 600;
  padding: 10px 20px;
  border-radius: 25px;
}
.countdown-chip.urgent { background: var(--gold-soft); color: var(--gold-dark); }

/* Score */
.score-display {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-bottom: 20px;
}

.score-val {
  font-family: var(--font-display);
  font-size: 72px;
  font-weight: 800;
  color: var(--navy);
  line-height: 1;
}

.score-max {
  font-size: 22px;
  color: var(--muted);
  font-weight: 500;
}

.score-slider {
  width: 100%;
  accent-color: var(--navy);
  cursor: pointer;
  margin-bottom: 8px;
}

.score-range-labels {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: var(--muted);
  margin-bottom: 20px;
  width: 100%;
}

.score-bands {
  display: flex;
  gap: 6px;
  width: 100%;
  flex-wrap: wrap;
  justify-content: center;
}

.score-band {
  flex: 1;
  min-width: 80px;
  padding: 8px 6px;
  border-radius: 10px;
  border: 1.5px solid var(--border);
  text-align: center;
  transition: all 0.25s;
}

.band-range {
  display: block;
  font-family: var(--font-display);
  font-size: 11px;
  font-weight: 700;
  margin-bottom: 3px;
}

.band-label {
  font-size: 10px;
  color: var(--muted);
  font-weight: 500;
}

/* Actions */
.setup-actions {
  display: flex;
  gap: 10px;
  padding-top: 24px;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 15px 20px;
  background: white;
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-back:hover { background: var(--grey); }

.btn-next {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--navy);
  color: white;
  border: none;
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(10,15,44,0.25);
}
.btn-next:hover:not(:disabled) { transform: translateY(-2px); }
.btn-next:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

/* Transition */
.step-slide-enter-active { transition: all 0.28s ease; }
.step-slide-leave-active { transition: all 0.2s ease; }
.step-slide-enter-from   { opacity: 0; transform: translateX(24px); }
.step-slide-leave-to     { opacity: 0; transform: translateX(-16px); }
</style>