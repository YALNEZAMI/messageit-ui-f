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
const getConversationImage = () => {
  const conversation = useConversationsStore().currentConversation;
  switch (conversation.type) {
    case "ai":
      return useConversationsStore().robotImage;
    case "group":
      return conversation.image;
    case "private":
      return useConversationsStore().getOtherUser(conversation).image;
    default:
      break;
  }
};

const authStore = useAuthStore();
const defaultUserImg = authStore.defaultUserImg;

const imgSrc = ref(""); // Local reactive variable for the image source

const handleError = () => {
  imgSrc.value = defaultUserImg; // Set to default image on error
};
onMounted(async () => {
  imgSrc.value = getConversationImage();
  eventBus.on("conversationChanged", (conv: any) => {
    imgSrc.value = getConversationImage();
  });
});
</script>
