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
      <div class="px-3">
        <div class="w-3/4 text-2xl md:text-3xl font-bold">
          {{ getType() != "ai" ? getName() : "Boby 🤖" }}
        </div>
        <span class="text-xs font-serif">{{ getSecondaryText() }}</span>
      </div>
    </div>
    <ContainersMain
      class="font-bold hover:bg-opacity-70 transition-all duration-300 rounded-full flex justify-center items-center p-1 w-max hover:px-2"
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
import { connected } from "process";

const getConnectedFriend = () => {
  const connectedUser = useConversationsStore().getConnectedFriend(
    useConversationsStore().currentConversation
  );
  return connectedUser;
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

const goToConversations = () => {
  useRouter().push("/conversations");
};
const getSecondaryText = () => {
  const currentConversation = useConversationsStore().currentConversation;
  switch (currentConversation.type) {
    case "ai":
      return "Tu peux demander ce que tu veux !";
    case "group":
      return "Groupe";
    case "private":
      if (currentConversation.members.length == 1) {
        return "Je suis tout seul ici !";
      } else {
        const otherUser =
          useConversationsStore().getOtherUser(currentConversation);
        if (otherUser.onLine) {
          return "En ligne";
        } else {
          return (
            "Hors ligne depuis " +
            getDurationSince(new Date(otherUser.lastConnection))
          );
        }
      }

    default:
      break;
  }
};
const getDurationSince = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  if (days > 0) {
    return days + " jours";
  } else if (hours > 0) {
    return hours + " heures";
  } else if (minutes > 0) {
    return minutes + " minutes";
  } else {
    return seconds + " secondes";
  }
};
</script>
