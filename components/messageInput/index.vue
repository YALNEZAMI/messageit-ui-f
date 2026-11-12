<template>
  <div class="w-full">
    <div v-if="sendError" role="alert" class="bg-red-50 px-3 py-2 text-center text-sm text-red-700">
      {{ sendError }}
    </div>
    <!--refered message-->
    <MessageInputReferedMessage
      :refered-message="referedMessage"
      @cancel-reply="cancelReply()"
      v-if="referedMessage._id"
    ></MessageInputReferedMessage>
    <!--photos preview-->
    <div v-if="previewSrc.length" class="composer-previews">
      <div v-for="(file, index) of previewSrc.slice(0, 3)" :key="file" class="composer-preview">
        <img :src="file" :alt="files[index]?.name || 'Image sélectionnée'" />
        <button
          type="button"
          class="composer-preview-remove"
          :aria-label="`Retirer ${files[index]?.name || 'l’image'}`"
          @click="removeFile(index)"
        >×</button>
      </div>
      <button
        @click="selectFiles = true"
        v-if="previewSrc.length > 3"
        type="button"
        class="composer-more"
      >+{{ previewSrc.length - 3 }}</button>
    </div>
    <!--inputs-->
    <ContainersConversationTheme class="composer w-full flex justify-center">
      <div class="composer-inner">
        <!--text main input-->
        <textarea
          @input="typing"
          id="textInput"
          type="text"
          v-model.trim="message.text"
          class="composer-input scroll"
          placeholder="Écrire un message..."
          aria-label="Écrire un message"
          rows="1"
          style="resize: none"
        ></textarea>
        <button
          :disabled="isSendButtonDisabled()"
          v-if="isSendable()"
          @click="send"
          class="composer-send"
          aria-label="Envoyer le message"
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
        <!--emoji send button-->
        <button
          v-else
          @click="sendEmoji"
          class="composer-send"
          aria-label="Envoyer l’emoji du thème"
        >
          {{ getEmoji() }}
        </button>
        <!--file form activater-->
        <button
          class="composer-attach"
          aria-label="Ajouter des photos"
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

const cancelReply = () => {
  referedMessage.value = {} as Message;
};
const message = ref({
  text: "",
  conversation: "",
  referedMessage: "",
  transfered: false,
  type: "message",
} as Message);
const getEmoji = (): string => {
  return useConversationsStore().currentConversation.theme?.emoji != undefined
    ? useConversationsStore().currentConversation.theme!.emoji
    : useConversationsStore().getEmojiOfTheme(
        useConversationsStore().currentConversation.theme?._id!
      );
};
const sendEmoji = async () => {
  message.value.text = getEmoji();
  await send();
};
const getConversationType = () => {
  return useConversationsStore().currentConversation.type;
};
const isGenerating = ref(false);
const sendError = ref("");
const send = async () => {
  isGenerating.value = true;
  sendError.value = "";
  const text = message.value.text;
  message.value.text = "";
  try {
    let urls = [] as string[];
    if (files.value.length > 0) {
      const res = await useUploadStore().uploadMessageFiles(files.value);
      urls = res.urls;
    }
    await useMessagesStore().send(
      {
        ...message.value,
        text,
        type: "message",
        files: urls,
      },
      useConversationsStore().currentConversation._id as string
    );
    previewSrc.value = [];
    files.value = [];
    cancelReply();
  } catch (error) {
    console.error("Échec de l'envoi du message", error);
    if (!message.value.text) message.value.text = text;
    sendError.value =
      "Impossible d'envoyer le message. Vérifiez la connexion et la configuration du serveur, puis réessayez.";
  } finally {
    isGenerating.value = false;
  }
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
  return (
    getConversationType() == "ai" ||
    (message.value.text && message.value.text.trim() !== "") ||
    files.value.length > 0
  );
};
const isSendButtonDisabled = () => {
  return (
    (getConversationType() == "ai" && isGenerating.value) ||
    (getConversationType() == "ai" && message.value.text == "")
  );
};
</script>
<style scoped>
.scroll::-webkit-scrollbar {
  display: none;
}
</style>
