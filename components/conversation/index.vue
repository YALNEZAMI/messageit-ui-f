<template>
  <main>{{ props.conversation.type }}</main>
</template>
<script setup>
const props = defineProps({
  conversation: "Object",
});
</script>
