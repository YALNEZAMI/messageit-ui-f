<template>
  <main class="flex w-screen" style="height: 35.5rem">
    <!--side conversations-->
    <ContainersMain class="w-1/4 rounded h-full overflow-y-auto">
      <Conversation
        class="mb-1"
        v-for="conv of getConvs()"
        :key="conv._id"
        :conversation="conv"
        :isSideBar="true"
      ></Conversation>
    </ContainersMain>
    <!--messages container and input-->
    <div class="flex w-3/4 mr-4 flex-col h-full">
      <div
        class="p-2 flex flex-col overflow-y-auto bg-blue-200"
        style="height: 32rem"
      >
        <!--messages-->
        <Message
          @click="setClickedId(message._id)"
          v-for="message of getMessages()"
          :key="message._id"
          :message="message"
          :clickedId="clickedId"
        ></Message>
      </div>
      <!-- input -->
      <MessageInput></MessageInput>
    </div>
  </main>
</template>
<script lang="ts" setup>
import type { Message } from "~/interfaces/message";
const clickedId = ref("");
const setClickedId = (val: any) => {
  if (clickedId.value == val) {
    clickedId.value = "";
    return;
  }
  clickedId.value = val;
};
const getConvs = (): any[] => {
  return useConversationsStore().conversations;
};
const getMessages = () => {
  return useMessagesStore().messages;
};

definePageMeta({
  layout: "conversations",
  middleware: "conversations",
});
onBeforeMount(async () => {
  await useMessagesStore().getInitialMessages();
});
</script>
