<template>
  <main class="bg-black text-white">{{ notification.name }}</main>
</template>
<script setup>
const props = defineProps({
  notification: Object,
});
const notification = props.notification;
</script>
