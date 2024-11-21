<template>
  <main class="flex w-screen" style="height: 35.5rem">
    <!--side conversations-->
    <ContainersMain class="w-1/4 rounded h-full overflow-y-auto">
      <Conversation
        class="mb-1"
        v-for="conv of getConvs()"
        :key="conv._id"
        :conversation="conv"
        :isSideBar="true"
      ></Conversation>
    </ContainersMain>
    <!--messages container and input-->
    <div class="flex w-3/4 mr-4 flex-col h-full">
      <div
        id="messagesContainer"
        class="p-2 flex flex-col overflow-y-auto bg-blue-200"
        style="height: 32rem"
      >
        <div class="flex justify-center" v-if="getIsAppendingMessages()">
          <div
            class="w-6 h-6 mb-10 border-4 border-solid border-white border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
        <!--messages-->
        <Message
          @click="setClickedId(message._id)"
          v-for="message of getMessages()"
          :key="message._id"
          :message="message"
          :clickedId="clickedId"
        ></Message>
      </div>
      <!-- input -->
      <MessageInput></MessageInput>
    </div>
  </main>
</template>
<script lang="ts" setup>
import { eventBus } from "@/utils/eventBus";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
const clickedId = ref("");
const isAtBottom = ref(true);
const getIsAppendingMessages = () => {
  return useMessagesStore().isAppendingMessages;
};
const setClickedId = (val: any) => {
  if (clickedId.value == val) {
    clickedId.value = "";
    return;
  }
  clickedId.value = val;
};
const getConvs = (): any[] => {
  return useConversationsStore().conversations;
};
const getMessages = () => {
  return useMessagesStore().messages;
};
let messagesContainer: HTMLDivElement;

const goBottom = () => {
  messagesContainer!.scrollTop =
    messagesContainer!.scrollHeight + messagesContainer.clientHeight + 1;
};
onMounted(async () => {
  await useMessagesStore().getInitialMessages();
  //set messages containrer
  messagesContainer = document.getElementById(
    "messagesContainer"
  ) as HTMLDivElement;
  //initial scrolling
  goBottom();
  //listen to conversation change event and scroll then
  eventBus.on("conversationChanged", (conv: Conversation) => {
    goBottom();
  });
  //listen to messages recieved event and scoll if the conversation is concerned
  eventBus.on("messageReceived", (msg: Message) => {
    const msgConversation = msg.conversation as Conversation;
    if (
      msgConversation._id == useConversationsStore().currentConversation._id &&
      isAtBottom.value
    ) {
      goBottom();
    }
  });
  messagesContainer.addEventListener("scroll", async (e) => {
    // update isAtBottom
    isAtBottom.value =
      messagesContainer.scrollHeight - messagesContainer.scrollTop <=
      messagesContainer.clientHeight + 1;
    //check out if at top
    if (messagesContainer.scrollTop < 1) {
      await useMessagesStore().appendHistoryMessages();
    }
  });
});
definePageMeta({
  layout: "conversations",
  middleware: "conversations",
});
</script>
