<template>
  <Transition name="tutor-slide">
    <div v-if="visible" class="tutor-panel">

      <!-- ── HEADER ── -->
      <div class="tutor-header">
        <div class="tutor-header-left">
          <div class="tutor-avatar">
            <PhRobot :size="20" weight="fill" />
          </div>
          <div class="tutor-header-info">
            <span class="tutor-name">AI Tutor</span>
            <span class="tutor-status">
              <span class="status-dot" :class="{ active: !loading }"></span>
              {{ loading ? 'Thinking...' : 'Ready to help' }}
            </span>
          </div>
        </div>

        <div class="tutor-header-right">
          <!-- Credit display -->
          <div class="credit-chip" :class="{ low: totalCredits <= 10 }">
            <PhCoins :size="13" weight="fill" />
            <span>{{ totalCredits }} left</span>
          </div>
          <button class="tutor-close" @click="emit('close')">
            <PhX :size="18" weight="bold" />
          </button>
        </div>
      </div>

      <!-- ── CONTEXT BANNER ── -->
      <div class="context-banner">
        <PhBookOpen :size="14" weight="fill" />
        <span>{{ subjectLabel }} · {{ topicLabel }} · JAMB {{ questionContext?.year }}</span>
      </div>

      <!-- ── MESSAGES ── -->
      <div class="messages-wrap" ref="messagesEl">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-row"
          :class="msg.role"
        >
          <!-- Assistant avatar -->
          <div v-if="msg.role === 'assistant'" class="msg-avatar">
            <PhRobot :size="14" weight="fill" />
          </div>

          <div class="message-bubble" :class="msg.role">
            <!-- Render message with line break support -->
            <p
              v-for="(line, i) in formatMessage(msg.content)"
              :key="i"
              :class="{ blank: line === '' }"
            >{{ line }}</p>

            <!-- Suggested follow-ups (first assistant message only) -->
            <div
              v-if="msg.role === 'assistant' && messages.indexOf(msg) === 0 && suggestions.length"
              class="suggestions"
            >
              <button
                v-for="s in suggestions"
                :key="s"
                class="suggestion-chip"
                @click="sendSuggestion(s)"
              >{{ s }}</button>
            </div>
          </div>
        </div>

        <!-- Loading indicator -->
        <div v-if="loading" class="message-row assistant">
          <div class="msg-avatar">
            <PhRobot :size="14" weight="fill" />
          </div>
          <div class="message-bubble assistant typing">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="error-row">
          <PhWarning :size="14" weight="fill" />
          {{ error }}
          <button @click="retryLast">Retry</button>
        </div>
      </div>

      <!-- ── INPUT ── -->
      <div class="tutor-input-wrap">
        <textarea
          v-model="inputText"
          ref="inputEl"
          class="tutor-input"
          placeholder="Ask anything about this question..."
          rows="1"
          :disabled="loading"
          @keydown.enter.exact.prevent="handleSend"
          @input="autoResize"
        ></textarea>
        <button
          class="send-btn"
          :class="{ active: inputText.trim() }"
          :disabled="!inputText.trim() || loading"
          @click="handleSend"
        >
          <PhPaperPlaneTilt :size="18" weight="fill" />
        </button>
      </div>

      <!-- Credit top-up nudge (when low) -->
      <Transition name="fade">
        <div v-if="totalCredits <= 5 && totalCredits > 0" class="low-credits-bar">
          <PhWarning :size="13" weight="fill" />
          Only {{ totalCredits }} credit{{ totalCredits !== 1 ? 's' : '' }} left.
          <RouterLink to="/upgrade" class="topup-link">Top up →</RouterLink>
        </div>
      </Transition>

      <!-- Out of credits -->
      <Transition name="fade">
        <div v-if="totalCredits === 0" class="no-credits-bar">
          <PhLock :size="13" weight="fill" />
          You've used all your credits.
          <RouterLink to="/upgrade" class="topup-link">Get more →</RouterLink>
        </div>
      </Transition>

    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { useUserStore } from '@/stores/user'
import { SUBJECT_CONFIG } from '@/data/questions'
import {
  PhRobot, PhCoins, PhX, PhBookOpen,
  PhPaperPlaneTilt, PhWarning, PhLock
} from '@phosphor-icons/vue'

const props = defineProps({
  visible:         { type: Boolean, required: true },
  messages:        { type: Array,   required: true },
  loading:         { type: Boolean, default: false },
  error:           { type: String,  default: null },
  questionContext: { type: Object,  default: null }
})

const emit = defineEmits(['close', 'send'])

const userStore    = useUserStore()
const totalCredits = computed(() => userStore.totalCredits)

const inputText  = ref('')
const messagesEl = ref(null)
const inputEl    = ref(null)

// ── Subject / topic display
const subjectLabel = computed(() =>
  SUBJECT_CONFIG[props.questionContext?.subject]?.label || props.questionContext?.subject || ''
)
const topicLabel = computed(() => {
  const t = props.questionContext?.topic || ''
  return t.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
})

// ── Suggested follow-up chips (generated from subject/topic)
const suggestions = computed(() => {
  const subj = props.questionContext?.subject
  const base = [
    'Explain this differently',
    'Give me a similar example',
    'What are common mistakes here?',
  ]
  const subjectSpecific = {
    mathematics: ['Show me the full working', 'What formula applies here?'],
    chemistry:   ['Draw the structure for me', 'How does this relate to the periodic table?'],
    biology:     ['Where does this happen in the body?', 'Connect this to evolution'],
    english:     ['Show another sentence like this', "What's the grammar rule?"],
  }
  return [...base.slice(0, 2), ...(subjectSpecific[subj] || []).slice(0, 1)]
})

// ── Send
function handleSend() {
  if (!inputText.value.trim() || props.loading) return
  emit('send', inputText.value.trim())
  inputText.value = ''
  nextTick(() => { if (inputEl.value) inputEl.value.style.height = 'auto' })
}

function sendSuggestion(text) {
  emit('send', text)
}

// ── Retry last failed message
const lastUserMessage = ref('')
watch(() => props.messages, (msgs) => {
  const last = [...msgs].reverse().find(m => m.role === 'user')
  if (last) lastUserMessage.value = last.content
}, { deep: true })

function retryLast() {
  if (lastUserMessage.value) emit('send', lastUserMessage.value)
}

// ── Auto-scroll to bottom on new messages
watch(() => props.messages.length, async () => {
  await nextTick()
  if (messagesEl.value) {
    messagesEl.value.scrollTo({ top: messagesEl.value.scrollHeight, behavior: 'smooth' })
  }
})

// ── Auto-resize textarea
function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 120) + 'px'
}

// ── Format message — split by newlines
function formatMessage(content) {
  return content.split('\n')
}

// Focus input when panel opens
watch(() => props.visible, async (val) => {
  if (val) {
    await nextTick()
    inputEl.value?.focus()
  }
})
</script>

<style scoped>
.tutor-panel {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  max-width: 480px;
  margin: 0 auto;
  background: white;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -12px 50px rgba(10,15,44,0.22);
  z-index: 250;
  display: flex;
  flex-direction: column;
  height: 72vh;
  max-height: 680px;
}

/* ── HEADER ── */
.tutor-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px 12px;
  border-bottom: 1px solid var(--border);
  flex-shrink: 0;
}

.tutor-header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tutor-avatar {
  width: 38px; height: 38px;
  border-radius: 12px;
  background: linear-gradient(135deg, var(--navy-mid), var(--navy-light));
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
  flex-shrink: 0;
}

.tutor-header-info {
  display: flex;
  flex-direction: column;
}

.tutor-name {
  font-family: var(--font-display);
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.tutor-status {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11.5px;
  color: var(--muted);
}

.status-dot {
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--muted);
  transition: background 0.3s;
}
.status-dot.active { background: var(--green); }

.tutor-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.credit-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  background: var(--green-soft);
  color: var(--green-dark);
  font-size: 11.5px;
  font-weight: 700;
  padding: 5px 10px;
  border-radius: 20px;
  transition: all 0.3s;
}
.credit-chip.low {
  background: var(--gold-soft);
  color: var(--gold-dark);
}

.tutor-close {
  width: 32px; height: 32px;
  border-radius: 10px;
  background: var(--grey);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.tutor-close:hover { background: var(--border); color: var(--text); }

/* ── CONTEXT BANNER ── */
.context-banner {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 18px;
  background: var(--navy);
  color: rgba(255,255,255,0.65);
  font-size: 11.5px;
  font-weight: 500;
  flex-shrink: 0;
}
.context-banner ph-icon { color: var(--green); }

/* ── MESSAGES ── */
.messages-wrap {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  scroll-behavior: smooth;
}

.messages-wrap::-webkit-scrollbar { width: 3px; }
.messages-wrap::-webkit-scrollbar-thumb { background: var(--border); }

.message-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.message-row.user {
  flex-direction: row-reverse;
}

.msg-avatar {
  width: 28px; height: 28px;
  border-radius: 9px;
  background: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--green);
  flex-shrink: 0;
  margin-bottom: 2px;
}

.message-bubble {
  max-width: 82%;
  padding: 11px 14px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.65;
}

.message-bubble p { margin-bottom: 2px; }
.message-bubble p.blank { height: 6px; }

.message-bubble.assistant {
  background: var(--grey);
  color: var(--text);
  border-bottom-left-radius: 4px;
}

.message-bubble.user {
  background: var(--navy);
  color: white;
  border-bottom-right-radius: 4px;
  margin-left: auto;
}

/* ── TYPING INDICATOR ── */
.message-bubble.typing {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 14px 18px;
}

.message-bubble.typing span {
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--muted);
  display: inline-block;
  animation: typing-bounce 1.2s ease-in-out infinite;
}
.message-bubble.typing span:nth-child(2) { animation-delay: 0.2s; }
.message-bubble.typing span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing-bounce {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

/* ── SUGGESTIONS ── */
.suggestions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.suggestion-chip {
  padding: 6px 12px;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  color: var(--text);
  cursor: pointer;
  transition: all 0.18s;
  font-family: var(--font-body);
}
.suggestion-chip:hover {
  border-color: var(--green);
  color: var(--green-dark);
  background: var(--green-soft);
}

/* ── ERROR ── */
.error-row {
  display: flex;
  align-items: center;
  gap: 7px;
  color: var(--red);
  font-size: 13px;
  padding: 10px 14px;
  background: var(--red-soft);
  border-radius: 12px;
}
.error-row button {
  margin-left: auto;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--red);
  text-decoration: underline;
  background: none;
  border: none;
  cursor: pointer;
}

/* ── INPUT ── */
.tutor-input-wrap {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  flex-shrink: 0;
}

.tutor-input {
  flex: 1;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  padding: 11px 14px;
  font-family: var(--font-body);
  font-size: 14px;
  color: var(--text);
  resize: none;
  outline: none;
  line-height: 1.5;
  min-height: 44px;
  max-height: 120px;
  transition: border-color 0.2s;
  overflow-y: auto;
}
.tutor-input:focus { border-color: var(--navy); }
.tutor-input::placeholder { color: var(--muted); }
.tutor-input:disabled { opacity: 0.6; background: var(--grey); }

.send-btn {
  width: 44px; height: 44px;
  border-radius: 12px;
  background: var(--border);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s;
}
.send-btn.active {
  background: var(--navy);
  color: white;
  box-shadow: 0 4px 14px rgba(10,15,44,0.25);
}
.send-btn:disabled { cursor: not-allowed; }

/* ── CREDIT BARS ── */
.low-credits-bar,
.no-credits-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 16px;
  font-size: 12.5px;
  font-weight: 500;
  flex-shrink: 0;
}

.low-credits-bar {
  background: var(--gold-soft);
  color: var(--gold-dark);
}

.no-credits-bar {
  background: var(--red-soft);
  color: var(--red);
}

.topup-link {
  margin-left: auto;
  font-weight: 700;
  color: inherit;
  text-decoration: underline;
}

/* ── TRANSITION ── */
.tutor-slide-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.05, 0.64, 1);
}
.tutor-slide-leave-active {
  transition: all 0.24s ease;
}
.tutor-slide-enter-from,
.tutor-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

/* ── FADE ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
