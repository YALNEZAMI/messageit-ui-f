<!-- components/ThemeContainer.vue -->
<template>
  <div
    :class="{
      [getClasses()]: true,
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
const theme = props.theme as Theme;
const getClasses = () => {
  switch (theme._id) {
    case "basic":
      return "bg-blue-100 text-black";
    case "love":
      return "bg-pink-100 text-white";
    case "panda":
      return "bg-gray-600 text-white";
    case "spring":
      return "bg-green-100 text-white";

    default:
      return "bg-white text-black";
      break;
  }
};
</script>
