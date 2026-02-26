<template>
  <Transition name="calc-slide">
    <div v-if="visible" class="calc-overlay" @click.self="$emit('close')">
      <div class="calc-modal">

        <!-- Handle bar -->
        <div class="calc-handle" @click="$emit('close')"></div>

        <!-- Display -->
        <div class="calc-display">
          <div class="calc-expression">{{ expression || '\u00a0' }}</div>
          <div class="calc-value">{{ display }}</div>
        </div>

        <!-- Buttons -->
        <div class="calc-grid">
          <!-- Row 1 -->
          <button class="calc-btn func" @click="clearAll">AC</button>
          <button class="calc-btn func" @click="toggleSign">+/−</button>
          <button class="calc-btn func" @click="percent">%</button>
          <button class="calc-btn op" :class="{ active: pendingOp === '÷' }" @click="op('÷')">÷</button>

          <!-- Row 2 -->
          <button class="calc-btn" @click="digit('7')">7</button>
          <button class="calc-btn" @click="digit('8')">8</button>
          <button class="calc-btn" @click="digit('9')">9</button>
          <button class="calc-btn op" :class="{ active: pendingOp === '×' }" @click="op('×')">×</button>

          <!-- Row 3 -->
          <button class="calc-btn" @click="digit('4')">4</button>
          <button class="calc-btn" @click="digit('5')">5</button>
          <button class="calc-btn" @click="digit('6')">6</button>
          <button class="calc-btn op" :class="{ active: pendingOp === '−' }" @click="op('−')">−</button>

          <!-- Row 4 -->
          <button class="calc-btn" @click="digit('1')">1</button>
          <button class="calc-btn" @click="digit('2')">2</button>
          <button class="calc-btn" @click="digit('3')">3</button>
          <button class="calc-btn op" :class="{ active: pendingOp === '+' }" @click="op('+')">+</button>

          <!-- Row 5 -->
          <button class="calc-btn zero" @click="digit('0')">0</button>
          <button class="calc-btn" @click="decimal">.</button>
          <button class="calc-btn op equals" @click="equals">=</button>
        </div>

      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'

defineProps({ visible: Boolean })
defineEmits(['close'])

// ── State ─────────────────────────────────────────────────────────────────
const current    = ref('0')   // what's on the display right now
const previous   = ref(null)  // stored left-hand operand
const pendingOp  = ref(null)  // stored operator symbol
const justEvaled = ref(false) // true right after = was pressed

// ── Display ───────────────────────────────────────────────────────────────
const display = computed(() => {
  const n = parseFloat(current.value)
  if (isNaN(n)) return 'Error'
  // Format: at most 10 significant digits, no trailing zeros on decimals
  if (Math.abs(n) >= 1e10 || (Math.abs(n) < 1e-4 && n !== 0)) {
    return n.toExponential(4)
  }
  // Show up to 10 chars
  const str = current.value
  return str.length > 12 ? parseFloat(n.toPrecision(9)).toString() : str
})

const expression = computed(() => {
  if (!pendingOp.value || !previous.value) return ''
  return `${formatShort(previous.value)} ${pendingOp.value}`
})

function formatShort(v) {
  const n = parseFloat(v)
  if (Math.abs(n) >= 1e6) return n.toExponential(2)
  return v
}

// ── Input handlers ────────────────────────────────────────────────────────
function digit(d) {
  if (justEvaled.value) {
    current.value  = d
    justEvaled.value = false
    return
  }
  if (current.value === '0' && d !== '.') {
    current.value = d
  } else if (current.value.length < 12) {
    current.value = current.value + d
  }
}

function decimal() {
  if (justEvaled.value) {
    current.value  = '0.'
    justEvaled.value = false
    return
  }
  if (!current.value.includes('.')) {
    current.value = current.value + '.'
  }
}

function op(symbol) {
  if (pendingOp.value && !justEvaled.value) {
    // chain: evaluate what we have first
    evaluate()
  }
  previous.value  = current.value
  pendingOp.value = symbol
  justEvaled.value = false
  // Next digit press will start fresh
  const snapshot = current.value
  current.value = snapshot  // keep display, but next digit replaces it
  // Mark that next digit should replace current
  _nextReplace = true
}

let _nextReplace = false

const _origDigit = digit
function digit(d) {   // override to handle "replace on next op"
  if (_nextReplace) {
    current.value  = d === '0' ? '0' : d
    _nextReplace = false
    justEvaled.value = false
    return
  }
  _origDigit(d)
}

function evaluate() {
  if (!pendingOp.value || !previous.value) return

  const a = parseFloat(previous.value)
  const b = parseFloat(current.value)
  let result

  switch (pendingOp.value) {
    case '+': result = a + b; break
    case '−': result = a - b; break
    case '×': result = a * b; break
    case '÷': result = b === 0 ? NaN : a / b; break
    default:  result = b
  }

  current.value   = isNaN(result) ? 'Error' : trimResult(result)
  previous.value  = null
  pendingOp.value = null
  justEvaled.value = true
  _nextReplace = false
}

function equals() {
  evaluate()
}

function clearAll() {
  current.value   = '0'
  previous.value  = null
  pendingOp.value = null
  justEvaled.value = false
  _nextReplace = false
}

function toggleSign() {
  const n = parseFloat(current.value)
  if (!isNaN(n) && n !== 0) {
    current.value = trimResult(-n)
  }
}

function percent() {
  const n = parseFloat(current.value)
  if (!isNaN(n)) {
    current.value = trimResult(n / 100)
  }
}

function trimResult(n) {
  // Remove floating point noise (e.g. 0.1 + 0.2 = 0.30000000000000004)
  const str = parseFloat(n.toPrecision(10)).toString()
  return str
}
</script>

<style scoped>
/* ── Overlay ── */
.calc-overlay {
  position: fixed;
  inset: 0;
  background: rgba(8, 18, 58, 0.55);
  backdrop-filter: blur(4px);
  z-index: 300;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

/* ── Modal ── */
.calc-modal {
  width: 100%;
  max-width: 380px;
  background: #1C1C1E;
  border-radius: 24px 24px 0 0;
  padding: 0 0 env(safe-area-inset-bottom, 16px);
  overflow: hidden;
  touch-action: none;
}

/* ── Handle ── */
.calc-handle {
  width: 40px;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  margin: 12px auto 0;
  cursor: pointer;
}

/* ── Display ── */
.calc-display {
  padding: 12px 24px 8px;
  text-align: right;
  min-height: 88px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}
.calc-expression {
  font-size: 15px;
  color: rgba(255,255,255,0.35);
  margin-bottom: 4px;
  min-height: 20px;
  font-family: 'SF Mono', 'Courier New', monospace;
}
.calc-value {
  font-size: 52px;
  font-weight: 300;
  color: white;
  line-height: 1;
  letter-spacing: -1px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Grid ── */
.calc-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 12px 16px 20px;
}

/* ── Buttons ── */
.calc-btn {
  height: 72px;
  border-radius: 50%;
  border: none;
  font-size: 26px;
  font-weight: 400;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: filter 0.1s, transform 0.08s;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  background: #3A3A3C;
  color: white;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
}
.calc-btn:active {
  filter: brightness(1.4);
  transform: scale(0.92);
}

/* Function buttons (AC, +/-, %) */
.calc-btn.func {
  background: #636366;
  color: black;
  font-size: 22px;
}

/* Operator buttons */
.calc-btn.op {
  background: #00C853;
  color: white;
  font-size: 30px;
}
.calc-btn.op.active {
  background: white;
  color: #00C853;
}
.calc-btn.op.equals {
  background: #00C853;
  color: white;
}

/* Wide zero button */
.calc-btn.zero {
  grid-column: span 2;
  border-radius: 36px;
  justify-content: flex-start;
  padding-left: 28px;
}

/* ── Transition ── */
.calc-slide-enter-active,
.calc-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              opacity 0.3s ease;
}
.calc-slide-enter-from,
.calc-slide-leave-to {
  transform: translateY(100%);
  opacity: 0;
}
</style>
