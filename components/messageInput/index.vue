<template>
  <div>
    <!--refered message-->
    <div
      v-if="referedMessage._id"
      class="border-l-8 py-2 border-solid border-l-red-600 w-11/12 flex mx-auto bg-black bg-opacity-40"
    >
      <div class="w-11/12">
        <div class="mx-2 font-bold text-red-600">
          {{ getReferedMessageSender().name }}
        </div>
        <div class="truncate mx-2 text-white">{{ referedMessage.text }}</div>
      </div>
      <ContainersMain class="h-max rounded-full"
        ><button
          @click="cancelReply()"
          class="rounded-full cursor-pointer bg-transparent text-white hover:opacity-80"
        >
          x
        </button></ContainersMain
      >
    </div>
    <!--photos preview-->
    <div class="flex bg-black bg-opacity-25">
      <div v-for="(file, index) of previewSrc" :key="file" class="relative">
        <NuxtImg
          v-if="index < 3"
          class="w-16 h-16 rounded m-1 border-2 border-solid border-white"
          :src="file"
        ></NuxtImg>
        <button
          class="p-1 cursor-pointer rounded border-0 text-white px-2 bg-red-500 absolute top-0 right-0"
          @click="removeFile(index)"
        >
          x
        </button>
      </div>
      <div
        v-if="previewSrc.length > 3"
        class="flex items-center text-xl font-bold"
      >
        ...
      </div>
    </div>
    <ContainersConversationTheme class="w-full flex justify-center">
      <div
        class="p-2 flex justify-center items-center space-x-1 w-full md:w1/2"
      >
        <textarea
          @input="typing"
          id="textInput"
          type="text"
          v-model.trim="message.text"
          class="scroll border-2 border-solid border-black w-3/4 h-7 md:w-1/2 px-2 rounded focus:border-black focus:border-2"
          placeholder="écrir..."
          rows="3"
          style="resize: none"
        ></textarea>
        <button
          :disabled="
            (getConversationType() == 'ai' && isGenerating) ||
            (getConversationType() == 'ai' && message.text.trim() == '')
          "
          v-if="isSendable()"
          @click="send"
          class="bg-white text-black rounded border-0 px-2 py-1 cursor-pointer hover:bg-gray-200 transition-all duration-500 ease-in-out"
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
          class="bg-white text-lg border-solid shadow-md text-black rounded cursor-pointer hover:bg-gray-200 transition-all duration-500 ease-in-out"
        >
          {{ getEmoji() }}
        </button>
        <button
          class="flex cursor-pointer items-center bg-green-400 hover:bg-green-500 border-solid border-black border-2 text-white rounded"
          v-if="useConversationsStore().currentConversation.type != 'ai'"
          @click="selectFiles = true"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="size-5 my-1"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </button>
        <MessageInputFiles
          @finish="finishFiles($event)"
          @removeFile="removeFile($event)"
          v-if="selectFiles"
          :files="files"
          :previewSrc="previewSrc"
        ></MessageInputFiles>
      </div>
    </ContainersConversationTheme>
  </div>
</template>
<script lang="ts" setup>
import { eventBus } from "@/utils/eventBus";
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";
const selectFiles = ref(false);
const referedMessage = ref({} as Message);
const previewSrc = ref([] as string[]);
const files = ref<File[]>([]);
const finishFiles = (data: { previewSrc: string[]; files: File[] }) => {
  selectFiles.value = false;
  previewSrc.value = data.previewSrc;
  files.value = data.files;
};
const removeFile = (index: number) => {
  files.value = files.value.filter((file: File, i: any) => {
    return index != i;
  });
  previewSrc.value = previewSrc.value.filter((file: any, i: any) => {
    return index != i;
  });
};
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
  type: "message",
} as Message);
const getEmoji = (): string => {
  return useConversationsStore().currentConversation.theme?.emoji as string;
};
const sendEmoji = async () => {
  message.value.text = getEmoji();
  await send();
};
const getConversationType = () => {
  return useConversationsStore().currentConversation.type;
};
const isGenerating = ref(false);
const send = async () => {
  isGenerating.value = true;
  const text = message.value.text;
  message.value.text = "";

  const res = await useMessagesStore().send(
    {
      ...message.value,
      text,
      type: "message",
    },
    useConversationsStore().currentConversation._id as string,
    files.value
  );
  isGenerating.value = false;
  files.value = [];
  previewSrc.value = [];
  cancelReply();
};
const typing = async () => {
  useConversationsStore().setConversationDraft(
    useRoute().params.id as string,
    message.value
  );
  await useTypingStore().createTyping();
};
onMounted(async () => {
  message.value.text = useConversationsStore().getConversationDraft(
    useRoute().params.id as string
  );
  const input = document.getElementById("textInput") as HTMLInputElement;
  input.focus();
});
const isSendable = () => {
  console.log(' getConversationType() != "ai"', getConversationType() != "ai");
  return (
    getConversationType() == "ai" ||
    (message.value.text && message.value.text.trim() !== "") ||
    files.value.length > 0
  );
};
</script>
<style scoped>
.scroll::-webkit-scrollbar {
  display: none;
}
</style>
