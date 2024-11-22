<template>
  <main
    style="height: 35rem"
    class="flex flex-wrap overflow-y-auto justify-center p-2"
  >
    <Conversation
      class="w-11/12 md:w-1/3"
      v-for="conv of getConvs()"
      :key="conv._id"
      :conversation="conv"
      :isSideBar="false"
    />
    <NoResult
      v-if="isNoConversations()"
      message="Aucune conversations pour le moment."
    />
  </main>
</template>
<script lang="ts" setup>
const getConvs = (): any[] => {
  return useConversationsStore().conversations;
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
