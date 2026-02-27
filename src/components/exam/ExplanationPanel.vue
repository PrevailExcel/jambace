<template>
  <Transition name="slide-up">
    <div v-if="visible" class="explanation-panel" :class="{ expanded: showTutor }">

      <!-- ── DRAG HANDLE ── -->
      <div class="drag-handle"></div>

      <!-- ── HEADER ── -->
      <div class="exp-header">
        <div class="exp-header-left">
          <div class="exp-header-icon">
            <PhLightbulb :size="16" weight="fill" />
          </div>
          <span class="exp-title">Explanation</span>
        </div>
        <div class="exp-header-actions">
          <button class="exp-close" @click="emit('close')">
            <PhX :size="17" weight="bold" />
          </button>
        </div>
      </div>

      <!-- ── TABS ── -->
      <div class="exp-tabs">
        <button class="exp-tab" :class="{ active: !showTutor }" @click="showTutor = false">
          <PhBookOpen :size="14" weight="fill" />
          Explanation
        </button>
        <button class="exp-tab" :class="{ active: showTutor, locked: !userStore.isPremium }" @click="handleTutorTab">
          <PhRobot :size="14" weight="fill" />
          AI Tutor
          <PhLockSimple v-if="!userStore.isPremium" :size="11" weight="fill" />
          <span v-else-if="userStore.totalCredits >= 0" class="tab-credit">
            {{ userStore.totalCredits }}
          </span>
        </button>
      </div>

      <!-- ── CORRECT ANSWER BANNER ── -->
      <div class="exp-correct-banner">
        <PhCheckCircle :size="15" weight="fill" />
        <span>Correct: <strong>{{ letters[correctIndex] }}. {{ correctOption }}</strong></span>
      </div>

      <!-- ── EXPLANATION TAB ── -->
      <Transition name="tab-fade" mode="out-in">
        <div v-if="!showTutor" key="explanation" class="exp-content">

          <div class="exp-body" :class="{ blurred: locked }">
            <p v-for="(line, i) in lines" :key="i" :class="{ 'exp-blank': line.trim() === '' }">
              {{ line }}
            </p>
          </div>

          <!-- Premium lock overlay -->
          <div v-if="locked" class="exp-locked">
            <div class="locked-icon-wrap">
              <PhLockSimple :size="24" weight="fill" />
            </div>
            <strong>Full explanations are Premium</strong>
            <p>Upgrade for ₦1,000/year or refer 5 friends to unlock step-by-step explanations for every question.</p>
            <RouterLink to="/upgrade" class="exp-upgrade-btn">
              Unlock Premium
              <PhArrowRight :size="14" weight="bold" />
            </RouterLink>
          </div>

          <!-- Prompt to open AI tutor (premium, non-locked) -->
          <div v-if="!locked" class="tutor-prompt-banner" @click="handleTutorTab">
            <div class="tpb-left">
              <div class="tpb-icon">
                <PhRobot :size="16" weight="fill" />
              </div>
              <div>
                <strong>Still confused?</strong>
                <span>
                  {{ userStore.isPremium
                    ? 'Ask the AI Tutor a follow-up question'
                    : 'Upgrade to ask the AI Tutor' }}
                </span>
              </div>
            </div>
            <PhCaretRight :size="16" weight="bold" class="tpb-arrow" />
          </div>

        </div>

        <!-- ── AI TUTOR TAB ── -->
        <div v-else key="tutor" class="exp-content">
          <AiTutorThread :questionId="questionId" :questionText="questionText" :subject="subject" :topic="topic"
            :year="year" :explanation="explanation" :correctAnswer="correctOption" :options="options" />
        </div>
      </Transition>

    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhLightbulb, PhX, PhCheckCircle, PhLockSimple,
  PhRobot, PhBookOpen, PhArrowRight, PhCaretRight
} from '@phosphor-icons/vue'
import { useUserStore } from '@/stores/user'
import AiTutorThread from './AiTutorThread.vue'

const props = defineProps({
  visible: { type: Boolean, default: false },
  questionId: { type: [String, Number], default: null },
  questionText: { type: String, default: '' },
  subject: { type: String, default: '' },
  topic: { type: String, default: '' },
  year: { type: Number, default: null },
  explanation: { type: String, default: '' },
  correctIndex: { type: Number, default: 0 },
  correctOption: { type: String, default: '' },
  options: { type: Array, default: () => [] },
  locked: { type: Boolean, default: false },
})

const emit = defineEmits(['close'])

const router = useRouter()
const userStore = useUserStore()
const showTutor = ref(false)
const letters = ['A', 'B', 'C', 'D', 'E']

const lines = computed(() =>
  props.locked
    ? [
      'This question tests your understanding of the topic.',
      '',
      'The correct answer is shown above. Upgrade to Premium to unlock the full step-by-step explanation for this and every question.'
    ]
    : (props.explanation || '').split('\n')
)

function handleTutorTab() {
  if (!userStore.isPremium) {
    router.push('/upgrade')
    return
  }
  showTutor.value = true
}
</script>

<style scoped>
.explanation-panel {
  background: var(--navy);
  border-radius: 22px 22px 0 0;
  padding: 10px 20px 32px;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  max-width: 480px;
  margin: 0 auto;
  box-shadow: 0 -10px 50px rgba(0, 0, 0, 0.4);
  max-height: 60vh;
  overflow-y: auto;
  transition: max-height 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.explanation-panel.expanded {
  max-height: 82vh;
}

.explanation-panel::-webkit-scrollbar {
  width: 3px;
}

.explanation-panel::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
}

.drag-handle {
  width: 36px;
  height: 4px;
  background: rgba(255, 255, 255, 0.18);
  border-radius: 2px;
  margin: 0 auto 16px;
}

.exp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.exp-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exp-header-icon {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 184, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gold);
}

.exp-title {
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  color: white;
}

.exp-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.exp-close {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.55);
  transition: all 0.2s;
}

.exp-close:hover {
  background: rgba(255, 255, 255, 0.15);
  color: white;
}

/* ── TABS ── */
.exp-tabs {
  display: flex;
  gap: 4px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 14px;
}

.exp-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.5);
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.exp-tab.active {
  background: white;
  color: var(--navy);
}

.exp-tab.locked {
  opacity: 0.6;
}

.tab-credit {
  background: var(--green);
  color: white;
  font-size: 10px;
  font-weight: 700;
  padding: 1px 6px;
  border-radius: 10px;
  min-width: 18px;
  text-align: center;
}

.exp-tab.active .tab-credit {
  background: var(--navy);
  color: white;
}

/* ── CORRECT ANSWER ── */
.exp-correct-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(0, 200, 83, 0.13);
  color: var(--green);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 14px;
}

.exp-correct-banner strong {
  font-weight: 700;
}

/* ── CONTENT ── */
.exp-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.exp-body {
  color: rgba(255, 255, 255, 0.78);
  font-size: 14px;
  line-height: 1.78;
  white-space: pre-line;
  transition: filter 0.3s;
}

.exp-body.blurred {
  filter: blur(4px);
  user-select: none;
  pointer-events: none;
}

.exp-body p {
  margin-bottom: 2px;
}

.exp-blank {
  height: 8px;
}

/* ── LOCK ── */
.exp-locked {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 22px 20px;
  text-align: center;
  margin-top: -8px;
}

.locked-icon-wrap {
  width: 52px;
  height: 52px;
  border-radius: 16px;
  background: rgba(255, 184, 0, 0.15);
  color: var(--gold);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 12px;
}

.exp-locked strong {
  display: block;
  color: white;
  font-size: 15px;
  font-family: var(--font-display);
  margin-bottom: 8px;
}

.exp-locked p {
  color: rgba(255, 255, 255, 0.45);
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 16px;
}

.exp-upgrade-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--green);
  color: white;
  font-size: 14px;
  font-weight: 700;
  padding: 11px 22px;
  border-radius: 25px;
  box-shadow: 0 4px 16px rgba(0, 200, 83, 0.3);
}

/* ── TUTOR PROMPT ── */
.tutor-prompt-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 200, 83, 0.07);
  border: 1px solid rgba(0, 200, 83, 0.2);
  border-radius: 12px;
  padding: 12px 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.tutor-prompt-banner:hover {
  background: rgba(0, 200, 83, 0.13);
  border-color: rgba(0, 200, 83, 0.4);
}

.tpb-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tpb-icon {
  width: 32px;
  height: 32px;
  border-radius: 9px;
  background: rgba(0, 200, 83, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
  flex-shrink: 0;
}

.tpb-left strong {
  display: block;
  color: white;
  font-size: 13px;
}

.tpb-left span {
  color: rgba(255, 255, 255, 0.45);
  font-size: 11.5px;
}

.tpb-arrow {
  color: rgba(255, 255, 255, 0.4);
}

/* ── TRANSITIONS ── */
.slide-up-enter-active {
  transition: all 0.34s cubic-bezier(0.34, 1.1, 0.64, 1);
}

.slide-up-leave-active {
  transition: all 0.22s ease;
}

.slide-up-enter-from {
  transform: translateY(100%);
}

.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.tab-fade-enter-active {
  transition: all 0.22s ease;
}

.tab-fade-leave-active {
  transition: all 0.15s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateX(12px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateX(-8px);
}
</style>
