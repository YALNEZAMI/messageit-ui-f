<template>
  <ContainersConversationTheme>
    <div class="p-2 flex justify-end space-x-1">
      <input
        id="textInput"
        type="text"
        v-model.trim="message.text"
        class="w-3/4 md:w-1/2 px-2 rounded border-transparent focus:border-black focus:border-2"
        placeholder="écrir..."
      />
      <button
        :disabled="message.text == ''"
        @click="send"
        class="bg-white text-black rounded border-0 p-2 cursor-pointer hover:bg-gray-200 transition-all duration-500 ease-in-out"
      >
        envoyer
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
const send = async () => {
  await useMessagesStore().send(message.value);
  message.value.text = "";
};
onMounted(async () => {
  const input = document.getElementById("textInput") as HTMLInputElement;
  input.focus();
});
</script>
