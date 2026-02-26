<template>
  <div class="auth-view">
    <!-- Back -->
    <button class="auth-back" @click="router.back()">
      <PhArrowLeft :size="20" weight="bold" />
    </button>

    <div class="auth-content">
      <!-- Logo -->
      <div class="auth-logo">
        <div class="logo-icon"><PhTarget :size="22" weight="fill" /></div>
        <span class="logo-text">2W<span>ise</span></span>
      </div>

      <!-- Tab switcher -->
      <div class="auth-tabs">
        <button class="auth-tab" :class="{ active: mode === 'signup' }" @click="mode = 'signup'">Sign Up</button>
        <button class="auth-tab" :class="{ active: mode === 'login'  }" @click="mode = 'login'">Log In</button>
      </div>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="submit">
        <!-- Name (signup only) -->
        <Transition name="field-drop">
          <div v-if="mode === 'signup'" class="field-wrap">
            <label class="field-label">Full Name</label>
            <div class="field-input-wrap">
              <PhUser :size="18" weight="regular" class="field-icon" />
              <input
                v-model="form.name"
                type="text"
                placeholder="e.g. Chukwuemeka Daniel"
                class="field-input"
                autocomplete="name"
                required
              />
            </div>
          </div>
        </Transition>

        <!-- Email -->
        <div class="field-wrap">
          <label class="field-label">Email Address</label>
          <div class="field-input-wrap">
            <PhEnvelope :size="18" weight="regular" class="field-icon" />
            <input
              v-model="form.email"
              type="email"
              placeholder="you@example.com"
              class="field-input"
              autocomplete="email"
              required
            />
          </div>
        </div>

        <!-- Password -->
        <div class="field-wrap">
          <div class="field-label-row">
            <label class="field-label">Password</label>
            <button
              v-if="mode === 'login'"
              type="button"
              class="forgot-link"
              @click="forgotPassword"
            >Forgot password?</button>
          </div>
          <div class="field-input-wrap">
            <PhLock :size="18" weight="regular" class="field-icon" />
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Min. 8 characters"
              class="field-input"
              autocomplete="current-password"
              required
              minlength="8"
            />
            <button type="button" class="eye-btn" @click="showPassword = !showPassword">
              <PhEye v-if="!showPassword" :size="18" weight="regular" />
              <PhEyeSlash v-else :size="18" weight="regular" />
            </button>
          </div>
        </div>

        <!-- Referral code (signup only) -->
        <Transition name="field-drop">
          <div v-if="mode === 'signup' && showReferral" class="field-wrap">
            <label class="field-label">Referral Code <span class="optional">(optional)</span></label>
            <div class="field-input-wrap">
              <PhGift :size="18" weight="regular" class="field-icon" />
              <input
                v-model="form.referralCode"
                type="text"
                placeholder="Enter code from a friend"
                class="field-input"
                style="text-transform: uppercase"
              />
            </div>
          </div>
        </Transition>

        <button
          v-if="mode === 'signup' && !showReferral"
          type="button"
          class="add-referral-btn"
          @click="showReferral = true"
        >
          <PhGift :size="14" weight="fill" />
          Have a referral code?
        </button>

        <!-- Error -->
        <Transition name="fade">
          <div v-if="error" class="auth-error">
            <PhWarning :size="15" weight="fill" />
            {{ error }}
          </div>
        </Transition>

        <!-- Submit -->
        <button type="submit" class="btn-submit" :disabled="loading">
          <div v-if="loading" class="btn-spinner"></div>
          <template v-else>
            {{ mode === 'signup' ? 'Create Account' : 'Log In' }}
            <PhArrowRight :size="17" weight="bold" />
          </template>
        </button>
      </form>

      <!-- Divider -->
      <div class="auth-divider"><span>or</span></div>

      <!-- Google -->
      <button class="btn-google" @click="googleAuth" :disabled="loading">
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
          <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
          <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
          <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>

      <!-- Terms -->
      <p v-if="mode === 'signup'" class="auth-terms">
        By signing up you agree to our
        <a href="#" class="terms-link">Terms of Service</a> and
        <a href="#" class="terms-link">Privacy Policy</a>.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  PhArrowLeft, PhArrowRight, PhTarget, PhUser,
  PhEnvelope, PhLock, PhEye, PhEyeSlash,
  PhGift, PhWarning
} from '@phosphor-icons/vue'
import { useUserStore }     from '@/stores/user'
import { useSyncStore }        from '@/stores/sync'
import { useQuestionsStore }   from '@/stores/questions'

const API = import.meta.env.VITE_API_BASE_URL ?? '/api'

const router          = useRouter()
const route           = useRoute()
const userStore       = useUserStore()
const syncStore       = useSyncStore()

const mode         = ref('signup')
const showPassword = ref(false)
const showReferral = ref(!!route.query.ref)
const loading      = ref(false)
const error        = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  referralCode: route.query.ref || ''
})

async function submit() {
  error.value   = ''
  loading.value = true

  try {
    const endpoint = mode.value === 'signup' ? '/auth/register' : '/auth/login'
    const body     = mode.value === 'signup'
      ? { name: form.name, email: form.email, password: form.password, referral_code: form.referralCode || undefined }
      : { email: form.email, password: form.password }

    const res  = await fetch(`${API}${endpoint}`, {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(body),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.message ?? 'Authentication failed.')

    // Hydrate stores from server response
    userStore.setProfile(data)

    // Non-blocking: bootstrap progress + start offline download
    afterLogin()

    const redirect = route.query.redirect
    if (redirect) router.replace(redirect)
    else if (!userStore.subjects.length) router.replace({ name: 'setup' })
    else router.replace({ name: 'dashboard' })

  } catch (e) {
    error.value = e.message || 'Something went wrong. Please try again.'
  } finally {
    loading.value = false
  }
}

async function googleAuth() {
  // TODO: Google OAuth — load gsi library, call google.accounts.id.initialize()
  error.value = 'Google sign-in coming soon.'
}

function afterLogin() {
  syncStore.bootstrapFromServer()
  // Silently pre-fetch all subjects for offline use — non-blocking
  if (userStore.subjects.length) {
    questionsStore.warmCache(userStore.subjects)
  }
}

function forgotPassword() {
  // TODO: implement password reset flow
  alert('A reset link will be sent to your email.')
}
</script>

<style scoped>
.auth-view {
  min-height: 100vh;
  background: var(--bg);
  display: flex;
  flex-direction: column;
  max-width: 480px;
  margin: 0 auto;
  padding: 0 20px 40px;
}

.auth-back {
  width: 40px; height: 40px;
  border-radius: 12px;
  background: white;
  border: 1.5px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  margin-top: 56px;
  cursor: pointer;
  box-shadow: var(--shadow);
  transition: all 0.2s;
}
.auth-back:hover { background: var(--grey); }

.auth-content { flex: 1; display: flex; flex-direction: column; padding-top: 28px; }

/* Logo */
.auth-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 28px;
}
.logo-icon {
  width: 40px; height: 40px;
  background: var(--navy);
  border-radius: 11px;
  display: flex; align-items: center; justify-content: center;
  color: var(--green);
}
.logo-text {
  font-family: var(--font-display);
  font-size: 24px;
  font-weight: 800;
  color: var(--text);
}
.logo-text span { color: var(--green); }

/* Tabs */
.auth-tabs {
  display: flex;
  background: var(--grey);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 24px;
}
.auth-tab {
  flex: 1;
  padding: 10px;
  border-radius: 9px;
  border: none;
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.auth-tab.active {
  background: white;
  color: var(--text);
  box-shadow: var(--shadow);
}

/* Form */
.auth-form { display: flex; flex-direction: column; gap: 14px; margin-bottom: 20px; }

.field-wrap { display: flex; flex-direction: column; gap: 6px; }

.field-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}
.optional { color: var(--muted); font-weight: 400; }

.field-label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.forgot-link {
  font-size: 13px;
  color: var(--green-dark);
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}

.field-input-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border: 1.5px solid var(--border);
  border-radius: 12px;
  padding: 0 14px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field-input-wrap:focus-within {
  border-color: var(--navy);
  box-shadow: 0 0 0 3px rgba(10,15,44,0.06);
}

.field-icon { color: var(--muted); flex-shrink: 0; }

.field-input {
  flex: 1;
  border: none;
  outline: none;
  font-family: var(--font-body);
  font-size: 14.5px;
  color: var(--text);
  padding: 14px 0;
  background: transparent;
}
.field-input::placeholder { color: var(--muted); }

.eye-btn {
  color: var(--muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  padding: 4px;
  transition: color 0.2s;
}
.eye-btn:hover { color: var(--text); }

.add-referral-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--green-dark);
  font-size: 13px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px 0;
  align-self: flex-start;
}

.auth-error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--red-soft);
  color: var(--red);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 13.5px;
  font-weight: 500;
}

.btn-submit {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: var(--navy);
  color: white;
  border: none;
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 4px 20px rgba(10,15,44,0.25);
  margin-top: 4px;
}
.btn-submit:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 28px rgba(10,15,44,0.3); }
.btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-spinner {
  width: 20px; height: 20px;
  border: 2px solid rgba(255,255,255,0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Divider */
.auth-divider {
  position: relative;
  text-align: center;
  margin: 16px 0;
}
.auth-divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0; right: 0;
  height: 1px;
  background: var(--border);
}
.auth-divider span {
  position: relative;
  background: var(--bg);
  padding: 0 12px;
  font-size: 12px;
  color: var(--muted);
  font-weight: 500;
}

/* Google */
.btn-google {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px;
  background: white;
  color: var(--text);
  border: 1.5px solid var(--border);
  border-radius: 14px;
  font-family: var(--font-body);
  font-size: 14.5px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--shadow);
}
.btn-google:hover:not(:disabled) { background: var(--grey); }

/* Terms */
.auth-terms {
  font-size: 12px;
  color: var(--muted);
  text-align: center;
  margin-top: 16px;
  line-height: 1.6;
}
.terms-link { color: var(--green-dark); font-weight: 600; }

/* Transitions */
.field-drop-enter-active { transition: all 0.25s ease; }
.field-drop-leave-active { transition: all 0.18s ease; }
.field-drop-enter-from   { opacity: 0; transform: translateY(-8px); }
.field-drop-leave-to     { opacity: 0; transform: translateY(-8px); }

.fade-enter-active { transition: opacity 0.2s; }
.fade-enter-from   { opacity: 0; }
</style>