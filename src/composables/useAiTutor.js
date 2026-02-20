// composables/useAiTutor.js
// Manages a single AI tutor thread anchored to one exam question.
// Each thread costs 1 credit on open. Messages within the thread are free.

import { ref, readonly } from 'vue'
import { useUserStore } from '@/stores/user'

export function useAiTutor() {
  const userStore = useUserStore()

  // ── Thread state
  const messages   = ref([])   // { role: 'user'|'assistant', content: string, id: string }
  const loading    = ref(false)
  const error      = ref(null)
  const threadOpen = ref(false)
  const creditSpent = ref(false) // track if credit was already charged for this thread

  // ── The question context anchored to this thread
  const questionContext = ref(null)
  /*
    questionContext = {
      text:          string,  // full question text
      options:       string[], // the 4 options
      correctIndex:  number,
      explanation:   string,
      subject:       string,
      topic:         string,
      year:          number
    }
  */

  // ── Open a new thread for a specific question
  // Returns false if no credits available
  function openThread(ctx) {
    if (!userStore.isPremium) return false

    // Charge credit only once per thread
    if (!creditSpent.value) {
      const success = userStore.spendCredit()
      if (!success) return false
      creditSpent.value = true
    }

    questionContext.value = ctx
    threadOpen.value = true
    messages.value = []
    error.value = null

    // Seed with a helpful opener so it doesn't feel blank
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: `I'm here to help you understand this question. What would you like to know? You can ask me to explain it differently, give you a similar example, or break down any part of the solution step by step.`
    })

    return true
  }

  function closeThread() {
    threadOpen.value = false
    // Keep messages — student can re-open and continue. Credit already spent.
  }

  function resetThread() {
    threadOpen.value = false
    messages.value = []
    creditSpent.value = false
    questionContext.value = null
    error.value = null
  }

  // ── Send a message
  async function sendMessage(userText) {
    if (!userText.trim() || loading.value || !questionContext.value) return
    error.value = null

    // Add user message
    messages.value.push({
      id: crypto.randomUUID(),
      role: 'user',
      content: userText.trim()
    })

    loading.value = true

    try {
      const ctx = questionContext.value
      const correctOption = ctx.options[ctx.correctIndex]

      // Build the conversation history for the API (exclude our opener)
      const apiMessages = messages.value
        .filter(m => !(m.role === 'assistant' && messages.value.indexOf(m) === 0))
        .map(m => ({ role: m.role, content: m.content }))

      const systemPrompt = buildSystemPrompt(ctx, correctOption)

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: apiMessages
        })
      })

      if (!response.ok) {
        const err = await response.json()
        throw new Error(err.error?.message || 'API error')
      }

      const data = await response.json()
      const replyText = data.content
        .filter(b => b.type === 'text')
        .map(b => b.text)
        .join('')

      messages.value.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: replyText
      })

    } catch (err) {
      error.value = 'Something went wrong. Please try again.'
      console.error('AI Tutor error:', err)
    } finally {
      loading.value = false
    }
  }

  // ── Build a focused system prompt with full question context
  function buildSystemPrompt(ctx, correctOption) {
    return `You are an expert JAMB (Joint Admissions and Matriculation Board) tutor helping a Nigerian student prepare for their university entrance exam. You are warm, encouraging, and highly knowledgeable in all JAMB subjects.

QUESTION CONTEXT (what the student just answered):
Subject: ${ctx.subject} — ${ctx.topic}
Year: JAMB ${ctx.year}

Question: ${ctx.text}

Options:
${ctx.options.map((o, i) => `${['A','B','C','D'][i]}. ${o}`).join('\n')}

Correct Answer: ${['A','B','C','D'][ctx.correctIndex]}. ${correctOption}

Official Explanation: ${ctx.explanation}

YOUR ROLE:
- Help the student deeply understand this specific question and the underlying concept
- Answer their follow-up questions clearly with Nigerian curriculum in mind
- Use simple analogies, worked examples, and step-by-step breakdowns
- If they ask for another example, give one that is similar but slightly different
- Keep all explanations relevant to JAMB level and the Nigerian curriculum
- Be encouraging — many students feel anxious about JAMB
- If the student asks something completely unrelated to this question or academics, gently bring them back: "Let's stay focused on this topic for now — what else would you like to understand about it?"
- Never solve or answer a live exam question for a student who mentions they are currently in an exam
- Keep responses concise but complete — aim for 80–150 words unless a longer explanation is genuinely needed
- Format with simple line breaks. Do not use markdown headers or bullet points — this is a chat interface`
  }

  return {
    // State
    messages:      readonly(messages),
    loading:       readonly(loading),
    error:         readonly(error),
    threadOpen:    readonly(threadOpen),
    creditSpent:   readonly(creditSpent),
    questionContext: readonly(questionContext),
    // Actions
    openThread,
    closeThread,
    resetThread,
    sendMessage
  }
}
