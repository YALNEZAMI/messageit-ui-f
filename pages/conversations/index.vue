<template>
  <main style="min-height: 35rem" class="flex justify-center">
    <div
      style="max-height: 35rem; scrollbar-width: thin"
      class="flex h-max w-full lg:w-3/4 justify-center flex-wrap overflow-y-auto p-2"
    >
      <Conversation
        v-for="conv of getConvs()"
        :key="conv._id"
        :conversation="conv"
        :isSideBar="false"
      />
      <div
        class="w-11/12 md:w-1/3 m-1"
        :class="{
          hidden: !isPulse(),
        }"
        v-for="(pulse, index) in ([].length = 10)"
        :key="index"
      >
        <Pulse
          v-if="isPulse()"
          class="w-full overflow-hidden bg-gray-300 rounded"
        ></Pulse>
      </div>

      <NoResult
        v-if="isNoConversations()"
        message="Aucune conversations pour le moment."
      />
    </div>
  </main>
</template>
<script lang="ts" setup>
const getConvs = (): any[] => {
  return useConversationsStore().conversations;
};
const isPulse = () => {
  return useConversationsStore().isConversationsPulse;
};
const isNoConversations = (): boolean => {
  return getConvs().length == 0;
};
definePageMeta({
  layout: "private-space",
  middleware: "conversations",
});
onBeforeMount(async () => {
  await useConversationsStore().getInitalConversations();
});
</script>
