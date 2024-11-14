<template>
  <main>
    <div>
      <ConversationHeader></ConversationHeader>
      <ConversationNavBar></ConversationNavBar>
    </div>

    <div><slot /></div>
  </main>
</template>
<script lang="ts" setup>
definePageMeta({
  middleware: "conversations",
});
</script>
