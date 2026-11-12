<template>
  <main class="empty-state">
    <div class="empty-state-icon" aria-hidden="true">✦</div>
    {{ props.message }}
  </main>
</template>
<script setup>
const props = defineProps({
  message: String,
});
</script>
