<template>
  <main>
    <div
      class="composer-reply"
    >
      <div class="min-w-0 flex-1">
        <div class="composer-reply-sender">
          {{ getReferedMessageSender().name }}
        </div>
        <div class="truncate" v-if="referedMessage.text">
          {{ referedMessage.text }}
        </div>
        <div
          v-if="referedMessage.files?.length > 0"
          class="flex space-x-1 m-1 overflow-x-auto"
        >
          <img
            v-for="path of referedMessage.files"
            :key="path"
            :src="path"
            alt=""
            class="w-10 h-10"
          />
        </div>
      </div>
      <button
          type="button"
          aria-label="Annuler la réponse"
          @click="cancelReply()"
          class="composer-reply-close"
        >
          ×
      </button>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
import type { User } from "~/interfaces/user";
import { eventBus } from "@/utils/eventBus";
const props = defineProps(["referedMessage"]);
const emit = defineEmits(["cancelReply"]);
function cancelReply() {
  emit("cancelReply");
}
const referedMessage = ref(props.referedMessage as Message);
const getReferedMessageSender = (): User => {
  return referedMessage.value.sender as User;
};
eventBus.on("refereMessage", (referedMsg: Message) => {
  referedMessage.value = referedMsg;
});
</script>
