<template>
  <div class="exam-timer" :class="timerClass">
    <PhTimer :size="16" weight="fill" />
    <span class="timer-text">{{ formattedTime }}</span>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { PhTimer } from '@phosphor-icons/vue'

const props = defineProps({
  totalSeconds: { type: Number, required: true }, // initial time in seconds
  running: { type: Boolean, default: true }
})

const emit = defineEmits(['tick', 'warning', 'expired'])

const secondsLeft = ref(props.totalSeconds)
let interval = null

const formattedTime = computed(() => {
  const h = Math.floor(secondsLeft.value / 3600)
  const m = Math.floor((secondsLeft.value % 3600) / 60)
  const s = secondsLeft.value % 60
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
})

const timerClass = computed(() => {
  if (secondsLeft.value <= 60)  return 'danger'   // last 1 min — red pulsing
  if (secondsLeft.value <= 300) return 'warning'  // last 5 min — orange
  return 'normal'
})

function tick() {
  if (secondsLeft.value <= 0) {
    clearInterval(interval)
    emit('expired')
    return
  }
  secondsLeft.value--
  emit('tick', secondsLeft.value)
  if (secondsLeft.value === 300) emit('warning', 300) // 5 min warning
  if (secondsLeft.value === 60)  emit('warning', 60)  // 1 min warning
}

watch(() => props.running, (val) => {
  if (val) startTimer()
  else clearInterval(interval)
})

function startTimer() {
  clearInterval(interval)
  interval = setInterval(tick, 1000)
}

onMounted(() => { if (props.running) startTimer() })
onUnmounted(() => clearInterval(interval))

// Expose for parent to read remaining time on submit
defineExpose({ secondsLeft })
</script>

<style scoped>
.exam-timer {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 14px;
  border-radius: 20px;
  font-family: var(--font-display);
  font-size: 15px;
  font-weight: 700;
  transition: all 0.3s ease;
}

.exam-timer.normal {
  background: rgba(255,255,255,0.1);
  color: rgba(255,255,255,0.85);
}

.exam-timer.warning {
  background: rgba(255,184,0,0.2);
  color: var(--gold);
}

.exam-timer.danger {
  background: rgba(255,68,68,0.2);
  color: #FF6B6B;
  animation: pulse 1s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
</style>
