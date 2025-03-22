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
const getConversationImage = (): string => {
  const conversation = useConversationsStore().currentConversation;
  switch (conversation.type) {
    case "ai":
      return useConversationsStore().robotImage;
    case "group":
      return conversation.image!;
    case "private":
      return useConversationsStore().getOtherUser(conversation).image;
    default:
      return useConversationsStore().getOtherUser(conversation).image;
      break;
  }
};

const authStore = useAuthStore();

const imgSrc = ref(""); // Local reactive variable for the image source

const handleError = () => {
  imgSrc.value =
    "https://cdn.pixabay.com/photo/2023/02/18/11/00/icon-7797704_1280.png"; // Set to default image on error
};
onMounted(async () => {
  imgSrc.value = getConversationImage();
  eventBus.on("conversationChanged", (conv: any) => {
    imgSrc.value = getConversationImage();
  });
});
</script>
