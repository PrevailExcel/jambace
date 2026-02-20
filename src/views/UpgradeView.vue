<template>
  <div class="upgrade-view">
    <!-- Header -->
    <div class="upgrade-hero">
      <button class="hero-back" @click="router.back()">
        <PhArrowLeft :size="20" weight="bold" />
      </button>
      <div class="hero-glow"></div>
      <div class="hero-badge">
        <PhCrown :size="14" weight="fill" /> Premium
      </div>
      <h1 class="hero-title">Unlock Everything.<br/>Score 300+.</h1>
      <p class="hero-sub">Full explanations, offline access, and an AI Tutor in your pocket — for less than a sachet of water a day.</p>
    </div>

    <div class="upgrade-body">

      <!-- ── PREMIUM PLAN ── -->
      <div class="plan-card featured">
        <div class="plan-tag">Most Popular</div>
        <div class="plan-header">
          <div class="plan-icon"><PhCrown :size="22" weight="fill" /></div>
          <div>
            <div class="plan-name">JAMBAce Premium</div>
            <div class="plan-billing">Annual plan — cancel anytime</div>
          </div>
        </div>

        <div class="plan-price">
          <span class="price-amount">₦1,000</span>
          <span class="price-period">/ year</span>
        </div>

        <div class="plan-features">
          <div v-for="f in premiumFeatures" :key="f" class="plan-feat">
            <PhCheckCircle :size="15" weight="fill" class="feat-check" />
            <span>{{ f }}</span>
          </div>
        </div>

        <button class="btn-upgrade" @click="subscribe" :disabled="loading">
          <div v-if="loading" class="btn-spin"></div>
          <template v-else>
            <PhRocketLaunch :size="17" weight="fill" />
            Get Premium — ₦1,000/year
          </template>
        </button>

        <p class="plan-note">30-day free trial included. You won't be charged today.</p>
      </div>

      <!-- ── REFERRAL OPTION ── -->
      <div class="referral-card">
        <div class="referral-icon"><PhUsers :size="22" weight="fill" /></div>
        <div class="referral-body">
          <strong>Refer 5 friends, get Premium free</strong>
          <span>Share your unique link. When 5 friends sign up, your account upgrades automatically — no payment needed.</span>
          <RouterLink to="/refer" class="referral-link">
            Get my referral link <PhArrowRight :size="13" weight="bold" />
          </RouterLink>
        </div>
      </div>

      <!-- ── AI TUTOR CREDITS ── -->
      <div class="credits-section">
        <div class="credits-header">
          <div class="credits-title-wrap">
            <PhRobot :size="18" weight="fill" class="credits-icon" />
            <h3 class="credits-title">AI Tutor Credits</h3>
          </div>
          <div class="credits-balance" v-if="userStore.isPremium">
            <span class="balance-val">{{ userStore.totalCredits }}</span>
            <span class="balance-lbl">credits remaining</span>
          </div>
        </div>
        <p class="credits-desc">Premium users get 100 free credits every month. Need more? Top up below — credits never expire once purchased.</p>

        <div class="credit-packs">
          <div
            v-for="pack in creditPacks"
            :key="pack.id"
            class="pack-card"
            :class="{ featured: pack.tag === 'Best Value', popular: pack.tag === 'Popular' }"
            @click="buyCredits(pack)"
          >
            <div v-if="pack.tag" class="pack-tag" :class="pack.tag === 'Best Value' ? 'green' : 'gold'">
              {{ pack.tag }}
            </div>
            <div class="pack-credits">
              <PhCoins :size="20" weight="fill" />
              {{ pack.credits }}
            </div>
            <div class="pack-label">credits</div>
            <div class="pack-price">₦{{ pack.price }}</div>
            <div class="pack-per">₦{{ Math.round(pack.price / pack.credits * 10) / 10 }} per credit</div>
          </div>
        </div>

        <p class="credits-note">
          <PhInfo :size="13" weight="fill" />
          1 credit = 1 AI Tutor conversation thread, with unlimited messages inside.
        </p>
      </div>

      <!-- ── FEATURE COMPARISON ── -->
      <div class="comparison-card">
        <h3 class="comparison-title">Free vs Premium</h3>
        <div class="comparison-table">
          <div class="ct-header">
            <span></span>
            <span class="ct-col">Free</span>
            <span class="ct-col premium-col">Premium</span>
          </div>
          <div v-for="row in comparison" :key="row.feature" class="ct-row">
            <span class="ct-feature">{{ row.feature }}</span>
            <span class="ct-val">
              <PhCheckCircle v-if="row.free === true"  :size="16" weight="fill" class="yes" />
              <PhXCircle     v-else-if="row.free === false" :size="16" weight="fill" class="no" />
              <span v-else class="partial">{{ row.free }}</span>
            </span>
            <span class="ct-val">
              <PhCheckCircle v-if="row.premium === true"  :size="16" weight="fill" class="yes" />
              <PhXCircle     v-else-if="row.premium === false" :size="16" weight="fill" class="no" />
              <span v-else class="partial premium-text">{{ row.premium }}</span>
            </span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhArrowLeft, PhArrowRight, PhCrown, PhCheckCircle, PhXCircle,
  PhRocketLaunch, PhUsers, PhRobot, PhCoins, PhInfo
} from '@phosphor-icons/vue'
import { useUserStore }  from '@/stores/user'
import { CREDIT_PACKS }  from '@/stores/user'

const router    = useRouter()
const userStore = useUserStore()
const loading   = ref(false)
const creditPacks = CREDIT_PACKS

const premiumFeatures = [
  'Full step-by-step answer explanations',
  'Offline access — study without internet',
  '100 AI Tutor credits every month',
  'All past questions — 1985 to 2024',
  'Unlimited mock exams',
  'Personalized AI study plan',
  'Streak shield (1 per week)',
  'Priority support',
]

const comparison = [
  { feature: 'Past questions (2015–2024)', free: true,  premium: true },
  { feature: 'Full archive (1985–2024)',   free: false, premium: true },
  { feature: 'Mock exams per week',        free: '3',   premium: 'Unlimited' },
  { feature: 'Answer explanations',        free: false, premium: true },
  { feature: 'AI Tutor access',            free: false, premium: '100 credits/mo' },
  { feature: 'Offline access',             free: false, premium: true },
  { feature: 'Personalized study plan',    free: false, premium: true },
  { feature: 'Leaderboard',               free: true,  premium: true },
  { feature: 'Community rooms',            free: true,  premium: true },
  { feature: 'Streak shield',              free: false, premium: true },
]

async function subscribe() {
  loading.value = true
  try {
    // TODO: initialise Paystack payment
    // const handler = PaystackPop.setup({
    //   key: import.meta.env.VITE_PAYSTACK_PUBLIC_KEY,
    //   email: userStore.profile.email,
    //   amount: 100000, // ₦1,000 in kobo
    //   currency: 'NGN',
    //   ref: 'sub_' + Date.now(),
    //   onSuccess(response) { verifyPayment(response.reference) },
    //   onCancel() { loading.value = false }
    // })
    // handler.openIframe()

    // MOCK for now
    await new Promise(r => setTimeout(r, 1200))
    const expiry = new Date()
    expiry.setFullYear(expiry.getFullYear() + 1)
    userStore.activatePremium(expiry.toISOString())
    router.replace({ name: 'dashboard' })
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function buyCredits(pack) {
  if (!userStore.isPremium) {
    alert('You need to be a Premium member to buy credit top-ups.')
    return
  }
  // TODO: Paystack payment for credit packs
  // MOCK for now
  userStore.addPurchasedCredits(pack.credits)
  alert(`${pack.credits} credits added to your account!`)
}
</script>

<style scoped>
.upgrade-view {
  min-height: 100vh;
  background: var(--bg);
  max-width: 480px;
  margin: 0 auto;
}

/* ── HERO ── */
.upgrade-hero {
  background: var(--navy);
  padding: 56px 20px 32px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  width: 300px; height: 300px;
  background: radial-gradient(circle, rgba(255,184,0,0.12) 0%, transparent 70%);
  top: -80px; left: 50%;
  transform: translateX(-50%);
  pointer-events: none;
}
.hero-back {
  position: absolute;
  top: 16px; left: 16px;
  width: 36px; height: 36px;
  border-radius: 10px;
  background: rgba(255,255,255,0.1);
  color: white;
  display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer;
}
.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: rgba(255,184,0,0.15);
  color: var(--gold);
  font-size: 12px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 20px;
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.hero-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
  margin-bottom: 12px;
}
.hero-sub { color: rgba(255,255,255,0.5); font-size: 14px; line-height: 1.6; }

/* ── BODY ── */
.upgrade-body { padding: 16px; display: flex; flex-direction: column; gap: 14px; }

/* ── PLAN CARD ── */
.plan-card {
  background: white;
  border-radius: 20px;
  padding: 20px;
  box-shadow: var(--shadow-md);
  position: relative;
  overflow: hidden;
  border: 2px solid transparent;
}
.plan-card.featured { border-color: var(--green); }

.plan-tag {
  position: absolute;
  top: 0; right: 0;
  background: var(--green);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 5px 14px;
  border-radius: 0 18px 0 12px;
}

.plan-header { display: flex; align-items: center; gap: 12px; margin-bottom: 16px; }
.plan-icon {
  width: 46px; height: 46px;
  border-radius: 14px;
  background: var(--gold-soft);
  color: var(--gold-dark);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.plan-name { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--text); }
.plan-billing { font-size: 12px; color: var(--muted); margin-top: 2px; }

.plan-price { display: flex; align-items: baseline; gap: 4px; margin-bottom: 18px; }
.price-amount { font-family: var(--font-display); font-size: 42px; font-weight: 800; color: var(--navy); }
.price-period { font-size: 16px; color: var(--muted); }

.plan-features { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.plan-feat { display: flex; align-items: center; gap: 10px; font-size: 14px; color: var(--text); }
.feat-check { color: var(--green); flex-shrink: 0; }

.btn-upgrade {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--green);
  color: white;
  border: none;
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0,200,83,0.35);
  transition: all 0.2s;
  margin-bottom: 10px;
}
.btn-upgrade:hover:not(:disabled) { transform: translateY(-2px); }
.btn-upgrade:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-spin { width: 20px; height: 20px; border: 2px solid rgba(255,255,255,0.3); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

.plan-note { font-size: 12px; color: var(--muted); text-align: center; }

/* ── REFERRAL CARD ── */
.referral-card {
  display: flex;
  gap: 14px;
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--shadow);
  border: 1.5px solid var(--border);
}
.referral-icon {
  width: 46px; height: 46px;
  border-radius: 14px;
  background: var(--green-soft);
  color: var(--green-dark);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.referral-body { flex: 1; }
.referral-body strong { display: block; font-size: 14px; font-weight: 700; color: var(--text); margin-bottom: 5px; }
.referral-body span   { display: block; font-size: 12.5px; color: var(--muted); line-height: 1.55; margin-bottom: 10px; }
.referral-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--green-dark);
  font-size: 13px;
  font-weight: 700;
  text-decoration: none;
}

/* ── CREDITS ── */
.credits-section {
  background: white;
  border-radius: 16px;
  padding: 18px;
  box-shadow: var(--shadow);
}
.credits-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; }
.credits-title-wrap { display: flex; align-items: center; gap: 8px; }
.credits-icon { color: var(--green); }
.credits-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); }
.credits-balance { text-align: right; }
.balance-val { display: block; font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--green); }
.balance-lbl { font-size: 11px; color: var(--muted); }
.credits-desc { font-size: 13px; color: var(--muted); line-height: 1.55; margin-bottom: 16px; }

.credit-packs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 12px; }

.pack-card {
  border: 2px solid var(--border);
  border-radius: 14px;
  padding: 14px 10px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  position: relative;
  background: white;
}
.pack-card:hover { border-color: var(--green); transform: translateY(-2px); }
.pack-card.featured { border-color: var(--green); background: var(--green-soft); }
.pack-card.popular  { border-color: var(--gold); }

.pack-tag {
  position: absolute;
  top: -10px; left: 50%;
  transform: translateX(-50%);
  font-size: 9.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 10px;
  white-space: nowrap;
}
.pack-tag.green { background: var(--green); color: white; }
.pack-tag.gold  { background: var(--gold); color: white; }

.pack-credits {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 800;
  color: var(--navy);
  margin-bottom: 2px;
  color: var(--green-dark);
}
.pack-card.featured .pack-credits { color: var(--green-dark); }

.pack-label { font-size: 11px; color: var(--muted); margin-bottom: 8px; }
.pack-price { font-family: var(--font-display); font-size: 16px; font-weight: 700; color: var(--navy); }
.pack-per   { font-size: 10px; color: var(--muted); margin-top: 3px; }

.credits-note {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
  line-height: 1.5;
}

/* ── COMPARISON ── */
.comparison-card { background: white; border-radius: 16px; padding: 18px; box-shadow: var(--shadow); }
.comparison-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 14px; }
.comparison-table { display: flex; flex-direction: column; }
.ct-header {
  display: grid;
  grid-template-columns: 1fr 52px 80px;
  gap: 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
}
.ct-col { font-size: 12px; font-weight: 700; color: var(--muted); text-align: center; }
.ct-col.premium-col { color: var(--green-dark); }
.ct-row {
  display: grid;
  grid-template-columns: 1fr 52px 80px;
  gap: 8px;
  padding: 9px 0;
  border-bottom: 1px solid var(--border);
  align-items: center;
}
.ct-row:last-child { border-bottom: none; }
.ct-feature { font-size: 13px; color: var(--text); }
.ct-val { display: flex; align-items: center; justify-content: center; }
.yes { color: var(--green); }
.no  { color: var(--border); }
.partial { font-size: 11.5px; color: var(--muted); text-align: center; }
.premium-text { color: var(--green-dark); font-weight: 600; }
</style>
