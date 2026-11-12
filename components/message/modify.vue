<template>
  <main
    class="dialog-backdrop fixed inset-0 z-50 flex justify-center items-center"
  >
    <div class="dialog-panel message-edit">
      <h2 class="dialog-title">Modifier le message</h2>
      <label for="message-edit-input">Votre message</label>
      <input
        id="message-edit-input"
        type="text"
        class="search-input"
        placeholder="Votre message"
        v-model="text"
      />

      <div class="message-edit-actions">
        <button
          type="button"
          class="message-action"
          @click="cancel"
        >
          Annuler
        </button>
        <button
          type="button"
          class="upload-button-primary"
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
  const input = document.getElementById("message-edit-input") as HTMLInputElement;
  input.focus();
});
</script>
