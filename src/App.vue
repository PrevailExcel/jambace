<template>
  <div id="jambace-app" :class="{ 'is-premium': userStore.isPremium }">
    <RouterView v-slot="{ Component, route }">
      <Transition :name="route.meta.transition || 'fade'" mode="out-in">
        <component :is="Component" :key="route.path" />
      </Transition>
    </RouterView>
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useUserStore } from '@/stores/user'
import { useNetworkStore } from '@/stores/network'

const userStore = useUserStore()
const networkStore = useNetworkStore()

onMounted(() => {
  networkStore.init()
  userStore.checkSession()
})
</script>
