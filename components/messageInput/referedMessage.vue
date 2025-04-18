<template>
  <main>
    <div
      class="border-l-8 py-2 border-solid border-l-red-600 w-full flex mx-auto bg-black bg-opacity-60"
    >
      <div class="w-11/12">
        <div class="mx-2 font-bold text-red-600">
          {{ getReferedMessageSender().name }}
        </div>
        <div class="truncate mx-2 text-white" v-if="referedMessage.text">
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
      <ContainersMain class="h-max rounded-full"
        ><button
          @click="cancelReply()"
          class="rounded-full cursor-pointer bg-transparent text-white hover:opacity-80"
        >
          x
        </button></ContainersMain
      >
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
