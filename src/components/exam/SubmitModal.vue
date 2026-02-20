<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay" @click.self="emit('cancel')">
      <Transition name="modal-pop">
        <div v-if="visible" class="modal">
          <!-- Icon -->
          <div class="modal-icon" :class="hasUnanswered ? 'warn' : 'ok'">
            <PhWarning  v-if="hasUnanswered" :size="32" weight="fill" />
            <PhCheckFat v-else               :size="32" weight="fill" />
          </div>

          <!-- Title -->
          <h2 class="modal-title">
            {{ hasUnanswered ? 'Questions Remaining' : 'Submit Exam?' }}
          </h2>

          <!-- Stats -->
          <div class="modal-stats">
            <div class="mstat">
              <span class="mstat-val green">{{ answeredCount }}</span>
              <span class="mstat-lbl">Answered</span>
            </div>
            <div class="mstat">
              <span class="mstat-val gold">{{ flaggedCount }}</span>
              <span class="mstat-lbl">Flagged</span>
            </div>
            <div class="mstat">
              <span class="mstat-val" :class="hasUnanswered ? 'red' : 'muted'">{{ unansweredCount }}</span>
              <span class="mstat-lbl">Unanswered</span>
            </div>
          </div>

          <!-- Message -->
          <p class="modal-msg">
            <template v-if="hasUnanswered">
              You still have <strong>{{ unansweredCount }} unanswered question{{ unansweredCount !== 1 ? 's' : '' }}</strong>.
              Unanswered questions score zero. Are you sure you want to submit?
            </template>
            <template v-else>
              You've answered all {{ totalQuestions }} questions.
              Once submitted, you cannot change your answers.
            </template>
          </p>

          <!-- Actions -->
          <div class="modal-actions">
            <button class="modal-btn-back" @click="emit('cancel')">
              <PhArrowLeft :size="16" weight="bold" />
              Go Back
            </button>
            <button class="modal-btn-submit" @click="emit('confirm')">
              Submit Now
              <PhPaperPlaneTilt :size="16" weight="fill" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { computed } from 'vue'
import { PhWarning, PhCheckFat, PhArrowLeft, PhPaperPlaneTilt } from '@phosphor-icons/vue'

const props = defineProps({
  visible:      { type: Boolean, required: true },
  answeredCount:{ type: Number,  default: 0 },
  flaggedCount: { type: Number,  default: 0 },
  totalQuestions:{ type: Number, default: 0 }
})

const emit = defineEmits(['confirm', 'cancel'])

const unansweredCount = computed(() => props.totalQuestions - props.answeredCount)
const hasUnanswered   = computed(() => unansweredCount.value > 0)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(10,15,44,0.7);
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
  padding: 28px 24px 40px;
  width: 100%;
  max-width: 480px;
  text-align: center;
}

.modal-icon {
  width: 64px; height: 64px;
  border-radius: 20px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.modal-icon.ok   { background: var(--green-soft); color: var(--green); }
.modal-icon.warn { background: var(--gold-soft);  color: var(--gold-dark); }

.modal-title {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 800;
  color: var(--text);
  margin-bottom: 18px;
}

.modal-stats {
  display: flex;
  justify-content: space-around;
  background: var(--grey);
  border-radius: 14px;
  padding: 14px;
  margin-bottom: 16px;
}

.mstat { display: flex; flex-direction: column; align-items: center; gap: 2px; }

.mstat-val {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
}
.mstat-val.green { color: var(--green); }
.mstat-val.gold  { color: var(--gold); }
.mstat-val.red   { color: var(--red); }
.mstat-val.muted { color: var(--muted); }

.mstat-lbl { font-size: 11px; color: var(--muted); font-weight: 500; }

.modal-msg {
  font-size: 14px;
  color: var(--muted);
  line-height: 1.6;
  margin-bottom: 24px;
}
.modal-msg strong { color: var(--text); }

.modal-actions { display: flex; gap: 10px; }

.modal-btn-back {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 14px;
  background: var(--grey);
  color: var(--text);
  border: none;
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.modal-btn-back:hover { background: var(--border); }

.modal-btn-submit {
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 14px;
  background: var(--green);
  color: white;
  border: none;
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 16px rgba(0,200,83,0.35);
}
.modal-btn-submit:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,200,83,0.4); }

/* ── Transitions ── */
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }

.modal-pop-enter-active { transition: all 0.32s cubic-bezier(0.34, 1.1, 0.64, 1); }
.modal-pop-leave-active { transition: all 0.2s ease; }
.modal-pop-enter-from   { transform: translateY(60px); opacity: 0; }
.modal-pop-leave-to     { transform: translateY(60px); opacity: 0; }
</style>
