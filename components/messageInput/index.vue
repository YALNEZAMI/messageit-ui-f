<template>
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
        v-if="message.text != ''"
        @click="send"
        class="bg-white text-black rounded border-0 p-2 cursor-pointer hover:bg-gray-200 transition-all duration-500 ease-in-out"
      >
        envoyer
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
</template>
<script lang="ts" setup>
const message = ref({
  text: "",
  sender: "",
  conversation: "",
});
const getEmoji = (): string => {
  return useConversationsStore().getEmojiOfTheme();
};
const sendEmoji = async () => {
  message.value.text = getEmoji();
  await send();
};
const send = async () => {
  await useMessagesStore().send(message.value);
  message.value.text = "";
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
