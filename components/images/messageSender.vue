<template>
  <main>
    <ImagesFallback
      class="message-avatar"
      :src="src"
      :fallback="useConversationsStore().getDefaultImage('private')"
      alt=""
    />
  </main>
</template>

<script setup>
defineProps({
  src: String,
});
</script>
