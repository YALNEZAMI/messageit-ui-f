<template>
  <main class="bg-red-400 p-1 text-white h-max w-full text-center font-serif">
    {{ props.message }}
  </main>
</template>
<script setup>
const props = defineProps({
  message: String,
});
</script>
