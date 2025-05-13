<template>
  <main class="flex justify-center">
    <div
      class="rounded-md p-3"
      style="background: linear-gradient(0deg, cyan, pink, white)"
    >
      <div class="flex justify-center">
        <ImagesConversationHeader></ImagesConversationHeader>
      </div>
      <div class="font-bold my-2 text-center">
        <div v-if="conversation.type == 'ai'">
          Chatter avec votre assistant de vie maintenant !
        </div>
        <div v-else-if="conversation.type == 'group'">
          "Vous faites partie du groupe {{ conversation.name }}, lancez la
          conversation !
        </div>
        <div v-else>
          <div>
            <!--register date-->
            <div class="font-serif flex items-center justify-center text-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4 mx-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>

              A rejoint le
              {{ new Date(otherUser.createdAt + "").toLocaleDateString() }}
            </div>
            <!--friendship date-->
            <div
              class="font-serif text-sm flex items-center justify-center space-x-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-4 mx-2"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z"
                />
              </svg>

              Ami depuis
              {{ friendshipDate }}
            </div>
            <div class="text-center mt-3 text-l uppercase text-blue-800">
              Lancez la conversation !
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";

const conversation = useConversationsStore()
  .currentConversation as Conversation;
const otherUser = useConversationsStore().getOtherUser(conversation);
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
      return `A rejoint le ${new Date(
        otherUser.createdAt as string
      ).toLocaleDateString()},
       Vous êtes ami avec ${otherUser.name} depuis le ${
        friendshipDate.value
      }, envoyez-lui quelque chose !`;
    default:
      break;
  }
};
const friendshipDate = ref("");
onMounted(async () => {
  const friendshipdate = await useFriendsStore().getFriendshipDate(
    otherUser._id as string
  );
  friendshipDate.value = new Date(friendshipdate).toLocaleDateString();
});
</script>
