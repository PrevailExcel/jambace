<template>
  <div class="community-view">

    <!-- ── TABS ── -->
    <div class="community-header">
      <h1 class="page-title">Community</h1>
      <div class="tabs">
        <button v-for="t in tabs" :key="t.id" class="tab" :class="{ active: activeTab === t.id }" @click="activeTab = t.id">
          <component :is="t.icon" :size="14" weight="fill" />
          {{ t.label }}
        </button>
      </div>
    </div>

    <Transition name="tab-slide" mode="out-in">

      <!-- ══ LEADERBOARD ══ -->
      <div v-if="activeTab === 'leaderboard'" key="lb" class="tab-content">

        <!-- Filter: week / all time -->
        <div class="lb-filters">
          <button v-for="f in ['week', 'month', 'all']" :key="f" class="lb-filter" :class="{ active: lbPeriod === f }" @click="lbPeriod = f">
            {{ { week: 'This Week', month: 'This Month', all: 'All Time' }[f] }}
          </button>
        </div>

        <!-- My rank card -->
        <div class="my-rank-card">
          <div class="mr-left">
            <span class="mr-rank">#{{ myRank }}</span>
            <div class="mr-avatar">{{ myInitials }}</div>
            <div class="mr-info">
              <strong>{{ myName }} (You)</strong>
              <span>{{ myScore }} XP</span>
            </div>
          </div>
          <div class="mr-badge" v-if="myRank <= 3">
            {{ ['🥇', '🥈', '🥉'][myRank - 1] }}
          </div>
        </div>

        <!-- Top 10 -->
        <div class="lb-list">
          <div
            v-for="(entry, i) in leaderboard"
            :key="entry.name"
            class="lb-row"
            :class="{ me: entry.isMe, top3: i < 3 }"
          >
            <div class="lb-rank-badge" :class="i < 3 ? `rank-${i}` : ''">
              {{ i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1 }}
            </div>
            <div class="lb-avatar-circle" :style="{ background: entry.color }">{{ entry.initials }}</div>
            <div class="lb-info">
              <span class="lb-name">{{ entry.name }}{{ entry.isMe ? ' (You)' : '' }}</span>
              <span class="lb-school">{{ entry.school }}</span>
            </div>
            <div class="lb-score-wrap">
              <span class="lb-xp">{{ entry.score }}</span>
              <span class="lb-xp-lbl">XP</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ══ STUDY ROOMS ══ -->
      <div v-else-if="activeTab === 'rooms'" key="rooms" class="tab-content">
        <p class="tab-desc">Join a study room to discuss questions with other JAMB candidates.</p>

        <div class="rooms-list">
          <div
            v-for="room in studyRooms"
            :key="room.id"
            class="room-card"
            @click="openRoom(room)"
          >
            <div class="room-icon" :style="{ background: room.bg, color: room.color }">
              <component :is="room.icon" :size="22" weight="fill" />
            </div>
            <div class="room-info">
              <span class="room-name">{{ room.name }}</span>
              <span class="room-sub">{{ room.members }} members online</span>
            </div>
            <div class="room-activity">
              <div class="room-bubble-row">
                <div v-for="m in room.recent" :key="m" class="room-bubble" :style="{ background: room.color }">{{ m }}</div>
              </div>
              <PhCaretRight :size="16" weight="bold" class="room-arrow" />
            </div>
          </div>
        </div>

        <!-- Create room CTA -->
        <button class="create-room-btn" @click="showCreateRoom = true">
          <PhPlus :size="16" weight="bold" />
          Create a Study Room
        </button>

        <!-- Room modal placeholder -->
        <Transition name="fade">
          <div v-if="activeRoom" class="modal-overlay" @click.self="activeRoom = null">
            <div class="room-modal">
              <div class="room-modal-header">
                <div class="rm-icon" :style="{ background: activeRoom.bg }">
                  <component :is="activeRoom.icon" :size="18" weight="fill" :style="{ color: activeRoom.color }" />
                </div>
                <div class="rm-title">{{ activeRoom.name }}</div>
                <button class="rm-close" @click="activeRoom = null"><PhX :size="16" weight="bold" /></button>
              </div>
              <div class="room-messages">
                <div v-for="msg in activeRoom.messages" :key="msg.id" class="room-msg">
                  <div class="room-msg-avatar" :style="{ background: activeRoom.color }">{{ msg.initials }}</div>
                  <div class="room-msg-body">
                    <span class="room-msg-name">{{ msg.name }}</span>
                    <p class="room-msg-text">{{ msg.text }}</p>
                  </div>
                </div>
              </div>
              <div class="room-input-wrap">
                <input v-model="roomInput" class="room-input" placeholder="Ask a question..." @keydown.enter="sendRoomMessage" />
                <button class="room-send" @click="sendRoomMessage">
                  <PhPaperPlaneTilt :size="16" weight="fill" />
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>

      <!-- ══ CHALLENGE ══ -->
      <div v-else-if="activeTab === 'challenge'" key="challenge" class="tab-content">
        <div class="challenge-hero">
          <div class="ch-icon"><PhSwords :size="36" weight="fill" /></div>
          <h2 class="ch-title">Challenge a Friend</h2>
          <p class="ch-desc">Send a challenge link. You both answer the same 20 questions in 10 minutes. Highest score wins.</p>
        </div>

        <div class="challenge-stats">
          <div class="cs-tile">
            <span class="cs-val">{{ challengeStats.sent }}</span>
            <span class="cs-lbl">Challenges Sent</span>
          </div>
          <div class="cs-tile">
            <span class="cs-val green">{{ challengeStats.won }}</span>
            <span class="cs-lbl">Won</span>
          </div>
          <div class="cs-tile">
            <span class="cs-val red">{{ challengeStats.lost }}</span>
            <span class="cs-lbl">Lost</span>
          </div>
        </div>

        <!-- Pending challenges -->
        <div v-if="pendingChallenges.length" class="pending-section">
          <h3 class="pending-title">Waiting for You</h3>
          <div class="pending-list">
            <div v-for="c in pendingChallenges" :key="c.id" class="pending-card">
              <div class="pc-avatar">{{ c.initials }}</div>
              <div class="pc-info">
                <strong>{{ c.name }}</strong>
                <span>challenged you · expires in {{ c.expires }}</span>
              </div>
              <button class="pc-accept" @click="acceptChallenge(c)">Accept</button>
            </div>
          </div>
        </div>

        <button class="btn-challenge" @click="createChallenge">
          <PhShare :size="16" weight="fill" />
          Create & Share Challenge
        </button>

        <div class="challenge-link-card" v-if="challengeLink">
          <div class="cl-header">
            <PhLink :size="15" weight="fill" />
            <span>Your challenge link</span>
          </div>
          <div class="cl-url">{{ challengeLink }}</div>
          <button class="cl-copy" @click="copyLink">
            <PhCopy :size="14" weight="fill" />
            {{ copied ? 'Copied!' : 'Copy Link' }}
          </button>
        </div>
      </div>

    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import {
  PhTrophy, PhUsers, PhSwords, PhCaretRight, PhPlus, PhX,
  PhPaperPlaneTilt, PhShare, PhLink, PhCopy,
  PhBookOpen, PhCalculator, PhAtom, PhDna, PhGlobe
} from '@phosphor-icons/vue'
import { useUserStore }     from '@/stores/user'
import { useProgressStore } from '@/stores/progress'

const userStore     = useUserStore()
const progressStore = useProgressStore()

const tabs = [
  { id: 'leaderboard', label: 'Leaderboard', icon: PhTrophy },
  { id: 'rooms',       label: 'Study Rooms',  icon: PhUsers },
  { id: 'challenge',   label: 'Challenge',    icon: PhSwords },
]
const activeTab = ref('leaderboard')
const lbPeriod  = ref('week')

// ── My rank
const myName     = computed(() => userStore.profile?.name?.split(' ')[0] || 'You')
const myInitials = computed(() => (userStore.profile?.name || 'S').split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase())
const myScore    = computed(() => progressStore.xp || 1240)
const myRank     = ref(4)

// ── Leaderboard mock data
const leaderboard = ref([
  { name: 'Adaeze O.',  initials: 'AO', school: 'Federal GS Lagos',   score: 3420, color: '#00C853', isMe: false },
  { name: 'Ibrahim K.', initials: 'IK', school: 'Kano Model Sec',      score: 3180, color: '#7B1FA2', isMe: false },
  { name: 'Chisom E.',  initials: 'CE', school: 'Holy Child College',  score: 2970, color: '#2196F3', isMe: false },
  { name: myName.value, initials: myInitials.value, school: 'Your School', score: myScore.value, color: '#00C853', isMe: true },
  { name: 'Tunde A.',   initials: 'TA', school: 'CMS Grammar Sch.',   score: 1190, color: '#E91E63', isMe: false },
  { name: 'Ngozi N.',   initials: 'NN', school: 'Queen\'s College',    score: 1080, color: '#FF5722', isMe: false },
])

// ── Study rooms
const studyRooms = [
  {
    id: 'english', name: 'English Language', icon: PhBookOpen,
    color: '#00C853', bg: '#E8FFF1', members: 247,
    recent: ['AO', 'IK', 'CE'],
    messages: [
      { id: 1, name: 'Adaeze', initials: 'AO', text: 'Can anyone explain the difference between a metaphor and a simile?' },
      { id: 2, name: 'Chisom', initials: 'CE', text: 'A simile uses "like" or "as" — e.g. "fast as lightning". A metaphor says something IS something else — "He is a lion".' },
      { id: 3, name: 'Tunde',  initials: 'TA', text: 'What about personification? Is it a type of metaphor?' },
    ]
  },
  {
    id: 'math', name: 'Mathematics', icon: PhCalculator,
    color: '#FFB800', bg: '#FFF8E1', members: 189,
    recent: ['NN', 'IK'],
    messages: [
      { id: 1, name: 'Ngozi',  initials: 'NN', text: 'Who can help with quadratic formula? Getting confused with the ± part.' },
      { id: 2, name: 'Ibrahim',initials: 'IK', text: 'x = (−b ± √(b²−4ac)) / 2a — the ± just means there are two possible answers, one with + and one with −.' },
    ]
  },
  {
    id: 'chem', name: 'Chemistry', icon: PhAtom,
    color: '#7B1FA2', bg: '#F3E5F5', members: 134,
    recent: ['AO', 'TA', 'CE'],
    messages: [
      { id: 1, name: 'Adaeze', initials: 'AO', text: 'Le Chatelier\'s principle is killing me. Does increasing pressure always shift to fewer moles?' },
    ]
  },
  {
    id: 'bio', name: 'Biology', icon: PhDna,
    color: '#2196F3', bg: '#E3F2FD', members: 98,
    recent: ['CE'],
    messages: []
  },
]

const activeRoom  = ref(null)
const roomInput   = ref('')
const showCreateRoom = ref(false)

function openRoom(room) { activeRoom.value = { ...room } }
function sendRoomMessage() {
  if (!roomInput.value.trim()) return
  activeRoom.value.messages.push({
    id: Date.now(),
    name: myName.value,
    initials: myInitials.value,
    text: roomInput.value
  })
  roomInput.value = ''
}

// ── Challenge
const challengeStats = ref({ sent: 12, won: 8, lost: 4 })
const pendingChallenges = ref([
  { id: 1, name: 'Emeka F.', initials: 'EF', expires: '2h 14m' },
])
const challengeLink = ref('')
const copied = ref(false)

function createChallenge() {
  challengeLink.value = `https://jambace.app/c/${Math.random().toString(36).substr(2, 8).toUpperCase()}`
}

function copyLink() {
  navigator.clipboard.writeText(challengeLink.value).catch(() => {})
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}

function acceptChallenge(c) {
  pendingChallenges.value = pendingChallenges.value.filter(p => p.id !== c.id)
}
</script>

<style scoped>
.community-view { padding: 0 16px 32px; }

.community-header { padding-top: 16px; margin-bottom: 16px; }
.page-title { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--text); margin-bottom: 12px; }

.tabs { display: flex; gap: 6px; }
.tab {
  display: flex; align-items: center; gap: 5px;
  padding: 8px 16px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}
.tab.active { background: var(--navy); color: white; border-color: var(--navy); }

.tab-content { display: flex; flex-direction: column; gap: 12px; }
.tab-desc { font-size: 14px; color: var(--muted); line-height: 1.55; }

/* ── LEADERBOARD ── */
.lb-filters { display: flex; gap: 6px; }
.lb-filter {
  padding: 7px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border);
  background: white;
  font-size: 12.5px; font-weight: 600; color: var(--muted);
  cursor: pointer; transition: all 0.2s;
}
.lb-filter.active { background: var(--green); color: white; border-color: var(--green); }

.my-rank-card {
  background: var(--navy);
  border-radius: 14px;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.mr-left { display: flex; align-items: center; gap: 12px; }
.mr-rank { font-family: var(--font-display); font-size: 24px; font-weight: 800; color: var(--green); }
.mr-avatar {
  width: 38px; height: 38px;
  border-radius: 11px;
  background: rgba(0,200,83,0.2);
  color: var(--green);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 15px; font-weight: 700;
}
.mr-info strong { display: block; color: white; font-size: 14px; margin-bottom: 2px; }
.mr-info span   { color: rgba(255,255,255,0.45); font-size: 12px; }
.mr-badge { font-size: 28px; }

.lb-list { display: flex; flex-direction: column; gap: 6px; }
.lb-row {
  display: flex; align-items: center; gap: 12px;
  padding: 12px 14px;
  background: white;
  border-radius: 14px;
  box-shadow: var(--shadow);
  transition: all 0.2s;
}
.lb-row.me { background: var(--green-soft); border: 1.5px solid var(--green); }
.lb-row.top3 { box-shadow: var(--shadow-md); }

.lb-rank-badge { width: 28px; text-align: center; font-family: var(--font-display); font-size: 13px; font-weight: 800; color: var(--muted); }
.rank-0, .rank-1, .rank-2 { font-size: 20px; }

.lb-avatar-circle {
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-display); font-size: 13px; font-weight: 700;
  color: white; flex-shrink: 0;
}

.lb-info { flex: 1; }
.lb-name   { display: block; font-size: 13.5px; font-weight: 600; color: var(--text); }
.lb-school { font-size: 11.5px; color: var(--muted); }

.lb-score-wrap { text-align: right; }
.lb-xp     { display: block; font-family: var(--font-display); font-size: 16px; font-weight: 800; color: var(--navy); }
.lb-xp-lbl { font-size: 10px; color: var(--muted); }

/* ── STUDY ROOMS ── */
.rooms-list { display: flex; flex-direction: column; gap: 10px; }
.room-card {
  display: flex; align-items: center; gap: 12px;
  background: white;
  border-radius: 14px;
  padding: 14px;
  box-shadow: var(--shadow);
  cursor: pointer;
  transition: all 0.2s;
}
.room-card:hover { transform: translateX(4px); box-shadow: var(--shadow-md); }

.room-icon {
  width: 46px; height: 46px;
  border-radius: 14px;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0;
}
.room-info { flex: 1; }
.room-name { display: block; font-size: 14px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.room-sub  { font-size: 11.5px; color: var(--muted); }

.room-activity { display: flex; align-items: center; gap: 8px; }
.room-bubble-row { display: flex; gap: -4px; }
.room-bubble {
  width: 22px; height: 22px;
  border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  font-size: 8px; font-weight: 700; color: white;
  margin-left: -4px;
  border: 1.5px solid white;
}
.room-arrow { color: var(--muted); }

.create-room-btn {
  display: flex; align-items: center; justify-content: center; gap: 7px;
  width: 100%; padding: 13px;
  background: white;
  border: 2px dashed var(--border);
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 14px; font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.2s;
}
.create-room-btn:hover { border-color: var(--green); color: var(--green-dark); }

/* Room modal */
.modal-overlay { position: fixed; inset: 0; background: rgba(10,15,44,0.55); backdrop-filter: blur(4px); display: flex; align-items: flex-end; justify-content: center; z-index: 300; padding: 0 16px; }
.room-modal { background: white; border-radius: 24px 24px 0 0; width: 100%; max-width: 480px; max-height: 80vh; display: flex; flex-direction: column; }
.room-modal-header { display: flex; align-items: center; gap: 10px; padding: 18px 18px 14px; border-bottom: 1px solid var(--border); }
.rm-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
.rm-title { flex: 1; font-family: var(--font-display); font-size: 16px; font-weight: 700; }
.rm-close { color: var(--muted); background: var(--grey); border: none; width: 30px; height: 30px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.room-messages { flex: 1; overflow-y: auto; padding: 14px; display: flex; flex-direction: column; gap: 12px; }
.room-msg { display: flex; gap: 10px; }
.room-msg-avatar { width: 30px; height: 30px; border-radius: 9px; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 700; color: white; flex-shrink: 0; }
.room-msg-name { display: block; font-size: 12px; font-weight: 700; color: var(--text); margin-bottom: 3px; }
.room-msg-text { font-size: 13.5px; color: var(--muted); line-height: 1.5; }
.room-input-wrap { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--border); }
.room-input { flex: 1; border: 1.5px solid var(--border); border-radius: 12px; padding: 10px 14px; font-family: var(--font-body); font-size: 14px; outline: none; }
.room-send { width: 40px; height: 40px; border-radius: 11px; background: var(--navy); color: white; border: none; display: flex; align-items: center; justify-content: center; cursor: pointer; }

/* ── CHALLENGE ── */
.challenge-hero { text-align: center; padding: 8px 0; }
.ch-icon { width: 72px; height: 72px; border-radius: 22px; background: linear-gradient(135deg, #4A148C, #7B1FA2); color: white; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; }
.ch-title { font-family: var(--font-display); font-size: 22px; font-weight: 800; color: var(--text); margin-bottom: 8px; }
.ch-desc  { font-size: 14px; color: var(--muted); line-height: 1.6; max-width: 280px; margin: 0 auto; }

.challenge-stats { display: flex; gap: 10px; }
.cs-tile {
  flex: 1; background: white; border-radius: 14px; padding: 14px;
  text-align: center; box-shadow: var(--shadow);
}
.cs-val { display: block; font-family: var(--font-display); font-size: 26px; font-weight: 800; color: var(--navy); }
.cs-val.green { color: var(--green); }
.cs-val.red   { color: var(--red); }
.cs-lbl { font-size: 11.5px; color: var(--muted); font-weight: 500; }

.pending-section { background: white; border-radius: 14px; padding: 14px; box-shadow: var(--shadow); }
.pending-title { font-family: var(--font-display); font-size: 14px; font-weight: 700; margin-bottom: 10px; }
.pending-list { display: flex; flex-direction: column; gap: 8px; }
.pending-card { display: flex; align-items: center; gap: 12px; padding: 10px; background: var(--grey); border-radius: 11px; }
.pc-avatar { width: 36px; height: 36px; border-radius: 10px; background: var(--navy); color: white; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
.pc-info { flex: 1; }
.pc-info strong { display: block; font-size: 13px; color: var(--text); }
.pc-info span   { font-size: 11.5px; color: var(--muted); }
.pc-accept { padding: 7px 16px; background: var(--green); color: white; border: none; border-radius: 9px; font-weight: 700; font-size: 13px; cursor: pointer; }

.btn-challenge {
  width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px;
  padding: 15px; background: linear-gradient(135deg, #4A148C, #7B1FA2); color: white;
  border: none; border-radius: 14px;
  font-family: var(--font-body); font-size: 15px; font-weight: 700;
  cursor: pointer; transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(74,20,140,0.35);
}
.btn-challenge:hover { transform: translateY(-2px); }

.challenge-link-card { background: white; border-radius: 14px; padding: 14px; box-shadow: var(--shadow); }
.cl-header { display: flex; align-items: center; gap: 7px; font-size: 12px; font-weight: 600; color: var(--muted); margin-bottom: 8px; }
.cl-url { font-size: 13px; color: var(--text); background: var(--grey); padding: 9px 12px; border-radius: 9px; word-break: break-all; margin-bottom: 10px; }
.cl-copy { display: flex; align-items: center; justify-content: center; gap: 7px; width: 100%; padding: 11px; background: var(--green); color: white; border: none; border-radius: 10px; font-weight: 700; font-size: 14px; cursor: pointer; }

/* Transitions */
.tab-slide-enter-active { transition: all 0.25s ease; }
.tab-slide-leave-active { transition: all 0.18s ease; }
.tab-slide-enter-from   { opacity: 0; transform: translateY(8px); }
.tab-slide-leave-to     { opacity: 0; }

.fade-enter-active { transition: opacity 0.2s; }
.fade-enter-from   { opacity: 0; }
</style>
