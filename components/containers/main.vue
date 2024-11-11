<!-- components/ThemeContainer.vue -->
<template>
  <div
    :class="{
      [`bg-gray-700 text-white`]: useAuthStore().user.theme == 'basic',
    }"
    v-bind="attrs"
  >
    <slot />
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
import { useAttrs } from "vue";

const props = defineProps({
  level: Number,
});

const { theme } = toRefs(props);
const attrs = useAttrs();

// Compute a theme class based on the theme prop
const themeClass = computed(() => {
  return {
    "bg-light text-dark": theme.value === "light",
    "bg-dark text-light": theme.value === "dark",
    "bg-primary text-white": theme.value === "primary",
    // Add other themes as needed
  };
});
</script>

<style scoped>
/* Define the basic theme styles here */
.bg-light {
  background-color: #f8f9fa;
  color: #212529;
}

.bg-dark {
  background-color: #343a40;
  color: #ffffff;
}

.bg-primary {
  background-color: #007bff;
  color: #ffffff;
}

/* Add any other theme-specific styles here */
</style>
