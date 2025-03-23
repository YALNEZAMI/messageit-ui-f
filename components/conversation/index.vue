<template>
  <ContainersTheme
    :class="getContainerClasses()"
    class="relative flex h-20 items-center shadow-md hover:bg-opacity-70 transition-all duration-500 cursor-pointer p-1 rounded m-1"
  >
    <div
      class="flex w-full items-center"
      :class="{
        'justify-center md:justify-normal ': isSideBar,
      }"
      @click="setConversation()"
    >
      <!--image and user status-->
      <div
        :class="{
          'relative z-0 w-16': true,
          'flex justify-center': props.isSideBar,
        }"
      >
        <ImagesConversation :src="getConversationImage()" />
        <!--user status-->
        <Status
          class="absolute top-0 right-0"
          :user="getConnectedFriend()"
        ></Status>
      </div>
      <!--name + second text+ lastMessage status-->
      <div
        class="md:w-3/4 w-2/3 flex h-full items-center justify-between"
        :class="{
          ' hidden md:block': props.isSideBar,
        }"
      >
        <div class="sm:w-3/4 w-2/3 truncate px-3">
          <div class="font-bold text-2xl mb-1">
            {{ getName() }}
          </div>
          <div
            class="truncate"
            :class="{
              'font-bold text-base ': !isSeen,
              'text-xs font-serif ': isSeen,
            }"
          >
            {{ getSecondaryText() }}
          </div>
        </div>
        <!--lastMessage status-->
        <MessageStatus
          v-if="conversation.lastMessage != undefined && !isSideBar"
          class="flex h-full items-end mt-5 max-w-10 overflow-hidden"
          :onConversation="true"
          :message="conversation.lastMessage"
        ></MessageStatus>
      </div>
    </div>

    <!--settings-->
    <div class="absolute top-1/3 right-4 z-20" v-if="!isSideBar && !noSettings">
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
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { Typing } from "~/interfaces/typing";
import type { User } from "~/interfaces/user";
const props = defineProps({
  conversation: Object,
  isSideBar: Boolean,
  noSettings: Boolean,
});
const conversation = props.conversation as Conversation;
const isSideBar = props.isSideBar;
const setConversation = async () => {
  useRouter().push("/conversations/" + conversation._id + "/messages");
};

const getName = () => {
  switch (conversation.type) {
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
const typing: Ref<Typing> = ref({} as Typing);
const getSecondaryText = () => {
  if (typing.value._id != undefined) {
    const typer = typing.value.typer as User;
    return typer!.name + " est en train d'écrire...";
  }
  const lastMessage = useConversationsStore().getLastMessage(
    conversation._id!
  ) as Message;

  if (lastMessage == undefined) {
    //si pas de message encore
    if (conversation.members.length == 1) {
      return "Auto conversation";
    }
    switch (conversation.type) {
      case "private":
        return (
          "Dites bonjour à " +
          useConversationsStore().getOtherUser(conversation).name +
          " !"
        );
      case "group":
        return "Nouveau Groupe.";
      case "ai":
        return "Posez une question à l'assistant Boby";
    }
  } else {
    //si présence de message
    if (lastMessage.type == "notification") {
      return lastMessage.text;
    }
    const sender = lastMessage.sender as User;
    switch (conversation.type) {
      case "private":
      case "group":
        if (lastMessage.text == "") {
          return "Files";
        }
        return sender._id == useUsersStore().user._id
          ? "Moi: " + lastMessage.text
          : sender.name + ": " + lastMessage.text;

      case "ai":
        if (sender._id == useUsersStore().user._id) {
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

const isCurrentConversation = () => {
  return conversation._id == useConversationsStore().currentConversation._id;
};
const isSeen = ref(true);

onMounted(async () => {
  if (
    conversation.lastMessage &&
    conversation.lastMessage.sender._id != useUsersStore().user._id
  ) {
    isSeen.value = await useMessageStatusStore().isSeenBy(
      conversation.lastMessage._id,
      useUsersStore().user._id!
    );
  } else {
    isSeen.value = true;
  }
  eventBus.on("messageReceived", (message: Message) => {
    const sender = message.sender as User;
    const msgConversation = message.conversation as Conversation;
    if (
      sender._id != useUsersStore().user._id &&
      msgConversation._id == conversation._id &&
      msgConversation._id != useRoute().params.id
    ) {
      isSeen.value = false;
    }
  });
  eventBus.on("typing", (t: Typing) => {
    if (t.conversation != conversation._id) {
      return;
    }
    typing.value = t;
    setTimeout(() => {
      typing.value = {} as Typing;
    }, 2000);
  });
});
const getConversationImage = () => {
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
const getContainerClasses = () => {
  return {
    "md:w-96": !isSideBar,
    "md:w-72 ": isSideBar,
    "opacity-70": isSideBar && !isCurrentConversation(),
    "w-11/12": !props.noSettings,
    "w-3/4": props.noSettings,
  };
};
</script>
