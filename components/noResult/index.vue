<template>
  <main
    class="bg-red-400 p-1 text-white h-max w-11/12 mx-auto text-center font-serif"
  >
    {{ props.message }}
  </main>
</template>
<script setup>
const props = defineProps({
  message: String,
});
</script>
