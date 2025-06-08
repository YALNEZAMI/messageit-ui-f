<template>
  <main class="flex w-screen" style="height: 36.8rem">
    <!--side conversations-->
    <ContainersMain style="min-height: 35.5rem" class="w-1/4 md:w-1/5 rounded">
      <ConversationSideBar></ConversationSideBar>
    </ContainersMain>
    <!--messages container and input-->
    <div
      style="
        background-size: cover;
        background-repeat: no-repeat;
        background-position: center;
      "
      :style="{
        backgroundImage: `url(${
          useConversationsStore().currentConversation.theme?.photo
        })`,
      }"
      class="relative flex w-full md:w-4/5 pr-3 flex-col h-full"
    >
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
        class="relativep-1 px-1 w-full flex flex-col overflow-y-auto overflow-x-hidden"
        style="height: 32rem; scrollbar-width: thin"
      >
        <!--load spinner-->
        <div class="flex justify-center" v-if="getIsAppendingMessages()">
          <div
            class="w-6 h-6 mb-10 border-4 border-solid border-white border-t-transparent rounded-full animate-spin"
          ></div>
        </div>
        <!--welcome to conversation-->
        <ConversationWelcome
          v-if="getMessages().length == 0"
        ></ConversationWelcome>
        <!--messages-->
        <div v-for="message of getMessages()" :key="message._id">
          <Message
            :id="message._id"
            @click="setClickedId(message._id)"
            @options="messageOptions(message)"
            @select="select(message)"
            @goToReferedMessage="
              goToMessage(getReferedMessageId(message), true)
            "
            :message="message"
            :clickedId="clickedId"
            :is-selected="isSelected(message._id + '')"
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
          v-if="allSeletedMessagesAreMine()"
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
      <MessageInput class="absolute bottom-0 left-0 w-full"></MessageInput>
    </div>

    <!--options-->
    <transition name="slide-up">
      <div
        id="options"
        style="height: 35.5rem"
        v-if="isOptions"
        @click="setIsOptions(false)"
        class="bg-black bg-opacity-80 fixed w-screen z-30 flex justify-center items-end"
      >
        <div class="relative w-11/12">
          <div
            class="z-40 transition-all duration-1000 w-11/12 h-max p-0 bg-white rounded"
          >
            <!--emojis container-->
            <div
              class="flex justify-center space-x-2 bg-black bg-opacity-50 p-1 mb-1"
            >
              <div
                @click="postEmoji(emoji)"
                class="rounded-lg p-1 cursor-pointer hover:opacity-85"
                :class="{
                  'bg-indigo-300': reaction == emoji,
                  'bg-white': reaction !== emoji,
                }"
                v-for="emoji of useEmojisStore().availableEmojis"
                :key="emoji"
              >
                {{ emoji }}
              </div>
            </div>
            <!--<h3 class="text-center text-black mb-1 m-0">
          Choisir l'opération à effectuer sur
        </h3>-->

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
      </div>
    </transition>

    <!--transfer component-->
    <div
      v-if="transfering"
      class="flex justify-center items-center fixed z-0 w-full h-full top-0 left-0 bg-black bg-opacity-50"
    >
      <Transfer
        @send="sendFromTransfer($event)"
        @finish="cancelTransfering"
        :messagesToSend="selectedMessages"
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
  @apply animate-pulse bg-red-300 bg-opacity-50 rounded;
}
</style>
<script lang="ts" setup>
import { eventBus } from "@/utils/eventBus";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const clickedId = ref("");
const isOptions = ref(false);
const selectingMode = ref(false);
let message = useMessagesStore().messages[0];
let messagesContainer: HTMLDivElement;
const selectedMessages = ref([] as Message[]);
const transfering = ref(false);
const copied = ref(false);

const allSeletedMessagesAreMine = (): boolean => {
  return selectedMessages.value.every((msg: Message) => {
    return (msg.sender as User)._id == useUsersStore().user._id;
  });
};
const sendFromTransfer = async (conv: Conversation) => {
  // for (const msg of selectedMessages.value) {
  //   const sending = await useMessagesStore().transfer(
  //     {
  //       text: msg.text,
  //       files: msg.files,
  //       sender: "",
  //       conversation: "",
  //       referedMessage: "",
  //       type: "message",
  //       transfered: true,
  //       createdAt: new Date().toISOString(),
  //     },
  //     conv._id as string
  //   );

  //   sentToConversations.value.push(conv._id as string);
  // }
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
  const isSelected = selectedMessages.value.some((msgfind: Message) => {
    return msg._id == msgfind._id;
  });
  if (isSelected) {
    selectedMessages.value = selectedMessages.value.filter(
      (msgfilter: Message) => msgfilter._id != msg._id
    );
  } else {
    selectedMessages.value.push(msg);
  }
};
const cancelSelection = () => {
  selectedMessages.value = [];
  selectingMode.value = false;
};
const toogleSelectingMode = () => {
  selectingMode.value = !selectingMode.value;
  isOptions.value = false;
  selectedMessages.value.push(message);
};
const isSelected = (idMsg: string): boolean => {
  return selectedMessages.value.some((msgfind: Message) => {
    return idMsg == msgfind._id;
  });
};
const setIsOptions = (newVal: boolean) => {
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
  useAudioStore().runWipeDelete();

  setIsOptions(false);
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
  useAudioStore().runWipeDelete();

  setIsOptions(false);
};
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
const reaction = ref("");
const messageOptions = async (msg: any) => {
  //handle reaction state
  const alreadyReacted = await useEmojisStore().alreadyReacted(msg._id);
  if (alreadyReacted.length > 0) {
    reaction.value = alreadyReacted[0].emoji;
  } else {
    reaction.value = "";
  }
  message = msg;
  //display the options pannel
  setIsOptions(true);
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
const goToMessage = async (messageId: string, effect: boolean) => {
  let messageElement = document.getElementById(messageId) as HTMLElement;

  if (!messageElement) {
    messagesContainer.scrollTop = 0; // Scroll to top to load older messages
    await useMessagesStore().appendHistoryMessages(); // Load older messages
    setTimeout(() => goToMessage(messageId, true), 500); // Retry after messages load
    return;
  }

  // Ensure the message is centered
  messageElement.scrollIntoView({ behavior: "smooth", block: "center" });

  if (effect) {
    // Highlight the message
    messageElement.classList.add("searchedMessage");
    setTimeout(() => {
      messageElement.classList.remove("searchedMessage");
    }, 4000);
  }
};
const isAtBottom = () => {
  return useMessagesStore().isAtBottom;
};
const postEmoji = async (emoji: string) => {
  await useEmojisStore().postEmoji(message._id as string, emoji);
  isOptions.value = false;
  goBottom();
};
onMounted(async () => {
  //init messages
  await useMessagesStore().getInitialMessages(useRoute().params.id as string);
  //set messages containrer
  messagesContainer = document.getElementById(
    "messagesContainer"
  ) as HTMLDivElement;

  //listen to conversation change event and scroll then
  eventBus.on("conversationChanged", (conv: Conversation) => {
    goBottom();
  });

  //listen to messages recieved event and scoll if the conversation is concerned
  eventBus.on("messageReceived", (msg: Message) => {
    const msgConversationId = msg.conversation._id
      ? msg.conversation._id
      : msg.conversation;

    if (
      msgConversationId == useConversationsStore().currentConversation._id ||
      isAtBottom()
    ) {
      goBottom();
      setTimeout(() => {
        goBottom();
      }, 500);
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
    await goToMessage(messageId as string, true);
  }
  //not seen messages
  let lastSeenMessageId = await useMessageStatusStore().getLastSeenMessageId(
    useRoute().params.id as string
  );
  const msgs = useMessagesStore().messages;
  if (
    lastSeenMessageId == null ||
    lastSeenMessageId == msgs[msgs.length - 1]._id
  ) {
    //initial scrolling
    goBottom();
  } else {
    goToMessage(lastSeenMessageId, false);
    const message = document.getElementById(lastSeenMessageId) as HTMLElement;
    const elem = document.createElement("div");
    elem.classList.add(
      "bg-gray-300",
      "border-2",
      "border-double",
      "border-indigo-400",
      "rounded",
      "px-5",
      "py-1",
      "bg-opacity-50",
      "w-max",
      "mx-auto",
      "text-center"
    );
    elem.innerHTML = "______Nouveaux messages______";
    message.appendChild(elem);
  }
  //set messages as seen
  //set conversation messages as seen
  await useMessageStatusStore().setConversationMessagesAsSeen();
});
definePageMeta({
  layout: "conversations",
  middleware: "conversations",
});
</script>
<style scoped>
/* Slide-up transition */
.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s ease-in-out;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
  opacity: 0;
}

.slide-up-enter-to,
.slide-up-leave-from {
  transform: translateY(0%);
  opacity: 1;
}
</style>
