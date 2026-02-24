<template>
  <div class="refer-view">
    <div class="refer-header">
      <button class="back-btn" @click="router.back()">
        <PhArrowLeft :size="20" weight="bold" />
      </button>
    </div>

    <!-- ── HERO ── -->
    <div class="refer-hero">
      <div class="hero-icon">
        <PhGift :size="36" weight="fill" />
      </div>
      <h1 class="hero-title">Refer Friends,<br/>Get Premium Free</h1>
      <p class="hero-sub">Share your link. When 5 friends sign up, your account upgrades to Premium automatically — no payment needed, ever.</p>
    </div>

    <div class="refer-body">

      <!-- ── PROGRESS TRACKER ── -->
      <div class="progress-card">
        <div class="progress-header">
          <span class="progress-label">Your progress</span>
          <span class="progress-count">{{ userStore.referralCount }}/5 friends</span>
        </div>

        <div class="referral-track">
          <div
            v-for="i in 5"
            :key="i"
            class="track-step"
            :class="{
              done:    i <= userStore.referralCount,
              current: i === userStore.referralCount + 1
            }"
          >
            <div class="step-circle">
              <PhCheck v-if="i <= userStore.referralCount" :size="14" weight="bold" />
              <span v-else>{{ i }}</span>
            </div>
            <div class="step-connector" v-if="i < 5" :class="{ filled: i < userStore.referralCount }"></div>
          </div>
        </div>

        <div class="progress-message" v-if="userStore.referralCount < 5">
          <PhArrowRight :size="14" weight="bold" />
          {{ 5 - userStore.referralCount }} more friend{{ 5 - userStore.referralCount !== 1 ? 's' : '' }} to unlock Premium
        </div>
        <div class="progress-message done" v-else>
          <PhCheckCircle :size="14" weight="fill" />
          Premium unlocked! You're all set.
        </div>
      </div>

      <!-- ── YOUR LINK ── -->
      <div class="link-card">
        <div class="link-label">Your referral link</div>
        <div class="link-display">
          <span class="link-url">{{ referralUrl }}</span>
          <button class="copy-btn" @click="copyLink">
            <PhCopy :size="16" weight="fill" />
            {{ copied ? 'Copied!' : 'Copy' }}
          </button>
        </div>
        <div class="referral-code">
          <span class="code-label">Your code:</span>
          <span class="code-val">{{ userStore.referralCode || 'ACE' + (userStore.profile?.id || '').slice(0, 5).toUpperCase() }}</span>
        </div>
      </div>

      <!-- ── SHARE BUTTONS ── -->
      <div class="share-section">
        <h3 class="share-title">Share via</h3>
        <div class="share-grid">
          <button
            v-for="platform in sharePlatforms"
            :key="platform.id"
            class="share-btn"
            :style="{ background: platform.bg, color: platform.color }"
            @click="share(platform)"
          >
            <component :is="platform.icon" :size="22" weight="fill" />
            <span>{{ platform.label }}</span>
          </button>
        </div>
      </div>

      <!-- ── HOW IT WORKS ── -->
      <div class="how-card">
        <h3 class="how-title">How It Works</h3>
        <div class="how-steps">
          <div v-for="(step, i) in howSteps" :key="i" class="how-step">
            <div class="how-num">{{ i + 1 }}</div>
            <div class="how-text">
              <strong>{{ step.title }}</strong>
              <span>{{ step.desc }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── REFERRED FRIENDS ── -->
      <div v-if="referredFriends.length" class="friends-card">
        <h3 class="friends-title">Friends You've Referred</h3>
        <div class="friends-list">
          <div v-for="friend in referredFriends" :key="friend.name" class="friend-item">
            <div class="friend-avatar">{{ friend.initials }}</div>
            <div class="friend-info">
              <span class="friend-name">{{ friend.name }}</span>
              <span class="friend-date">Joined {{ friend.date }}</span>
            </div>
            <PhCheckCircle :size="18" weight="fill" class="friend-check" />
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhArrowLeft, PhGift, PhCheck, PhCheckCircle, PhArrowRight,
  PhCopy, PhWhatsappLogo, PhTelegramLogo, PhEnvelope, PhShareNetwork
} from '@phosphor-icons/vue'
import { useUserStore } from '@/stores/user'

const router    = useRouter()
const userStore = useUserStore()

const copied = ref(false)

const referralUrl = computed(() =>
  `https://2wise.com.ng/join?ref=${userStore.referralCode || 'DEMO'}`
)

function copyLink() {
  navigator.clipboard.writeText(referralUrl.value).catch(() => {})
  copied.value = true
  setTimeout(() => { copied.value = false }, 2500)
}

const shareMessage = computed(() =>
  `🎯 I've been studying for JAMB on 2Wise — real past questions, verified answers, and an AI Tutor! Use my link to join: ${referralUrl.value}`
)

const sharePlatforms = [
  {
    id: 'whatsapp', label: 'WhatsApp', icon: PhWhatsappLogo,
    bg: '#E8FFF1', color: '#00952E',
    action: () => `https://wa.me/?text=${encodeURIComponent(shareMessage.value)}`
  },
  {
    id: 'telegram', label: 'Telegram', icon: PhTelegramLogo,
    bg: '#E3F2FD', color: '#0088cc',
    action: () => `https://t.me/share/url?url=${encodeURIComponent(referralUrl.value)}&text=${encodeURIComponent(shareMessage.value)}`
  },
  {
    id: 'email', label: 'Email', icon: PhEnvelope,
    bg: '#F3E5F5', color: '#7B1FA2',
    action: () => `mailto:?subject=Join me on 2Wise!&body=${encodeURIComponent(shareMessage.value)}`
  },
  {
    id: 'other', label: 'More', icon: PhShareNetwork,
    bg: 'var(--grey)', color: 'var(--muted)',
    action: null // uses navigator.share
  },
]

async function share(platform) {
  if (platform.id === 'other') {
    if (navigator.share) {
      await navigator.share({ title: '2Wise', text: shareMessage.value, url: referralUrl.value }).catch(() => {})
    } else {
      copyLink()
    }
    return
  }
  window.open(platform.action(), '_blank')
}

const howSteps = [
  { title: 'Share your link', desc: 'Send it to friends via WhatsApp, Telegram, or any platform.' },
  { title: 'Friends sign up', desc: 'They create a 2Wise account using your unique link.' },
  { title: 'You both benefit', desc: 'Refer 5 and your account unlocks Premium. Your friends get 30 days free trial.' },
]

// Mocked referred friends
const referredFriends = computed(() =>
  userStore.referralCount > 0
    ? Array.from({ length: Math.min(userStore.referralCount, 3) }, (_, i) => ({
        name: ['Emeka F.', 'Bisi A.', 'Yemi O.'][i],
        initials: ['EF', 'BA', 'YO'][i],
        date: ['2 days ago', '5 days ago', 'Last week'][i]
      }))
    : []
)
</script>

<style scoped>
.refer-view { min-height: 100vh; background: var(--bg); max-width: 480px; margin: 0 auto; }

.refer-header { padding: 56px 20px 0; }
.back-btn {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: white;
  border: 1.5px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  color: var(--text);
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s;
}

/* ── HERO ── */
.refer-hero {
  text-align: center;
  padding: 24px 24px 0;
}
.hero-icon {
  width: 80px; height: 80px;
  border-radius: 26px;
  background: linear-gradient(135deg, var(--green), #00952E);
  color: white;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px;
  box-shadow: 0 10px 30px rgba(0,200,83,0.3);
}
.hero-title {
  font-family: var(--font-display);
  font-size: 28px; font-weight: 800; color: var(--text);
  line-height: 1.2; margin-bottom: 12px;
}
.hero-sub { font-size: 14.5px; color: var(--muted); line-height: 1.65; max-width: 300px; margin: 0 auto; }

/* ── BODY ── */
.refer-body { padding: 20px 16px 40px; display: flex; flex-direction: column; gap: 14px; }

/* ── PROGRESS ── */
.progress-card { background: white; border-radius: 18px; padding: 20px; box-shadow: var(--shadow-md); }
.progress-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
.progress-label { font-size: 13px; color: var(--muted); font-weight: 500; }
.progress-count { font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--navy); }

.referral-track {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.track-step {
  display: flex;
  align-items: center;
  flex: 1;
}
.track-step:last-child { flex: none; }

.step-circle {
  width: 36px; height: 36px;
  border-radius: 10px;
  border: 2px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 13px; font-weight: 700;
  color: var(--muted);
  background: white;
  flex-shrink: 0;
  transition: all 0.3s;
}
.track-step.done .step-circle { background: var(--green); border-color: var(--green); color: white; }
.track-step.current .step-circle { border-color: var(--green); color: var(--green); }

.step-connector {
  flex: 1;
  height: 3px;
  background: var(--border);
  margin: 0 4px;
  border-radius: 2px;
  transition: background 0.3s;
}
.step-connector.filled { background: var(--green); }

.progress-message {
  display: flex; align-items: center; gap: 7px;
  font-size: 13px; font-weight: 500; color: var(--muted);
  background: var(--grey);
  padding: 10px 14px;
  border-radius: 10px;
}
.progress-message.done { background: var(--green-soft); color: var(--green-dark); }

/* ── LINK ── */
.link-card { background: white; border-radius: 16px; padding: 18px; box-shadow: var(--shadow); }
.link-label { font-size: 12px; font-weight: 600; color: var(--muted); text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px; }
.link-display {
  display: flex; align-items: center; gap: 10px;
  background: var(--grey);
  border-radius: 12px;
  padding: 10px 14px;
  margin-bottom: 10px;
}
.link-url { flex: 1; font-size: 13px; color: var(--text); word-break: break-all; }
.copy-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 14px;
  background: var(--navy); color: white;
  border: none; border-radius: 9px;
  font-size: 13px; font-weight: 700;
  cursor: pointer; white-space: nowrap;
  flex-shrink: 0;
  transition: all 0.2s;
}
.referral-code { display: flex; align-items: center; gap: 8px; }
.code-label { font-size: 13px; color: var(--muted); }
.code-val {
  font-family: var(--font-display);
  font-size: 16px; font-weight: 800;
  color: var(--green-dark);
  background: var(--green-soft);
  padding: 3px 12px;
  border-radius: 8px;
  letter-spacing: 1px;
}

/* ── SHARE ── */
.share-section { }
.share-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 10px; }
.share-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.share-btn {
  display: flex; flex-direction: column; align-items: center; gap: 7px;
  padding: 14px 8px;
  border-radius: 14px; border: none;
  font-family: var(--font-body); font-size: 12px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.share-btn:hover { transform: translateY(-3px); filter: brightness(0.95); }

/* ── HOW IT WORKS ── */
.how-card { background: white; border-radius: 16px; padding: 18px; box-shadow: var(--shadow); }
.how-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 16px; }
.how-steps { display: flex; flex-direction: column; gap: 14px; }
.how-step { display: flex; gap: 14px; align-items: flex-start; }
.how-num {
  width: 30px; height: 30px;
  border-radius: 9px;
  background: var(--navy);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display);
  font-size: 14px; font-weight: 800;
  flex-shrink: 0;
}
.how-text strong { display: block; font-size: 13.5px; color: var(--text); margin-bottom: 3px; }
.how-text span   { font-size: 12.5px; color: var(--muted); line-height: 1.5; }

/* ── FRIENDS ── */
.friends-card { background: white; border-radius: 16px; padding: 16px; box-shadow: var(--shadow); }
.friends-title { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); margin-bottom: 12px; }
.friends-list  { display: flex; flex-direction: column; gap: 8px; }
.friend-item { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--grey); border-radius: 12px; }
.friend-avatar {
  width: 36px; height: 36px;
  border-radius: 10px;
  background: var(--green);
  color: white;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px;
}
.friend-info { flex: 1; }
.friend-name { display: block; font-size: 13.5px; font-weight: 600; color: var(--text); }
.friend-date { font-size: 11.5px; color: var(--muted); }
.friend-check { color: var(--green); }
</style>
