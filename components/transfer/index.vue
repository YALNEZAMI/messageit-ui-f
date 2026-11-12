<template>
  <main class="dialog-panel transfer-panel">
    <h2 class="dialog-title">Transférer le message</h2>
    <p class="dialog-subtitle">Choisissez une conversation.</p>
    <!--search bar-->
    <div class="flex justify-center my-2">
      <div class="relative w-3/4 md:w-1/2">
        <input
          v-model="req"
          @input="search"
          type="text"
          class="search-input"
          placeholder="Recherche..."
        />
        <!--search icon-->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke-width="1.5"
          stroke="currentColor"
          class="size-6 text-black absolute -right-1 top-1"
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
      class="flex flex-col space-y-2 px-5 overflow-y-auto overflow-hidden h-3/4 max-h-96"
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
          :disabled="sentTab.includes(conv._id + '')"
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
          hidden: !isPulse() && !isSearchConversationsPulse(),
        }"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
      >
        <Pulse
          v-if="isPulse() || isSearchConversationsPulse()"
          class="w-full overflow-hidden bg-gray-300 rounded"
        ></Pulse>
      </div>
    </div>
    <div class="flex justify-center my-2">
      <button
        @click="emits('finish')"
        class="upload-button-primary"
      >
        Terminer
      </button>
    </div>
    <p v-if="sendError" class="search-error" role="alert">{{ sendError }}</p>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
import type { Message } from "~/interfaces/message";
const emits = defineEmits(["send", "finish"]);
const props = defineProps<{ messagesToSend: Message[] }>();
const sentTab = ref([] as string[]);
const sendingTab = ref([] as string[]);
const sendError = ref("");
const send = async (conv: Conversation) => {
  const id = conv._id as string;
  if (sendingTab.value.includes(id)) return;
  sendingTab.value.push(id);
  sendError.value = "";
  try {
    for (const msg of props.messagesToSend) {
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
    }
    sentTab.value.push(id);
    emits("send", conv);
  } catch (error) {
    console.error("Impossible de transférer le message :", error);
    sendError.value = "Le transfert a échoué. Vérifiez la conversation avant de réessayer.";
  } finally {
    sendingTab.value = sendingTab.value.filter((sendingId) => sendingId !== id);
  }
};

const req = ref("");
const searchedConversations = ref([] as any[]);
const search = async () => {
  const res = await useConversationsStore().searchConversations(req.value);
  searchedConversations.value = res;
};
const getConvs = (): any[] => {
  const res =
    req.value == ""
      ? useConversationsStore().conversations
      : searchedConversations.value;
  return res.filter((conv: Conversation) => {
    return conv._id != useConversationsStore().currentConversation._id;
  });
};
const isSearchConversationsPulse = () => {
  return useConversationsStore().isSearchedConversationsPulse;
};
const isPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
</script>
