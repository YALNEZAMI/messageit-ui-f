<template>
  <main>
    <ImagesFallback
      class="w-16 h-16 rounded-md object-cover"
      :src="src"
      :fallback="useConversationsStore().getDefaultImage(convType || '')"
      alt=""
    />
  </main>
</template>

<script setup>
defineProps({
  src: String,
  convType: String,
});
</script>
