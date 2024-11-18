<template>
  <ContainersTheme
    @click="setConversation()"
    :class="{
      'flex items-center shadow-md space-x-2 cursor-pointer p-2 rounded ': true,
      'justify-center md:justify-normal': props.isSideBar,
      'w-full md:w-1/3': !props.isSideBar,
    }"
  >
    <div
      :class="{
        'relative z-0 w-16': true,
        'flex justify-center': props.isSideBar,
      }"
    >
      <ImagesUserImage :src="conversation.image" />

      <Status class="absolute top-0 right-0" :user="getUser()"></Status>
    </div>
    <div
      :class="{
        ' hidden md:block': props.isSideBar,
      }"
      class="w-1/2 truncate font-bold text-lg px-3"
    >
      {{ getName() }}
    </div>
  </ContainersTheme>
</template>
<script setup>
const props = defineProps({
  conversation: "Object",
  isSideBar: "Boolean",
});
const conversation = props.conversation;

const setConversation = async () => {
  useRouter().push("/conversations/" + conversation._id);
};
const getName = () => {
  return useConversationsStore().getNamePrivateConversation(conversation);
};
const getUser = () => {
  return useConversationsStore().getOtherUser(conversation);
};
const getPhoto = () => {
  return useAuthStore().defaultUserImg;
};
</script>
