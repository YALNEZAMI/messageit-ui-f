<template>
  <ContainersConversationTheme
    class="flex items-center justify-between space-x-2 rounded p-2"
  >
    <div class="flex items-center w-11/12">
      <div class="relative">
        <ImagesConversationHeader
          class="w-20 md:w-20 h-16"
          :src="getConversationImage()"
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
    </div>
    <ContainersMain
      class="flex justify-center items-center font-bold hover:bg-opacity-70 transition-all duration-300 border-2 border-solid border-white rounded"
    >
      <button
        @click="goToConversations"
        class="bg-transparent cursor-pointer text-white p-1 pl-2 rounded"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-box-arrow-right"
          viewBox="0 0 16 16"
        >
          <path
            fill-rule="evenodd"
            d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0z"
          />
          <path
            fill-rule="evenodd"
            d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708z"
          />
        </svg>
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
</script>
