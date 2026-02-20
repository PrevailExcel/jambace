<template>
  <div class="tutor-btn-wrap">

    <!-- ── PREMIUM: has credits ── -->
    <button
      v-if="canUseAiTutor"
      class="tutor-btn"
      :class="{ active: threadOpen }"
      @click="handleClick"
    >
      <div class="tutor-btn-icon">
        <PhRobot :size="18" weight="fill" />
      </div>
      <div class="tutor-btn-text">
        <strong>{{ threadOpen ? 'Continue with AI Tutor' : 'Ask AI Tutor' }}</strong>
        <span>{{ threadOpen ? 'Thread open · 1 credit used' : `1 credit · ${totalCredits} remaining` }}</span>
      </div>
      <PhCaretRight :size="16" weight="bold" class="tutor-btn-arrow" />
    </button>

    <!-- ── PREMIUM: no credits ── -->
    <RouterLink
      v-else-if="isPremium && !canUseAiTutor"
      to="/upgrade"
      class="tutor-btn out-of-credits"
    >
      <div class="tutor-btn-icon warn">
        <PhCoins :size="18" weight="fill" />
      </div>
      <div class="tutor-btn-text">
        <strong>No credits remaining</strong>
        <span>Top up to ask the AI Tutor</span>
      </div>
      <PhCaretRight :size="16" weight="bold" class="tutor-btn-arrow" />
    </RouterLink>

    <!-- ── FREE USER: locked ── -->
    <div v-else class="tutor-btn locked" @click="emit('upgrade-prompt')">
      <div class="tutor-btn-icon lock">
        <PhLock :size="18" weight="fill" />
      </div>
      <div class="tutor-btn-text">
        <strong>Ask AI Tutor</strong>
        <span>Premium feature · 100 free credits/month</span>
      </div>
      <div class="locked-badge">Upgrade</div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useUserStore } from '@/stores/user'
import { PhRobot, PhLock, PhCoins, PhCaretRight } from '@phosphor-icons/vue'

const props = defineProps({
  threadOpen: { type: Boolean, default: false }
})

const emit = defineEmits(['open', 'upgrade-prompt'])

const userStore     = useUserStore()
const isPremium     = computed(() => userStore.isPremium)
const canUseAiTutor = computed(() => userStore.canUseAiTutor)
const totalCredits  = computed(() => userStore.totalCredits)

function handleClick() {
  emit('open')
}
</script>

<style scoped>
.tutor-btn-wrap { margin-top: 16px; }

/* ── Base button ── */
.tutor-btn {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.06);
  cursor: pointer;
  transition: all 0.2s;
  text-align: left;
  text-decoration: none;
}

.tutor-btn:hover:not(.locked):not(.out-of-credits) {
  background: rgba(0,200,83,0.12);
  border-color: var(--green);
}

.tutor-btn.active {
  background: rgba(0,200,83,0.1);
  border-color: var(--green);
}

/* ── Icon ── */
.tutor-btn-icon {
  width: 38px; height: 38px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0,200,83,0.15);
  color: var(--green);
  flex-shrink: 0;
}

.tutor-btn-icon.warn { background: rgba(255,184,0,0.15); color: var(--gold); }
.tutor-btn-icon.lock { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.35); }

/* ── Text ── */
.tutor-btn-text {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.tutor-btn-text strong {
  font-size: 13.5px;
  font-weight: 600;
  color: white;
  display: block;
}

.tutor-btn-text span {
  font-size: 11.5px;
  color: rgba(255,255,255,0.45);
}

.tutor-btn-arrow {
  color: rgba(255,255,255,0.35);
  flex-shrink: 0;
}

/* ── Locked state ── */
.tutor-btn.locked {
  cursor: pointer;
  opacity: 0.75;
}

.tutor-btn.locked:hover { opacity: 0.9; }

.locked-badge {
  background: var(--green);
  color: white;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 20px;
  flex-shrink: 0;
}

/* ── Out of credits ── */
.tutor-btn.out-of-credits {
  border-color: rgba(255,184,0,0.2);
}
</style>
