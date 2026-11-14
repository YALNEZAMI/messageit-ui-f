<template>
  <main class="dialog-panel transfer-panel">
    <header class="transfer-header">
      <div>
        <h2 class="dialog-title">Transférer le message</h2>
        <p class="dialog-subtitle">Choisissez une conversation.</p>
      </div>
      <button ref="closeButton" type="button" class="transfer-close" aria-label="Fermer le transfert" @click="emits('finish')">×</button>
    </header>
    <!--search bar-->
    <div class="flex justify-center my-2">
      <div class="transfer-search">
        <input
          v-model="req"
          type="text"
          class="search-input"
          placeholder="Recherche..."
          aria-label="Rechercher une conversation"
        />
        <!--search icon-->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="transfer-search-icon"
          aria-hidden="true"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
          />
        </svg>
      </div>
    </div>
    <div
      class="transfer-list flex flex-col space-y-2"
    >
      <ContainersTheme
        class="w-11/12 flex space-x-2 justify-center items-center p-1 py-2 px-4 rounded"
        v-for="conv of getConvs()"
        :key="conv._id"
      >
        <Conversation
          :isSideBar="false"
          :noSettings="true"
          :conversation="conv"
        ></Conversation>
        <button
          :disabled="sentTab.includes(conv._id + '') || sendingTab.includes(conv._id + '')"
          @click="send(conv)"
          class="basicButton h-max text-white"
          :class="{
            'bg-indigo-500  hover:bg-indigo-700': !sentTab.includes(
              conv._id + ''
            ),
            'bg-gray-400': sentTab.includes(conv._id + ''),
          }"
        >
          <div v-if="!sendingTab.includes(conv._id + '')">
            {{ sentTab.includes(conv._id + "") ? "envoyé" : "envoyer" }}
          </div>
          <!--load spinner-->

          <div class="h-8" v-else>
            <div class="flex justify-center items-center h-max">
              <div
                class="w-6 h-6 mb-10 border-4 border-solid border-white border-t-transparent rounded-full animate-spin"
              ></div>
            </div>
          </div>
        </button>
      </ContainersTheme>
      <!--pulse effect-->
      <div
        class="w-11/12 md:w-1/3 m-1"
        :class="{
          hidden: !isPulse(),
        }"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
      >
        <Pulse
          v-if="isPulse()"
          class="w-full overflow-hidden bg-gray-300 rounded"
        ></Pulse>
      </div>
    </div>
    <p v-if="sendError" class="search-error" role="alert">{{ sendError }}</p>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
import { filterConversations } from "~/utils/conversationSearch";
const emits = defineEmits(["send", "finish"]);
const props = defineProps<{ messagesToSend: Message[] }>();
const sentTab = ref([] as string[]);
const sendingTab = ref([] as string[]);
const sentCounts = new Map<string, number>();
const sendError = ref("");
const send = async (conv: Conversation) => {
  const id = conv._id as string;
  if (sendingTab.value.includes(id) || sentTab.value.includes(id)) return;
  sendingTab.value.push(id);
  sendError.value = "";
  try {
    for (let index = sentCounts.get(id) || 0; index < props.messagesToSend.length; index++) {
      const msg = props.messagesToSend[index];
      await useMessagesStore().transfer(
        {
          text: msg.text,
          files: msg.files,
          conversation: id,
          referedMessage: "",
          type: "message",
          transfered: true,
          createdAt: new Date().toISOString(),
        },
        id
      );
      sentCounts.set(id, index + 1);
    }
    sentTab.value.push(id);
    emits("send", conv);
  } catch (error) {
    console.error("Impossible de transférer le message :", error);
    sendError.value = "Le transfert a échoué. Réessayez pour envoyer les messages restants.";
  } finally {
    sendingTab.value = sendingTab.value.filter((sendingId) => sendingId !== id);
  }
};

const req = ref("");
const getConvs = (): Conversation[] => {
  const res = filterConversations(useConversationsStore().conversations, req.value, useUsersStore().user._id);
  return res.filter((conv: Conversation) => {
    return conv._id != useConversationsStore().currentConversation._id;
  });
};
const isPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
const closeButton = ref<HTMLButtonElement | null>(null);
let opener: HTMLElement | null = null;
onMounted(async () => {
  opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  await nextTick();
  closeButton.value?.focus();
});
onBeforeUnmount(() => {
  if (opener?.isConnected) opener.focus();
});
</script>

<style scoped>
.transfer-panel { display: flex; flex-direction: column; overflow: hidden; }
.transfer-header { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.transfer-close { display: grid; place-items: center; flex: none; width: 2.6rem; height: 2.6rem; border-radius: .75rem; background: #fff0ef; color: #b42318; font-size: 1.6rem; line-height: 1; }
.transfer-close:hover { background: #fee2e2; color: #8f1b15; }
.transfer-search { position: relative; width: 100%; max-width: 24rem; }
.transfer-search .search-input { padding-right: 3rem; }
.transfer-search-icon { position: absolute; right: .9rem; top: 50%; width: 1.25rem; height: 1.25rem; transform: translateY(-50%); color: #526078; pointer-events: none; }
.transfer-list { flex: 1; min-height: 0; overflow-y: auto; padding: .5rem; }
</style>
