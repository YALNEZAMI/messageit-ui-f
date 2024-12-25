<template>
  <main class="bg-white p-1 py-4 rounded w-full sm:w-3/4 h-1/2">
    <!--search bar-->
    <div class="flex justify-center my-2">
      <div class="relative w-3/4 md:w-1/2">
        <input
          v-model="req"
          @input="search"
          type="text"
          class="rounded-md w-full p-2 bg-gray-100"
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
          :disabled="alreadyTransferedTo.includes(conv._id + '')"
          @click="send(conv)"
          class="basicButton h-max text-white"
          :class="{
            'bg-indigo-500  hover:bg-indigo-700': !alreadyTransferedTo.includes(
              conv._id + ''
            ),
          }"
        >
          <div
            v-if="
              !alreadyTransferedTo.includes(conv._id + '') ||
              props.sentToConversations?.includes(conv._id)
            "
          >
            {{
              alreadyTransferedTo.includes(conv._id + "") ? "envoyé" : "envoyer"
            }}
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
        class="basicButton bg-green-500 hover:bg-green-600"
      >
        Terminer
      </button>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Conversation } from "~/interfaces/conversation";
const emits = defineEmits(["send", "finish"]);
const props = defineProps({
  sentToConversations: Array,
});

const alreadyTransferedTo = ref([] as string[]);
const send = (conv: Conversation) => {
  alreadyTransferedTo.value.push(conv._id as string);
  emits("send", conv);
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
