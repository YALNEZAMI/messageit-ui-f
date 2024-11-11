<!-- components/ThemeContainer.vue -->
<template>
  <div
    :class="{
      'bg-blue-300': useAuthStore().user.theme == 'basic',
    }"
    v-bind="attrs"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
const attrs = useAttrs();
</script>
