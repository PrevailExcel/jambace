<template>
  <button
    class="option"
    :class="optionClass"
    :disabled="disabled"
    @click="!disabled && emit('select', index)"
  >
    <span class="opt-letter">{{ letters[index] }}</span>

    <span class="opt-text">{{ text }}</span>

    <!-- State icon (practice mode after answering) -->
    <Transition name="icon-pop">
      <span v-if="showResult" class="opt-result-icon">
        <PhCheckCircle v-if="isCorrect" :size="20" weight="fill" class="icon-correct" />
        <PhXCircle      v-else          :size="20" weight="fill" class="icon-wrong"   />
      </span>
    </Transition>
  </button>
</template>

<script setup>
import { computed } from 'vue'
import { PhCheckCircle, PhXCircle } from '@phosphor-icons/vue'

const props = defineProps({
  index:      { type: Number, required: true },
  text:       { type: String, required: true },
  selected:   { type: Boolean, default: false },
  isCorrect:  { type: Boolean, default: false },  // only relevant when showResult is true
  showResult: { type: Boolean, default: false },  // practice mode: show right/wrong after pick
  disabled:   { type: Boolean, default: false }
})

const emit = defineEmits(['select'])

const letters = ['A', 'B', 'C', 'D', 'E']

const optionClass = computed(() => {
  if (props.showResult) {
    if (props.isCorrect) return 'correct'
    if (props.selected && !props.isCorrect) return 'wrong'
    return 'dimmed'
  }
  if (props.selected) return 'selected'
  return ''
})
</script>

<style scoped>
.option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 14px;
  cursor: pointer;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  text-align: left;
  box-shadow: var(--shadow);
}

.option:hover:not(:disabled):not(.correct):not(.wrong):not(.dimmed) {
  border-color: var(--green);
  background: var(--green-soft);
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(0,200,83,0.12);
}

.option:active:not(:disabled) { transform: translateY(0); }

/* ── States ── */
.option.selected {
  border-color: var(--green);
  background: var(--green-soft);
  box-shadow: 0 4px 16px rgba(0,200,83,0.15);
}

.option.correct {
  border-color: var(--green);
  background: var(--green-soft);
  cursor: default;
}

.option.wrong {
  border-color: var(--red);
  background: var(--red-soft);
  cursor: default;
}

.option.dimmed {
  opacity: 0.45;
  cursor: default;
}

.option:disabled { cursor: default; }

/* ── Letter badge ── */
.opt-letter {
  width: 34px;
  height: 34px;
  border-radius: 9px;
  background: var(--grey);
  color: var(--muted);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  transition: background 0.18s, color 0.18s;
}

.selected .opt-letter { background: var(--green); color: white; }
.correct  .opt-letter { background: var(--green); color: white; }
.wrong    .opt-letter { background: var(--red);   color: white; }

/* ── Text ── */
.opt-text {
  flex: 1;
  font-size: 14.5px;
  color: var(--text);
  font-weight: 500;
  line-height: 1.5;
}

/* ── Result icon ── */
.opt-result-icon { flex-shrink: 0; display: flex; }
.icon-correct { color: var(--green); }
.icon-wrong   { color: var(--red); }

/* ── Transition ── */
.icon-pop-enter-active { transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1); }
.icon-pop-enter-from   { transform: scale(0); opacity: 0; }
.icon-pop-leave-active { transition: all 0.15s ease; }
.icon-pop-leave-to     { transform: scale(0); opacity: 0; }
</style>
