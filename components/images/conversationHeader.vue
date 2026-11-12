<template>
  <main>
    <ImagesFallback
      class="w-16 h-16 rounded-md object-cover"
      :src="imageSrc"
      :fallback="fallback"
      alt=""
    />
  </main>
</template>

<script lang="ts" setup>
const conversation = computed(() => useConversationsStore().currentConversation);
const fallback = computed(() =>
  useConversationsStore().getDefaultImage(conversation.value.type)
);
const imageSrc = computed(() => {
  switch (conversation.value.type) {
    case "ai":
      return useConversationsStore().getDefaultImage("ai");
    case "group":
      return conversation.value.image;
    case "private":
      return useConversationsStore().getOtherUser(conversation.value).image;
    default:
      return fallback.value;
  }
});
</script>
