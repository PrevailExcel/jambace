import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/user'

const routes = [
  // ── Public
  {
    path: '/',
    name: 'splash',
    component: () => import('@/views/SplashView.vue'),
    meta: { public: true }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { public: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import('@/views/AuthView.vue'),
    meta: { public: true }
  },

  // ── Setup (post-auth, pre-dashboard)
  {
    path: '/setup',
    name: 'setup',
    component: () => import('@/views/SetupView.vue'),
    meta: { requiresAuth: true }
    // Collects: subjects, exam date, target score
  },

  // ── Main app — with bottom nav layout
  {
    path: '/home',
    component: () => import('@/views/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/views/DashboardView.vue'),
        meta: { tab: 'home' }
      },
      {
        path: '/practice',
        name: 'practice',
        component: () => import('@/views/PracticeView.vue'),
        meta: { tab: 'practice' }
      },
      {
        path: '/plan',
        name: 'plan',
        component: () => import('@/views/StudyPlanView.vue'),
        meta: { tab: 'plan' }
      },
      {
        path: '/community',
        name: 'community',
        component: () => import('@/views/CommunityView.vue'),
        meta: { tab: 'community' }
      },
      {
        path: '/profile',
        name: 'profile',
        component: () => import('@/views/ProfileView.vue'),
        meta: { tab: 'profile' }
      }
    ]
  },

  // ── Exam — fullscreen, no bottom nav
  {
    path: '/exam/:type',
    name: 'exam',
    component: () => import('@/views/ExamView.vue'),
    meta: { requiresAuth: true, fullscreen: true, transition: 'fade' }
    // :type = 'mock' | 'practice' | 'challenge' | 'weak-areas' | 'subject'
  },
  {
    path: '/exam/results/:sessionId',
    name: 'results',
    component: () => import('@/views/ResultsView.vue'),
    meta: { requiresAuth: true, fullscreen: true }
  },

  // ── Premium / Monetisation
  {
    path: '/upgrade',
    name: 'upgrade',
    component: () => import('@/views/UpgradeView.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/refer',
    name: 'refer',
    component: () => import('@/views/ReferView.vue'),
    meta: { requiresAuth: true }
  },

  // ── Catch-all
  { path: '/:pathMatch(.*)*', redirect: '/home' }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

// ── Navigation guard
router.beforeEach((to) => {
  const userStore = useUserStore()

  if (to.meta.requiresAuth && !userStore.isLoggedIn) {
    return { name: 'auth', query: { redirect: to.fullPath } }
  }

  // Redirect already-logged-in users away from splash
  if (to.meta.public && userStore.isLoggedIn && to.name === 'splash') {
    return { name: 'dashboard' }
  }
})

export default router
