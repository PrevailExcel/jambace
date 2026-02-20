import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import dayjs from 'dayjs'

// ── AI Tutor credit packs (prices in Naira)
export const CREDIT_PACKS = [
  { id: 'pack_50',  credits: 50,  price: 200,  label: '50 Credits',  tag: null },
  { id: 'pack_150', credits: 150, price: 500,  label: '150 Credits', tag: 'Popular' },
  { id: 'pack_400', credits: 400, price: 1000, label: '400 Credits', tag: 'Best Value' },
]

export const MONTHLY_FREE_CREDITS = 100  // given to premium users every month

export const useUserStore = defineStore('user', () => {
  // ── State
  const profile = ref(null)         // { id, name, email, avatar, phone }
  const token = ref(null)
  const trialStartDate = ref(null)
  const subscriptionExpiry = ref(null)
  const referralCount = ref(0)
  const referralCode = ref(null)

  // Exam setup
  const examDate = ref(null)
  const targetScore = ref(280)
  const subjects = ref([])

  // ── AI Tutor Credits
  const monthlyCredits = ref(0)         // resets each month (included with premium)
  const purchasedCredits = ref(0)       // never expire — from top-up packs
  const lastCreditReset = ref(null)     // ISO date of last monthly reset 'YYYY-MM'

  // ── Getters
  const isLoggedIn = computed(() => !!token.value)

  const trialDaysLeft = computed(() => {
    if (!trialStartDate.value) return 0
    const end = dayjs(trialStartDate.value).add(30, 'day')
    return Math.max(0, end.diff(dayjs(), 'day'))
  })

  const isInTrial = computed(() => trialDaysLeft.value > 0)

  const isPremium = computed(() => {
    if (subscriptionExpiry.value && dayjs().isBefore(dayjs(subscriptionExpiry.value))) return true
    if (referralCount.value >= 5) return true
    if (isInTrial.value) return true
    return false
  })

  const isFullPremium = computed(() =>
    (subscriptionExpiry.value && dayjs().isBefore(dayjs(subscriptionExpiry.value))) ||
    referralCount.value >= 5
  )

  const daysToExam = computed(() => {
    if (!examDate.value) return null
    return Math.max(0, dayjs(examDate.value).diff(dayjs(), 'day'))
  })

  // Total available AI tutor credits
  const totalCredits = computed(() => monthlyCredits.value + purchasedCredits.value)

  // Can the user open a new AI tutor thread?
  const canUseAiTutor = computed(() => isPremium.value && totalCredits.value > 0)

  // ── Actions
  function setProfile(data) {
    profile.value = data.profile
    token.value = data.token
    trialStartDate.value = data.trialStartDate || dayjs().toISOString()
    subscriptionExpiry.value = data.subscriptionExpiry || null
    referralCount.value = data.referralCount || 0
    referralCode.value = data.referralCode || null
    monthlyCredits.value = data.monthlyCredits ?? MONTHLY_FREE_CREDITS
    purchasedCredits.value = data.purchasedCredits ?? 0
    lastCreditReset.value = data.lastCreditReset || dayjs().format('YYYY-MM')
  }

  function updateExamSetup({ date, score, subs }) {
    examDate.value = date
    targetScore.value = score
    subjects.value = subs
  }

  function incrementReferral() { referralCount.value++ }

  function activatePremium(expiryDate) {
    subscriptionExpiry.value = expiryDate
    // Grant monthly credits immediately on activation
    checkAndResetMonthlyCredits()
  }

  // Called on app mount and when premium activates
  function checkAndResetMonthlyCredits() {
    if (!isPremium.value) return
    const thisMonth = dayjs().format('YYYY-MM')
    if (lastCreditReset.value !== thisMonth) {
      monthlyCredits.value = MONTHLY_FREE_CREDITS
      lastCreditReset.value = thisMonth
      // TODO: sync with backend
    }
  }

  // Spend 1 credit when opening a new AI tutor thread
  // Returns true if successful, false if no credits
  function spendCredit() {
    if (!isPremium.value) return false
    if (totalCredits.value <= 0) return false

    // Spend monthly credits first, then purchased
    if (monthlyCredits.value > 0) {
      monthlyCredits.value--
    } else {
      purchasedCredits.value--
    }
    // TODO: sync with backend api.spendCredit()
    return true
  }

  // Add purchased credits after Paystack payment
  function addPurchasedCredits(amount) {
    purchasedCredits.value += amount
    // TODO: sync with backend
  }

  function logout() {
    profile.value = null
    token.value = null
    trialStartDate.value = null
    subscriptionExpiry.value = null
    monthlyCredits.value = 0
    purchasedCredits.value = 0
  }

  function checkSession() {
    if (!token.value) return
    checkAndResetMonthlyCredits()
    // TODO: await api.validateToken(token.value)
  }

  return {
    // State
    profile, token, trialStartDate, subscriptionExpiry,
    referralCount, referralCode, examDate, targetScore, subjects,
    monthlyCredits, purchasedCredits, lastCreditReset,
    // Getters
    isLoggedIn, trialDaysLeft, isInTrial, isPremium, isFullPremium,
    daysToExam, totalCredits, canUseAiTutor,
    // Actions
    setProfile, updateExamSetup, incrementReferral, activatePremium,
    checkAndResetMonthlyCredits, spendCredit, addPurchasedCredits,
    logout, checkSession
  }
}, { persist: true })
