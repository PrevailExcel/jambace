<template>
  <div id="jambace-app" :class="{ 'is-premium': userStore.isPremium }">

    <!-- ── Offline banner (slides from top) ── -->
    <Transition name="slide-down">
      <div v-if="showOfflineBanner" class="status-bar offline-bar">
        <PhWifiSlash :size="13" weight="fill" />
        <span>Offline — studying from your downloaded library</span>
      </div>
    </Transition>

    <!-- ── Outbox sync indicator ── -->
    <Transition name="slide-down">
      <div v-if="showSyncBanner" class="status-bar sync-bar">
        <span class="sync-spinner"></span>
        <span v-if="syncStore.isSyncing">
          Syncing {{ syncStore.pendingCount }} session{{ syncStore.pendingCount !== 1 ? 's' : '' }}…
        </span>
        <span v-else-if="syncStore.failedCount > 0">
          {{ syncStore.failedCount }} item{{ syncStore.failedCount !== 1 ? 's' : '' }} couldn't sync
          <button class="bar-retry" @click="retry">Retry</button>
        </span>
      </div>
    </Transition>

    <!-- ── Router view ── -->
    <RouterView v-slot="{ Component, route }">
      <Transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>

    <!-- ── PWA: install prompt + update toast ── -->
    <InstallBanner />

  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { PhWifiSlash } from '@phosphor-icons/vue'
import { useUserStore }    from '@/stores/user'
import { useNetworkStore } from '@/stores/network'
import { useSyncStore }    from '@/stores/sync'
import InstallBanner from '@/components/InstallBanner.vue'

const userStore    = useUserStore()
const networkStore = useNetworkStore()
const syncStore    = useSyncStore()

const showOfflineBanner = computed(
  () => !networkStore.isOnline && networkStore.wasOffline
)

const showSyncBanner = computed(
  () => networkStore.isOnline &&
        (syncStore.isSyncing || syncStore.hasPending || syncStore.failedCount > 0)
)

function retry() {
  syncStore.removeFailedItems()
  syncStore.drainOutbox()
}

onMounted(() => {
  networkStore.init()
  userStore.checkSession()

  // Refresh server state on first online load
  if (networkStore.isOnline && userStore.isLoggedIn) {
    syncStore.bootstrapFromServer()
  }
})
</script>

<style>
/* ── Safe area insets — critical for iPhone notch / Dynamic Island ── */
:root {
  --safe-top:    env(safe-area-inset-top,    0px);
  --safe-bottom: env(safe-area-inset-bottom, 0px);
  --safe-left:   env(safe-area-inset-left,   0px);
  --safe-right:  env(safe-area-inset-right,  0px);
}

#jambace-app {
  /* Prevent content from going under the status bar on iOS standalone */
  padding-top: var(--safe-top);
}

/* ── Status bars (offline / sync) ── */
.status-bar {
  position: fixed;
  top: var(--safe-top);
  left: 0;
  right: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 9px 16px;
  font-family: var(--font-body, sans-serif);
  font-size: 12.5px;
  font-weight: 500;
}

.offline-bar { background: var(--navy, #0A0F2C); color: rgba(255,255,255,0.82); }
.sync-bar    { background: var(--green, #00C853); color: white; }

.sync-spinner {
  width: 11px; height: 11px;
  border: 2px solid rgba(255,255,255,0.35);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

.bar-retry {
  background: rgba(255,255,255,0.25);
  border: none;
  color: white;
  font-weight: 700;
  font-size: 11px;
  padding: 2px 9px;
  border-radius: 20px;
  cursor: pointer;
  margin-left: 4px;
}

/* ── Transitions ── */
@keyframes spin { to { transform: rotate(360deg); } }

.slide-down-enter-active,
.slide-down-leave-active { transition: transform 0.22s ease, opacity 0.22s ease; }
.slide-down-enter-from,
.slide-down-leave-to     { transform: translateY(-100%); opacity: 0; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.18s ease; }
.fade-enter-from,   .fade-leave-to     { opacity: 0; }
</style>