<template>
  <main class="flex w-screen" style="height: 35.5rem">
    <!--side conversations-->
    <ContainersMain style="min-height: 35.5rem" class="w-1/4 md:w-1/5 rounded">
      <ConversationSideBar></ConversationSideBar>
    </ContainersMain>
    <!--messages container and input-->
    <div class="relative flex w-3/4 md:w-4/5 mr-4 flex-col h-full">
      <!--copied message-->
      <div
        v-if="copied"
        class="flex justify-center absolute bottom-14 left-0 w-full"
      >
        <span class="bg-white p-1 rounded-md text-green-400 font-bold"
          >Copied ✔️</span
        >
      </div>
      <div
        id="messagesContainer"
        class="p-2 flex flex-col overflow-y-auto overflow-x-hidden"
        style="height: 32rem; scrollbar-width: thin"
      >
        <!--load spinner-->
        <div class="flex justify-center" v-if="getIsAppendingMessages()">
          <div
            class="w-6 h-6 mb-10 border-4 border-solid border-white border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
        <!--messages-->
        <div v-for="message of getMessages()" :key="message._id">
          <Message
            :id="message._id"
            @click="setClickedId(message._id)"
            @options="messageOptions(message)"
            @select="select(message)"
            @goToReferedMessage="goToMessage(getReferedMessageId(message))"
            :message="message"
            :clickedId="clickedId"
            :selectingMode="selectingMode"
            v-if="message.type == 'message'"
          ></Message>
          <ConversationNotification
            v-if="message.type == 'notification'"
            @click="setClickedId(message._id)"
            :message="message"
            :clickedId="clickedId"
          ></ConversationNotification>
        </div>
        <!--typing component-->
        <Typing @goBottom="goBottom()"></Typing>
        <!--pulse effect-->
        <div
          class="w-full m-1"
          :class="{
            'flex justify-start': index % 2 == 0,
            hidden: !isMessagesPulse(),
          }"
          :style="{
            direction: index % 2 == 0 ? 'rtl' : 'ltr',
          }"
          v-for="(pulse, index) in ([].length = 10)"
          :key="index"
        >
          <Pulse
            v-if="isMessagesPulse()"
            class="bg-gray-300 overflow-x-hidden rounded p-2 h-16 w-96 overflow-hidden"
          ></Pulse>
        </div>
        <!--scroll down button-->
        <div class="flex justify-center sticky bottom-0 left-0 w-full">
          <button
            v-if="!isAtBottom()"
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
      <!--selection multiple options-->
      <div
        class="flex flex-wrap justify-center bg-gray-400 bg-opacity-65 p-2"
        v-if="selectedMessages.length > 0"
      >
        <button
          class="selectionButtons half bg-orange-500 hover:bg-orange-600"
          @click="deleteForMe"
        >
          Supprimer pour moi
        </button>
        <button
          class="selectionButtons half bg-red-500 hover:bg-red-600"
          @click="deleteForAll"
        >
          Supprimer pour tous
        </button>
        <button
          class="selectionButtons w-1/2 bg-yellow-500 hover:bg-yellow-600"
          @click="cancelSelection()"
        >
          Annuler
        </button>
        <button
          @click="transfering = true"
          class="optionsButtons bg-indigo-500 hover:bg-indigo-600"
        >
          Transferer
        </button>
        <button
          @click="copy"
          class="optionsButtons bg-indigo-500 hover:bg-indigo-600"
        >
          {{ copied ? "Copied ✔️" : "Copier le text" }}
        </button>
      </div>

      <div v-else-if="selectingMode" class="flex justify-center">
        <button
          class="selectionButtons w-1/2 bg-yellow-500 hover:bg-yellow-600"
          @click="cancelSelection()"
        >
          Annuler
        </button>
      </div>
      <!-- input -->
      <MessageInput></MessageInput>
    </div>

    <!--options-->
    <div
      id="options"
      style="height: 35.5rem"
      v-if="isOptions"
      @click="toogleIsOptions(false)"
      class="bg-black bg-opacity-80 fixed w-screen z-30 flex justify-center items-end"
    >
      <div class="z-40 relative w-11/12 h-max p-0 bg-white rounded">
        <h3 class="text-center text-black mb-1 m-0">
          Choisir l'opération à effectuer sur
        </h3>
        <div class="flex flex-wrap justify-center w-full">
          <button
            @click="deleteForMe"
            class="optionsButtons text-xs bg-orange-500 hover:bg-orange-600"
          >
            Supprimer pour moi
          </button>
          <button
            v-if="getSender()._id == useUsersStore().user._id"
            @click="deleteForAll"
            class="optionsButtons text-xs bg-red-500 hover:bg-red-600"
          >
            Supprimer pour tous
          </button>

          <button
            @click="toogleSelectingMode()"
            class="optionsButtons bg-indigo-500 hover:bg-indigo-600"
          >
            Select
          </button>
          <button
            @click="transferOne()"
            class="optionsButtons bg-indigo-500 hover:bg-indigo-600"
          >
            Transfère
          </button>
          <button
            @click="copy"
            class="optionsButtons bg-indigo-500 hover:bg-indigo-600"
          >
            {{ copied ? "Copié ✔️" : "Copier" }}
          </button>
        </div>
      </div>
    </div>
    <!--transfer component-->
    <div
      v-if="transfering"
      class="flex justify-center items-center fixed z-0 w-full h-full top-0 left-0 bg-black bg-opacity-50"
    >
      <Transfer
        @send="sendFromTransfer($event)"
        @finish="cancelTransfering"
        :sentToConversations="sentToConversations"
        class="relative z-10"
      ></Transfer>
    </div>
  </main>
</template>
<style lang="postcss" scoped>
.optionsButtons {
  @apply border-0  cursor-pointer p-2 rounded-md text-white m-1 min-w-20;
}
.selectionButtons {
  @apply border-0  cursor-pointer p-2 rounded-md text-white m-1 max-w-40;
}
.searchedMessage {
  @apply animate-pulse bg-red-300 p-2 rounded;
}
</style>
<script lang="ts" setup>
import { eventBus } from "@/utils/eventBus";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const clickedId = ref("");
const isOptions = ref(false);
const selectingMode = ref(false as boolean);
let message = useMessagesStore().messages[0];
const selectedMessages = ref([] as Message[]);
const sentToConversations = ref([] as string[]);
const transfering = ref(false);
const sendFromTransfer = async (conv: Conversation) => {
  for (const msg of selectedMessages.value) {
    const sending = await useMessagesStore().transfer(
      {
        text: msg.text,
        sender: "",
        conversation: "",
        referedMessage: "",
        type: "message",
        transfered: true,
      },
      conv._id as string
    );

    sentToConversations.value.push(conv._id as string);
  }
  selectedMessages.value = [];
  selectingMode.value = false;
};
const cancelTransfering = () => {
  transfering.value = false;
  cancelSelection();
};
const transferOne = () => {
  selectedMessages.value.push(message);
  transfering.value = true;
};
const select = (msg: Message) => {
  const isSelected =
    selectedMessages.value.find((msgfind: Message) => {
      return msg._id == msgfind._id;
    }) != undefined;
  if (isSelected) {
    selectedMessages.value = selectedMessages.value.filter(
      (msgfilter: Message) => msgfilter._id != msg._id
    );
    return;
  }
  selectedMessages.value.push(msg);
};
const cancelSelection = () => {
  selectedMessages.value = [];
  selectingMode.value = false;
};
const toogleSelectingMode = () => {
  selectingMode.value = !selectingMode.value;

  isOptions.value = false;
};
const toogleIsOptions = (newVal: boolean) => {
  isOptions.value = newVal;
};

const getSender = (): User => {
  return message.sender as User;
};
const getReferedMessageId = (msg: Message): string => {
  const message = msg.referedMessage as Message;
  return message._id as string;
};
const deleteForMe = async () => {
  if (selectingMode.value) {
    for (const msg of selectedMessages.value) {
      await useMessagesStore().deleteForMe(msg._id as string);
    }
    selectingMode.value = false;

    return;
  }
  await useMessagesStore().deleteForMe(message._id as string);
  toogleIsOptions(false);
};
const deleteForAll = async () => {
  if (selectingMode.value) {
    for (const msg of selectedMessages.value) {
      await useMessagesStore().deleteForAll(msg._id as string);
    }
    selectingMode.value = false;
    return;
  }
  await useMessagesStore().deleteForAll(message._id as string);
  toogleIsOptions(false);
};

const copied = ref(false);
const copy = () => {
  copied.value = true;
  navigator.clipboard
    .writeText(message.text as string)
    .then(() => {})
    .catch((err) => {
      console.error("Failed to copy text: ", err);
    });
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
const messageOptions = (msg: any) => {
  message = msg;
  toogleIsOptions(true);
};

const isMessagesPulse = () => {
  return useMessagesStore().isMessagesPulse;
};
const getIsAppendingMessages = () => {
  return useMessagesStore().isAppendingMessages;
};
const setClickedId = (val: any) => {
  if (clickedId.value == val || selectingMode.value) {
    clickedId.value = "";
    return;
  }
  clickedId.value = val;
};

const getMessages = () => {
  return useMessagesStore().messages;
};
let messagesContainer: HTMLDivElement;

const goBottom = () => {
  if (messagesContainer == null) {
    setTimeout(() => {
      //set messages containrer
      messagesContainer = document.getElementById(
        "messagesContainer"
      ) as HTMLDivElement;
      messagesContainer!.scrollTop =
        messagesContainer!.scrollHeight + messagesContainer.clientHeight + 1;
    }, 4000);
  } else {
    messagesContainer!.scrollTop =
      messagesContainer!.scrollHeight + messagesContainer.clientHeight + 1;
  }
};
const goToMessage = async (messageId: string) => {
  const messageElement = document.getElementById(messageId);
  if (!messageElement) {
    messagesContainer.scrollTop = 0;
    await useMessagesStore().appendHistoryMessages();
  } else {
    messageElement.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    messageElement.classList.toggle("searchedMessage");

    setTimeout(() => {
      messageElement.classList.toggle("searchedMessage");
    }, 4000);
  }
};
const isAtBottom = () => {
  return useMessagesStore().isAtBottom;
};

onMounted(async () => {
  //init messages
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
      isAtBottom()
    ) {
      goBottom();
    }
  });

  messagesContainer.addEventListener("scroll", async (e) => {
    // update isAtBottom
    useMessagesStore().setIsAtBottom(
      messagesContainer.scrollHeight - messagesContainer.scrollTop <=
        messagesContainer.clientHeight + 60
    );
    //check out message history if at top
    if (messagesContainer.scrollTop < 1) {
      await useMessagesStore().appendHistoryMessages();
    }
  });
  //search message case
  let messageId = useRoute().query.messageId;

  if (messageId) {
    await goToMessage(messageId as string);
  }
});

definePageMeta({
  layout: "conversations",
  middleware: "conversations",
});
</script>
