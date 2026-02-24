# 2Wise 🎯

**Nigeria's smartest JAMB exam prep app.**  
Real past questions, verified answers, an AI Tutor that explains like a teacher, and a study plan built around your exam date.

---

## What Is This?

2Wise is a Progressive Web App (PWA) built for Nigerian secondary school students preparing for the JAMB UTME. It works in a browser, installs on Android and iOS like a native app, and is designed to be the only study tool a student needs from registration to exam day.

**Target user:** Students aged 16–19, sitting their first or second UTME attempt.  
**Core problem it solves:** Existing apps have wrong answers, no explanations, and no personalisation. Students are left Googling for help and losing momentum.

---

## Key Features

### For Every Student (Free)
- All past questions from 1985 to 2024
- Timed mock exams (3 per week on the free tier)
- Subject progress tracking
- Community leaderboard
- Study rooms — discuss questions with other candidates
- Challenge a friend mode
- Verified answer system — community flagging + review team

### Premium Only (₦1,000/year)
- Full step-by-step answer explanations
- **AI Tutor** — ask follow-up questions after any explanation (see below)
- Offline access — study without internet
- Unlimited mock exams
- Personalised AI study plan
- Streak shield (miss one day without losing your streak, once per week)

### AI Tutor
The standout feature. After viewing an explanation, students can open a conversation thread with an AI tutor that already knows the question, the correct answer, and the explanation. No copy-pasting, no re-explaining — just ask "why?" and the tutor responds in context.

**Credit model:**
- Premium users get **100 free credits per month**, auto-reset
- Purchased credits never expire
- 1 credit = 1 conversation thread (unlimited messages within the thread)
- Top-up packs: ₦200 / ₦500 / ₦1,000

**Available:** Practice mode and post-exam review screen.  
**Free users:** See the button, cannot use it — clear and honest gating.

### Referral Programme
Refer 5 friends who sign up → account upgrades to Premium automatically. No payment required, ever.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Vue 3 (Composition API) |
| Build tool | Vite 5 |
| State management | Pinia + pinia-plugin-persistedstate |
| Routing | Vue Router 4 |
| Icons | Phosphor Icons for Vue |
| Utilities | @vueuse/core, dayjs, axios |
| PWA | vite-plugin-pwa (offline caching, installable) |
| Mobile wrapper | Capacitor 6 (Android + iOS) |
| AI Tutor | Anthropic Claude API (claude-sonnet-4-20250514) |
| Payments | Paystack (integration stubbed, ready to wire) |
| CSS | Custom design system — no UI framework dependency |

---

## Folder Structure

```
2Wise/
│
├── index.html                      # App entry point
├── package.json                    # Dependencies & scripts
├── vite.config.js                  # Vite + PWA configuration
├── capacitor.config.json           # Capacitor (Android/iOS) config
├── README.md                       # This file
├── PROJECT.md                      # Extended technical reference
│
└── src/
    │
    ├── App.vue                     # Root component — router-view + transitions
    ├── main.js                     # App bootstrap — Pinia, Router, plugins
    │
    ├── assets/
    │   └── main.css                # Global design system
    │                               # CSS variables: colours, fonts, shadows, radius
    │                               # Utility classes: buttons, typography, layout
    │                               # Subject-specific colour tokens
    │
    ├── data/
    │   └── questions.js            # Sample question dataset (20 questions, 4 subjects)
    │                               # SUBJECT_CONFIG — labels, colours, backgrounds
    │                               # EXAM_CONFIGS — time limits, question counts per type
    │
    ├── composables/
    │   └── useAiTutor.js           # AI Tutor logic — thread lifecycle, API calls,
    │                               # credit charging, system prompt builder
    │
    ├── stores/                     # Pinia stores — all persisted to localStorage
    │   ├── user.js                 # Auth, premium status, trial, credits, referrals
    │   ├── exam.js                 # Active session engine — answers, flags, scoring
    │   ├── progress.js             # Streaks, XP, levels, badges, subject/topic stats
    │   ├── questions.js            # API fetching, offline cache, question flagging
    │   └── network.js              # Online/offline detection via Capacitor Network
    │
    ├── router/
    │   └── index.js                # All routes + auth guard
    │                               # Public: splash, onboarding, auth
    │                               # Auth required: setup, main app, exam, results
    │                               # Monetisation: upgrade, refer
    │
    ├── components/
    │   └── exam/                   # All exam-specific components
    │       ├── ExamTimer.vue       # Countdown — 3 states: normal / warning / danger
    │       ├── OptionItem.vue      # Single answer option — mock & practice modes
    │       ├── QuestionNavigator.vue  # Bubble grid — answered/flagged/current/pending
    │       ├── ExplanationPanel.vue   # Slide-up panel — explanation tab + AI Tutor tab
    │       ├── AiTutorThread.vue   # Inline chat thread inside ExplanationPanel
    │       ├── AiTutorButton.vue   # Entry point — 3 states: active/no credits/locked
    │       ├── AiTutorChat.vue     # Fullscreen chat variant (results review screen)
    │       ├── SubmitModal.vue     # Pre-submit confirmation — shows unanswered count
    │       └── FlagQuestionModal.vue  # Report bad question — 4 reason types
    │
    └── views/
        │
        ├── layouts/
        │   └── MainLayout.vue      # Bottom navigation + offline banner
        │                           # Wraps: Dashboard, Practice, Plan, Community, Profile
        │
        ├── SplashView.vue          # Loading screen — routes new vs returning users
        ├── OnboardingView.vue      # 3-slide feature walkthrough
        ├── AuthView.vue            # Sign up / log in — email + Google OAuth stub
        ├── SetupView.vue           # 3-step wizard: subjects → exam date → target score
        │
        ├── DashboardView.vue       # Home — countdown, quick actions, progress, leaderboard
        ├── PracticeView.vue        # 3 tabs: By Subject / Mock Exam / Weak Areas
        ├── StudyPlanView.vue       # Daily tasks, weekly grid, subject allocation, XP
        ├── CommunityView.vue       # 3 tabs: Leaderboard / Study Rooms / Challenge
        ├── ProfileView.vue         # Stats, badges, exam info, credits, settings, logout
        │
        ├── ExamView.vue            # Fullscreen CBT interface — the core product
        ├── ResultsView.vue         # Post-exam: score, breakdown, weak areas, review
        │
        ├── UpgradeView.vue         # Premium plan + credit top-up packs + comparison
        └── ReferView.vue           # Referral link, share buttons, progress tracker
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Install & Run

```bash
# Clone the repo
git clone https://github.com/your-username/2Wise.git
cd 2Wise

# Install dependencies
npm install

# Start dev server
npm run dev
```

App runs at `http://localhost:5173`.

### Build for Production

```bash
npm run build
npm run preview
```

### Android (Capacitor)

```bash
# Build web assets and sync to native project
npm run cap:sync

# Open in Android Studio
npx cap open android
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Anthropic API — AI Tutor
VITE_ANTHROPIC_API_KEY=your_key_here

# Paystack — payments
VITE_PAYSTACK_PUBLIC_KEY=pk_live_xxxxxxxx

# Backend API
VITE_API_BASE_URL=https://api.2Wise.app/v1
```

> ⚠️ Never commit `.env` to version control. The Anthropic key is already handled by the artifact environment in development — add it to your backend proxy in production.

---

## What's Stubbed / TODO

The frontend is complete and wired to mock data. The following require backend work to go live:

**Authentication**
- Replace mock `setProfile()` call in `AuthView.vue` with real API
- Implement Google OAuth flow
- Add email verification

**Questions**
- Replace `SAMPLE_QUESTIONS` in `data/questions.js` with API calls in `stores/questions.js`
- Implement `fetchQuestions()`, `fetchMockExam()`, `fetchWeakAreaQuestions()`
- Build admin panel for answer verification workflow

**Payments (Paystack)**
- Uncomment Paystack `PopupHandler` in `UpgradeView.vue`
- Add `verifyPayment()` endpoint on backend
- Wire `buyCredits()` to Paystack for credit top-ups
- Set up webhook to update subscription status

**AI Tutor**
- Move API key to backend proxy — never expose in client
- Add server-side credit validation before each request
- Log usage per user for billing reconciliation

**Sync**
- `spendCredit()` in `user.js` — sync to backend on each call
- `recordSession()` in `progress.js` — POST results to API
- `checkAndResetMonthlyCredits()` — validate server-side on login

**Referrals**
- Track referral signups on backend
- Auto-trigger premium upgrade when count hits 5
- Send confirmation notification to referrer

---

## Monetisation Model

| Plan | Price | Key benefit |
|---|---|---|
| Free | ₦0 | Past questions, 3 mocks/week, community |
| Trial | ₦0 for 30 days | Full premium access, 100 AI credits |
| Premium | ₦1,000/year | Explanations, offline, unlimited mocks |
| Referral Premium | ₦0 (refer 5) | Full premium, no payment ever |

**AI Tutor Credits**
| Pack | Credits | Price |
|---|---|---|
| Starter | 50 | ₦200 |
| Popular | 150 | ₦500 |
| Best Value | 400 | ₦1,000 |

---

## Design System

All design tokens live in `src/assets/main.css` as CSS custom properties.

**Colours**
- `--navy` / `--navy-mid` / `--navy-light` — primary brand, headers, CTAs
- `--green` / `--green-dark` / `--green-soft` — success, correct answers, premium
- `--gold` / `--gold-dark` / `--gold-soft` — warnings, flagged, AI credits
- `--red` / `--red-soft` — errors, wrong answers, critical weak areas

**Typography**
- Display: `Syne` — headings, scores, UI numbers
- Body: `DM Sans` — all body text, buttons, labels

**Subject colour tokens** — each JAMB subject has its own `color` + `bg` pair defined in `SUBJECT_CONFIG` (`data/questions.js`).

---

## Scoring

2Wise uses the real JAMB scoring rules:
- ✅ Correct answer: **+1 mark**
- ❌ Wrong answer: **0** (no negative marking)
- ⬜ Unanswered: **0**
- Maximum score: **400** (100 questions × 4 subjects)

---

## Build Roadmap

### Phase 1 — MVP (Current)
- [x] Complete frontend — all 12 views
- [x] Exam engine — CBT interface, timer, navigator, submit
- [x] AI Tutor — threaded conversations, credit system
- [x] Stores — user, exam, progress, questions, network
- [x] Design system — consistent tokens, animations, typography
- [ ] Backend API — Node.js / Express
- [ ] Database — PostgreSQL (questions, users, sessions)
- [ ] Question seed — full 1985–2024 JAMB archive

### Phase 2 — Growth
- [ ] Paystack payment integration
- [ ] Push notifications — daily streak reminders
- [ ] Capacitor Android build + Play Store listing
- [ ] Real leaderboard (server-ranked, not mocked)
- [ ] Community moderation tools
- [ ] Post-UTME past questions (subject-specific)

### Phase 3 — Scale
- [ ] iOS build + App Store listing
- [ ] School/class group accounts
- [ ] Teacher dashboard — track student progress
- [ ] Advanced analytics — cohort performance, topic difficulty ratings
- [ ] Offline question sync for premium users

---

## Contributing

This is a solo project in active development. If you spot a wrong answer in the question bank, use the **Flag Question** feature inside the app — that's exactly what it's for.

---

*Built with ❤️ for Nigerian students. Your 300+ is coming.*
