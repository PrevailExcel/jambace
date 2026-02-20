<template>
  <div class="splash">
    <div class="splash-content">
      <Transition name="logo-pop">
        <div v-if="showLogo" class="splash-logo">
          <div class="logo-icon">
            <PhTarget :size="32" weight="fill" />
          </div>
          <span class="logo-text">JAMB<span>Ace</span></span>
        </div>
      </Transition>
      <Transition name="fade-up">
        <p v-if="showTagline" class="splash-tagline">Your path to 300+</p>
      </Transition>
    </div>
    <div class="splash-spinner" v-if="showSpinner">
      <div class="spinner-ring"></div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { PhTarget } from '@phosphor-icons/vue'
import { useUserStore } from '@/stores/user'

const router    = useRouter()
const userStore = useUserStore()
const showLogo    = ref(false)
const showTagline = ref(false)
const showSpinner = ref(false)

onMounted(async () => {
  // Staggered reveal
  setTimeout(() => { showLogo.value = true }, 100)
  setTimeout(() => { showTagline.value = true }, 500)
  setTimeout(() => { showSpinner.value = true }, 900)

  // Decide where to navigate
  setTimeout(() => {
    if (userStore.isLoggedIn) {
      // Returning user
      if (!userStore.subjects.length) router.replace({ name: 'setup' })
      else router.replace({ name: 'dashboard' })
    } else {
      router.replace({ name: 'onboarding' })
    }
  }, 2000)
})
</script>

<style scoped>
.splash {
  min-height: 100vh;
  background: var(--navy);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

/* Background glow */
.splash::before {
  content: '';
  position: absolute;
  width: 400px; height: 400px;
  background: radial-gradient(circle, rgba(0,200,83,0.15) 0%, transparent 70%);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.splash-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  z-index: 1;
}

.splash-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 56px; height: 56px;
  background: var(--green);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 8px 32px rgba(0,200,83,0.4);
}

.logo-text {
  font-family: var(--font-display);
  font-size: 38px;
  font-weight: 800;
  color: white;
  letter-spacing: -1px;
}
.logo-text span { color: var(--green); }

.splash-tagline {
  font-size: 15px;
  color: rgba(255,255,255,0.45);
  font-weight: 500;
  letter-spacing: 0.5px;
}

.splash-spinner {
  position: absolute;
  bottom: 60px;
}

.spinner-ring {
  width: 28px; height: 28px;
  border: 2.5px solid rgba(255,255,255,0.1);
  border-top-color: var(--green);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* Transitions */
.logo-pop-enter-active { transition: all 0.5s cubic-bezier(0.34, 1.3, 0.64, 1); }
.logo-pop-enter-from   { opacity: 0; transform: scale(0.7); }

.fade-up-enter-active { transition: all 0.5s ease; transition-delay: 0.1s; }
.fade-up-enter-from   { opacity: 0; transform: translateY(10px); }
</style>
