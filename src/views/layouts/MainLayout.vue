<template>
  <div class="main-layout">
    <!-- Offline banner (free users only) -->
    <Transition name="slide-up">
      <div v-if="!networkStore.isOnline && !userStore.isPremium" class="offline-banner">
        <PhWifiSlash :size="16" weight="fill" />
        <span>You're offline. <RouterLink to="/upgrade">Upgrade</RouterLink> for offline access.</span>
      </div>
    </Transition>

    <!-- Page content -->
    <main class="main-content">
      <RouterView v-slot="{ Component, route }">
        <Transition :name="route.meta.transition || 'fade'" mode="out-in">
          <component :is="Component" :key="route.path" />
        </Transition>
      </RouterView>
    </main>

    <!-- Bottom Navigation -->
    <nav class="bottom-nav safe-bottom">
      <RouterLink
        v-for="item in navItems"
        :key="item.name"
        :to="item.to"
        class="bnav-item"
        :class="{ active: route.meta.tab === item.tab }"
      >
        <!-- <component :is="route.meta.tab === item.tab ? item.iconFill : item.icon"
          :size="24" class="bnav-icon" /> -->
          <component
  :is="item.icon"
  :size="24"
  :weight="route.meta.tab === item.tab ? 'bold' : 'regular'"
  :class="['bnav-icon', { active: route.meta.tab === item.tab }]"
/>
        <span class="bnav-label">{{ item.label }}</span>
      </RouterLink>
    </nav>
  </div>
</template>

<script setup>
import { useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useNetworkStore } from '@/stores/network'
import {
  PhHouse,
  PhLightning,
  PhCalendarCheck,
  PhUsers,
  PhUser,
  PhWifiSlash
} from '@phosphor-icons/vue'

const route = useRoute()
const userStore = useUserStore()
const networkStore = useNetworkStore()

const navItems = [
  { tab: 'home',      to: '/home',      label: 'Home',      icon: PhHouse },
  { tab: 'practice',  to: '/practice',  label: 'Practice',  icon: PhLightning },
  { tab: 'plan',      to: '/plan',      label: 'Plan',      icon: PhCalendarCheck },
  { tab: 'community', to: '/community', label: 'Community', icon: PhUsers },
  { tab: 'profile',   to: '/profile',   label: 'Profile',   icon: PhUser },
]

</script>

<style scoped>
.main-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.offline-banner {
  background: var(--gold);
  color: var(--navy);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  font-size: 13px;
  font-weight: 500;
  position: sticky;
  top: 0;
  z-index: 80;
}
.offline-banner a { font-weight: 700; text-decoration: underline; }

.main-content {
  flex: 1;
  padding-bottom: calc(var(--bottom-nav-height) + 16px);
  max-width: 480px;
  margin: 0 auto;
  width: 100%;
}

.bottom-nav {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: white;
  border-top: 1px solid var(--border);
  display: flex;
  justify-content: space-around;
  align-items: center;
  height: var(--bottom-nav-height);
  z-index: 50;
  box-shadow: 0 -4px 20px rgba(0,0,0,0.06);
}

.bnav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 6px 14px;
  border-radius: 12px;
  color: var(--muted);
  transition: color 0.2s;
  text-decoration: none;
}

.bnav-item.active { color: var(--green); }

.bnav-label {
  font-size: 10px;
  font-weight: 500;
}
</style>
