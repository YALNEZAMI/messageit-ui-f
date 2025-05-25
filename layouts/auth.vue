<template>
  <main>
    <!--background img-->
    <NuxtImg
      class="fixed top-0 left-0 w-screen h-screen z-0"
      :src="authBackgroud"
      alt=""
    />
    <div
      class="flex z-20 justify-center items-center relative w-screen h-screen"
    >
      <slot />
    </div>
  </main>
</template>
<script lang="ts" setup>
const authBackgroud = useAuthStore().authBackgroud;
</script>
