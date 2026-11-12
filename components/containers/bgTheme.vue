<!-- components/ThemeContainer.vue -->
<template>
  <div
    :class="{
      [getClasses()]: true,
      'theme-panda': props.theme?._id === 'panda',
    }"
    v-bind="attrs"
  >
    <slot />
  </div>
</template>

<script lang="ts" setup>
import type { Theme } from "~/interfaces/theme";

const attrs = useAttrs();
const props = defineProps({
  theme: Object,
});
const getClasses = () => {
  switch ((props.theme as Theme | undefined)?._id) {
    case "basic":
      return "bg-blue-100 text-black";
    case "love":
      return "bg-pink-100 text-black";
    case "panda":
      return "bg-gray-600 text-white";
    case "spring":
      return "bg-green-100 text-black";

    default:
      return "bg-white text-black";
      break;
  }
};
</script>
