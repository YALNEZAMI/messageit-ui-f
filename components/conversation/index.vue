<template>
  <ContainersConversationTheme
    class="flex items-center space-x-2 cursor-pointer p-2 rounded"
    @click="setConversation()"
  >
    <div class="relative">
      <NuxtImg class="w-14" :src="useAuthStore().defaultUserImg" />

      <Status
        class="absolute top-0 right-0"
        :user="useConversationsStore().getOtherUser(conversation)"
      ></Status>
    </div>
    <div class="w-1/2 truncate">
      {{ getName() }}
    </div>
  </ContainersConversationTheme>
</template>
<script setup>
const props = defineProps({
  conversation: "Object",
});
const conversation = props.conversation;

const setConversation = async () => {
  useRouter().push("/conversations/" + conversation._id);
};
const getName = () => {
  return useConversationsStore().getNamePrivateConversation(conversation);
};
</script>
