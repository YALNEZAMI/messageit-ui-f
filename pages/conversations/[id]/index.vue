<template>
  <main class="flex w-screen" style="height: 35.5rem">
    <!--side conversations-->
    <ContainersMain style="min-height: 35.5rem" class="w-1/4 md:w-1/3 rounded">
      <div
        style="max-height: 35.5rem; direction: rtl; scrollbar-width: thin"
        class="overflow-y-auto scro flex justify-center flex-wrap h-max"
      >
        <Conversation
          style="direction: ltr"
          class="mb-1"
          v-for="conv of getConvs()"
          :key="conv._id"
          :conversation="conv"
          :isSideBar="true"
        ></Conversation>
        <div
          class="w-11/12 md:w-1/3"
          v-for="(pulse, index) in ([].length = 10)"
          :key="index"
        >
          <Pulse
            v-if="isConversationPulse()"
            class="w-full overflow-hidden"
          ></Pulse>
        </div>
      </div>
    </ContainersMain>
    <!--messages container and input-->
    <div class="flex w-3/4 mr-4 flex-col h-full">
      <div
        id="messagesContainer"
        class="p-2 flex flex-col overflow-y-auto"
        style="height: 32rem; scrollbar-width: thin"
      >
        <!--load spinner-->
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
        <div
          class="w-11/12 md:w-1/3"
          v-for="(pulse, index) in ([].length = 10)"
          :key="index"
        >
          <Pulse
            v-if="isMessagesPulse()"
            class="w-full overflow-hidden"
          ></Pulse>
        </div>
        <!--scroll down button-->
        <div class="flex justify-center sticky bottom-0 left-0 w-full">
          <button
            v-if="!isAtBottom"
            class="animate-bounce bg-transparent border-0 cursor-pointer"
            @click="goBottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="size-7"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
              />
            </svg>
          </button>
        </div>
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
const isConversationPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
const isMessagesPulse = () => {
  return useMessagesStore().isMessagesPulse;
};
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
