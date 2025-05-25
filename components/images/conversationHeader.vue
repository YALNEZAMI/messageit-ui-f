<template>
  <main>
    <NuxtImg
      class="w-16 h-16 rounded-md"
      :src="imgSrc"
      @error="handleError"
    ></NuxtImg>
  </main>
</template>

<script lang="ts" setup>
const conversation = useConversationsStore().currentConversation;

const getConversationImage = (): string => {
  switch (conversation.type) {
    case "ai":
      return useConversationsStore().getDefaultImage("ai");
    case "group":
      return conversation.image!;
    case "private":
      return useConversationsStore().getOtherUser(conversation).image;
    default:
      return useConversationsStore().getOtherUser(conversation).image;
  }
};

const imgSrc = ref(""); // Local reactive variable for the image source

const handleError = () => {
  return useConversationsStore().getDefaultImage(conversation.type);
};
onMounted(async () => {
  imgSrc.value = getConversationImage();
  eventBus.on("conversationChanged", (conv: any) => {
    imgSrc.value = getConversationImage();
  });
});
</script>
