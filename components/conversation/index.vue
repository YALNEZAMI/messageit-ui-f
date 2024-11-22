<template>
  <ContainersTheme
    class="flex items-center shadow-md cursor-pointer p-2 py-1 rounded m-1"
  >
    <div
      class="flex w-11/12 items-center"
      :class="{
        'justify-center md:justify-normal ': isSideBar,
      }"
      @click="setConversation()"
    >
      <div
        :class="{
          'relative z-0 w-16': true,
          'flex justify-center': props.isSideBar,
        }"
      >
        <ImagesConversation
          :src="
            conversation.type != 'ai' ? conversation.image : getRobotImage()
          "
        />

        <Status
          class="absolute top-0 right-0"
          :user="getConnectedFriend()"
        ></Status>
      </div>
      <div
        class="w-3/4 flex h-full items-center"
        :class="{
          ' hidden md:block': props.isSideBar,
        }"
      >
        <div class="w-3/4 truncate px-3">
          <div class="font-bold text-lg">
            {{ getName() }}
          </div>
          <div class="text-sm truncate 1/2">{{ getSecondaryText() }}</div>
        </div>
      </div>
    </div>
    <!--settings-->
    <div v-if="!isSideBar">
      <svg
        @click="
          $router.push('/conversations/' + conversation._id + '/settings')
        "
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke-width="1.5"
        stroke="currentColor"
        class="size-6 z-10"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 0 1 1.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.559.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.894.149c-.424.07-.764.383-.929.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 0 1-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.398.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 0 1-.12-1.45l.527-.737c.25-.35.272-.806.108-1.204-.165-.397-.506-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.108-1.204l-.526-.738a1.125 1.125 0 0 1 .12-1.45l.773-.773a1.125 1.125 0 0 1 1.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894Z"
        />
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
        />
      </svg>
    </div>
  </ContainersTheme>
</template>
<script setup>
const props = defineProps({
  conversation: "Object",
  isSideBar: "Boolean",
});
const conversation = props.conversation;
const isSideBar = props.isSideBar;
const setConversation = async () => {
  useRouter().push("/conversations/" + conversation._id);
};
const getRobotImage = () => {
  return useConversationsStore().robotImage;
};
const getName = () => {
  switch (useConversationsStore().currentConversation.type) {
    case "private":
      return useConversationsStore().getNamePrivateConversation(conversation);
    case "group":
      return conversation.name;
    case "ai":
      return "Assistant Boby 🤖";
    default:
      return "conversation";
  }
};
const getSecondaryText = () => {
  const lastMessage = useConversationsStore().getLastMessage(conversation._id);

  if (lastMessage == undefined) {
    switch (conversation.type) {
      case "private":
        return (
          "Dites bonjour à " +
          useConversationsStore().getOtherUser(conversation).name
        );
      case "group":
        return "Nouveau Groupe.";
      case "ai":
        return "Posez une question à l'assistant Boby";
    }
  } else {
    switch (conversation.type) {
      case "private":
        return "Moi: " + lastMessage.text;
      case "group":
        useConversationsStore().getOtherUser(conversation).name +
          ": " +
          lastMessage.text;
      case "ai":
        if (lastMessage.sender._id == useUsersStore().user._id) {
          return "Moi: " + lastMessage.text;
        } else {
          return "Boby: " + lastMessage.text;
        }
    }
  }
};
const getConnectedFriend = () => {
  return useConversationsStore().getConnectedFriend(conversation);
};
const getPhoto = () => {
  return useAuthStore().defaultUserImg;
};
</script>
