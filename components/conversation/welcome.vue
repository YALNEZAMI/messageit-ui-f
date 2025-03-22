<template>
  <main class="flex justify-center">
    <div
      class="rounded-md p-3"
      style="background: linear-gradient(0deg, cyan, pink, white)"
    >
      <div class="flex justify-center">
        <ImagesConversationHeader></ImagesConversationHeader>
      </div>
      <div class="font-bold my-2">{{ getSecondaryText() }}</div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";

const conversation = useConversationsStore()
  .currentConversation as Conversation;
const getSecondaryText = () => {
  switch (conversation.type) {
    case "ai":
      return "Chatter avec votre assistant de vie maintenant !";
    case "group":
      return (
        "Vous faites partie du groupe " +
        conversation.name +
        ", lancez la conversation !"
      );
    case "private":
      return (
        "Vous êtes ami avec " +
        useConversationsStore().getOtherUser(conversation).name +
        ", envoyez-lui quelque chose !"
      );
    default:
      break;
  }
};
</script>
