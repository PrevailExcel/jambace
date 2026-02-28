import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'
import { useQuestionsStore } from './questions'


export const CREDIT_PACKS = [
  { id: 'pack_50',  credits: 50,  price: 200,  label: '50 Credits',  tag: null },
  { id: 'pack_150', credits: 150, price: 500,  label: '150 Credits', tag: 'Popular' },
  { id: 'pack_400', credits: 400, price: 1000, label: '400 Credits', tag: 'Best Value' },
]

export const MONTHLY_FREE_CREDITS = 100

export const useUserStore = defineStore('user', () => {
  // ── Auth ──────────────────────────────────────────────────────────────
  const profile         = ref(null)   // { id, name, email, avatar, phone }
  const token           = ref(null)
  const tokenExpiresAt  = ref(null)   // ISO string — used for silent refresh
  const questionsStore   = useQuestionsStore()

  // ── Subscription ──────────────────────────────────────────────────────
  const trialStartDate      = ref(null)
  const subscriptionExpiry  = ref(null)
  const subscriptionStatus  = ref('none') // 'none' | 'trial' | 'active' | 'expired' | 'referral'
  const referralCount       = ref(0)
  const referralCode        = ref(null)

  // ── Exam setup ────────────────────────────────────────────────────────
  const examDate    = ref(null)
  const targetScore = ref(280)
  const subjects    = ref([])

  // ── AI Tutor Credits ──────────────────────────────────────────────────
  const monthlyCredits   = ref(0)
  const purchasedCredits = ref(0)
  const lastCreditReset  = ref(null)  // 'YYYY-MM'

  // ── Getters ───────────────────────────────────────────────────────────

  const isLoggedIn = computed(() => !!token.value)

  const trialDaysLeft = computed(() => {
    if (!trialStartDate.value) return 0
    return Math.max(0, dayjs(trialStartDate.value).add(30, 'day').diff(dayjs(), 'day'))
  })

  const isInTrial = computed(() => trialDaysLeft.value > 0)

  const isPremium = computed(() => {
    if (subscriptionStatus.value === 'referral') return true
    if (subscriptionExpiry.value && dayjs().isBefore(dayjs(subscriptionExpiry.value))) return true
    if (isInTrial.value) return true
    return false
  })

  const isFullPremium = computed(() =>
    subscriptionStatus.value === 'referral' ||
    (subscriptionExpiry.value && dayjs().isBefore(dayjs(subscriptionExpiry.value)))
  )

  const daysToExam = computed(() =>
    examDate.value ? Math.max(0, dayjs(examDate.value).diff(dayjs(), 'day')) : null
  )

  const totalCredits    = computed(() => monthlyCredits.value + purchasedCredits.value)
  const canUseAiTutor   = computed(() => isPremium.value && totalCredits.value > 0)

  const tokenIsExpired  = computed(() => {
    if (!tokenExpiresAt.value) return false
    return dayjs().isAfter(dayjs(tokenExpiresAt.value))
  })

  const tokenExpiresInDays = computed(() => {
    if (!tokenExpiresAt.value) return null
    return dayjs(tokenExpiresAt.value).diff(dayjs(), 'day')
  })

  // ── Actions ───────────────────────────────────────────────────────────

  function setProfile(data) {
    profile.value            = data.profile
    token.value              = data.token
    tokenExpiresAt.value     = data.token_expires_at ?? null

    // Subscription
    subscriptionStatus.value  = data.subscription?.status     ?? 'none'
    trialStartDate.value      = data.subscription?.trial_started_at ?? dayjs().toISOString()
    subscriptionExpiry.value  = data.subscription?.expires_at ?? null
    referralCount.value       = data.referral?.count          ?? 0
    referralCode.value        = data.referral?.code           ?? null

    // Exam setup
    if (data.exam_setup) {
      examDate.value    = data.exam_setup.exam_date
      targetScore.value = data.exam_setup.target_score ?? 280
      subjects.value    = data.exam_setup.subjects     ?? []
    }

    // Credits
    monthlyCredits.value   = data.credits?.monthly   ?? MONTHLY_FREE_CREDITS
    purchasedCredits.value = data.credits?.purchased ?? 0
    lastCreditReset.value  = data.credits?.reset_month ?? dayjs().format('YYYY-MM')

  }

  /**
   * Called when the server sends fresh state (on reconnect / token refresh).
   * Server is authoritative for subscription and credits.
   * We do NOT overwrite exam setup — that's owned locally until explicitly changed.
   */
  function reconcileFromServer(data) {
    if (!data) return

    if (data.token)          token.value          = data.token
    if (data.token_expires_at) tokenExpiresAt.value = data.token_expires_at

    if (data.subscription) {
      subscriptionStatus.value = data.subscription.status     ?? subscriptionStatus.value
      subscriptionExpiry.value = data.subscription.expires_at ?? subscriptionExpiry.value
      trialStartDate.value     = data.subscription.trial_started_at ?? trialStartDate.value
    }

    if (data.credits) {
      // Take the higher value — prevents server from rolling back local optimistic decrements
      monthlyCredits.value   = Math.max(data.credits.monthly   ?? 0, monthlyCredits.value)
      purchasedCredits.value = Math.max(data.credits.purchased ?? 0, purchasedCredits.value)
      lastCreditReset.value  = data.credits.reset_month ?? lastCreditReset.value
    }

    if (data.referral) {
      referralCount.value = data.referral.count ?? referralCount.value
    }
  }

  /** Silently swap in a fresh token after background refresh */
  function refreshToken(newToken, expiresAt) {
    token.value          = newToken
    tokenExpiresAt.value = expiresAt
  }

  function updateExamSetup({ date, score, subs }) {
    examDate.value    = date
    targetScore.value = score
    subjects.value    = subs
  }

  function incrementReferral() { referralCount.value++ }

  function activatePremium(expiryDate) {
    subscriptionStatus.value = 'active'
    subscriptionExpiry.value = expiryDate
    checkAndResetMonthlyCredits()
  }

  function checkAndResetMonthlyCredits() {
    if (!isPremium.value) return
    const thisMonth = dayjs().format('YYYY-MM')
    if (lastCreditReset.value !== thisMonth) {
      monthlyCredits.value  = MONTHLY_FREE_CREDITS
      lastCreditReset.value = thisMonth
    }
  }

  /**
   * Deduct 1 credit locally. Returns the type spent ('monthly'|'purchased') or false.
   * The sync store queues this to be confirmed server-side.
   */
  function spendCredit() {
    if (!isPremium.value || totalCredits.value <= 0) return false
    if (monthlyCredits.value > 0) {
      monthlyCredits.value--
      return 'monthly'
    }
    purchasedCredits.value--
    return 'purchased'
  }

  function addPurchasedCredits(amount) {
    purchasedCredits.value += amount
  }

  function logout() {
    profile.value            = null
    token.value              = null
    tokenExpiresAt.value     = null
    trialStartDate.value     = null
    subscriptionExpiry.value = null
    subscriptionStatus.value = 'none'
    monthlyCredits.value     = 0
    purchasedCredits.value   = 0

    // Question cache is plain JSON — pinia persist clears on next hydration
    // Call questionsStore.clearCache() from the logout UI if you want immediate wipe
    questionsStore.clearCache()
  }

  function checkSession() {
    if (!token.value) return
    checkAndResetMonthlyCredits()
  }

  return {
    // State
    profile, token, tokenExpiresAt,
    trialStartDate, subscriptionExpiry, subscriptionStatus,
    referralCount, referralCode,
    examDate, targetScore, subjects,
    monthlyCredits, purchasedCredits, lastCreditReset,
    // Getters
    isLoggedIn, trialDaysLeft, isInTrial, isPremium, isFullPremium,
    daysToExam, totalCredits, canUseAiTutor,
    tokenIsExpired, tokenExpiresInDays,
    // Actions
    setProfile, reconcileFromServer, refreshToken,
    updateExamSetup, incrementReferral,
    activatePremium, checkAndResetMonthlyCredits,
    spendCredit, addPurchasedCredits,
    logout, checkSession,
  }
}, { persist: true })