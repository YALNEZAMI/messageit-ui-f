<template>
  <ContainersConversationTheme class="flex items-center space-x-2 rounded p-2">
    <div class="relative">
      <ImagesUserImage
        class="w-20 md:w-20 h-16"
        :src="getImgSrc()"
      ></ImagesUserImage>
      <Status
        class="absolute top-0 right-0"
        :user="getConnectedFriend()"
      ></Status>
    </div>
    <div class="w-3/4 text-2xl md:text-3xl px-3 font-bold">
      {{ getName() }}
    </div>
    <div class="flex justify-center">
      <button
        @click="$router.push('/conversations')"
        class="bg-red-400 cursor-pointer text-white py-1 px-2 rounded"
      >
        X
      </button>
    </div>
  </ContainersConversationTheme>
</template>
<script lang="ts" setup>
const getConnectedFriend = () => {
  return useConversationsStore().getConnectedFriend(
    useConversationsStore().currentConversation
  );
};
const getName = () => {
  return useConversationsStore().getNamePrivateConversation(
    useConversationsStore().currentConversation
  );
};
const getImgSrc = () => {
  return useConversationsStore().currentConversation.image;
};
</script>
