<template>
  <main class="chat-page flex w-full" @keydown.esc="closeConversationSidebar">
    <!--side conversations-->
    <button
      v-if="conversationSidebarOpen"
      type="button"
      class="chat-sidebar-backdrop"
      aria-label="Fermer la liste des conversations"
      @click="closeConversationSidebar"
    ></button>
    <ContainersMain
      id="conversation-sidebar"
      class="chat-sidebar rounded-xl"
      :class="{ 'chat-sidebar-open': conversationSidebarOpen }"
    >
      <div class="chat-sidebar-heading">
        <h2>Conversations</h2>
        <button ref="conversationSidebarCloseButton" type="button" class="chat-sidebar-close" aria-label="Fermer la liste des conversations" @click="closeConversationSidebar">×</button>
      </div>
      <ConversationSideBar @conversation-selected="closeConversationSidebar"></ConversationSideBar>
    </ContainersMain>
    <!--messages container and input-->
    <div
      :style="{
        backgroundImage: `url(${
          useConversationsStore().currentConversation.theme?.photo
        })`,
      }"
      class="chat-content relative flex h-full w-full flex-col bg-cover bg-center bg-no-repeat"
    >
      <button
        type="button"
        ref="conversationSidebarToggleButton"
        class="chat-sidebar-toggle"
        aria-controls="conversation-sidebar"
        :aria-expanded="conversationSidebarOpen"
        @click="openConversationSidebar"
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        Conversations
      </button>
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
        class="chat-messages relative w-full flex flex-col overflow-y-auto overflow-x-hidden px-1"
        style="scrollbar-width: thin"
        @scroll="onHistoryScroll"
      >
        <div class="history-controls" v-if="useMessagesStore().hasOlderMessages || getIsAppendingMessages() || historyError">
          <p v-if="findingMessage" role="status">Recherche du message dans l’historique…</p>
          <p v-else-if="getIsAppendingMessages()" role="status">Chargement des messages précédents…</p>
          <p v-if="historyError" role="alert">{{ historyError }}</p>
          <button v-if="!findingMessage && !getIsAppendingMessages()" type="button" @click="retryHistory">
            {{ historyError ? 'Réessayer' : 'Charger les messages précédents' }}
          </button>
        </div>
        <!--welcome to conversation-->
        <ConversationWelcome
          v-if="getMessages().length == 0 && !isMessagesPulse()"
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
        <div v-if="navigationNotice" class="navigation-notice" role="status">
          <span>{{ navigationNotice }}</span>
          <button type="button" aria-label="Fermer" @click="navigationNotice = ''">×</button>
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
            v-if="!isAtBottom() && useMessagesStore().messages.length > 10"
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
          @click="requestDelete('me')"
        >
          Supprimer pour moi
        </button>
        <button
          v-if="allSeletedMessagesAreMine()"
          class="selectionButtons half bg-red-500 hover:bg-red-600"
          @click="requestDelete('all')"
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
      <MessageInput class="w-full shrink-0"></MessageInput>
    </div>

    <!--options-->
    <transition name="slide-up">
      <div
        id="options"
        v-if="isOptions"
        @click="setIsOptions(false)"
        class="message-options-overlay"
      >
        <div class="message-options-panel">
          <div>
            <div class="message-options-heading">
              <div><h2>Options du message</h2><p>Réagissez ou choisissez une action.</p></div>
              <button type="button" class="message-options-close" aria-label="Fermer les options">×</button>
            </div>
            <!--emojis container-->
            <div class="message-options-reactions">
              <button
                type="button"
                @click="postEmoji(emoji)"
                class="message-options-reaction"
                :class="{ active: reaction == emoji }"
                :aria-label="`Réagir avec ${emoji}`"
                :aria-pressed="reaction == emoji"
                v-for="emoji of useEmojisStore().availableEmojis"
                :key="emoji"
              >
                {{ emoji }}
              </button>
            </div>
            <p v-if="reactionError" class="search-error" role="alert">{{ reactionError }}</p>
            <div class="message-options-actions">
              <button
                @click="requestDelete('me')"
                class="message-action message-action-danger"
              >
                Supprimer pour moi
              </button>
              <button
                v-if="getSender()._id == useUsersStore().user._id"
                @click="requestDelete('all')"
                class="message-action message-action-danger"
              >
                Supprimer pour tous
              </button>
              <button
                v-if="isModifiable()"
                @click="isModifyMessage = true"
                class="message-action"
              >
                Modifier
              </button>

              <button
                @click="toogleSelectingMode()"
                class="message-action"
              >
                Sélectionner
              </button>
              <button
                @click="transferOne()"
                class="message-action"
              >
                Transférer
              </button>
              <button
                @click="copy"
                class="message-action"
              >
                {{ copied ? "Copié ✔️" : "Copier" }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <!--modify form-->
    <MessageModify
      v-if="isModifyMessage"
      :message="message"
      @cancel="cancelModify($event)"
    ></MessageModify>
    <!--transfer component-->
    <div
      v-if="transfering"
      class="flex justify-center items-center fixed z-50 w-full h-full top-0 left-0 bg-black bg-opacity-50 p-4"
      role="dialog" aria-modal="true" aria-label="Transférer les messages"
      @click.self="cancelTransfering" @keydown.esc.stop="cancelTransfering"
    >
      <Transfer
        @finish="cancelTransfering"
        :messagesToSend="selectedMessages"
        class="relative z-10"
      ></Transfer>
    </div>
    <ConfirmDialog v-if="deleteMode" :title="deleteMode === 'all' ? 'Supprimer pour tous ?' : 'Supprimer pour vous ?'"
      :description="deleteDescription" :confirm-label="deleteMode === 'all' ? 'Supprimer pour tous' : 'Supprimer pour moi'"
      :busy="deletingMessages" :error="deleteError" @cancel="cancelDelete" @confirm="confirmDeleteMessages" />
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
  border-radius: 1rem;
  background: rgb(224 231 255 / 80%);
  box-shadow: 0 0 0 3px #6366f1, 0 8px 24px rgb(49 46 129 / 25%);
  transition: background .3s ease, box-shadow .3s ease;
}
.history-controls { align-self: center; display: grid; justify-items: center; gap: .4rem; margin: .75rem; padding: .6rem .9rem; border-radius: .9rem; background: #fff; color: #334155; box-shadow: 0 4px 16px rgb(15 23 42 / 12%); font-size: .85rem; text-align: center; }
.history-controls button { border: 0; border-radius: .6rem; padding: .4rem .7rem; color: #fff; background: #4338ca; font-weight: 700; }
.navigation-notice { position: absolute; z-index: 5; top: 4.5rem; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 1rem; width: max-content; max-width: calc(100% - 2rem); padding: .7rem 1rem; border-radius: .8rem; background: #fff; color: #1e293b; box-shadow: 0 8px 24px rgb(15 23 42 / 22%); font-size: .875rem; }
.navigation-notice button { color: #475569; font-size: 1.2rem; }
</style>
<script lang="ts" setup>
import { eventBus } from "@/utils/eventBus";
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const clickedId = ref("");
const conversationSidebarOpen = ref(false);
const conversationSidebarToggleButton = ref<HTMLButtonElement | null>(null);
const conversationSidebarCloseButton = ref<HTMLButtonElement | null>(null);
const openConversationSidebar = async () => {
  conversationSidebarOpen.value = true;
  await nextTick();
  conversationSidebarCloseButton.value?.focus();
};
const closeConversationSidebar = () => {
  if (!conversationSidebarOpen.value) return;
  conversationSidebarOpen.value = false;
  nextTick(() => conversationSidebarToggleButton.value?.focus());
};
const isOptions = ref(false);
const selectingMode = ref(false);
let message = useMessagesStore().messages[0];
let messagesContainer: HTMLDivElement;
const historyError = ref("");
const findingMessage = ref(false);
const navigationNotice = ref("");
let navigationRequest = 0;
let pendingTarget = "";
let highlightTimer: ReturnType<typeof setTimeout> | undefined;
let historyLoading: Promise<boolean> | null = null;
let historyLoadingConversation = "";
const selectedMessages = ref([] as Message[]);
const transfering = ref(false);
const copied = ref(false);
const isModifyMessage = ref(false);
const cancelModify = (e: any) => {
  isModifyMessage.value = false;
  message = {} as Message;
};
const allSeletedMessagesAreMine = (): boolean => {
  return selectedMessages.value.every((msg: Message) => {
    return (msg.sender as User)._id == useUsersStore().user._id;
  });
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
const deleteMode = ref<"me" | "all" | null>(null);
const deleteIds = ref<string[]>([]);
const deletingMessages = ref(false);
const deleteError = ref("");
const deleteDescription = computed(() => {
  const count = deleteIds.value.length;
  const subject = count > 1 ? `Ces ${count} messages seront supprimés` : "Ce message sera supprimé";
  return deleteMode.value === "all"
    ? `${subject} pour tous les participants. Cette action est irréversible.`
    : `${subject} de votre vue. Les autres participants pourront toujours le voir.`;
});
const requestDelete = (mode: "me" | "all") => {
  const targets = selectingMode.value ? selectedMessages.value : [message];
  deleteIds.value = targets.flatMap((item) => item?._id ? [item._id] : []);
  if (!deleteIds.value.length) return;
  deleteError.value = "";
  deleteMode.value = mode;
  setIsOptions(false);
};
const cancelDelete = () => {
  if (!deletingMessages.value) deleteMode.value = null;
};
const confirmDeleteMessages = async () => {
  if (deletingMessages.value || !deleteMode.value) return;
  deletingMessages.value = true;
  deleteError.value = "";
  try {
    while (deleteIds.value.length) {
      const id = deleteIds.value[0];
      if (deleteMode.value === "all") await useMessagesStore().deleteForAll(id);
      else await useMessagesStore().deleteForMe(id);
      deleteIds.value.shift();
      selectedMessages.value = selectedMessages.value.filter((item) => item._id !== id);
    }
    selectingMode.value = false;
    deleteMode.value = null;
    useAudioStore().runWipeDelete();
  } catch (error) {
    console.error("Impossible de supprimer les messages :", error);
    deleteError.value = "La suppression a échoué. Les messages restants peuvent être réessayés.";
  } finally {
    deletingMessages.value = false;
  }
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
const reactionError = ref("");
let optionsRequest = 0;
const messageOptions = async (msg: Message) => {
  const request = ++optionsRequest;
  message = msg;
  reaction.value = "";
  reactionError.value = "";
  setIsOptions(true);
  try {
    const alreadyReacted = await useEmojisStore().alreadyReacted(msg._id as string);
    if (request === optionsRequest) reaction.value = alreadyReacted[0]?.emoji || "";
  } catch (error) {
    console.error("Impossible de charger la réaction :", error);
    if (request === optionsRequest) reactionError.value = "Impossible de charger votre réaction.";
  }
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
  if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;
};
const loadHistory = (preservePosition = true): Promise<boolean> => {
  const conversation = useMessagesStore().historyConversationId;
  if (historyLoading) {
    if (historyLoadingConversation === conversation) return historyLoading;
    return historyLoading.then(() => loadHistory(preservePosition));
  }
  historyLoadingConversation = conversation;
  historyLoading = (async () => {
    const height = messagesContainer.scrollHeight;
    const top = messagesContainer.scrollTop;
    historyError.value = "";
    try {
      const loaded = await useMessagesStore().appendHistoryMessages(preservePosition);
      await nextTick();
      if (loaded && preservePosition) messagesContainer.scrollTop = top + messagesContainer.scrollHeight - height;
      return loaded;
    } catch (error) {
      console.error("Impossible de charger l’historique :", error);
      historyError.value = "Impossible de charger les messages précédents.";
      return false;
    } finally {
      historyLoading = null;
    }
  })();
  return historyLoading;
};
const retryHistory = () => {
  if (pendingTarget) void goToMessage(pendingTarget, true);
  else void loadHistory();
};
const onHistoryScroll = () => {
  if (!messagesContainer) return;
  useMessagesStore().setIsAtBottom(
    messagesContainer.scrollHeight - messagesContainer.scrollTop <= messagesContainer.clientHeight + 60
  );
  if (messagesContainer.scrollTop < 50 && !findingMessage.value && !historyError.value &&
      useMessagesStore().hasOlderMessages && !getIsAppendingMessages()) void loadHistory();
};
const goToMessage = async (messageId: string, effect: boolean) => {
  const request = ++navigationRequest;
  const conversation = useMessagesStore().historyConversationId;
  pendingTarget = messageId;
  findingMessage.value = true;
  navigationNotice.value = "";
  try {
    await nextTick();
    let element = document.getElementById(messageId);
    while (!element && useMessagesStore().hasOlderMessages && request === navigationRequest &&
      conversation === useMessagesStore().historyConversationId) {
      if (!await loadHistory(false)) break;
      element = document.getElementById(messageId);
    }
    if (request !== navigationRequest || conversation !== useMessagesStore().historyConversationId) return;
    if (!element) {
      if (!historyError.value) {
        pendingTarget = "";
        navigationNotice.value = "Ce message n’est plus disponible dans cette conversation.";
      }
      return;
    }
    pendingTarget = "";
    element.scrollIntoView({ behavior: "smooth", block: "center" });
    if (effect) {
      document.querySelectorAll(".searchedMessage").forEach((item) => item.classList.remove("searchedMessage"));
      element.classList.add("searchedMessage");
      clearTimeout(highlightTimer);
      highlightTimer = setTimeout(() => element?.classList.remove("searchedMessage"), 4000);
    }
  } finally {
    if (request === navigationRequest) {
      findingMessage.value = false;
      if (conversation === useMessagesStore().historyConversationId) {
        try {
          await useMessageStatusStore().setConversationMessagesAsSeen();
        } catch (error) {
          console.error("Impossible de confirmer la lecture des messages :", error);
        }
      }
    }
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
const isModifiable = (): boolean => {
  const isSeen = useMessageStatusStore().isSeen(message._id as string);
  let res =
    getSender()._id == useUsersStore().user._id &&
    !isSeen &&
    useConversationsStore().currentConversation.type != "ai" &&
    !message.transfered &&
    message.originalText == undefined;

  return res;
};
const onConversationChanged = () => {
  if (!findingMessage.value) goBottom();
};
const onMessageReceived = (msg: Message) => {
  const conv = msg.conversation as Conversation;
  const msgConversationId = conv?._id || msg.conversation;
  if (msgConversationId === useConversationsStore().currentConversation._id && isAtBottom() && !findingMessage.value) {
    nextTick(goBottom);
  }
};
const initializePosition = async () => {
  const request = ++navigationRequest;
  const conversation = useMessagesStore().historyConversationId;
  const messageId = useRoute().query.messageId;
  if (typeof messageId === "string" && messageId) {
    await goToMessage(messageId, true);
  } else {
    const lastSeenMessageId = await useMessageStatusStore().getLastSeenMessageId(
      useRoute().params.id as string
    );
    if (request !== navigationRequest || conversation !== useMessagesStore().historyConversationId) return;
    const msgs = useMessagesStore().messages;
    if (!lastSeenMessageId || lastSeenMessageId === msgs[msgs.length - 1]?._id) {
      goBottom();
    } else {
      await goToMessage(lastSeenMessageId, false);
    }
  }
  if (conversation === useMessagesStore().historyConversationId) {
    try {
      await useMessageStatusStore().setConversationMessagesAsSeen();
    } catch (error) {
      console.error("Impossible de confirmer la lecture des messages :", error);
    }
  }
};
onMounted(() => {
  messagesContainer = document.getElementById("messagesContainer") as HTMLDivElement;
  eventBus.on("conversationChanged", onConversationChanged);
  eventBus.on("messageReceived", onMessageReceived);
  void initializePosition().catch((error) => {
    console.error("Impossible de positionner la conversation :", error);
    navigationNotice.value = "Impossible de retrouver votre position dans la conversation.";
  });
});
watch(() => useRoute().params.id, () => {
  if (!messagesContainer) return;
  historyError.value = "";
  pendingTarget = "";
  void initializePosition().catch((error) => {
    console.error("Impossible de positionner la conversation :", error);
    navigationNotice.value = "Impossible de retrouver votre position dans la conversation.";
  });
});
watch(() => useRoute().query.messageId, (id) => {
  if (typeof id === "string" && id && messagesContainer) void goToMessage(id, true);
});
onBeforeUnmount(() => {
  navigationRequest++;
  clearTimeout(highlightTimer);
  eventBus.off("conversationChanged", onConversationChanged);
  eventBus.off("messageReceived", onMessageReceived);
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
