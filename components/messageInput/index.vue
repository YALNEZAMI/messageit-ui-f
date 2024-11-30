<template>
  <div>
    <!--refered message-->
    <div
      v-if="referedMessage._id"
      class="border-l-8 py-2 border-solid border-l-red-600 w-11/12 flex mx-auto bg-black bg-opacity-20"
    >
      <div class="w-11/12">
        <div class="mx-2 font-bold text-red-600">
          {{ getReferedMessageSender().name }}
        </div>
        <div class="truncate mx-2 text-black">{{ referedMessage.text }}</div>
      </div>
      <ContainersMain class="h-max"
        ><button
          @click="cancelReply()"
          class="cursor-pointer bg-transparent text-white hover:opacity-80"
        >
          x
        </button></ContainersMain
      >
    </div>
    <ContainersConversationTheme class="w-full flex justify-center">
      <div class="p-2 flex justify-center space-x-1 w-full md:w1/2">
        <textarea
          @input="typing"
          id="textInput"
          type="text"
          v-model.trim="message.text"
          class="scroll w-3/4 h-7 md:w-1/2 px-2 rounded border-transparent focus:border-black focus:border-2"
          placeholder="écrir..."
          rows="3"
          style="resize: none"
        ></textarea>
        <button
          :disabled="
            (getConversationType() == 'ai' && isGenerating) ||
            (getConversationType() == 'ai' && message.text == '')
          "
          v-if="message.text != '' || getConversationType() == 'ai'"
          @click="send"
          class="bg-white text-black rounded border-0 px-2 cursor-pointer hover:bg-gray-200 transition-all duration-500 ease-in-out"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-6"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
            />
          </svg>
        </button>
        <button
          v-else
          @click="sendEmoji"
          class="bg-white text-lg text-black rounded border-0 p-1 px-2 cursor-pointer hover:bg-gray-200 transition-all duration-500 ease-in-out"
        >
          {{ getEmoji() }}
        </button>
      </div>
    </ContainersConversationTheme>
  </div>
</template>
<script lang="ts" setup>
import { eventBus } from "@/utils/eventBus";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";

const referedMessage = ref({} as Message);
eventBus.on("refereMessage", (referedMsg: Message) => {
  referedMessage.value = referedMsg;
  message.value.referedMessage = referedMsg._id as string;
});
const getReferedMessageSender = (): User => {
  return referedMessage.value.sender as User;
};
const cancelReply = () => {
  referedMessage.value = {} as Message;
};
const message = ref({
  text: "",
  conversation: "",
  referedMessage: "",
});
const getEmoji = (): string => {
  return useConversationsStore().getEmojiOfTheme();
};
const sendEmoji = async () => {
  message.value.text = getEmoji();
  await send();
};
const getConversationType = () => {
  return useConversationsStore().currentConversation.type;
};
const send = async () => {
  const text = message.value.text;
  message.value.text = "";

  const res = await useMessagesStore().send(
    {
      ...message.value,
      text,
      type: "message",
    },
    useConversationsStore().currentConversation._id as string
  );
  cancelReply();
};
const typing = async () => {
  await useTypingStore().createTyping();
};
onMounted(async () => {
  const input = document.getElementById("textInput") as HTMLInputElement;
  input.focus();
});
</script>
<style scoped>
.scroll::-webkit-scrollbar {
  display: none;
}
</style>
