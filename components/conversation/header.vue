<template>
  <ContainersConversationTheme class="flex items-center space-x-2 rounded p-2">
    <div class="relative">
      <NuxtImg
        class="w-14 md:w-20 h-16"
        :src="useAuthStore().defaultUserImg"
      ></NuxtImg>
      <Status
        class="absolute top-0 right-0"
        :user="
          useConversationsStore().getOtherUser(
            useConversationsStore().currentConversation
          )
        "
      ></Status>
    </div>
    <div class="w-2/3">
      {{ getName() }}
    </div>
    <button
      @click="$router.push('/conversations')"
      class="bg-red-400 cursor-pointer text-white py-1 px-2 rounded"
    >
      X
    </button>
  </ContainersConversationTheme>
</template>
<script lang="ts" setup>
const getName = () => {
  return useConversationsStore().getNamePrivateConversation(
    useConversationsStore().currentConversation
  );
};
</script>
