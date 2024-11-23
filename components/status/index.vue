<template>
  <main class="w-3 h-3 rounded-full">
    <span
      v-if="user.onLine"
      class="animate-ping absolute top-0 left-0 inline-flex h-full w-full rounded-full bg-sky-400 opacity-100"
    ></span>
    <span
      class="relative inline-flex rounded-full h-2 w-2 border-2 border-solid border-white"
      :class="{
        'bg-gray-500': !user.onLine,
        'bg-green-400': user.onLine,
      }"
    ></span>
  </main>
</template>
<script setup>
const props = defineProps({
  user: "Object",
});
import { eventBus } from "@/utils/eventBus";

eventBus.on("userPatched", (user) => {
  if (user._id == props.user._id) {
    props.user.onLine = user.onLine;
  }
});
</script>
