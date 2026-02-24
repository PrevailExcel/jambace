<template>
  <!-- ── Android / Chrome: native install prompt ──────────────────────── -->
  <Transition name="slide-up">
    <div v-if="showBanner && canInstall && !isIos" class="install-banner">
      <div class="install-banner-icon">
        <img src="/icons/icon-96.png" alt="2Wise icon" width="44" height="44" />
      </div>
      <div class="install-banner-body">
        <strong>Add 2Wise to Home Screen</strong>
        <span>Study offline, no browser needed</span>
      </div>
      <div class="install-banner-actions">
        <button class="install-dismiss" @click="dismiss" aria-label="Dismiss">✕</button>
        <button class="install-btn" :disabled="installing" @click="install">
          {{ installing ? 'Installing…' : 'Install' }}
        </button>
      </div>
    </div>
  </Transition>

  <!-- ── iOS Safari: manual instructions ─────────────────────────────── -->
  <Transition name="slide-up">
    <div v-if="showBanner && isIos" class="install-banner ios">
      <div class="install-banner-icon">
        <img src="/icons/icon-96.png" alt="2Wise icon" width="44" height="44" />
      </div>
      <div class="install-banner-body">
        <strong>Install 2Wise</strong>
        <span>
          Tap
          <span class="share-icon">⎙</span>
          then <em>Add to Home Screen</em>
        </span>
      </div>
      <button class="install-dismiss" @click="dismiss" aria-label="Dismiss">✕</button>
    </div>
  </Transition>

  <!-- ── PWA update available ─────────────────────────────────────────── -->
  <Transition name="slide-up">
    <div v-if="needRefresh" class="update-toast">
      <span>✦ New version available</span>
      <button class="update-btn" @click="applyUpdate">Update now</button>
    </div>
  </Transition>

  <!-- ── First install: offline ready confirmation ─────────────────────── -->
  <Transition name="slide-up">
    <div v-if="offlineReady && !offlineReadyDismissed" class="offline-ready-toast">
      <span>✓ App ready to use offline</span>
      <button class="offline-dismiss" @click="offlineReadyDismissed = true">OK</button>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { useInstallPrompt } from '@/composables/useInstallPrompt'
import { usePwaUpdate }     from '@/composables/usePwaUpdate'

const { showBanner, canInstall, isIos, installing, install, dismiss } = useInstallPrompt()
const { needRefresh, offlineReady, applyUpdate } = usePwaUpdate()

const offlineReadyDismissed = ref(false)
</script>

<style scoped>
/* ── Shared banner base ─────────────────────────────────────────── */
.install-banner,
.update-toast,
.offline-ready-toast {
  position: fixed;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 72px); /* above bottom nav */
  left: 12px;
  right: 12px;
  z-index: 8000;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.22);
  display: flex;
  align-items: center;
  padding: 14px 14px;
  gap: 12px;
  max-width: 480px;
  margin: 0 auto;
  /* Prevent overflow beyond viewport on wide screens */
  width: calc(100% - 24px);
}

/* ── Install banner ─────────────────────────────────────────────── */
.install-banner {
  background: white;
  border: 1.5px solid rgba(0,200,83,0.25);
}

.install-banner.ios {
  border-color: rgba(0,150,255,0.25);
}

.install-banner-icon img {
  border-radius: 12px;
  flex-shrink: 0;
}

.install-banner-body {
  flex: 1;
  min-width: 0;
}

.install-banner-body strong {
  display: block;
  font-size: 13.5px;
  font-weight: 700;
  color: #0A0F2C;
  margin-bottom: 2px;
}

.install-banner-body span {
  font-size: 12px;
  color: #6B7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
}

.install-banner-body .share-icon {
  font-size: 14px;
  color: #007AFF; /* iOS blue */
}

.install-banner-body em { font-style: normal; font-weight: 600; color: #0A0F2C; }

.install-banner-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.install-btn {
  background: #00C853;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 9px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s;
}

.install-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.install-btn:not(:disabled):hover { opacity: 0.88; }

.install-dismiss {
  background: none;
  border: none;
  color: #9CA3AF;
  font-size: 16px;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
  line-height: 1;
  flex-shrink: 0;
}

.install-dismiss:hover { color: #374151; }

/* ── Update toast ───────────────────────────────────────────────── */
.update-toast {
  background: #0A0F2C;
  color: white;
  font-size: 13.5px;
  font-weight: 500;
  padding: 13px 16px;
}

.update-btn {
  margin-left: auto;
  background: #00C853;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 12.5px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  flex-shrink: 0;
}

.update-btn:hover { opacity: 0.88; }

/* ── Offline ready toast ────────────────────────────────────────── */
.offline-ready-toast {
  background: #0A0F2C;
  color: rgba(255,255,255,0.85);
  font-size: 13px;
  padding: 12px 16px;
}

.offline-dismiss {
  margin-left: auto;
  background: rgba(255,255,255,0.15);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 5px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  flex-shrink: 0;
}

/* ── Transition ─────────────────────────────────────────────────── */
.slide-up-enter-active { transition: transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease; }
.slide-up-leave-active { transition: transform 0.2s ease, opacity 0.2s ease; }
.slide-up-enter-from   { transform: translateY(20px); opacity: 0; }
.slide-up-leave-to     { transform: translateY(10px); opacity: 0; }
</style>