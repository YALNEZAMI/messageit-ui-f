<template>
  <main
    class="fixed z-50 top-0 left-0 w-screen h-screen bg-black flex justify-center items-center bg-opacity-60"
  >
    <div class="flex flex-col bg-white p-5 rounded">
      <h4>Entrer votre nouveau text:</h4>
      <input
        id="input"
        type="text"
        class="p-1 px-2"
        placeholder="Your new message"
        v-model="text"
      />

      <div class="flex justify-center m-3 space-x-2">
        <button
          class="basicButton border-2 border-solid border-red-600 hover:bg-red-50 bg-white text-red-700"
          @click="cancel"
        >
          Annuler
        </button>
        <button
          class="basicButton border-2 border-solid border-green-600 hover:bg-green-50 bg-white text-green-700"
          @click="modify"
        >
          Modifier
        </button>
      </div>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Message } from "~/interfaces/message";

const props = defineProps({
  message: Object,
});
const message = props.message as Message;
const text = ref(message.text);
const emit = defineEmits(["cancel"]);
const cancel = () => {
  emit("cancel");
};
const modify = async () => {
  const res = await useMessagesStore().modify(
    message._id as string,
    text.value
  );
  emit("cancel");
};
onMounted(async () => {
  const input = document.getElementById("input") as HTMLInputElement;
  input.focus();
});
</script>
