<template>
  <div class="onboarding">
    <!-- Slides -->
    <div class="slides-wrap" ref="slidesEl">
      <TransitionGroup name="slide-fade" mode="out-in">
        <div class="slide" :key="current">
          <div class="slide-illustration" :style="{ background: slides[current].bg }">
            <component :is="slides[current].icon" :size="64" weight="fill" :style="{ color: slides[current].color }" />
          </div>
          <h1 class="slide-title">{{ slides[current].title }}</h1>
          <p class="slide-desc">{{ slides[current].desc }}</p>

          <!-- Feature bullets -->
          <div class="slide-features">
            <div v-for="f in slides[current].features" :key="f" class="slide-feat">
              <PhCheckCircle :size="16" weight="fill" class="feat-check" />
              <span>{{ f }}</span>
            </div>
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- Dots -->
    <div class="ob-dots">
      <button
        v-for="(_, i) in slides"
        :key="i"
        class="dot"
        :class="{ active: i === current }"
        @click="current = i"
      ></button>
    </div>

    <!-- Actions -->
    <div class="ob-actions">
      <button class="btn-primary" @click="advance">
        {{ current < slides.length - 1 ? 'Next' : 'Get Started' }}
        <PhArrowRight :size="17" weight="bold" />
      </button>
      <button
        v-if="current < slides.length - 1"
        class="btn-skip"
        @click="router.push({ name: 'auth' })"
      >
        Skip
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  PhTarget, PhBrain, PhTrophy,
  PhCheckCircle, PhArrowRight
} from '@phosphor-icons/vue'

const router  = useRouter()
const current = ref(0)

const slides = [
  {
    icon: PhTarget,
    bg: 'linear-gradient(135deg, #E8FFF1, #C8F5DC)',
    color: '#00952E',
    title: 'Ace JAMB First Attempt',
    desc: 'Nigeria\'s smartest exam prep — real past questions, verified answers, and a study plan built around your exam date.',
    features: [
      'Past questions from 1985 to 2024',
      'Verified answers — flagged by the community',
      'Works offline for premium users',
    ]
  },
  {
    icon: PhBrain,
    bg: 'linear-gradient(135deg, #EDE7F6, #D1C4E9)',
    color: '#4A148C',
    title: 'Your Personal AI Tutor',
    desc: 'Don\'t just see the answer — understand it. Ask the AI Tutor follow-up questions after every explanation.',
    features: [
      'Threaded conversations per question',
      'Context-aware — it knows the question',
      '100 free credits every month with Premium',
    ]
  },
  {
    icon: PhTrophy,
    bg: 'linear-gradient(135deg, #FFF8E1, #FFE082)',
    color: '#E65100',
    title: 'Study Smart, Not Hard',
    desc: 'Streaks, leaderboards, XP, and a personalized daily plan keep you motivated from day one to exam day.',
    features: [
      'Daily study streaks with XP rewards',
      'Compete with friends on the leaderboard',
      'AI-detected weak topics — drill what matters',
    ]
  }
]

function advance() {
  if (current.value < slides.length - 1) {
    current.value++
  } else {
    router.push({ name: 'auth' })
  }
}
</script>

<style scoped>
.onboarding {
  min-height: 100vh;
  background: var(--navy);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 24px 48px;
  max-width: 480px;
  margin: 0 auto;
}

.slides-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  width: 100%;
}

.slide {
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.slide-illustration {
  width: 140px; height: 140px;
  border-radius: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
  box-shadow: 0 12px 40px rgba(0,0,0,0.2);
}

.slide-title {
  font-family: var(--font-display);
  font-size: 28px;
  font-weight: 800;
  color: white;
  line-height: 1.2;
}

.slide-desc {
  color: rgba(255,255,255,0.55);
  font-size: 15px;
  line-height: 1.65;
  max-width: 320px;
}

.slide-features {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 320px;
  text-align: left;
  margin-top: 4px;
}

.slide-feat {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: rgba(255,255,255,0.7);
}

.feat-check { color: var(--green); flex-shrink: 0; }

/* Dots */
.ob-dots {
  display: flex;
  gap: 7px;
  margin: 28px 0 24px;
}

.dot {
  height: 7px;
  border-radius: 4px;
  background: rgba(255,255,255,0.2);
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 7px;
}
.dot.active { width: 24px; background: var(--green); }

/* Actions */
.ob-actions {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.btn-primary {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--green);
  color: white;
  border: none;
  border-radius: 16px;
  font-family: var(--font-body);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 6px 24px rgba(0,200,83,0.35);
  transition: all 0.2s;
}
.btn-primary:hover { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(0,200,83,0.4); }

.btn-skip {
  color: rgba(255,255,255,0.4);
  font-size: 14px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px 24px;
  transition: color 0.2s;
}
.btn-skip:hover { color: rgba(255,255,255,0.7); }

/* Slide transition */
.slide-fade-enter-active { transition: all 0.3s ease; }
.slide-fade-leave-active { transition: all 0.2s ease; }
.slide-fade-enter-from   { opacity: 0; transform: translateX(30px); }
.slide-fade-leave-to     { opacity: 0; transform: translateX(-20px); }
</style>
