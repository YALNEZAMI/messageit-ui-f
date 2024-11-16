<template>
  <main
    class="w-2 h-2 rounded-full"
    :class="{
      'bg-gray-500': !user.onLine,
      'bg-green-400': user.onLine,
    }"
  ></main>
</template>
<script setup>
const props = defineProps({
  user: "Object",
});
</script>
