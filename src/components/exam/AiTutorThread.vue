<template>
  <div class="tutor-thread">

    <!-- NO CREDITS -->
    <div v-if="!userStore.canUseAiTutor && userStore.isPremium" class="no-credits">
      <div class="nc-icon"><PhCoins :size="28" weight="fill" /></div>
      <strong>No credits remaining</strong>
      <p>Top up to keep asking the AI Tutor.</p>
      <RouterLink to="/upgrade" class="nc-btn">
        <PhPlus :size="14" weight="bold" /> Top Up Credits
      </RouterLink>
    </div>

    <div v-else class="thread-wrap">

      <!-- Credit bar -->
      <div class="credit-bar">
        <div class="credit-bar-left">
          <PhCoins :size="13" weight="fill" />
          <span>{{ userStore.totalCredits }} credits remaining</span>
        </div>
        <span class="credit-bar-note">1 credit per conversation</span>
      </div>

      <!-- Messages -->
      <div class="messages" ref="messagesEl">

        <!-- Empty state -->
        <div v-if="!threadStarted" class="empty-thread">
          <div class="et-avatar"><PhRobot :size="22" weight="fill" /></div>
          <p class="et-text">Ask me anything about this question — I'll explain it differently, give examples, or break down the working step by step.</p>
          <div class="suggestions">
            <button v-for="s in suggestions" :key="s" class="suggestion-chip" @click="startThread(s)">{{ s }}</button>
          </div>
        </div>

        <!-- Message list -->
        <template v-else>
          <div v-for="msg in tutor.messages" :key="msg.id" class="message-row" :class="msg.role">
            <div v-if="msg.role === 'assistant'" class="msg-avatar"><PhRobot :size="13" weight="fill" /></div>
            <div class="bubble" :class="msg.role">{{ msg.content }}</div>
          </div>
          <div v-if="tutor.loading" class="message-row assistant">
            <div class="msg-avatar"><PhRobot :size="13" weight="fill" /></div>
            <div class="bubble assistant typing"><span></span><span></span><span></span></div>
          </div>
        </template>

        <div v-if="tutor.error" class="error-chip">
          <PhWarningCircle :size="14" weight="fill" /> {{ tutor.error }}
        </div>
      </div>

      <!-- Input -->
      <div class="thread-input-wrap">
        <textarea
          v-model="inputText"
          ref="inputEl"
          class="thread-input"
          :placeholder="threadStarted ? 'Ask another question...' : 'Ask your question...'"
          rows="1"
          :disabled="tutor.loading"
          @keydown.enter.exact.prevent="send"
          @input="autoResize"
        ></textarea>
        <button class="send-btn" :class="{ active: inputText.trim() }" :disabled="!inputText.trim() || tutor.loading" @click="send">
          <PhPaperPlaneTilt :size="16" weight="fill" />
        </button>
      </div>

      <div v-if="userStore.totalCredits <= 5 && userStore.totalCredits > 0" class="low-bar">
        <PhWarning :size="12" weight="fill" />
        Only {{ userStore.totalCredits }} credit{{ userStore.totalCredits !== 1 ? 's' : '' }} left —
        <RouterLink to="/upgrade" class="low-link">top up</RouterLink>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { PhRobot, PhCoins, PhPlus, PhPaperPlaneTilt, PhWarning, PhWarningCircle } from '@phosphor-icons/vue'
import { useUserStore } from '@/stores/user'
import { useAiTutor } from '@/composables/useAiTutor'

const props = defineProps({
  questionText:  { type: String, required: true },
  subject:       { type: String, required: true },
  topic:         { type: String, default: '' },
  year:          { type: Number, default: null },
  explanation:   { type: String, default: '' },
  correctAnswer: { type: String, default: '' },
  options:       { type: Array,  default: () => [] },
  correctIndex:  { type: Number, default: 0 }
})

const userStore     = useUserStore()
const tutor         = useAiTutor()
const inputText     = ref('')
const messagesEl    = ref(null)
const inputEl       = ref(null)
const threadStarted = ref(false)

const context = computed(() => ({
  text: props.questionText, options: props.options,
  correctIndex: props.correctIndex, explanation: props.explanation,
  subject: props.subject, topic: props.topic, year: props.year
}))

const suggestions = computed(() => {
  const base = ['Explain this differently', 'Give me a similar example']
  const extra = {
    mathematics: 'Show the full working',
    chemistry: 'Why does this happen chemically?',
    biology: 'Where does this occur in the body?',
    english: 'What is the grammar rule here?',
    physics: 'What formula applies here?',
  }
  return [...base, extra[props.subject] || 'What are common mistakes here?']
})

async function startThread(text) {
  if (!userStore.canUseAiTutor) return
  const opened = tutor.openThread(context.value)
  if (!opened) return
  threadStarted.value = true
  await nextTick()
  scrollToBottom()
  await tutor.sendMessage(text)
  scrollToBottom()
}

async function send() {
  const text = inputText.value.trim()
  if (!text || tutor.loading) return
  inputText.value = ''
  await nextTick()
  if (inputEl.value) inputEl.value.style.height = 'auto'
  if (!threadStarted.value) await startThread(text)
  else { await tutor.sendMessage(text); scrollToBottom() }
}

function autoResize(e) {
  const el = e.target
  el.style.height = 'auto'
  el.style.height = Math.min(el.scrollHeight, 100) + 'px'
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) messagesEl.value.scrollTo({ top: messagesEl.value.scrollHeight, behavior: 'smooth' })
  })
}

watch(() => tutor.messages.length, scrollToBottom)
</script>

<style scoped>
.tutor-thread { display: flex; flex-direction: column; min-height: 200px; }
.no-credits { text-align: center; padding: 20px 16px; }
.nc-icon { width: 56px; height: 56px; border-radius: 16px; background: rgba(255,184,0,0.12); color: var(--gold); display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.no-credits strong { display: block; color: white; font-size: 15px; margin-bottom: 8px; }
.no-credits p { color: rgba(255,255,255,0.45); font-size: 13px; line-height: 1.55; margin-bottom: 16px; }
.nc-btn { display: inline-flex; align-items: center; gap: 6px; background: var(--green); color: white; font-size: 13.5px; font-weight: 700; padding: 10px 20px; border-radius: 25px; }
.thread-wrap { display: flex; flex-direction: column; gap: 10px; }
.credit-bar { display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; background: rgba(255,255,255,0.06); border-radius: 10px; font-size: 11.5px; }
.credit-bar-left { display: flex; align-items: center; gap: 5px; color: var(--green); font-weight: 600; }
.credit-bar-note { color: rgba(255,255,255,0.3); }
.messages { display: flex; flex-direction: column; gap: 10px; max-height: 220px; overflow-y: auto; padding-right: 4px; }
.messages::-webkit-scrollbar { width: 3px; }
.messages::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
.empty-thread { text-align: center; padding: 8px 0; }
.et-avatar { width: 44px; height: 44px; border-radius: 14px; background: rgba(0,200,83,0.12); color: var(--green); display: flex; align-items: center; justify-content: center; margin: 0 auto 10px; }
.et-text { color: rgba(255,255,255,0.55); font-size: 13px; line-height: 1.6; margin-bottom: 14px; }
.suggestions { display: flex; flex-wrap: wrap; gap: 7px; justify-content: center; }
.suggestion-chip { padding: 7px 13px; background: rgba(255,255,255,0.07); border: 1px solid rgba(255,255,255,0.12); border-radius: 20px; font-size: 12px; font-weight: 500; color: rgba(255,255,255,0.75); cursor: pointer; transition: all 0.18s; font-family: var(--font-body); }
.suggestion-chip:hover { background: rgba(0,200,83,0.12); border-color: rgba(0,200,83,0.35); color: var(--green); }
.message-row { display: flex; align-items: flex-end; gap: 7px; }
.message-row.user { flex-direction: row-reverse; }
.msg-avatar { width: 24px; height: 24px; border-radius: 7px; background: rgba(0,200,83,0.15); color: var(--green); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bubble { max-width: 85%; padding: 10px 13px; border-radius: 14px; font-size: 13.5px; line-height: 1.65; white-space: pre-line; }
.bubble.assistant { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.85); border-bottom-left-radius: 4px; }
.bubble.user { background: var(--green-dark); color: white; border-bottom-right-radius: 4px; margin-left: auto; }
.bubble.typing { display: flex; align-items: center; gap: 5px; padding: 12px 16px; }
.bubble.typing span { width: 6px; height: 6px; border-radius: 50%; background: rgba(255,255,255,0.4); display: inline-block; animation: bounce 1.1s ease-in-out infinite; }
.bubble.typing span:nth-child(2) { animation-delay: 0.18s; }
.bubble.typing span:nth-child(3) { animation-delay: 0.36s; }
@keyframes bounce { 0%, 60%, 100% { transform: translateY(0); opacity: 0.4; } 30% { transform: translateY(-5px); opacity: 1; } }
.error-chip { display: flex; align-items: center; gap: 6px; background: rgba(255,68,68,0.12); color: #FF6B6B; border-radius: 10px; padding: 9px 12px; font-size: 12.5px; }
.thread-input-wrap { display: flex; align-items: flex-end; gap: 8px; background: rgba(255,255,255,0.07); border-radius: 14px; padding: 8px 8px 8px 14px; border: 1.5px solid rgba(255,255,255,0.08); transition: border-color 0.2s; }
.thread-input-wrap:focus-within { border-color: rgba(0,200,83,0.4); }
.thread-input { flex: 1; background: transparent; border: none; outline: none; font-family: var(--font-body); font-size: 13.5px; color: white; resize: none; line-height: 1.5; min-height: 22px; max-height: 100px; overflow-y: auto; }
.thread-input::placeholder { color: rgba(255,255,255,0.3); }
.thread-input:disabled { opacity: 0.5; }
.send-btn { width: 36px; height: 36px; border-radius: 10px; background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.35); border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all 0.2s; }
.send-btn.active { background: var(--green); color: white; box-shadow: 0 3px 12px rgba(0,200,83,0.4); }
.send-btn:disabled { cursor: not-allowed; }
.low-bar { display: flex; align-items: center; gap: 5px; font-size: 11.5px; color: rgba(255,184,0,0.8); padding: 0 2px; }
.low-link { color: var(--gold); font-weight: 700; text-decoration: underline; }
</style>
