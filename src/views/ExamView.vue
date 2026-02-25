<template>
  <!-- ── Load error screen (offline or API failure) ── -->
  <div v-if="loadError" class="exam-error-screen">
    <div class="err-icon">{{ loadError === 'offline_free' ? '🔒' : '📵' }}</div>
    <h2 v-if="loadError === 'offline_free'">Offline Access is Premium</h2>
    <h2 v-else-if="loadError === 'offline_no_cache'">Questions Not Downloaded Yet</h2>
    <h2 v-else>Couldn't Load Questions</h2>
    <p v-if="loadError === 'offline_free'">
      You're offline. Upgrade to Premium to study anywhere without internet.
    </p>
    <p v-else-if="loadError === 'offline_no_cache'">
      You're offline and this subject hasn't been downloaded yet. Go online to sync your library first.
    </p>
    <p v-else>{{ loadError }}</p>
    <button class="err-back" @click="smartBack()">Go Back</button>
    <RouterLink v-if="loadError === 'offline_free'" to="/upgrade" class="err-upgrade">
      Upgrade to Premium
    </RouterLink>
  </div>

  <!-- ── Loading spinner ── -->
  <div v-else-if="!session" class="exam-loading">
    <div class="loading-spinner"></div>
    <p>Loading questions…</p>
  </div>

  <div v-else class="exam-view">

    <!-- ══ TOP BAR ══ -->
    <div class="exam-topbar" :style="{ background: subjectColor }">
      <!-- Left: back + subject -->
      <div class="topbar-left">
        <button class="topbar-back" @click="confirmExit" title="Exit exam">
          <PhArrowLeft :size="20" weight="bold" />
        </button>
        <div class="topbar-info">
          <span class="topbar-type">{{ examLabel }}</span>
          <span class="topbar-subject">{{ currentSubjectLabel }}</span>
        </div>
      </div>

      <!-- Right: timer + verified badge -->
      <div class="topbar-right">
        <div v-if="currentQuestion?.verified" class="verified-badge">
          <PhSeal :size="13" weight="fill" />
          Verified
        </div>
        <ExamTimer
          v-if="session.timeLimit"
          ref="timerRef"
          :totalSeconds="session.timeLimit"
          :running="!showSubmitModal && !showFlagModal"
          @warning="onTimerWarning"
          @expired="onTimeExpired"
        />
        <div v-else class="no-timer-badge">
          <PhInfinity :size="16" weight="bold" />
        </div>
      </div>
    </div>

    <!-- ══ PROGRESS BAR ══ -->
    <div class="exam-progress-track">
      <div
        class="exam-progress-fill"
        :style="{ width: `${progressPct}%`, background: subjectColor }"
      ></div>
    </div>

    <!-- ══ QUESTION META ══ -->
    <div class="exam-body">
      <div class="q-meta">
        <span class="q-count">
          <strong>{{ session.currentIndex + 1 }}</strong>
          <span>/ {{ totalQuestions }}</span>
        </span>

        <div class="q-meta-actions">
          <!-- Flag toggle -->
          <button
            class="meta-btn flag-btn"
            :class="{ flagged: isFlagged(currentQuestion?.id) }"
            @click="showFlagModal = true"
            title="Report an issue"
          >
            <PhFlag :size="16" :weight="isFlagged(currentQuestion?.id) ? 'fill' : 'regular'" />
            {{ isFlagged(currentQuestion?.id) ? 'Flagged' : 'Flag' }}
          </button>

          <!-- Explanation (practice mode) -->
          <button
            v-if="isPracticeMode && hasAnswered"
            class="meta-btn explain-btn"
            @click="showExplanation = true"
          >
            <PhLightbulb :size="16" weight="fill" />
            Explain
          </button>
        </div>
      </div>

      <!-- ══ QUESTION CARD ══ -->
      <Transition name="question-slide" mode="out-in">
        <div class="question-card" :key="currentQuestion?.id">
          <!-- Image (if any) -->
          <div v-if="currentQuestion?.imagePath" class="q-image-wrap">
            <img :src="currentQuestion.imagePath" :alt="`Question ${session.currentIndex + 1} diagram`" class="q-image" />
          </div>

          <!-- Text -->
          <p class="question-text">{{ currentQuestion?.text }}</p>

          <!-- Year chip -->
          <div class="q-chips">
            <span class="q-chip year">JAMB {{ currentQuestion?.year }}</span>
            <span class="q-chip topic" v-if="currentQuestion?.topic">
              {{ formatTopic(currentQuestion.topic) }}
            </span>
            <span class="q-chip difficulty" :class="currentQuestion?.difficulty">
              {{ currentQuestion?.difficulty }}
            </span>
          </div>
        </div>
      </Transition>

      <!-- ══ OPTIONS ══ -->
      <Transition name="question-slide" mode="out-in">
        <div class="options-list" :key="`opts-${currentQuestion?.id}`">
          <OptionItem
            v-for="(option, i) in currentQuestion?.options"
            :key="i"
            :index="i"
            :text="option"
            :selected="session.answers[currentQuestion?.id] === i"
            :isCorrect="i === currentQuestion?.correctIndex"
            :showResult="isPracticeMode && hasAnswered"
            :disabled="isPracticeMode && hasAnswered"
            @select="selectAnswer"
          />
        </div>
      </Transition>

      <!-- ══ QUESTION NAVIGATOR ══ -->
      <QuestionNavigator
        :questions="session.questions"
        :answers="session.answers"
        :flagged="session.flagged"
        :currentIndex="session.currentIndex"
        :subjects="session.subjects"
        @goto="goTo"
      />

      <!-- ══ NAV BUTTONS ══ -->
      <div class="exam-nav-btns">
        <button
          class="nav-btn prev-btn"
          :disabled="session.currentIndex === 0"
          @click="prev"
        >
          <PhArrowLeft :size="18" weight="bold" />
          Prev
        </button>

        <!-- Submit (last question) or Next -->
        <button
          v-if="session.currentIndex === totalQuestions - 1"
          class="nav-btn submit-btn"
          @click="showSubmitModal = true"
        >
          <PhPaperPlaneTilt :size="18" weight="fill" />
          Submit Exam
        </button>
        <button
          v-else
          class="nav-btn next-btn"
          @click="next"
        >
          Next
          <PhArrowRight :size="18" weight="bold" />
        </button>
      </div>

      <!-- ══ SUBMIT EARLY (not on last q) ══ -->
      <div v-if="session.currentIndex < totalQuestions - 1" class="submit-early">
        <button class="submit-early-btn" @click="showSubmitModal = true">
          <PhPaperPlaneTilt :size="15" weight="fill" />
          Submit Exam Early
        </button>
      </div>
    </div>

    <!-- ══ MODALS & PANELS ══ -->
    <SubmitModal
      :visible="showSubmitModal"
      :answeredCount="answeredCount"
      :flaggedCount="flaggedCount"
      :totalQuestions="totalQuestions"
      @confirm="submitExam"
      @cancel="showSubmitModal = false"
    />

    <FlagQuestionModal
      :visible="showFlagModal"
      :questionId="currentQuestion?.id"
      @confirm="handleFlag"
      @cancel="showFlagModal = false"
    />

    <ExplanationPanel
      :visible="showExplanation"
      :explanation="currentQuestion?.explanation"
      :correctIndex="currentQuestion?.correctIndex"
      :correctOption="currentQuestion?.options[currentQuestion?.correctIndex]"
      :locked="!userStore.isPremium && !userStore.isInTrial"
      @close="showExplanation = false"
    />

    <!-- Overlay when panel is open -->
    <Transition name="fade">
      <div
        v-if="showExplanation"
        class="panel-overlay"
        @click="showExplanation = false"
      ></div>
    </Transition>

    <!-- ══ TOAST NOTIFICATIONS ══ -->
    <Transition name="toast">
      <div v-if="toast.visible" class="toast" :class="toast.type">
        <component :is="toast.icon" :size="16" weight="fill" />
        {{ toast.message }}
      </div>
    </Transition>

    <!-- ══ EXIT CONFIRMATION ══ -->
    <Transition name="fade">
      <div v-if="showExitConfirm" class="modal-overlay" @click.self="showExitConfirm = false">
        <div class="exit-modal">
          <div class="exit-icon">
            <PhSignOut :size="26" weight="fill" />
          </div>
          <h3>Exit Exam?</h3>
          <p>Your progress will be lost. This exam will not be saved.</p>
          <div class="modal-actions">
            <button class="btn-cancel" @click="showExitConfirm = false">Stay</button>
            <button class="btn-exit"   @click="exitExam">Exit</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>

</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  PhArrowLeft, PhArrowRight, PhFlag, PhLightbulb,
  PhPaperPlaneTilt, PhSeal, PhInfinity, PhSignOut
} from '@phosphor-icons/vue'

import { useExamStore }     from '@/stores/exam'
import { useUserStore }     from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { useQuestionsStore } from '@/stores/questions'

import ExamTimer          from '@/components/exam/ExamTimer.vue'
import OptionItem         from '@/components/exam/OptionItem.vue'
import QuestionNavigator  from '@/components/exam/QuestionNavigator.vue'
import ExplanationPanel   from '@/components/exam/ExplanationPanel.vue'
import SubmitModal        from '@/components/exam/SubmitModal.vue'
import FlagQuestionModal  from '@/components/exam/FlagQuestionModal.vue'

import { SUBJECT_CONFIG, EXAM_CONFIGS } from '@/data/questions'

// ── Stores & Router
const route         = useRoute()
const router        = useRouter()
const examStore     = useExamStore()
const userStore     = useUserStore()
const progressStore = useProgressStore()
const questionsStore = useQuestionsStore()

// ── UI State
const showSubmitModal  = ref(false)
const showFlagModal    = ref(false)
const showExplanation  = ref(false)
const showExitConfirm  = ref(false)
const timerRef         = ref(null)

const toast = ref({ visible: false, message: '', type: 'info', icon: null })

onBeforeUnmount(() => {
  showExplanation.value = false
  showFlagModal.value = false
})
// ── Computed from store
const session       = computed(() => examStore.session)
const totalQuestions = computed(() => examStore.totalQuestions)
const answeredCount  = computed(() => examStore.answeredCount)
const flaggedCount   = computed(() => examStore.flaggedCount)
const currentQuestion = computed(() => examStore.currentQuestion)
const isFlagged       = computed(() => examStore.isFlagged)

const progressPct = computed(() =>
  totalQuestions.value > 0
    ? ((session.value?.currentIndex + 1) / totalQuestions.value) * 100
    : 0
)

const examType    = computed(() => route.params.type || 'mock')
const examConfig  = computed(() => EXAM_CONFIGS[examType.value] || EXAM_CONFIGS.mock)
const examLabel   = computed(() => examConfig.value.label)

const isPracticeMode = computed(() => examType.value === 'practice')

const hasAnswered = computed(() =>
  currentQuestion.value && currentQuestion.value.id in (session.value?.answers ?? {})
)

const currentSubjectLabel = computed(() => {
  const subj = currentQuestion.value?.subject
  return SUBJECT_CONFIG[subj]?.label || subj || ''
})

const subjectColor = computed(() => {
  const subj = currentQuestion.value?.subject
  return SUBJECT_CONFIG[subj]?.color || 'var(--navy)'
})

// ── Navigation
function next()       { examStore.next();  hideExplanation() }
function prev()       { examStore.prev();  hideExplanation() }
function goTo(index)  { examStore.goTo(index); hideExplanation() }
function hideExplanation() { showExplanation.value = false }

// ── Answering
function selectAnswer(optionIndex) {
  if (!currentQuestion.value) return
  examStore.answer(currentQuestion.value.id, optionIndex)

  // Practice mode: auto-show explanation for premium users
  if (isPracticeMode.value && userStore.isPremium) {
    setTimeout(() => { showExplanation.value = true }, 400)
  }
}

function smartBack() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/home') // fallback
  }
}

// ── Submit
async function submitExam() {
  showSubmitModal.value = false
  const result = await examStore.submit()
  progressStore.recordSession(result)

  console.log('result', result);
  console.log('result id.id', result.id);

  // Update subject stats
  if (result?.questions) {
    const byTopic = {}
    result.questions.forEach(q => {
      const key = `${q.subject}|${q.topic}`
      if (!byTopic[key]) byTopic[key] = { subject: q.subject, topic: q.topic, correct: 0, total: 0 }
      byTopic[key].total++
      if (result.answers[q.id] === q.correctIndex) byTopic[key].correct++
    })
    Object.values(byTopic).forEach(({ subject, topic, correct, total }) => {
      progressStore.updateSubjectStat(subject, topic, correct, total)
    })
  }

    window.removeEventListener('popstate', handlePopState) // ✅ stop blocking back
  router.replace({ name: 'results', params: { sessionId: result.id } })
}

// ── Flag / Report
async function handleFlag({ questionId, reason, note }) {
  showFlagModal.value = false
  examStore.toggleFlag(questionId)
  await questionsStore.flagQuestion(questionId, reason)
  showToast('Thanks for the report — we\'ll review it.', 'success', PhFlag)
}

// ── Timer events
function onTimerWarning(secondsLeft) {
  if (secondsLeft === 300) showToast('5 minutes remaining!', 'warning')
  if (secondsLeft === 60)  showToast('1 minute remaining!', 'danger')
}

function onTimeExpired() {
  showToast('Time\'s up! Submitting your exam...', 'danger')
  setTimeout(submitExam, 1500)
}

// ── Exit
function confirmExit() { showExitConfirm.value = true }
function exitExam() {
  examStore.clearSession()
  router.replace({ name: 'practice' })
}

// ── Toast
let toastTimeout = null
function showToast(message, type = 'info', icon = null) {
  clearTimeout(toastTimeout)
  toast.value = { visible: true, message, type, icon }
  toastTimeout = setTimeout(() => { toast.value.visible = false }, 3000)
}

// ── Format topic name
function formatTopic(topic) {
  return topic.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

// ── Init exam on mount
const loadError = ref(null)

onMounted(async () => {
  if (!examStore.session) {
    const subjects = userStore.subjects.length
      ? userStore.subjects
      : ['english', 'mathematics', 'chemistry', 'biology']

    try {
      let questions = []

      if (examType.value === 'mock') {
        questions = await questionsStore.fetchMockExam(subjects)
      } else if (examType.value === 'weak-areas') {
        const weak = route.query.topics
          ? JSON.parse(decodeURIComponent(route.query.topics))
          : []
        questions = weak.length
          ? await questionsStore.fetchWeakAreaQuestions(weak)
          : await questionsStore.fetchMockExam(subjects)
      } else {
        // practice — subject from route query or first subject
        const subject = route.query.subject || subjects[0]
        const year    = route.query.year    || undefined
        const topic   = route.query.topic   || undefined
        questions = await questionsStore.fetchQuestions({ subject, year, topic, count: 40 })
      }

      if (!questions.length) throw new Error('No questions found for your selection.')

      examStore.startSession({
        type: examType.value,
        subjects,
        questions,
        timeLimit: examConfig.value.timeLimit,
      })
    } catch (err) {
      if (err.code === 'OFFLINE_NOT_PREMIUM') {
        loadError.value = 'offline_free'
      } else if (err.code === 'OFFLINE_NOT_CACHED') {
        loadError.value = 'offline_no_cache'
      } else {
        loadError.value = err.message || 'Could not load questions. Please try again.'
      }
      return
    }
  }

  // Prevent browser back during active exam
  history.pushState(null, '', location.href)
  window.addEventListener('popstate', handlePopState)
})

onUnmounted(() => {
  window.removeEventListener('popstate', handlePopState)
})

function handlePopState() {
  if (examStore.session?.status === 'active') {
    history.pushState(null, '', location.href)
    confirmExit()
  }
}
</script>

<style scoped>
.exam-view {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
}

/* ══ TOP BAR ══ */
.exam-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  position: sticky;
  top: 0;
  z-index: 50;
  transition: background 0.3s ease;
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topbar-back {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.15);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.2s;
}
.topbar-back:hover { background: rgba(255,255,255,0.25); }

.topbar-info { display: flex; flex-direction: column; }
.topbar-type {
  font-size: 10.5px;
  color: rgba(255,255,255,0.6);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.topbar-subject {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.topbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.verified-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: rgba(255,255,255,0.2);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 9px;
  border-radius: 20px;
}

.no-timer-badge {
  display: inline-flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  color: white;
  padding: 7px 10px;
  border-radius: 20px;
}

/* ══ PROGRESS ══ */
.exam-progress-track {
  height: 4px;
  background: rgba(0,0,0,0.08);
  position: sticky;
  top: 64px;
  z-index: 49;
}
.exam-progress-fill {
  height: 100%;
  transition: width 0.4s ease;
  border-radius: 0 4px 4px 0;
}

/* ══ BODY ══ */
.exam-body {
  flex: 1;
  padding: 16px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ══ Q META ══ */
.q-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.q-count {
  font-size: 13px;
  color: var(--muted);
}
.q-count strong { font-family: var(--font-display); font-size: 18px; color: var(--text); font-weight: 800; }

.q-meta-actions { display: flex; gap: 8px; }

.meta-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 13px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.18s;
  color: var(--muted);
}

.flag-btn:hover, .flag-btn.flagged {
  border-color: var(--gold);
  background: var(--gold-soft);
  color: var(--gold-dark);
}

.explain-btn { color: var(--navy); border-color: var(--navy-light); }
.explain-btn:hover { background: var(--navy); color: white; }

/* ══ QUESTION CARD ══ */
.question-card {
  background: white;
  border-radius: var(--radius);
  padding: 20px;
  box-shadow: var(--shadow);
}

.q-image-wrap { margin-bottom: 14px; }
.q-image {
  width: 100%;
  border-radius: 10px;
  object-fit: contain;
  max-height: 200px;
}

.question-text {
  font-size: 15px;
  line-height: 1.75;
  color: var(--text);
  font-weight: 500;
  white-space: pre-line;
}

.q-chips {
  display: flex;
  gap: 6px;
  margin-top: 14px;
  flex-wrap: wrap;
}

.q-chip {
  font-size: 11px;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 20px;
  text-transform: capitalize;
}
.q-chip.year   { background: var(--grey); color: var(--muted); }
.q-chip.topic  { background: var(--green-soft); color: var(--green-dark); }
.q-chip.difficulty.easy   { background: #E8FFF1; color: var(--green-dark); }
.q-chip.difficulty.medium { background: #FFF8E1; color: var(--gold-dark); }
.q-chip.difficulty.hard   { background: var(--red-soft); color: var(--red); }

/* ══ OPTIONS ══ */
.options-list { display: flex; flex-direction: column; gap: 9px; }

/* ══ NAV BUTTONS ══ */
.exam-nav-btns {
  display: flex;
  gap: 10px;
  margin-top: 4px;
}

.nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 14px;
  border-radius: 14px;
  border: none;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.prev-btn {
  flex: 1;
  background: white;
  color: var(--text);
  border: 1.5px solid var(--border);
}
.prev-btn:hover:not(:disabled) { background: var(--grey); }
.prev-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.next-btn {
  flex: 2;
  background: var(--navy);
  color: white;
  box-shadow: 0 4px 16px rgba(10,15,44,0.25);
}
.next-btn:hover { opacity: 0.9; transform: translateY(-1px); }

.submit-btn {
  flex: 2;
  background: var(--green);
  color: white;
  box-shadow: 0 4px 16px rgba(0,200,83,0.35);
}
.submit-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,200,83,0.4); }

/* ══ SUBMIT EARLY ══ */
.submit-early { text-align: center; }
.submit-early-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--muted);
  font-size: 12.5px;
  font-weight: 600;
  padding: 8px 16px;
  border-radius: 20px;
  background: transparent;
  border: 1.5px solid var(--border);
  cursor: pointer;
  transition: all 0.2s;
}
.submit-early-btn:hover { color: var(--green); border-color: var(--green); }

/* ══ PANEL OVERLAY ══ */
.panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,15,44,0.4);
  z-index: 190;
}

/* ══ TOAST ══ */
.toast {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 11px 20px;
  border-radius: 30px;
  font-size: 13.5px;
  font-weight: 600;
  z-index: 500;
  white-space: nowrap;
  box-shadow: var(--shadow-md);
}
.toast.success { background: var(--navy); color: white; }
.toast.warning { background: var(--gold); color: var(--navy); }
.toast.danger  { background: var(--red);  color: white; }
.toast.info    { background: var(--navy); color: white; }

.toast-enter-active { transition: all 0.3s cubic-bezier(0.34,1.2,0.64,1); }
.toast-leave-active { transition: all 0.2s ease; }
.toast-enter-from   { opacity: 0; transform: translateX(-50%) translateY(-14px); }
.toast-leave-to     { opacity: 0; transform: translateX(-50%) translateY(-8px); }

/* ══ EXIT MODAL ══ */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,15,44,0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 300;
  padding: 24px;
}

.exit-modal {
  background: white;
  border-radius: 22px;
  padding: 28px 24px;
  text-align: center;
  width: 100%;
  max-width: 320px;
}

.exit-icon {
  width: 56px; height: 56px;
  border-radius: 16px;
  background: var(--red-soft);
  color: var(--red);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 14px;
}

.exit-modal h3 {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 8px;
}
.exit-modal p { font-size: 13.5px; color: var(--muted); margin-bottom: 22px; line-height: 1.5; }

.modal-actions { display: flex; gap: 10px; }

.btn-cancel {
  flex: 1;
  padding: 13px;
  background: var(--grey);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  color: var(--text);
}
.btn-exit {
  flex: 1;
  padding: 13px;
  background: var(--red);
  border: none;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 700;
  color: white;
  cursor: pointer;
}

/* ══ LOADING ══ */
.exam-loading {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: var(--muted);
}

.loading-spinner {
  width: 40px; height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

.exam-error-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 24px;
  text-align: center;
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
}
.err-icon { font-size: 48px; margin-bottom: 4px; }
.exam-error-screen h2 { font-family: var(--font-display); font-size: 20px; color: var(--text); margin: 0; }
.exam-error-screen p  { color: var(--muted); font-size: 14px; line-height: 1.5; margin: 0; }
.err-back    { background: white; border: 1.5px solid var(--border); color: var(--text); border-radius: 12px; padding: 12px 28px; font-weight: 600; cursor: pointer; margin-top: 8px; }
.err-upgrade { display: block; background: var(--green); color: white; text-decoration: none; border-radius: 12px; padding: 13px 28px; font-weight: 700; margin-top: 4px; }

/* ══ QUESTION TRANSITION ══ */
.question-slide-enter-active { transition: all 0.22s ease; }
.question-slide-leave-active { transition: all 0.16s ease; }
.question-slide-enter-from   { opacity: 0; transform: translateX(16px); }
.question-slide-leave-to     { opacity: 0; transform: translateX(-10px); }

/* ══ FADE ══ */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>