# 2Wise — Project Reference

## Tech Stack
- **Framework:** Vue 3 (Composition API + `<script setup>`)
- **Build tool:** Vite 5
- **State:** Pinia + pinia-plugin-persistedstate
- **Router:** Vue Router 4
- **Icons:** @phosphor-icons/vue
- **PWA:** vite-plugin-pwa (Workbox)
- **Mobile:** Capacitor 6 (Android + iOS wrapper)
- **Utilities:** @vueuse/core, dayjs, axios

---

## Folder Structure

```
src/
├── assets/
│   └── main.css             ← Global design system (CSS vars, fonts, utilities)
├── components/
│   ├── ui/                  ← Reusable: AppButton, AppCard, ProgressBar, Badge, Modal...
│   ├── exam/                ← QuestionCard, OptionItem, QuestionNavigator, ExamTimer...
│   ├── dashboard/           ← StatCard, StreakBanner, SubjectProgress, Leaderboard...
│   ├── study/               ← DayPlan, WeakAreaCard, CountdownBanner...
│   ├── community/           ← StudyGroupCard, ChallengeCard, DiscussionThread...
│   └── auth/                ← LoginForm, SignupForm, OTPInput...
├── views/
│   ├── layouts/
│   │   └── MainLayout.vue   ← Bottom nav wrapper for all main screens
│   ├── SplashView.vue
│   ├── OnboardingView.vue
│   ├── AuthView.vue
│   ├── SetupView.vue        ← Subject picker, exam date, target score
│   ├── DashboardView.vue
│   ├── PracticeView.vue
│   ├── StudyPlanView.vue
│   ├── CommunityView.vue
│   ├── ProfileView.vue
│   ├── ExamView.vue         ← Fullscreen CBT interface
│   ├── ResultsView.vue
│   ├── UpgradeView.vue
│   └── ReferView.vue
├── stores/
│   ├── user.js              ← Auth, profile, premium status, referrals
│   ├── exam.js              ← Active session, history, scoring
│   ├── progress.js          ← Streaks, XP, badges, subject stats, weak topics
│   ├── network.js           ← Online/offline detection
│   └── questions.js         ← Fetch, cache (offline), flag
├── router/
│   └── index.js             ← All routes + auth guard
├── composables/             ← useTimer, useCountdown, usePaystack, useReferral...
├── services/                ← api.js (axios instance + all API calls)
├── utils/                   ← formatScore, subjectColor, generateStudyPlan...
├── data/                    ← subjects.js, topics.js, badgeDefinitions.js
└── main.js
```

---

## Stores Reference

### useUserStore
| Property | Type | Description |
|---|---|---|
| `isLoggedIn` | computed | !!token |
| `isPremium` | computed | trial OR paid OR 5+ referrals |
| `isFullPremium` | computed | paid OR 5+ referrals (excludes trial) |
| `trialDaysLeft` | computed | 0–30 |
| `daysToExam` | computed | days until JAMB date |

### useExamStore
| Method | Description |
|---|---|
| `startSession({type, subjects, questions, timeLimit})` | Begin new exam |
| `answer(questionId, optionIndex)` | Record an answer |
| `toggleFlag(questionId)` | Flag/unflag a question |
| `next() / prev() / goTo(index)` | Navigate questions |
| `submit()` | End exam, save to history |

### useProgressStore
| Property/Method | Description |
|---|---|
| `streak` | Current study streak in days |
| `weakTopics` | Auto-detected topics under 55% accuracy |
| `recordSession(result)` | Called after every exam, updates all stats |
| `addXP(amount, reason)` | Add XP + check for new badges |

---

## Business Logic

### Premium Gate
```js
// In any component:
const userStore = useUserStore()

// Check premium (trial counts)
if (!userStore.isPremium) router.push('/upgrade')

// Check for offline access specifically
if (!networkStore.isOnline && !userStore.isFullPremium) {
  // Show upgrade prompt
}

// Show explanation (premium feature)
const showExplanation = computed(() => userStore.isPremium)
```

### Paywall Triggers
1. **App opens offline** → show upgrade banner (free users)
2. **User completes exam** → explanation locked behind upgrade prompt
3. **After 30-day trial** → soft gate on offline + explanations only

### Referral Flow
1. User shares unique `referralCode` link
2. Friend signs up via link → backend increments `referralCount`
3. At 5 referrals → `isPremium` returns true automatically
4. No payment needed

---

## Routing Summary

| Route | Auth | Layout |
|---|---|---|
| `/` SplashView | Public | None |
| `/onboarding` | Public | None |
| `/auth` | Public | None |
| `/setup` | Required | None |
| `/home` → DashboardView | Required | MainLayout (bottom nav) |
| `/practice` | Required | MainLayout |
| `/plan` | Required | MainLayout |
| `/community` | Required | MainLayout |
| `/profile` | Required | MainLayout |
| `/exam/:type` | Required | Fullscreen |
| `/exam/results/:id` | Required | Fullscreen |
| `/upgrade` | Required | None |
| `/refer` | Required | None |

---

## Design Tokens

```css
--green: #00C853      /* Primary CTA, success, progress */
--gold:  #FFB800      /* Streaks, XP, achievements */
--navy:  #0A0F2C      /* Headers, exam bar, dark surfaces */
--red:   #FF4444      /* Wrong answers, errors */
--muted: #7A8099      /* Secondary text */
--border: #E4E7F0     /* Dividers, card borders */

--font-display: 'Syne'     /* Headers, scores, titles */
--font-body:    'DM Sans'  /* Everything else */
```

---

## Build Order

- [x] Project scaffold (stores, router, layout, CSS)
- [ ] **NEXT:** Question data schema + seed data (sample questions)
- [ ] ExamView — CBT interface
- [ ] AuthView — signup/login
- [ ] SetupView — onboarding wizard
- [ ] DashboardView
- [ ] StudyPlanView
- [ ] ResultsView
- [ ] UpgradeView + ReferView
- [ ] CommunityView
- [ ] Backend API (Node.js / Supabase)
- [ ] Paystack payment integration
- [ ] Capacitor build (Android)
- [ ] Play Store submission

---

## Getting Started

```bash
cd jambace
npm install
npm run dev

# Build PWA
npm run build

# Wrap for Android
npm run cap:sync
npx cap open android
```
