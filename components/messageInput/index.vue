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
            v-if="!isGenerating"
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

          <div v-else role="status">
            <svg
              aria-hidden="true"
              class="w-6 h-6 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span class="sr-only">Loading...</span>
          </div>
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
  sender: "",
  conversation: "",
  referedMessage: "",
});
const isGenerating = ref(false);
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
  if (getConversationType() == "ai") {
    isGenerating.value = true;
  }

  const res = await useMessagesStore().send(
    message.value,
    useConversationsStore().currentConversation._id as string
  );
  isGenerating.value = false;
  message.value.text = "";
  cancelReply();
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
