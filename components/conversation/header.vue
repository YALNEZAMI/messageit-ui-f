<template>
  <ContainersConversationTheme class="flex items-center space-x-2 rounded p-2">
    <div class="relative">
      <ImagesConversationHeader
        class="w-20 md:w-20 h-16"
        :src="getType() != 'ai' ? getImgSrc() : getRobotImage()"
      ></ImagesConversationHeader>

      <Status
        v-if="getType() != 'ai'"
        class="absolute top-0 right-0"
        :user="getConnectedFriend()"
      ></Status>
    </div>
    <div class="w-3/4 text-2xl md:text-3xl px-3 font-bold">
      {{ getType() != "ai" ? getName() : "Boby 🤖" }}
    </div>
    <ContainersMain class="flex justify-center font-bold">
      <button
        @click="goToConversations"
        class="bg-transparent cursor-pointer text-white py-1 px-2 rounded"
      >
        X
      </button>
    </ContainersMain>
  </ContainersConversationTheme>
</template>
<script lang="ts" setup>
const getConnectedFriend = () => {
  return useConversationsStore().getConnectedFriend(
    useConversationsStore().currentConversation
  );
};
const getName = () => {
  const currentConversation = useConversationsStore().currentConversation;
  if (currentConversation.type == "group") {
    return currentConversation.name;
  }
  return useConversationsStore().getNamePrivateConversation(
    currentConversation
  );
};
const getType = () => {
  return useConversationsStore().currentConversation.type;
};
const getRobotImage = () => {
  return useConversationsStore().robotImage;
};
const getImgSrc = () => {
  return useConversationsStore().currentConversation.image;
};

const goToConversations = () => {
  useRouter().push("/conversations");
};
</script>
