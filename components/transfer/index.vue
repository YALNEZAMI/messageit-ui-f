<template>
  <main class="bg-white p-1 py-2 rounded w-full sm:w-3/4">
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

const getConvs = (): Conversation[] => {
  return useConversationsStore().conversations.filter((conv: Conversation) => {
    return conv._id != useConversationsStore().currentConversation._id;
  });
};
</script>
