<!-- components/ThemeContainer.vue -->
<template>
  <div
    :class="{
      'bg-blue-400 text-white': useAuthStore().user.theme._id == 'basic',
      'bg-pink-400 text-white': useAuthStore().user.theme._id == 'love',
      'bg-black text-white': useAuthStore().user.theme._id == 'panda',
      'bg-green-400 text-white': useAuthStore().user.theme._id == 'spring',
    }"
    v-bind="attrs"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const attrs = useAttrs();
</script>
