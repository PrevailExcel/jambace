<template>
  <div class="profile-view">

    <!-- ── HERO ── -->
    <div class="profile-hero">
      <div class="hero-glow"></div>
      <div class="profile-avatar">
        <span class="avatar-initials">{{ initials }}</span>
      </div>
      <div class="profile-name">{{ userStore.profile?.name || 'Student' }}</div>
      <div class="profile-email">{{ userStore.profile?.email }}</div>

      <div class="profile-badges-row">
        <div class="status-badge" :class="userStore.isFullPremium ? 'premium' : 'free'">
          <PhCrown v-if="userStore.isFullPremium" :size="12" weight="fill" />
          <PhStar  v-else                          :size="12" weight="fill" />
          {{ userStore.isFullPremium ? 'Premium' : userStore.isInTrial ? 'Trial' : 'Free' }}
        </div>
        <div class="level-badge">
          <PhTrophy :size="12" weight="fill" />
          Level {{ progressStore.level }}
        </div>
        <div class="streak-badge" v-if="progressStore.streak > 0">
          🔥 {{ progressStore.streak }}
        </div>
      </div>
    </div>

    <div class="profile-body">

      <!-- ── STATS GRID ── -->
      <div class="stats-grid">
        <div class="stat-tile" v-for="s in stats" :key="s.label">
          <div class="stat-icon" :style="{ background: s.bg, color: s.color }">
            <component :is="s.icon" :size="18" weight="fill" />
          </div>
          <span class="stat-val">{{ s.value }}</span>
          <span class="stat-lbl">{{ s.label }}</span>
        </div>
      </div>

      <!-- ── BADGES ── -->
      <div class="section-card">
        <div class="card-header">
          <h3 class="card-title">Badges</h3>
          <span class="badge-count">{{ earnedBadges.length }} earned</span>
        </div>
        <div class="badges-grid">
          <div
            v-for="badge in allBadges"
            :key="badge.id"
            class="badge-tile"
            :class="{ earned: badge.earned }"
            :title="badge.desc"
          >
            <div class="badge-icon" :class="{ locked: !badge.earned }">{{ badge.emoji }}</div>
            <span class="badge-name">{{ badge.name }}</span>
            <span class="badge-status" v-if="!badge.earned">{{ badge.progress }}</span>
          </div>
        </div>
      </div>

      <!-- ── EXAM INFO ── -->
      <div class="section-card">
        <h3 class="card-title">Exam Details</h3>
        <div class="exam-detail-list">
          <div class="ed-item">
            <PhCalendar :size="16" weight="fill" class="ed-icon" />
            <span class="ed-label">Exam Date</span>
            <span class="ed-val">{{ examDateFormatted }}</span>
          </div>
          <div class="ed-item">
            <PhTarget :size="16" weight="fill" class="ed-icon" />
            <span class="ed-label">Target Score</span>
            <span class="ed-val">{{ userStore.targetScore }} / 400</span>
          </div>
          <div class="ed-item">
            <PhBooks :size="16" weight="fill" class="ed-icon" />
            <span class="ed-label">Subjects</span>
            <span class="ed-val">{{ subjectLabels }}</span>
          </div>
        </div>
        <RouterLink to="/setup" class="edit-setup-btn">
          <PhPencil :size="14" weight="fill" />
          Update Setup
        </RouterLink>
      </div>

      <!-- ── AI CREDITS ── -->
      <div class="section-card" v-if="userStore.isPremium">
        <h3 class="card-title">AI Tutor Credits</h3>
        <div class="credits-display">
          <div class="credits-numbers">
            <div class="credit-item">
              <span class="credit-num green">{{ userStore.monthlyCredits }}</span>
              <span class="credit-desc">Monthly (resets soon)</span>
            </div>
            <div class="credit-divider"></div>
            <div class="credit-item">
              <span class="credit-num navy">{{ userStore.purchasedCredits }}</span>
              <span class="credit-desc">Purchased (never expire)</span>
            </div>
          </div>
          <RouterLink to="/upgrade" class="top-up-link">Top Up →</RouterLink>
        </div>
      </div>

      <!-- ── REFERRAL ── -->
      <div class="referral-card">
        <div class="referral-icon"><PhUsers :size="20" weight="fill" /></div>
        <div class="referral-body">
          <strong>Refer friends, earn Premium</strong>
          <span>{{ userStore.referralCount }}/5 friends referred</span>
          <div class="ref-progress">
            <div class="ref-fill" :style="{ width: (userStore.referralCount / 5 * 100) + '%' }"></div>
          </div>
        </div>
        <RouterLink to="/refer" class="ref-btn">Share</RouterLink>
      </div>

      <!-- ── SETTINGS ── -->
      <div class="settings-list">
        <button v-for="item in settings" :key="item.label" class="setting-item" @click="item.action">
          <div class="setting-icon" :style="{ background: item.bg, color: item.color }">
            <component :is="item.icon" :size="16" weight="fill" />
          </div>
          <span class="setting-label">{{ item.label }}</span>
          <PhCaretRight :size="15" weight="bold" class="setting-arrow" />
        </button>
      </div>

      <!-- ── LOGOUT ── -->
      <button class="logout-btn" @click="logout">
        <PhSignOut :size="16" weight="fill" />
        Log Out
      </button>

      <p class="version-note">JAMBAce v0.1.0 · Made with ❤️ for Nigerian students</p>
    </div>

    <!-- Logout confirmation -->
    <Transition name="fade">
      <div v-if="showLogoutConfirm" class="modal-overlay" @click.self="showLogoutConfirm = false">
        <div class="confirm-modal">
          <h3>Log Out?</h3>
          <p>Your progress is saved. You can log back in anytime.</p>
          <div class="confirm-actions">
            <button class="btn-cancel" @click="showLogoutConfirm = false">Cancel</button>
            <button class="btn-logout" @click="confirmLogout">Log Out</button>
          </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhCrown, PhStar, PhTrophy, PhCalendar, PhTarget, PhBooks,
  PhUsers, PhCaretRight, PhSignOut, PhPencil,
  PhLightning, PhCheckCircle, PhShieldCheck, PhBell, PhLock
} from '@phosphor-icons/vue'
import { useUserStore }     from '@/stores/user'
import { useProgressStore } from '@/stores/progress'
import { SUBJECT_CONFIG }   from '@/data/questions'
import dayjs from 'dayjs'

const router        = useRouter()
const userStore     = useUserStore()
const progressStore = useProgressStore()

const showLogoutConfirm = ref(false)

// ── Avatar
const initials = computed(() =>
  (userStore.profile?.name || 'S').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
)

// ── Exam date
const examDateFormatted = computed(() =>
  userStore.examDate ? dayjs(userStore.examDate).format('D MMMM YYYY') : 'Not set'
)

const subjectLabels = computed(() =>
  (userStore.subjects || []).map(id => SUBJECT_CONFIG[id]?.label?.split(' ')[0] || id).join(', ')
)

// ── Stats
const stats = computed(() => [
  { label: 'Questions Done', value: progressStore.totalAttempted || 0, icon: PhCheckCircle, bg: '#E8FFF1', color: 'var(--green)' },
  { label: 'Correct',        value: progressStore.totalCorrect || 0,   icon: PhTrophy,      bg: '#FFF8E1', color: 'var(--gold-dark)' },
  { label: 'Day Streak',     value: progressStore.streak,              icon: PhLightning,   bg: '#FBE9E7', color: '#FF5722' },
  { label: 'Total XP',       value: progressStore.xp,                  icon: PhStar,        bg: '#EDE7F6', color: 'var(--purple)' },
])

// ── Badges
const earnedBadges = computed(() => progressStore.badges || [])
const allBadges = computed(() => [
  { id: 'first_answer', emoji: '🎯', name: 'First Answer',  desc: 'Answer your first question', earned: (progressStore.totalAttempted || 0) >= 1, progress: '0/1' },
  { id: 'streak_3',     emoji: '🔥', name: '3-Day Streak',  desc: '3 days in a row',             earned: progressStore.streak >= 3,              progress: `${progressStore.streak}/3` },
  { id: 'streak_7',     emoji: '💥', name: 'Week Warrior',  desc: '7 days in a row',             earned: progressStore.streak >= 7,              progress: `${progressStore.streak}/7` },
  { id: 'hundred',      emoji: '💯', name: 'Century',       desc: 'Answer 100 questions',        earned: (progressStore.totalAttempted || 0) >= 100, progress: `${progressStore.totalAttempted || 0}/100` },
  { id: 'ace_mock',     emoji: '🏆', name: 'Mock Ace',      desc: 'Score 80%+ on a mock exam',   earned: false,                                  progress: 'Score 80%+' },
  { id: 'referrer',     emoji: '👥', name: 'Recruiter',     desc: 'Refer 5 friends',             earned: userStore.referralCount >= 5,           progress: `${userStore.referralCount}/5` },
])

// ── Settings
const settings = [
  { label: 'Notifications',   icon: PhBell,        bg: '#E8FFF1', color: 'var(--green)',    action: () => {} },
  { label: 'Change Password', icon: PhLock,        bg: '#EDE7F6', color: 'var(--purple)',   action: () => {} },
  { label: 'Premium & Credits', icon: PhCrown,     bg: '#FFF8E1', color: 'var(--gold-dark)', action: () => router.push('/upgrade') },
  { label: 'Privacy Policy',  icon: PhShieldCheck, bg: '#E3F2FD', color: '#2196F3',         action: () => {} },
]

function logout() { showLogoutConfirm.value = true }
function confirmLogout() {
  userStore.logout()
  router.replace({ name: 'auth' })
}
</script>

<style scoped>
.profile-view { min-height: 100vh; background: var(--bg); max-width: 480px; margin: 0 auto; }

/* ── HERO ── */
.profile-hero {
  background: var(--navy);
  padding: 56px 20px 28px;
  text-align: center;
  position: relative;
  overflow: hidden;
}
.hero-glow {
  position: absolute;
  width: 280px; height: 280px;
  background: radial-gradient(circle, rgba(0,200,83,0.12) 0%, transparent 70%);
  top: -80px; left: 50%; transform: translateX(-50%);
}

.profile-avatar {
  width: 80px; height: 80px;
  border-radius: 24px;
  background: var(--green);
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 12px;
  box-shadow: 0 8px 28px rgba(0,200,83,0.35);
  position: relative; z-index: 1;
}
.avatar-initials { font-family: var(--font-display); font-size: 28px; font-weight: 800; color: white; }

.profile-name  { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: white; margin-bottom: 4px; }
.profile-email { font-size: 13px; color: rgba(255,255,255,0.45); margin-bottom: 14px; }

.profile-badges-row { display: flex; align-items: center; justify-content: center; gap: 8px; }

.status-badge, .level-badge, .streak-badge {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 11.5px; font-weight: 700;
  padding: 5px 12px; border-radius: 20px;
}
.status-badge.premium { background: rgba(255,184,0,0.2); color: var(--gold); }
.status-badge.free    { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.55); }
.level-badge  { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.75); }
.streak-badge { background: rgba(255,107,0,0.2); color: var(--gold); }

/* ── BODY ── */
.profile-body { padding: 16px; display: flex; flex-direction: column; gap: 12px; }

/* ── STATS ── */
.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; }
.stat-tile {
  background: white; border-radius: 14px; padding: 12px 8px;
  display: flex; flex-direction: column; align-items: center; gap: 5px;
  box-shadow: var(--shadow);
}
.stat-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.stat-val { font-family: var(--font-display); font-size: 18px; font-weight: 800; color: var(--text); }
.stat-lbl { font-size: 9.5px; color: var(--muted); font-weight: 500; text-align: center; }

/* ── SECTION CARD ── */
.section-card { background: white; border-radius: 16px; padding: 16px; box-shadow: var(--shadow); }
.card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.card-title  { font-family: var(--font-display); font-size: 15px; font-weight: 700; color: var(--text); }
.badge-count { font-size: 12px; color: var(--muted); }

/* ── BADGES ── */
.badges-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
.badge-tile {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  padding: 12px 8px;
  border-radius: 12px;
  background: var(--grey);
  transition: all 0.2s;
  text-align: center;
}
.badge-tile.earned { background: var(--gold-soft); }
.badge-icon { font-size: 28px; transition: filter 0.2s; }
.badge-icon.locked { filter: grayscale(1); opacity: 0.4; }
.badge-name { font-size: 11px; font-weight: 600; color: var(--text); }
.badge-status { font-size: 10px; color: var(--muted); }

/* ── EXAM DETAILS ── */
.exam-detail-list { display: flex; flex-direction: column; gap: 12px; margin-bottom: 14px; }
.ed-item { display: flex; align-items: center; gap: 10px; }
.ed-icon { color: var(--muted); flex-shrink: 0; }
.ed-label { flex: 1; font-size: 13.5px; color: var(--muted); }
.ed-val   { font-size: 13.5px; font-weight: 600; color: var(--text); text-align: right; }

.edit-setup-btn {
  display: flex; align-items: center; justify-content: center; gap: 6px;
  width: 100%; padding: 11px;
  background: var(--grey); border-radius: 12px;
  font-size: 13.5px; font-weight: 600; color: var(--text);
  text-decoration: none; transition: all 0.2s;
}
.edit-setup-btn:hover { background: var(--border); }

/* ── CREDITS ── */
.credits-display { display: flex; align-items: center; gap: 12px; }
.credits-numbers { flex: 1; display: flex; align-items: center; gap: 12px; }
.credit-item { flex: 1; }
.credit-num { display: block; font-family: var(--font-display); font-size: 26px; font-weight: 800; }
.credit-num.green { color: var(--green); }
.credit-num.navy  { color: var(--navy); }
.credit-desc { font-size: 11px; color: var(--muted); }
.credit-divider { width: 1px; height: 36px; background: var(--border); }
.top-up-link { font-size: 13.5px; font-weight: 700; color: var(--green-dark); white-space: nowrap; }

/* ── REFERRAL ── */
.referral-card { background: white; border-radius: 16px; padding: 16px; box-shadow: var(--shadow); display: flex; align-items: center; gap: 12px; }
.referral-icon {
  width: 44px; height: 44px;
  border-radius: 13px;
  background: var(--green-soft);
  color: var(--green-dark);
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.referral-body { flex: 1; }
.referral-body strong { display: block; font-size: 13.5px; font-weight: 700; color: var(--text); margin-bottom: 2px; }
.referral-body span   { font-size: 12px; color: var(--muted); display: block; margin-bottom: 8px; }
.ref-progress { height: 5px; background: var(--border); border-radius: 3px; overflow: hidden; }
.ref-fill { height: 100%; background: var(--green); border-radius: 3px; }
.ref-btn {
  padding: 8px 16px; background: var(--green); color: white;
  border-radius: 10px; font-size: 13px; font-weight: 700; text-decoration: none;
  flex-shrink: 0;
}

/* ── SETTINGS ── */
.settings-list { background: white; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow); }
.setting-item {
  width: 100%; display: flex; align-items: center; gap: 12px;
  padding: 14px 16px;
  background: transparent; border: none;
  border-bottom: 1px solid var(--border);
  cursor: pointer; transition: background 0.2s;
  text-align: left;
}
.setting-item:last-child { border-bottom: none; }
.setting-item:hover { background: var(--grey); }
.setting-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.setting-label { flex: 1; font-size: 14px; font-weight: 500; color: var(--text); }
.setting-arrow { color: var(--muted); }

/* ── LOGOUT ── */
.logout-btn {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 14px; background: white; color: var(--red);
  border: 2px solid var(--red-soft); border-radius: 14px;
  font-family: var(--font-body); font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
}
.logout-btn:hover { background: var(--red-soft); }

.version-note { text-align: center; font-size: 12px; color: var(--muted); padding-bottom: 8px; }

/* ── MODAL ── */
.modal-overlay { position: fixed; inset: 0; background: rgba(10,15,44,0.55); backdrop-filter: blur(4px); display: flex; align-items: center; justify-content: center; z-index: 300; padding: 24px; }
.confirm-modal { background: white; border-radius: 22px; padding: 28px 24px; text-align: center; width: 100%; max-width: 320px; }
.confirm-modal h3 { font-family: var(--font-display); font-size: 19px; font-weight: 800; margin-bottom: 8px; }
.confirm-modal p  { font-size: 14px; color: var(--muted); margin-bottom: 22px; }
.confirm-actions  { display: flex; gap: 10px; }
.btn-cancel { flex: 1; padding: 13px; background: var(--grey); border: none; border-radius: 12px; font-weight: 600; cursor: pointer; }
.btn-logout { flex: 1; padding: 13px; background: var(--red); color: white; border: none; border-radius: 12px; font-weight: 700; cursor: pointer; }

.fade-enter-active { transition: opacity 0.2s; }
.fade-enter-from   { opacity: 0; }
</style>
