/**
 * useAiTutor.js
 *
 * Manages a single AI tutor conversation thread anchored to one exam question.
 *
 * Offline behaviour:
 *   - openThread() checks network BEFORE spending any credit.
 *   - If offline, returns { ok: false, reason: 'offline' } — credit is NOT spent.
 *   - sendMessage() also checks network; shows a recoverable error if dropped mid-chat.
 *   - The UI should always show a clear "needs internet" state rather than failing silently.
 *
 * Credit flow:
 *   - 1 credit charged on openThread() — only if online.
 *   - Unlimited messages within the thread.
 *   - Credit is deducted locally first (optimistic), then queued to sync to server.
 */

import { ref, readonly } from 'vue'
import { useUserStore }    from '@/stores/user'
import { useNetworkStore } from '@/stores/network'

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '/api'

export function useAiTutor() {
  const userStore    = useUserStore()
  const networkStore = useNetworkStore()

  // ── Thread state ──────────────────────────────────────────────────────
  const messages      = ref([])
  const loading       = ref(false)
  const error         = ref(null)
  const threadOpen    = ref(false)
  const creditSpent   = ref(false)
  const threadId      = ref(null)   // server thread ID once confirmed online
  const questionContext = ref(null)

  // ── Open a thread ─────────────────────────────────────────────────────

  /**
   * @param  ctx  { id, text, options, correctIndex, explanation, subject, topic, year }
   * @returns { ok: boolean, reason?: string }
   */
  async function openThread(ctx) {
    error.value = null

    if (!userStore.isPremium) {
      return { ok: false, reason: 'not_premium' }
    }
    if (!userStore.canUseAiTutor) {
      return { ok: false, reason: 'no_credits' }
    }

    // ── Hard gate: AI Tutor requires the internet ─────────────────────
    if (!networkStore.isOnline) {
      return { ok: false, reason: 'offline' }
    }

    // Charge credit (optimistic local deduct)
    if (!creditSpent.value) {
      const creditType = userStore.spendCredit()
      if (!creditType) return { ok: false, reason: 'no_credits' }
      creditSpent.value = true

      // Queue credit confirmation to server (non-blocking)
      confirmCreditOnServer(ctx, creditType).catch(() => {
        // Enqueue for later if confirmation fails
        enqueueCreditSync(ctx, creditType)
      })
    }

    questionContext.value = ctx
    threadOpen.value      = true
    messages.value        = []

    // Seed with opening message so thread never looks empty
    messages.value.push({
      id:      crypto.randomUUID(),
      role:    'assistant',
      content: seedOpener(ctx),
    })

    return { ok: true }
  }

  /** Open thread and immediately request the AI's context-aware opener */
  async function openThreadWithOpener(ctx) {
    const result = await openThread(ctx)
    if (!result.ok) return result

    // Replace static seed with a real AI opener
    loading.value = true
    try {
      const response = await callBackendAi(ctx, [
        { role: 'user', content: 'Hello, I just answered this question and would like to understand it better.' }
      ])
      messages.value = [{ id: crypto.randomUUID(), role: 'assistant', content: response }]
    } catch (err) {
      // Keep the static seed — don't surface this error
    } finally {
      loading.value = false
    }

    return { ok: true }
  }

  // ── Send a message ────────────────────────────────────────────────────

  async function sendMessage(userText) {
    if (!userText.trim() || loading.value || !questionContext.value) return

    if (!networkStore.isOnline) {
      error.value = 'offline'
      return
    }

    error.value = null

    messages.value.push({
      id:      crypto.randomUUID(),
      role:    'user',
      content: userText.trim(),
    })

    loading.value = true

    try {
      // Build history (skip the static seed opener if it was never replaced)
      const history = messages.value
        .slice(0, -1)  // exclude the message we just pushed (already in messages)
        .filter(m => m.id !== 'static-seed')
        .map(m => ({ role: m.role, content: m.content }))

      // Add the new user message to history for the API call
      history.push({ role: 'user', content: userText.trim() })

      const reply = await callBackendAi(questionContext.value, history)

      messages.value.push({
        id:      crypto.randomUUID(),
        role:    'assistant',
        content: reply,
      })
      console.log('Messages after AI reply:', messages.value)
    } catch (err) {
      if (err.message === 'OFFLINE') {
        error.value = 'offline'
        // Remove the user message we optimistically added
        messages.value = messages.value.slice(0, -1)
      } else {
        error.value = 'error'
      }
    } finally {
      loading.value = false
    }
  }

  // ── Thread lifecycle ──────────────────────────────────────────────────

  function closeThread() { threadOpen.value = false }

  function resetThread() {
    threadOpen.value    = false
    messages.value      = []
    creditSpent.value   = false
    questionContext.value = null
    error.value         = null
    threadId.value      = null
  }

  // ── Backend AI call (routes through our Laravel API, not directly to AI) ──

  async function callBackendAi(ctx, history) {
    if (!networkStore.isOnline) throw new Error('OFFLINE')

    const res = await fetch(`${API_BASE}/ai/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        question_context: ctx,
        messages:         history,
      }),
    })
    
    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error(data.message ?? `HTTP ${res.status}`)
    }

    const data = await res.json()
    console.log('AI response data:', data)  
    return data.reply
  }

  async function confirmCreditOnServer(ctx, creditType) {
    // Tell server a thread was opened so credits stay in sync
    const res = await fetch(`${API_BASE}/ai/threads`, {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization:  `Bearer ${userStore.token}`,
      },
      body: JSON.stringify({
        question_id:     ctx.id,
        credit_type:     creditType,
      }),
    })
    
    if (res.ok) {
      const data = await res.json()
      console.log('Credit confirmation response:', data)
      threadId.value = data.thread?.id ?? null
    }
  }

  async function enqueueCreditSync(ctx, creditType) {
    const { useSyncStore } = await import('@/stores/sync')
    useSyncStore().enqueue('credit_spend', {
      question_id:     ctx.id,
      credit_type:     creditType,
      thread_id:       crypto.randomUUID(),
    })
  }

  // ── Helpers ───────────────────────────────────────────────────────────

  function seedOpener(ctx) {
    return `I'm here to help you understand this ${ctx.subject} question. What would you like to know? I can explain the answer step by step, show you a similar example, or break down the underlying concept.`
  }

  return {
    messages:        readonly(messages),
    loading:         readonly(loading),
    error:           readonly(error),
    threadOpen:      readonly(threadOpen),
    creditSpent:     readonly(creditSpent),
    questionContext: readonly(questionContext),
    openThread,
    openThreadWithOpener,
    closeThread,
    resetThread,
    sendMessage,
  }
}