<template>
  <main class="auth-screen">
    <NuxtImg
      class="auth-background"
      :src="authBackgroud"
      alt=""
    />
    <slot />
  </main>
</template>
<script lang="ts" setup>
const authBackgroud = useAuthStore().authBackgroud;
</script>
