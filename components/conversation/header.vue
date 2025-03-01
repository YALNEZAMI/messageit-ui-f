<template>
  <ContainersConversationTheme
    class="flex items-center justify-between space-x-2 rounded p-2"
  >
    <div class="flex items-center w-11/12">
      <div class="relative">
        <ImagesConversationHeader
          class="w-20 md:w-20 h-16"
        ></ImagesConversationHeader>

        <Status
          v-if="getType() != 'ai'"
          class="absolute -top-1 right-3"
          :user="getConnectedFriend()"
        ></Status>
      </div>
      <div class="w-3/4 text-2xl md:text-3xl px-3 font-bold">
        {{ getType() != "ai" ? getName() : "Boby 🤖" }}
      </div>
    </div>
    <ContainersMain
      class="font-bold hover:bg-opacity-70 transition-all duration-300 rounded-full flex justify-center items-center p-1 w-max"
    >
      <svg
        @click="goToConversations"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6 cursor-pointer"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="m12.75 15 3-3m0 0-3-3m3 3h-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
        />
      </svg>
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
