<template>
  <main class="bg-black text-white">{{ notification.sender.name }}</main>
</template>
<script setup>
const props = defineProps({
  notification: Object,
});
const notification = props.notification;
console.log("notifications", notification);
</script>
