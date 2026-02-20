<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="emit('cancel')">
      <Transition name="modal-pop">
        <div v-if="visible" class="modal">
          <div class="modal-icon">
            <PhFlag :size="28" weight="fill" />
          </div>

          <h2 class="modal-title">Report an Issue</h2>
          <p class="modal-sub">Help us keep our question bank accurate. What's wrong with this question?</p>

          <div class="reason-list">
            <button
              v-for="reason in reasons"
              :key="reason.id"
              class="reason-btn"
              :class="{ selected: selectedReason === reason.id }"
              @click="selectedReason = reason.id"
            >
              <component :is="reason.icon" :size="18" weight="fill" class="reason-icon" />
              <div class="reason-text">
                <strong>{{ reason.label }}</strong>
                <span>{{ reason.desc }}</span>
              </div>
              <div class="reason-check" v-if="selectedReason === reason.id">
                <PhCheckCircle :size="18" weight="fill" />
              </div>
            </button>
          </div>

          <textarea
            v-model="note"
            placeholder="Add a note (optional)..."
            class="flag-note"
            rows="2"
          ></textarea>

          <div class="modal-actions">
            <button class="btn-cancel" @click="emit('cancel')">Cancel</button>
            <button
              class="btn-report"
              :disabled="!selectedReason"
              @click="submit"
            >
              <PhPaperPlaneTilt :size="15" weight="fill" />
              Submit Report
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import {
  PhFlag, PhCheckCircle, PhPaperPlaneTilt,
  PhX, PhArrowsClockwise, PhTextT, PhImage
} from '@phosphor-icons/vue'

const props = defineProps({
  visible:    { type: Boolean, required: true },
  questionId: { type: String,  default: '' }
})

const emit = defineEmits(['confirm', 'cancel'])

const selectedReason = ref(null)
const note = ref('')

const reasons = [
  { id: 'wrong-answer', icon: PhX,               label: 'Wrong correct answer',    desc: 'The marked answer appears to be incorrect' },
  { id: 'outdated',     icon: PhArrowsClockwise,  label: 'Outdated content',        desc: 'The question or answer is no longer current' },
  { id: 'typo',         icon: PhTextT,             label: 'Spelling or typo error',  desc: 'Text errors in the question or options' },
  { id: 'bad-image',    icon: PhImage,             label: 'Missing or broken image', desc: 'A diagram or image is not loading' },
]

function submit() {
  if (!selectedReason.value) return
  emit('confirm', { questionId: props.questionId, reason: selectedReason.value, note: note.value })
  selectedReason.value = null
  note.value = ''
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,15,44,0.65);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 300;
  padding: 0 16px;
}

.modal {
  background: white;
  border-radius: 24px 24px 0 0;
  padding: 26px 20px 40px;
  width: 100%;
  max-width: 480px;
}

.modal-icon {
  width: 52px; height: 52px;
  border-radius: 16px;
  background: var(--gold-soft);
  color: var(--gold-dark);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.modal-title {
  font-family: var(--font-display);
  font-size: 19px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 6px;
}

.modal-sub {
  font-size: 13px;
  color: var(--muted);
  margin-bottom: 18px;
  line-height: 1.5;
}

.reason-list { display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px; }

.reason-btn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
  transition: all 0.18s;
  text-align: left;
}

.reason-btn:hover   { border-color: var(--gold); background: var(--gold-soft); }
.reason-btn.selected{ border-color: var(--gold); background: var(--gold-soft); }

.reason-icon { color: var(--muted); flex-shrink: 0; }
.reason-btn.selected .reason-icon { color: var(--gold-dark); }

.reason-text { flex: 1 }
.reason-text strong { display: block; font-size: 13px; color: var(--text); margin-bottom: 1px; }
.reason-text span   { font-size: 11.5px; color: var(--muted); }

.reason-check { color: var(--gold-dark); flex-shrink: 0; }

.flag-note {
  width: 100%;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 12px 14px;
  font-family: var(--font-body);
  font-size: 13.5px;
  color: var(--text);
  resize: none;
  margin-bottom: 18px;
  transition: border-color 0.2s;
  outline: none;
}
.flag-note:focus { border-color: var(--green); }

.modal-actions { display: flex; gap: 10px; }

.btn-cancel {
  flex: 1;
  padding: 13px;
  background: var(--grey);
  border: none;
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
}

.btn-report {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 13px;
  background: var(--gold-dark);
  color: white;
  border: none;
  border-radius: 12px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-report:disabled { opacity: 0.45; cursor: not-allowed; transform: none; }
.btn-report:not(:disabled):hover { opacity: 0.9; }

/* Transitions */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
.modal-pop-enter-active { transition: all 0.3s cubic-bezier(0.34, 1.1, 0.64, 1); }
.modal-pop-leave-active { transition: all 0.2s ease; }
.modal-pop-enter-from   { transform: translateY(60px); opacity: 0; }
.modal-pop-leave-to     { transform: translateY(60px); opacity: 0; }
</style>
